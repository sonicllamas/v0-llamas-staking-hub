"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ExternalLink, Info } from "lucide-react"
import { fetchNFTCollection } from "@/lib/nft-service"
import type { NFTCollection } from "@/types/nft"

interface CollectionInfoCardProps {
  collectionAddress: string | null
  collectionName: string
}

export function CollectionInfoCard({ collectionAddress, collectionName }: CollectionInfoCardProps) {
  const [collection, setCollection] = useState<NFTCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const loadCollection = async () => {
      if (collectionAddress) {
        setLoading(true)
        try {
          const collectionData = await fetchNFTCollection(collectionAddress)
          setCollection(collectionData)
        } catch (error) {
          console.error("Failed to load collection:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadCollection()
  }, [collectionAddress])

  if (!collectionAddress || loading) {
    return null
  }

  if (!collection) {
    return (
      <div className="bg-[#0d2416] rounded-xl p-4">
        <h3 className="text-white font-bold">{collectionName}</h3>
        <p className="text-gray-400 text-sm">Collection details not available</p>
      </div>
    )
  }

  // Safely format numbers with fallbacks
  const formatNumber = (value: any): string => {
    if (value === undefined || value === null) return "0"
    if (typeof value === "number") return value.toLocaleString()
    if (typeof value === "string") {
      const num = Number(value)
      return isNaN(num) ? "0" : num.toLocaleString()
    }
    return "0"
  }

  // Ensure totalSupply is a number or has a default value
  const totalSupply =
    typeof collection.totalSupply === "number"
      ? collection.totalSupply
      : typeof collection.totalSupply === "string"
        ? Number.parseInt(collection.totalSupply, 10)
        : 0

  // Ensure ownersCount is a number or has a default value
  const ownersCount = collection.ownersCount || 0

  return (
    <div className="bg-[#0d2416] rounded-xl overflow-hidden">
      {collection.bannerImage && (
        <div className="w-full h-32 relative">
          <Image
            src={collection.bannerImage || "/placeholder.svg"}
            alt={collection.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="p-4 md:p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-[#143621] flex-shrink-0">
            <Image
              src={collection.image || "/placeholder-n65tg.png"}
              alt={collection.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <h3 className="text-white text-xl font-bold">{collection.name}</h3>
              {collection.verified && (
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">Verified</span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-400 text-sm">{collection.symbol}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400 text-sm">{formatNumber(totalSupply)} items</span>
              {ownersCount > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400 text-sm">{formatNumber(ownersCount)} owners</span>
                </>
              )}
            </div>

            {!expanded && collection.description && (
              <p className="text-green-100 mt-2 line-clamp-2">{collection.description}</p>
            )}
          </div>
        </div>

        {expanded && (
          <div className="mt-4">
            {collection.description && (
              <div className="mb-4">
                <h4 className="text-white font-medium mb-1">Description</h4>
                <p className="text-green-100">{collection.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {collection.floorPrice && (
                <div className="bg-[#143621] p-3 rounded-lg">
                  <p className="text-gray-400 text-xs">Floor Price</p>
                  <p className="text-white font-medium">{collection.floorPrice}</p>
                </div>
              )}

              {collection.volume24h && (
                <div className="bg-[#143621] p-3 rounded-lg">
                  <p className="text-gray-400 text-xs">24h Volume</p>
                  <p className="text-white font-medium">{collection.volume24h}</p>
                </div>
              )}

              {collection.totalVolume && (
                <div className="bg-[#143621] p-3 rounded-lg">
                  <p className="text-gray-400 text-xs">Total Volume</p>
                  <p className="text-white font-medium">{collection.totalVolume}</p>
                </div>
              )}

              {collection.royaltyFee !== undefined && (
                <div className="bg-[#143621] p-3 rounded-lg">
                  <p className="text-gray-400 text-xs">Royalty Fee</p>
                  <p className="text-white font-medium">{collection.royaltyFee}%</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {collection.website && (
                <a
                  href={collection.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                >
                  <ExternalLink size={14} />
                  <span className="text-sm">Website</span>
                </a>
              )}

              {collection.twitter && (
                <a
                  href={`https://twitter.com/${collection.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                >
                  <ExternalLink size={14} />
                  <span className="text-sm">Twitter</span>
                </a>
              )}

              {collection.discord && (
                <a
                  href={collection.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                >
                  <ExternalLink size={14} />
                  <span className="text-sm">Discord</span>
                </a>
              )}

              <a
                href={`https://sonicscan.org/address/${collectionAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
              >
                <ExternalLink size={14} />
                <span className="text-sm">Explorer</span>
              </a>
            </div>
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
        >
          <Info size={14} />
          <span className="text-sm">{expanded ? "Show Less" : "Show More"}</span>
        </button>
      </div>
    </div>
  )
}
