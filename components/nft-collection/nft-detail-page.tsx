"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchNFTDetails } from "@/lib/nft-service"
import type { NFT } from "@/types/nft"
import { Loading } from "@/components/loading"
import { BackButton } from "@/components/back-button"
import { NFTAttributes } from "./nft-attributes"
import { NFTTransactionHistory } from "./nft-transaction-history"
import { StakingButton } from "@/components/staking-button"

export function NFTDetailPage() {
  const params = useParams()
  const collectionAddress = params.collectionAddress as string
  const tokenId = params.tokenId as string

  const [nft, setNft] = useState<NFT | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [historyError, setHistoryError] = useState<boolean>(false)

  useEffect(() => {
    async function loadNFTDetails() {
      if (!collectionAddress || !tokenId) return

      setLoading(true)
      setError(null)

      try {
        const nftDetails = await fetchNFTDetails(collectionAddress, tokenId)
        setNft(nftDetails)
      } catch (err) {
        console.error("Error loading NFT details:", err)
        setError("Failed to load NFT details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadNFTDetails()
  }, [collectionAddress, tokenId])

  if (loading) {
    return <Loading message="Loading NFT details..." />
  }

  if (error || !nft) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error || "NFT not found"}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#0d2416] text-white px-4 py-2 rounded hover:bg-[#143621] transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  const handleHistoryError = (isError: boolean) => {
    setHistoryError(isError)
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <BackButton href="/my-nfts" />
        <StakingButton nft={nft} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#0d2416] rounded-xl overflow-hidden">
          <img
            src={nft.image || "/placeholder.svg"}
            alt={nft.name}
            className="w-full object-contain"
            style={{ maxHeight: "500px" }}
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{nft.name}</h1>
            <p className="text-gray-400 mt-2">Token ID: {nft.tokenId}</p>
          </div>

          {nft.description && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Description</h2>
              <p className="text-gray-300">{nft.description}</p>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Collection</h2>
            <div className="flex items-center space-x-3">
              {nft.collection.image && (
                <img
                  src={nft.collection.image || "/placeholder.svg"}
                  alt={nft.collection.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="text-white font-medium">{nft.collection.name}</p>
                {nft.collection.isVerified && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Verified</span>
                )}
              </div>
            </div>
          </div>

          {nft.rarity && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Rarity</h2>
              <div className="bg-[#143621] p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Rank</span>
                  <span className="text-white font-medium">
                    #{nft.rarity.rank} / {nft.rarity.total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Score</span>
                  <span className="text-white font-medium">{nft.rarity.score.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="attributes">
        <TabsList className="bg-[#0d2416]">
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>
        <TabsContent value="attributes" className="mt-6">
          <NFTAttributes attributes={nft.attributes || []} />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          {historyError && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
              <p className="font-bold">Note</p>
              <p>
                We're showing placeholder transaction history data for this NFT. Real transaction data may not be
                available yet.
              </p>
            </div>
          )}
          <NFTTransactionHistory
            collectionAddress={collectionAddress}
            tokenId={tokenId}
            onHistoryError={handleHistoryError}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
