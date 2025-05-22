"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, X, AlertCircle } from "lucide-react"
import { fetchCollectionTraits } from "@/lib/nft-service"
import type { NFT } from "@/types/nft"

interface TraitExplorerProps {
  collectionAddress: string
  onTraitSelect: (trait: { type: string; value: string | number }) => void
  onTraitRemove: (trait: { type: string; value: string | number }) => void
  selectedTraits: Array<{ type: string; value: string | number }>
  totalNfts: number
  nfts: NFT[]
}

export function TraitExplorer({
  collectionAddress,
  onTraitSelect,
  onTraitRemove,
  selectedTraits,
  totalNfts,
  nfts,
}: TraitExplorerProps) {
  const [traits, setTraits] = useState<Record<string, Record<string, number>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Extract traits from NFTs if API doesn't provide them
  useEffect(() => {
    const extractTraitsFromNfts = () => {
      if (!nfts || nfts.length === 0) return null

      const extractedTraits: Record<string, Record<string, number>> = {}

      nfts.forEach((nft) => {
        if (!nft.attributes || nft.attributes.length === 0) return

        nft.attributes.forEach((attr) => {
          if (!attr.trait_type || attr.value === undefined) return

          // Initialize trait type if it doesn't exist
          if (!extractedTraits[attr.trait_type]) {
            extractedTraits[attr.trait_type] = {}
          }

          // Convert value to string for consistency
          const valueStr = String(attr.value)

          // Increment count for this trait value
          if (!extractedTraits[attr.trait_type][valueStr]) {
            extractedTraits[attr.trait_type][valueStr] = 1
          } else {
            extractedTraits[attr.trait_type][valueStr]++
          }
        })
      })

      // Filter out trait types with only one value or empty values
      const filteredTraits: Record<string, Record<string, number>> = {}
      Object.entries(extractedTraits).forEach(([traitType, values]) => {
        if (Object.keys(values).length > 1) {
          filteredTraits[traitType] = values
        }
      })

      return Object.keys(filteredTraits).length > 0 ? filteredTraits : null
    }

    const loadTraits = async () => {
      setLoading(true)
      setError(null)

      try {
        // First try to get traits from API
        const traitData = await fetchCollectionTraits(collectionAddress)

        if (traitData && Object.keys(traitData).length > 0) {
          setTraits(traitData)

          // Expand the first few categories by default
          const categories = Object.keys(traitData)
          setExpandedCategories(categories.slice(0, 3))
        } else {
          // If API doesn't return useful traits, extract from NFTs
          const extractedTraits = extractTraitsFromNfts()

          if (extractedTraits) {
            setTraits(extractedTraits)
            const categories = Object.keys(extractedTraits)
            setExpandedCategories(categories.slice(0, 3))
          } else {
            setError("No trait data available for this collection")
          }
        }
      } catch (error) {
        console.error("Failed to load collection traits:", error)

        // Try extracting from NFTs as fallback
        const extractedTraits = extractTraitsFromNfts()

        if (extractedTraits) {
          setTraits(extractedTraits)
          const categories = Object.keys(extractedTraits)
          setExpandedCategories(categories.slice(0, 3))
        } else {
          setError("Failed to load trait data")
        }
      } finally {
        setLoading(false)
      }
    }

    loadTraits()
  }, [collectionAddress, nfts])

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const isTraitSelected = (type: string, value: string | number) => {
    return selectedTraits.some((trait) => trait.type === type && trait.value === value)
  }

  const handleTraitClick = (type: string, value: string | number) => {
    if (isTraitSelected(type, value)) {
      onTraitRemove({ type, value })
    } else {
      onTraitSelect({ type, value })
    }
  }

  // Filter traits based on search term
  const filteredTraits = traits
    ? Object.entries(traits).reduce(
        (acc, [category, values]) => {
          // Filter trait values that match the search term
          const filteredValues = Object.entries(values).filter(
            ([value]) =>
              value.toLowerCase().includes(searchTerm.toLowerCase()) ||
              category.toLowerCase().includes(searchTerm.toLowerCase()),
          )

          if (filteredValues.length > 0) {
            acc[category] = Object.fromEntries(filteredValues)
          }

          return acc
        },
        {} as Record<string, Record<string, number>>,
      )
    : null

  // Sort categories by name
  const sortedCategories = filteredTraits ? Object.keys(filteredTraits).sort() : []

  if (loading) {
    return (
      <div className="bg-[#0d2416] rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-[#143621] rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-6 bg-[#143621] rounded w-1/4"></div>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-10 bg-[#143621] rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !traits || Object.keys(traits).length === 0) {
    return (
      <div className="bg-[#0d2416] rounded-xl p-6">
        <div className="flex items-center gap-2 text-amber-400 mb-4">
          <AlertCircle size={18} />
          <h3 className="text-lg font-medium">Limited Trait Data</h3>
        </div>
        <p className="text-gray-300 mb-4">{error || "This collection has limited or no trait data available."}</p>
        <p className="text-gray-400 text-sm">
          You can still browse the collection, but filtering by traits may be limited.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#0d2416] rounded-xl p-4 md:p-6">
      <h3 className="text-xl font-bold text-white mb-4">Trait Explorer</h3>

      {/* Search input */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search traits..."
          className="w-full pl-4 pr-10 py-2 bg-[#143621] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Selected traits */}
      {selectedTraits.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Selected Traits</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTraits.map((trait, index) => (
              <div
                key={`${trait.type}-${trait.value}-${index}`}
                className="flex items-center bg-green-800/40 border border-green-700 rounded-full px-3 py-1"
              >
                <span className="text-green-300 text-sm mr-1">{trait.type}:</span>
                <span className="text-white text-sm">{trait.value}</span>
                <button onClick={() => onTraitRemove(trait)} className="ml-2 text-gray-300 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            ))}
            {selectedTraits.length > 1 && (
              <button
                onClick={() => selectedTraits.forEach((trait) => onTraitRemove(trait))}
                className="text-sm text-gray-300 hover:text-white underline"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Trait categories */}
      <div className="space-y-4">
        {sortedCategories.map((category) => {
          const isExpanded = expandedCategories.includes(category)
          const traitValues = filteredTraits![category]

          // Sort trait values by frequency (descending)
          const sortedValues = Object.entries(traitValues).sort((a, b) => b[1] - a[1])

          return (
            <div key={category} className="border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between bg-[#143621] px-4 py-3 text-left"
              >
                <span className="font-medium text-white">{category}</span>
                <span className="text-gray-400">
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>

              {isExpanded && (
                <div className="p-3 bg-[#0d2416] border-t border-gray-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sortedValues.map(([value, count]) => {
                      const percentage = totalNfts > 0 ? ((count / totalNfts) * 100).toFixed(1) : "0.0"
                      const isSelected = isTraitSelected(category, value)

                      return (
                        <button
                          key={`${category}-${value}`}
                          onClick={() => handleTraitClick(category, value)}
                          className={`flex items-center justify-between p-2 rounded-lg border ${
                            isSelected
                              ? "bg-green-800/30 border-green-600 text-white"
                              : "bg-[#143621] border-gray-700 text-gray-300 hover:bg-[#1a472a]"
                          } transition-colors`}
                        >
                          <span className="font-medium truncate">{value}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-[#0d2416] px-2 py-1 rounded-full">{count}</span>
                            <span className="text-xs text-gray-400">{percentage}%</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
