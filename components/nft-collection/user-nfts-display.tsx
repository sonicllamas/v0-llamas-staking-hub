"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import { fetchUserNFTs } from "@/lib/nft-service"
import type { NFT } from "@/types/nft"
import NFTGrid from "./nft-grid"
import Loading from "@/components/loading"
import { Button } from "@/components/ui/button"
import { AlertCircle, Wallet } from "lucide-react"

export default function UserNFTsDisplay() {
  const { address, isConnected, chainId, switchNetwork } = useWallet()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSonicNetwork = chainId === 146

  useEffect(() => {
    async function loadUserNFTs() {
      if (!address || !isConnected || !isSonicNetwork) return

      setLoading(true)
      setError(null)

      try {
        const userNfts = await fetchUserNFTs(address)
        setNfts(userNfts)
      } catch (err) {
        console.error("Error fetching user NFTs:", err)
        setError("Failed to load your NFTs. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadUserNFTs()
  }, [address, isConnected, isSonicNetwork])

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Wallet className="mb-4 h-16 w-16 text-gray-400" />
        <h2 className="mb-2 text-2xl font-bold">Connect Your Wallet</h2>
        <p className="mb-6 text-gray-400">Connect your wallet to view your NFTs on Sonic Mainnet</p>
      </div>
    )
  }

  if (!isSonicNetwork) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="mb-4 h-16 w-16 text-yellow-400" />
        <h2 className="mb-2 text-2xl font-bold">Wrong Network</h2>
        <p className="mb-6 text-gray-400">Please switch to Sonic Mainnet to view your NFTs</p>
        <Button onClick={() => switchNetwork(146)}>Switch to Sonic</Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loading />
        <p className="mt-4 text-gray-400">Loading your NFTs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="mb-4 h-16 w-16 text-red-400" />
        <h2 className="mb-2 text-2xl font-bold">Error Loading NFTs</h2>
        <p className="mb-6 text-gray-400">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">No NFTs Found</h2>
        <p className="text-gray-400">You don't have any NFTs on Sonic Mainnet yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My NFTs on Sonic Mainnet</h1>
      <p className="text-gray-400">
        Showing {nfts.length} NFT{nfts.length !== 1 ? "s" : ""} from your wallet
      </p>
      <NFTGrid nfts={nfts} />
    </div>
  )
}
