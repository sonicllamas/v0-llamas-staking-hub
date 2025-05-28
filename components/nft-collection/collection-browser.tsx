"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import { NFTGrid } from "./nft-grid"
import { NFTFilters } from "./nft-filters"
import { TraitExplorer } from "./trait-explorer"
import { fetchCollectionMetadata } from "@/lib/nft-service"
import type { NFT, TraitFilter } from "@/types/nft"
import { CollectionInfoCard } from "./collection-info-card"
import { ChevronLeft, ChevronRight, Filter, X } from "lucide-react"

interface CollectionBrowserProps {
  collectionAddress: string
  initialSearch?: string
}

export function CollectionBrowser({ collectionAddress, initialSearch = "Sonic Llamas" }: CollectionBrowserProps) {
  const { chainId } = useWallet()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [filteredNfts, setFilteredNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNfts, setSelectedNfts] = useState<NFT[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState<string>("rarity-desc")
  const [totalNfts, setTotalNfts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showTraitExplorer, setShowTraitExplorer] = useState(false)
  const [selectedTraits, setSelectedTraits] = useState<TraitFilter[]>([])
  const itemsPerPage = 50

  // Load NFTs when component mounts
  useEffect(() => {
    const loadNFTs = async () => {
      setLoading(true)
      try {
        const result = await fetchCollectionMetadata(collectionAddress, chainId || 146, initialSearch, itemsPerPage, 0)

        setNfts(result.nfts)
        setFilteredNfts(result.nfts)
        setTotalNfts(result.total)
      } catch (error) {
        console.error("Failed to load collection NFTs:", error)
      } finally {
        setLoading(false)
      }
    }

    loadNFTs()
  }, [collectionAddress, chainId, initialSearch])

  // Load more NFTs when page changes
  useEffect(() => {
    if (currentPage === 1) return

    const loadMoreNFTs = async () => {
      setIsLoadingMore(true)
      try {
        const offset = (currentPage - 1) * itemsPerPage
        const result = await fetchCollectionMetadata(
          collectionAddress,
          chainId || 146,
          initialSearch,
          itemsPerPage,
          offset,
        )

        // Append new NFTs to existing ones
        setNfts((prevNfts) => [...prevNfts, ...result.nfts])
        setFilteredNfts((prevNfts) => [...prevNfts, ...result.nfts])
      } catch (error) {
        console.error("Failed to load more NFTs:", error)
      } finally {
        setIsLoadingMore(false)
      }
    }

    loadMoreNFTs()
  }, [currentPage, collectionAddress, chainId, initialSearch])

  // Filter and sort NFTs based on search term, rarity, and traits
  useEffect(() => {
    let filtered = [...nfts]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (nft) =>
          nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.tokenId.toString().includes(searchTerm) ||
          (nft.description && nft.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (nft.attributes &&
            nft.attributes.some(
              (attr) =>
                attr.trait_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                attr.value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
            )),
      )
    }

    // Apply trait filters
    if (selectedTraits.length > 0) {
      filtered = filtered.filter((nft) => {
        return selectedTraits.every((trait) => {
          return (
            nft.attributes &&
            nft.attributes.some(
              (attr) => attr.trait_type === trait.type && attr.value.toString() === trait.value.toString(),
            )
          )
        })
      })
    }

    // Apply rarity filter
    if (selectedRarity) {
      switch (selectedRarity) {
        case "common":
          filtered = filtered.filter((nft) => nft.rarity && nft.rarity.score <= 20)
          break
        case "uncommon":
          filtered = filtered.filter((nft) => nft.rarity && nft.rarity.score > 20 && nft.rarity.score <= 40)
          break
        case "rare":
          filtered = filtered.filter((nft) => nft.rarity && nft.rarity.score > 40 && nft.rarity.score <= 60)
          break
        case "epic":
          filtered = filtered.filter((nft) => nft.rarity && nft.rarity.score > 60 && nft.rarity.score <= 80)
          break
        case "legendary":
          filtered = filtered.filter((nft) => nft.rarity && nft.rarity.score > 80)
          break
      }
    }

    // Apply sorting
    switch (sortOption) {
      case "newest":
        filtered.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        break
      case "oldest":
        filtered.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        })
        break
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "rarity-asc":
        filtered.sort((a, b) => (a.rarity?.score || 0) - (b.rarity?.score || 0))
        break
      case "rarity-desc":
        filtered.sort((a, b) => (b.rarity?.score || 0) - (a.rarity?.score || 0))
        break
      case "id-asc":
        filtered.sort((a, b) => Number.parseInt(a.tokenId) - Number.parseInt(b.tokenId))
        break
      case "id-desc":
        filtered.sort((a, b) => Number.parseInt(b.tokenId) - Number.parseInt(a.tokenId))
        break
    }

    setFilteredNfts(filtered)
  }, [nfts, searchTerm, selectedRarity, sortOption, selectedTraits])

  // Toggle NFT selection
  const toggleNftSelection = (nft: NFT) => {
    if (selectedNfts.some((item) => item.tokenId === nft.tokenId && item.address === nft.address)) {
      setSelectedNfts(selectedNfts.filter((item) => !(item.tokenId === nft.tokenId && item.address === nft.address)))
    } else {
      setSelectedNfts([...selectedNfts, nft])
    }
  }

  // Clear all selections
  const clearSelection = () => {
    setSelectedNfts([])
  }

  // Open stake modal (placeholder function)
  const openStakeModal = () => {
    console.log("Open stake modal with selected NFTs:", selectedNfts)
    // This would be implemented to actually open the modal
  }

  // Load more NFTs
  const loadMore = () => {
    setCurrentPage((prev) => prev + 1)
  }

  // Add a trait filter
  const addTraitFilter = (trait: TraitFilter) => {
    setSelectedTraits((prev) => [...prev, trait])
  }

  // Remove a trait filter
  const removeTraitFilter = (trait: TraitFilter) => {
    setSelectedTraits((prev) => prev.filter((t) => !(t.type === trait.type && t.value === trait.value)))
  }

  // Toggle trait explorer visibility
  const toggleTraitExplorer = () => {
    setShowTraitExplorer((prev) => !prev)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white">Loading NFTs...</p>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(totalNfts / itemsPerPage)
  const showingStart = 1
  const showingEnd = Math.min(nfts.length, totalNfts)

  return (
    <div className="space-y-6">
      <CollectionInfoCard collectionAddress={collectionAddress} collectionName={initialSearch} />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Trait Explorer (Sidebar) */}
        {showTraitExplorer && (
          <div className="md:w-1/3 lg:w-1/4">
            <TraitExplorer
              collectionAddress={collectionAddress}
              onTraitSelect={addTraitFilter}
              onTraitRemove={removeTraitFilter}
              selectedTraits={selectedTraits}
              totalNfts={totalNfts}
              nfts={nfts}
            />
          </div>
        )}

        {/* Main Content */}
        <div className={`${showTraitExplorer ? "md:w-2/3 lg:w-3/4" : "w-full"} space-y-6`}>
          <NFTFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            collections={[]} // Explicitly pass an empty array
            selectedCollection={null}
            setSelectedCollection={() => {}}
            selectedRarity={selectedRarity}
            setSelectedRarity={setSelectedRarity}
            sortOption={sortOption}
            setSortOption={setSortOption}
            selectedCount={selectedNfts.length}
            clearSelection={clearSelection}
            openStakeModal={openStakeModal}
            showCollectionFilter={false}
          >
            {/* Trait Explorer Toggle Button */}
            <button
              onClick={toggleTraitExplorer}
              className={`flex items-center gap-2 px-4 py-2 ${
                showTraitExplorer ? "bg-green-700 text-white" : "bg-[#143621] text-white hover:bg-[#1a472a]"
              } border border-gray-700 rounded-lg transition-colors`}
            >
              <Filter size={18} />
              <span>Traits</span>
              {selectedTraits.length > 0 && (
                <span className="bg-green-900 text-white text-xs rounded-full px-2 py-0.5">
                  {selectedTraits.length}
                </span>
              )}
            </button>
          </NFTFilters>

          {/* Selected Traits (Mobile View) */}
          {selectedTraits.length > 0 && !showTraitExplorer && (
            <div className="bg-[#0d2416] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-300">Selected Traits</h4>
                <button onClick={() => setSelectedTraits([])} className="text-xs text-gray-400 hover:text-white">
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTraits.map((trait, index) => (
                  <div
                    key={`${trait.type}-${trait.value}-${index}`}
                    className="flex items-center bg-green-800/40 border border-green-700 rounded-full px-3 py-1"
                  >
                    <span className="text-green-300 text-xs mr-1">{trait.type}:</span>
                    <span className="text-white text-xs">{trait.value}</span>
                    <button onClick={() => removeTraitFilter(trait)} className="ml-2 text-gray-300 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredNfts.length === 0 ? (
            <div className="bg-[#0d2416] rounded-xl p-8 text-center">
              <h2 className="text-white text-2xl font-bold mb-4">No NFTs Found</h2>
              <p className="text-green-100 mb-6">
                {nfts.length === 0 ? "No NFTs found in this collection." : "No NFTs match your search criteria."}
              </p>
              {selectedTraits.length > 0 && (
                <button
                  onClick={() => setSelectedTraits([])}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Clear Trait Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="bg-[#0d2416] rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-300">
                    Showing {showingStart}-{showingEnd} of {filteredNfts.length} NFTs
                    {filteredNfts.length !== totalNfts && ` (filtered from ${totalNfts})`}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-md bg-[#143621] text-white disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-white">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages || isLoadingMore}
                      className="p-2 rounded-md bg-[#143621] text-white disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <NFTGrid nfts={filteredNfts} selectedNfts={selectedNfts} toggleSelection={toggleNftSelection} />

              {nfts.length < totalNfts && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMore}
                    disabled={isLoadingMore || nfts.length >= totalNfts}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                  >
                    {isLoadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
