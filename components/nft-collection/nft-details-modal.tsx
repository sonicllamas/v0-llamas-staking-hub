"use client"

import { useState, useEffect } from "react"
import { X, ExternalLink, CheckCircle, Tag, Play, Pause, BarChart3, History } from "lucide-react"
import type { NFTItem, NFTAttribute } from "@/types/nft"
import { NFTRarityCalculator } from "./nft-rarity-calculator"
import { NFTTransactionHistory } from "./nft-transaction-history"
import { fetchCollectionTraits } from "@/lib/nft-service"
import { ProgressiveImage } from "@/components/progressive-image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface NFTDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  nft: NFTItem
  isSelected: boolean
  onToggleSelect: () => void
}

export function NFTDetailsModal({ isOpen, onClose, nft, isSelected, onToggleSelect }: NFTDetailsModalProps) {
  const [imageError, setImageError] = useState(false)
  const [activeTab, setActiveTab] = useState<"info" | "attributes" | "rarity" | "history">("info")
  const [isPlaying, setIsPlaying] = useState(false)
  const [collectionTraits, setCollectionTraits] = useState<Record<string, Record<string, number>> | null>(null)

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setActiveTab("info")
      setIsPlaying(false)

      // Fetch collection traits for rarity calculation
      const loadCollectionTraits = async () => {
        if (nft.collectionAddress) {
          try {
            const traits = await fetchCollectionTraits(nft.collectionAddress)
            setCollectionTraits(traits)
          } catch (error) {
            console.error("Failed to load collection traits:", error)
          }
        }
      }

      loadCollectionTraits()
    }
  }, [isOpen, nft.collectionAddress])

  if (!isOpen) return null

  const handleImageError = () => {
    setImageError(true)
  }

  // Format date to readable format
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown"

    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format timestamp to readable format
  const formatTimestamp = (timestamp: number | undefined) => {
    if (!timestamp) return "Unknown"

    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get rarity tier based on rarity score
  const getRarityTier = (rarity: number | undefined) => {
    if (!rarity) return null

    if (rarity <= 20) return { label: "Common", color: "bg-gray-500" }
    if (rarity <= 40) return { label: "Uncommon", color: "bg-green-500" }
    if (rarity <= 60) return { label: "Rare", color: "bg-blue-500" }
    if (rarity <= 80) return { label: "Epic", color: "bg-purple-500" }
    return { label: "Legendary", color: "bg-yellow-500" }
  }

  const rarityTier = getRarityTier(nft.rarity)
  const hasAnimation = nft.metadata?.animation_url !== undefined

  // Group attributes by display type
  const groupedAttributes: Record<string, NFTAttribute[]> = {}

  if (nft.attributes) {
    nft.attributes.forEach((attr) => {
      const displayType = attr.display_type || "default"
      if (!groupedAttributes[displayType]) {
        groupedAttributes[displayType] = []
      }
      groupedAttributes[displayType].push(attr)
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-hidden bg-[#0d2416] border-gray-700 text-white"
        aria-describedby="nft-details-description"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{nft.name}</DialogTitle>
          <DialogDescription id="nft-details-description">
            Detailed view of {nft.name} NFT including attributes, rarity, and transaction history.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-white text-xl font-bold">{nft.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-4">
              <div className="relative rounded-lg overflow-hidden">
                {hasAnimation && isPlaying ? (
                  <div className="aspect-square relative">
                    <iframe
                      src={nft.metadata?.animation_url}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                    <button
                      onClick={() => setIsPlaying(false)}
                      className="absolute bottom-4 right-4 bg-[#0d2416] bg-opacity-80 p-2 rounded-full"
                    >
                      <Pause size={20} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="aspect-square relative">
                    <ProgressiveImage
                      src={imageError ? "/placeholder.svg?height=400&width=400&query=nft+placeholder" : nft.image}
                      alt={nft.name}
                      fill
                      className="object-cover"
                      onError={handleImageError}
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {hasAnimation && (
                      <button
                        onClick={() => setIsPlaying(true)}
                        className="absolute bottom-4 right-4 bg-[#0d2416] bg-opacity-80 p-2 rounded-full"
                      >
                        <Play size={20} className="text-white" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {nft.marketData?.forSale && nft.marketData.price && (
                <div className="mt-4 bg-[#143621] p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Tag size={18} className="text-green-400" />
                      <span className="text-white font-medium">For Sale</span>
                    </div>
                    <span className="text-white font-bold">
                      {nft.marketData.price} {nft.marketData.currency}
                    </span>
                  </div>
                  <button className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition-colors">
                    Buy Now
                  </button>
                </div>
              )}

              {nft.marketData?.lastSoldPrice && (
                <div className="mt-4 bg-[#143621] p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Last Sold For</span>
                    <span className="text-white">
                      {nft.marketData.lastSoldPrice} {nft.marketData.currency}
                    </span>
                  </div>
                  {nft.marketData.lastSoldTimestamp && (
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-400">Sold Date</span>
                      <span className="text-white text-sm">{formatTimestamp(nft.marketData.lastSoldTimestamp)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={onToggleSelect}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-md ${
                    isSelected
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "border border-green-600 text-green-400 hover:bg-[#143621]"
                  } transition-colors`}
                >
                  <CheckCircle size={18} />
                  {isSelected ? "Selected for Staking" : "Select for Staking"}
                </button>
              </div>
            </div>

            <div className="md:w-1/2 p-4 border-t md:border-t-0 md:border-l border-gray-700">
              <div className="flex mb-4 border-b border-gray-700 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === "info"
                      ? "text-green-400 border-b-2 border-green-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Info
                </button>
                <button
                  onClick={() => setActiveTab("attributes")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === "attributes"
                      ? "text-green-400 border-b-2 border-green-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Attributes
                </button>
                <button
                  onClick={() => setActiveTab("rarity")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === "rarity"
                      ? "text-green-400 border-b-2 border-green-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <BarChart3 size={14} />
                    <span>Rarity</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === "history"
                      ? "text-green-400 border-b-2 border-green-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <History size={14} />
                    <span>History</span>
                  </div>
                </button>
              </div>

              {activeTab === "info" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-gray-400 text-sm">Collection</h4>
                    <p className="text-white font-medium">{nft.collectionName}</p>
                  </div>

                  <div>
                    <h4 className="text-gray-400 text-sm">Token ID</h4>
                    <p className="text-white font-medium">{nft.tokenId}</p>
                  </div>

                  <div>
                    <h4 className="text-gray-400 text-sm">Owner</h4>
                    <p className="text-white font-medium truncate">{nft.owner || "Unknown"}</p>
                  </div>

                  {nft.createdAt && (
                    <div>
                      <h4 className="text-gray-400 text-sm">Created</h4>
                      <p className="text-white font-medium">{formatDate(nft.createdAt)}</p>
                    </div>
                  )}

                  {nft.description && (
                    <div>
                      <h4 className="text-gray-400 text-sm">Description</h4>
                      <p className="text-white">{nft.description}</p>
                    </div>
                  )}

                  {nft.rarity !== undefined && (
                    <div>
                      <h4 className="text-gray-400 text-sm">Rarity</h4>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-[#143621] rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${rarityTier?.color || "bg-green-500"}`}
                            style={{ width: `${Math.min(100, nft.rarity)}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-medium">{nft.rarity}/100</span>
                        {rarityTier && (
                          <span className={`${rarityTier.color} px-2 py-0.5 rounded text-xs text-white`}>
                            {rarityTier.label}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {nft.metadata?.properties && Object.keys(nft.metadata.properties).length > 0 && (
                    <div>
                      <h4 className="text-gray-400 text-sm mb-2">Properties</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(nft.metadata.properties).map(([key, value]) => (
                          <div key={key} className="bg-[#143621] p-2 rounded-md">
                            <p className="text-gray-400 text-xs">{key}</p>
                            <p className="text-white font-medium truncate">{value.toString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-between">
                    <a
                      href={`https://sonicscan.org/token/${nft.collectionAddress}?a=${nft.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink size={16} />
                      <span>View on Explorer</span>
                    </a>

                    {nft.metadata?.external_url && (
                      <a
                        href={nft.metadata.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink size={16} />
                        <span>External Link</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "attributes" && (
                <div className="space-y-4">
                  {Object.keys(groupedAttributes).length === 0 ? (
                    <p className="text-gray-400">No attributes found for this NFT.</p>
                  ) : (
                    Object.entries(groupedAttributes).map(([displayType, attributes]) => (
                      <div key={displayType}>
                        <h4 className="text-white font-medium mb-2 capitalize">
                          {displayType === "default" ? "Traits" : displayType.replace(/_/g, " ")}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {attributes.map((attr, index) => (
                            <div key={index} className="bg-[#143621] p-3 rounded-md">
                              <p className="text-gray-400 text-xs">{attr.trait_type}</p>
                              {displayType === "date" ? (
                                <p className="text-white font-medium">{formatTimestamp(attr.value as number)}</p>
                              ) : (
                                <div className="flex justify-between items-center">
                                  <p className="text-white font-medium truncate">{attr.value.toString()}</p>
                                  {attr.rarity_percentage !== undefined && (
                                    <span className="text-gray-400 text-xs">{attr.rarity_percentage.toFixed(1)}%</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "rarity" && <NFTRarityCalculator nft={nft} collectionTraits={collectionTraits} />}

              {activeTab === "history" && (
                <NFTTransactionHistory collectionAddress={nft.collectionAddress} tokenId={nft.tokenId} />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
