import type React from "react"

interface NFTCardProps {
  nft: {
    id: number
    name: string
    imageUrl: string
    tokenId: string
    rarity?: {
      rank: number
      total: number
      score: number
    }
  }
}

// Export as both named and default export to ensure compatibility
export const NFTCard: React.FC<NFTCardProps> = ({ nft }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img src={nft.imageUrl || "/placeholder.svg"} alt={nft.name} className="w-full h-48 object-cover" />
        {nft.rarity && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full">
            Rank #{nft.rarity.rank} / {nft.rarity.total}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{nft.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm text-gray-500">Token ID: {nft.tokenId}</div>
          {nft.rarity && <div className="text-xs text-gray-400">Rarity: {nft.rarity.score.toFixed(2)}</div>}
        </div>
      </div>
    </div>
  )
}

// Also export as default for backward compatibility
export default NFTCard
