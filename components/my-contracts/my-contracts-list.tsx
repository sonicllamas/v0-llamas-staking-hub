"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import { WalletRequiredCard } from "@/components/create-staking/wallet-required-card"
import { NetworkRequiredCard } from "@/components/create-staking/network-required-card"
import { ContractCard } from "./contract-card"
import { Loading } from "@/components/loading"
import { fetchUserContracts } from "@/lib/contract-service"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export interface Contract {
  address: string
  name: string
  symbol: string
  nftCollection: string
  rewardToken: string
  stakedCount: number
  totalRewards: string
  createdAt: string
}

export function MyContractsList() {
  const { isConnected, chainId, address } = useWallet()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadContracts = async () => {
      if (isConnected && address && chainId === 146) {
        setLoading(true)
        try {
          const userContracts = await fetchUserContracts(address)
          setContracts(userContracts)
        } catch (error) {
          console.error("Failed to load contracts:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadContracts()
  }, [isConnected, address, chainId])

  // Check if user is connected to wallet
  if (!isConnected) {
    return <WalletRequiredCard />
  }

  // Check if user is on Sonic Mainnet
  if (chainId !== 146) {
    return <NetworkRequiredCard />
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      {contracts.length === 0 ? (
        <div className="bg-[#0d2416] rounded-xl p-8 text-center">
          <h2 className="text-white text-2xl font-bold mb-4">No Contracts Found</h2>
          <p className="text-green-100 mb-6">You haven't deployed any staking contracts yet.</p>
          <Link
            href="/create-staking"
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-full font-bold transition-colors inline-flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Create Your First Contract
          </Link>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-white text-xl font-bold">Your Contracts ({contracts.length})</h2>
            <Link
              href="/create-staking"
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full text-sm font-bold transition-colors inline-flex items-center gap-2"
            >
              <PlusCircle size={16} />
              New Contract
            </Link>
          </div>

          <div className="space-y-4">
            {contracts.map((contract) => (
              <ContractCard key={contract.address} contract={contract} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
