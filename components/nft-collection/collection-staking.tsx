"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import { fetchUserCollectionNFTs } from "@/lib/nft-service"
import { NFTGrid } from "./nft-grid"
import { Loading } from "@/components/loading"
import { StakeNFTsModal } from "./stake-nfts-modal"
import type { NFT } from "@/types/nft"

interface CollectionStakingProps {
  collectionAddress: string
}

export function CollectionStaking({ collectionAddress }: CollectionStakingProps) {
  const { account } = useWallet()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [selectedNfts, setSelectedNfts] = useState<NFT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false)

  // Fetch NFTs when account changes
  useEffect(() => {
    async function loadNFTs() {
      if (!account) {
        setNfts([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const userNfts = await fetchUserCollectionNFTs(account, collectionAddress)
        setNfts(userNfts)
      } catch (err) {
        console.error("Error loading NFTs:", err)
        setError("Failed to load your NFTs. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadNFTs()
  }, [account, collectionAddress])

  // Handle NFT selection
  const toggleNftSelection = (nft: NFT) => {
    if (selectedNfts.some((selected) => selected.id === nft.id)) {
      setSelectedNfts(selectedNfts.filter((selected) => selected.id !== nft.id))
    } else {
      setSelectedNfts([...selectedNfts, nft])
    }
  }

  if (isLoading) {
    return <Loading message="Loading your NFTs..." />
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#0d2416] text-white px-4 py-2 rounded hover:bg-[#143621] transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">Please connect your wallet to view your NFTs.</p>
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">You don&apos;t have any NFTs from this collection.</p>
        <p className="text-sm text-gray-500">
          Visit the{" "}
          <a href="/collections" className="text-[#0d2416] underline">
            Collections
          </a>{" "}
          page to browse available NFTs.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-[#0d2416] text-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Stake Your NFTs</h2>
        <p className="mb-4">Select the NFTs you want to stake to earn rewards.</p>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm">
              Available NFTs: <span className="font-bold">{nfts.length}</span>
            </p>
            <p className="text-sm">
              Selected: <span className="font-bold">{selectedNfts.length}</span>
            </p>
          </div>
          {selectedNfts.length > 0 && (
            <div className="space-x-4">
              <button onClick={() => setSelectedNfts([])} className="text-gray-300 hover:text-white">
                Clear Selection
              </button>
              <button
                onClick={() => setIsStakeModalOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                Stake Selected NFTs
              </button>
            </div>
          )}
        </div>
      </div>

      {/* NFT Grid */}
      <NFTGrid nfts={nfts} selectedNfts={selectedNfts} onSelectNft={toggleNftSelection} selectable={true} />

      {/* Stake Modal */}
      <StakeNFTsModal isOpen={isStakeModalOpen} onClose={() => setIsStakeModalOpen(false)} nfts={selectedNfts} />
    </div>
  )
}
