"use client"

import { useState } from "react"
import type { NFT } from "@/types/nft"
import { NFTCard } from "./nft-card" // Updated to use named import

interface NFTGridProps {
  nfts: NFT[]
  selectedNfts?: NFT[]
  onSelectNft?: (nft: NFT) => void
  isSelectable?: boolean
}

export function NFTGrid({ nfts, selectedNfts = [], onSelectNft, isSelectable = true }: NFTGridProps) {
  const [hoveredNft, setHoveredNft] = useState<number | null>(null)

  const isSelected = (nft: NFT) => {
    return selectedNfts.some((selected) => selected.id === nft.id)
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No NFTs found matching your criteria.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {nfts.map((nft) => (
        <div
          key={nft.id}
          className={`relative ${isSelectable ? "cursor-pointer" : ""}`}
          onMouseEnter={() => setHoveredNft(nft.id)}
          onMouseLeave={() => setHoveredNft(null)}
          onClick={() => onSelectNft && isSelectable && onSelectNft(nft)}
        >
          <div
            className={`${
              isSelected(nft) ? "ring-4 ring-green-500" : hoveredNft === nft.id ? "ring-2 ring-green-300" : ""
            } rounded-lg transition-all duration-200`}
          >
            <NFTCard
              nft={{
                id: nft.id,
                name: nft.name,
                imageUrl: nft.image,
                tokenId: nft.tokenId,
                rarity: nft.rarity,
              }}
            />
          </div>
          {isSelected(nft) && (
            <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
