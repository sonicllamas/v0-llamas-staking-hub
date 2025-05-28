"use client"

import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProgressiveImage } from "@/components/progressive-image"

interface NFTCardProps {
  nft: {
    id: string
    name: string
    imageUrl: string
    tokenId: string
    rarity?: string | { score: number; rank: number; total: number; calculated_at: number } | null
    collection?: {
      address: string
      name: string
      isVerified: boolean
      isWhitelisted: boolean
    }
    contractAddress?: string
    price?: string
    isOnSale?: boolean
  }
  onClick?: () => void
  isSelected?: boolean
  showPrice?: boolean
}

export const NFTCard = memo(function NFTCard({ nft, onClick, isSelected = false, showPrice = false }: NFTCardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "mythic":
        return "bg-purple-500"
      case "legendary":
        return "bg-orange-500"
      case "epic":
        return "bg-purple-400"
      case "rare":
        return "bg-blue-500"
      case "uncommon":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatRarity = (
    rarity: string | { score: number; rank: number; total: number; calculated_at: number } | null | undefined,
  ): string => {
    if (!rarity) return "Common"
    if (typeof rarity === "string") return rarity
    if (typeof rarity === "object" && rarity.rank) {
      return `#${rarity.rank}`
    }
    return "Common"
  }

  const rarityDisplay = formatRarity(nft.rarity)

  return (
    <Card
      className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <ProgressiveImage
            src={nft.imageUrl}
            alt={nft.name}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
            fallback={`/placeholder.svg?height=300&width=300&query=${encodeURIComponent(nft.name)}`}
          />

          {/* Rarity Badge */}
          {rarityDisplay && rarityDisplay !== "Common" && (
            <Badge className={`absolute top-2 right-2 text-white ${getRarityColor(rarityDisplay)}`} variant="secondary">
              {rarityDisplay}
            </Badge>
          )}

          {/* Price Badge */}
          {showPrice && nft.isOnSale && nft.price && nft.price !== "0" && (
            <Badge className="absolute top-2 left-2 bg-green-600 text-white" variant="secondary">
              {(Number.parseFloat(nft.price) / 1e18).toFixed(3)} S
            </Badge>
          )}

          {/* Selection Indicator */}
          {isSelected && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
              <div className="bg-blue-500 text-white rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg truncate" title={nft.name}>
              {nft.name}
            </h3>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>#{nft.tokenId}</span>
              {nft.collection && (
                <span className="truncate max-w-[120px]" title={nft.collection.name}>
                  {nft.collection.name}
                </span>
              )}
            </div>

            {/* Collection Verification */}
            {nft.collection?.isVerified && (
              <div className="flex items-center gap-1 text-xs text-blue-500">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Verified</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
