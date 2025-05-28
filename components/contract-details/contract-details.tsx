"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import { NetworkRequiredCard } from "@/components/create-staking/network-required-card"
import { ContractStats } from "./contract-stats"
import { StakedNFTs } from "./staked-nfts"
import { ContractActions } from "./contract-actions"
import { ContractSettings } from "./contract-settings"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ContractLoadingError, NetworkError, WalletError } from "@/components/error-states"

interface ContractDetailsProps {
  address: string
}

export function ContractDetails({ address }: ContractDetailsProps) {
  const { isConnected, chainId } = useWallet()
  const [loading, setLoading] = useState(true)
  const [contract, setContract] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isNetworkError, setIsNetworkError] = useState(false)

  useEffect(() => {
    const loadContract = async () => {
      if (isConnected && chainId === 146) {
        setLoading(true)
        setError(null)
        setIsNetworkError(false)

        try {
          // Mock data for demonstration
          await new Promise((resolve) => setTimeout(resolve, 1000))
          setContract({
            address,
            name: "Llama Staking",
            symbol: "LLSTK",
            nftCollection: "0xabcdef1234567890abcdef1234567890abcdef12",
            rewardToken: "0x9876543210fedcba9876543210fedcba98765432",
            stakedCount: 42,
            totalRewards: "1,250 SLL",
            createdAt: "2025-05-15T12:00:00Z",
            owner: "0x1234567890123456789012345678901234567890",
            isPaused: false,
            rewardRate: "10",
            rewardInterval: "86400",
            stakingType: "flexible",
          })
        } catch (err: any) {
          console.error("Failed to load contract:", err)
          if (err.message?.includes("network") || err.name === "NetworkError" || !navigator.onLine) {
            setIsNetworkError(true)
          } else {
            setError("Failed to load contract details")
          }
        } finally {
          setLoading(false)
        }
      }
    }

    loadContract()
  }, [isConnected, chainId, address])

  const retryLoading = () => {
    if (isConnected && chainId === 146) {
      setLoading(true)
      setError(null)
      setIsNetworkError(false)

      // Simulate loading contract data again
      setTimeout(() => {
        setContract({
          address,
          name: "Llama Staking",
          symbol: "LLSTK",
          nftCollection: "0xabcdef1234567890abcdef1234567890abcdef12",
          rewardToken: "0x9876543210fedcba9876543210fedcba98765432",
          stakedCount: 42,
          totalRewards: "1,250 SLL",
          createdAt: "2025-05-15T12:00:00Z",
          owner: "0x1234567890123456789012345678901234567890",
          isPaused: false,
          rewardRate: "10",
          rewardInterval: "86400",
          stakingType: "flexible",
        })
        setLoading(false)
      }, 1000)
    }
  }

  // Check if user is connected to wallet
  if (!isConnected) {
    return <WalletError />
  }

  // Check if user is on Sonic Mainnet
  if (chainId !== 146) {
    return <NetworkRequiredCard />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white">Loading contract details...</p>
        </div>
      </div>
    )
  }

  if (isNetworkError) {
    return <NetworkError onRetry={retryLoading} />
  }

  if (error || !contract) {
    return <ContractLoadingError onRetry={retryLoading} contractAddress={address} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/my-contracts"
          className="text-green-300 hover:text-green-200 transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          <span>Back to My Contracts</span>
        </Link>
      </div>

      <div className="bg-[#0d2416] rounded-xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-white text-2xl font-bold">{contract.name}</h2>
            <p className="text-gray-400">{contract.symbol}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                contract.isPaused ? "bg-red-900 text-white" : "bg-green-900 text-green-300"
              }`}
            >
              {contract.isPaused ? "Paused" : "Active"}
            </span>
          </div>
        </div>

        <ContractStats contract={contract} />
      </div>

      <Tabs defaultValue="staked" className="w-full">
        <TabsList className="bg-[#0d2416] border-b border-gray-700 w-full justify-start rounded-none p-0">
          <TabsTrigger
            value="staked"
            className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-green-500 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Staked NFTs
          </TabsTrigger>
          <TabsTrigger
            value="actions"
            className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-green-500 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Contract Actions
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-green-500 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="staked" className="mt-6">
          <StakedNFTs contract={contract} />
        </TabsContent>
        <TabsContent value="actions" className="mt-6">
          <ContractActions contract={contract} />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <ContractSettings contract={contract} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
