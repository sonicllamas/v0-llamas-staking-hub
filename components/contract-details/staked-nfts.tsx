"use client"

import { useState } from "react"
import Image from "next/image"

interface StakedNFTsProps {
  contract: any
}

interface NFT {
  id: string
  tokenId: string
  name: string
  image: string
  stakedAt: string
  owner: string
}

export function StakedNFTs({ contract }: StakedNFTsProps) {
  const [nfts, setNfts] = useState<NFT[]>([
    {
      id: "1",
      tokenId: "42",
      name: "Llama #42",
      image: "/placeholder.svg?key=g30ss",
      stakedAt: "2025-05-15T12:00:00Z",
      owner: "0x1234...5678",
    },
    {
      id: "2",
      tokenId: "123",
      name: "Llama #123",
      image: "/placeholder.svg?key=sjoyd",
      stakedAt: "2025-05-14T10:30:00Z",
      owner: "0x8765...4321",
    },
    {
      id: "3",
      tokenId: "7",
      name: "Llama #7",
      image: "/placeholder.svg?key=wnvst",
      stakedAt: "2025-05-13T09:15:00Z",
      owner: "0xabcd...efgh",
    },
  ])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-white text-xl font-bold">Staked NFTs ({nfts.length})</h3>
      </div>

      {nfts.length === 0 ? (
        <div className="bg-[#0d2416] rounded-lg p-6 text-center">
          <p className="text-gray-400">No NFTs are currently staked in this contract.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {nfts.map((nft) => (
            <div key={nft.id} className="bg-[#0d2416] rounded-lg overflow-hidden">
              <div className="aspect-square relative">
                <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover" unoptimized />
              </div>
              <div className="p-4">
                <h4 className="text-white font-bold">{nft.name}</h4>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Token ID:</span>
                    <span className="text-white text-xs">{nft.tokenId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Owner:</span>
                    <span className="text-white text-xs">{nft.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Staked:</span>
                    <span className="text-white text-xs">{formatDate(nft.stakedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
