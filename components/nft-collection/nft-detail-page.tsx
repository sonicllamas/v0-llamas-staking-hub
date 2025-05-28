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
import { ScrollAnimation } from "@/components/scroll-animation"
import { ProgressiveImage } from "@/components/progressive-image"

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
      <ScrollAnimation animation="fadeInDown" delay={0.1}>
        <div className="flex justify-between items-center">
          <BackButton href="/my-nfts" />
          <StakingButton nft={nft} />
        </div>
      </ScrollAnimation>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ScrollAnimation animation="fadeInLeft" delay={0.2}>
          <div className="bg-[#0d2416] rounded-xl overflow-hidden">
            <div className="aspect-square relative">
              <ProgressiveImage
                src={nft.image || "/placeholder.svg"}
                alt={nft.name}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </ScrollAnimation>

        <div className="space-y-6">
          <ScrollAnimation animation="fadeInRight" delay={0.3}>
            <div>
              <h1 className="text-3xl font-bold text-white">{nft.name}</h1>
              <p className="text-gray-400 mt-2">Token ID: {nft.tokenId}</p>
            </div>
          </ScrollAnimation>

          {nft.description && (
            <ScrollAnimation animation="fadeInRight" delay={0.4}>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Description</h2>
                <p className="text-gray-300">{nft.description}</p>
              </div>
            </ScrollAnimation>
          )}

          <ScrollAnimation animation="fadeInRight" delay={0.5}>
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Collection</h2>
              <div className="flex items-center space-x-3">
                {nft.collection.image && (
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <ProgressiveImage
                      src={nft.collection.image || "/placeholder.svg"}
                      alt={nft.collection.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">{nft.collection.name}</p>
                  {nft.collection.isVerified && (
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Verified</span>
                  )}
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {nft.rarity && (
            <ScrollAnimation animation="fadeInRight" delay={0.6}>
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
            </ScrollAnimation>
          )}
        </div>
      </div>

      <ScrollAnimation animation="fadeInUp" delay={0.7}>
        <Tabs defaultValue="attributes">
          <TabsList className="bg-[#0d2416]">
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
          </TabsList>
          <TabsContent value="attributes" className="mt-6">
            <ScrollAnimation animation="fadeInUp" delay={0.1}>
              <NFTAttributes attributes={nft.attributes || []} />
            </ScrollAnimation>
          </TabsContent>
          <TabsContent value="history" className="mt-6">
            <ScrollAnimation animation="fadeInUp" delay={0.1}>
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
            </ScrollAnimation>
          </TabsContent>
        </Tabs>
      </ScrollAnimation>
    </div>
  )
}
