"use client"

import { memo } from "react"
import type { NFT } from "@/types/nft"
import { NFTCard } from "./nft-card"

interface NFTGridProps {
  nfts: NFT[]
  selectedNfts?: NFT[]
  onSelectNft?: (nft: NFT) => void
  isSelectable?: boolean
}

// Memoize the NFT card to prevent unnecessary re-renders
const MemoizedNFTCard = memo(
  ({
    nft,
    isSelected,
    isHovered,
    onClick,
  }: {
    nft: NFT
    isSelected: boolean
    isHovered: boolean
    onClick: () => void
  }) => (
    <div
      className={`relative ${isSelected ? "ring-4 ring-green-500" : isHovered ? "ring-2 ring-green-300" : ""} rounded-lg transition-all duration-200 cursor-pointer`}
      onClick={onClick}
    >
      <NFTCard
        nft={{
          id: nft.id,
          name: nft.name,
          imageUrl: nft.image, // Use nft.image instead of nft.imageUrl
          tokenId: nft.tokenId,
          rarity: nft.rarity,
          collection: nft.collection, // Add collection info
          contractAddress: nft.contractAddress || nft.address, // Add contract address
        }}
      />
      {isSelected && (
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
  ),
)
MemoizedNFTCard.displayName = "MemoizedNFTCard"

export function NFTGrid({ nfts, selectedNfts = [], onSelectNft, isSelectable = true }: NFTGridProps) {
  if (nfts.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No NFTs found matching your criteria.</p>
      </div>
    )
  }

  const isSelected = (nft: NFT) => {
    return selectedNfts.some((selected) => selected.id === nft.id)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {nfts.map((nft) => (
        <MemoizedNFTCard
          key={nft.id}
          nft={nft}
          isSelected={isSelected(nft)}
          isHovered={false}
          onClick={() => onSelectNft && isSelectable && onSelectNft(nft)}
        />
      ))}
    </div>
  )
}
