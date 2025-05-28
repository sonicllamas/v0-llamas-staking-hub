"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import { ContractCard } from "./contract-card"
import { Loading } from "@/components/loading"
import { fetchUserContracts } from "@/lib/contract-service"
import { PlusCircle, RefreshCw, Wallet } from "lucide-react"
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
  const {
    isConnected: contextConnected,
    chainId: contextChainId,
    address: contextAddress,
    connect: contextConnect,
    switchNetwork,
  } = useWallet()

  // Direct wallet state (bypassing context issues)
  const [directWalletState, setDirectWalletState] = useState<{
    address: string | null
    chainId: number | null
    isConnected: boolean
  }>({
    address: null,
    chainId: null,
    isConnected: false,
  })

  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [isCheckingWallet, setIsCheckingWallet] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Direct wallet check function
  const checkWalletDirect = async () => {
    console.log("🔍 [My Contracts] Checking wallet directly...")

    if (typeof window === "undefined" || !window.ethereum) {
      console.log("❌ [My Contracts] No ethereum provider")
      setDirectWalletState({ address: null, chainId: null, isConnected: false })
      return
    }

    try {
      const [accounts, chainIdHex] = await Promise.all([
        window.ethereum.request({ method: "eth_accounts" }) as Promise<string[]>,
        window.ethereum.request({ method: "eth_chainId" }) as Promise<string>,
      ])

      const address = accounts && accounts.length > 0 ? accounts[0] : null
      const chainId = chainIdHex ? Number.parseInt(chainIdHex, 16) : null

      console.log("📱 [My Contracts] Direct wallet check:", { address, chainId, isConnected: !!address })

      setDirectWalletState({
        address,
        chainId,
        isConnected: !!address,
      })
    } catch (error) {
      console.error("❌ [My Contracts] Direct wallet check failed:", error)
      setDirectWalletState({ address: null, chainId: null, isConnected: false })
    }
  }

  // Check wallet on mount and periodically
  useEffect(() => {
    checkWalletDirect()
    setIsCheckingWallet(false)

    // Check every 2 seconds for wallet changes
    const interval = setInterval(checkWalletDirect, 2000)
    return () => clearInterval(interval)
  }, [])

  // Determine actual wallet state (prefer direct over context)
  const actuallyConnected = directWalletState.isConnected || contextConnected
  const actualAddress = directWalletState.address || contextAddress
  const actualChainId = directWalletState.chainId || contextChainId

  console.log("🔧 [My Contracts] Wallet State Comparison:", {
    context: { connected: contextConnected, address: contextAddress, chainId: contextChainId },
    direct: directWalletState,
    final: { connected: actuallyConnected, address: actualAddress, chainId: actualChainId },
  })

  // Load contracts when wallet is connected and on correct network
  useEffect(() => {
    const loadContracts = async () => {
      if (actuallyConnected && actualAddress && actualChainId === 146) {
        setLoading(true)
        setError(null)
        try {
          console.log("📄 [My Contracts] Loading contracts for:", actualAddress)
          const userContracts = await fetchUserContracts(actualAddress)
          setContracts(userContracts)
          console.log("✅ [My Contracts] Loaded contracts:", userContracts.length)
        } catch (error) {
          console.error("❌ [My Contracts] Failed to load contracts:", error)
          setError("Failed to load contracts. Please try again.")
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    loadContracts()
  }, [actuallyConnected, actualAddress, actualChainId])

  // Direct connect function
  const handleDirectConnect = async () => {
    console.log("🔗 [My Contracts] Attempting direct wallet connection...")

    if (typeof window === "undefined" || !window.ethereum) {
      setError("No Ethereum wallet found")
      return
    }

    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[]

      if (accounts && accounts.length > 0) {
        console.log("✅ [My Contracts] Direct connection successful:", accounts[0])
        await checkWalletDirect() // Refresh state
      }
    } catch (error) {
      console.error("❌ [My Contracts] Direct connection failed:", error)
      setError("Failed to connect wallet")
    }
  }

  // Direct network switch function
  const handleDirectNetworkSwitch = async () => {
    console.log("🔄 [My Contracts] Attempting direct network switch...")

    if (typeof window === "undefined" || !window.ethereum) {
      setError("No Ethereum wallet found")
      return
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x92" }], // 146 in hex
      })

      console.log("✅ [My Contracts] Network switch successful")
      await checkWalletDirect() // Refresh state
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x92",
                chainName: "Sonic Mainnet",
                nativeCurrency: {
                  name: "Sonic",
                  symbol: "S",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.soniclabs.com"],
                blockExplorerUrls: ["https://sonicscan.org"],
              },
            ],
          })
          console.log("✅ [My Contracts] Network added and switched")
          await checkWalletDirect()
        } catch (addError) {
          console.error("❌ [My Contracts] Failed to add network:", addError)
          setError("Failed to add Sonic network")
        }
      } else {
        console.error("❌ [My Contracts] Failed to switch network:", switchError)
        setError("Failed to switch to Sonic network")
      }
    }
  }

  // Show loading while checking wallet
  if (isCheckingWallet) {
    return (
      <div className="bg-[#0d2416] rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
        <p className="text-green-100">Checking wallet connection...</p>
      </div>
    )
  }

  // Check if user is connected to wallet
  if (!actuallyConnected) {
    return (
      <div className="bg-[#0d2416] rounded-xl p-8 text-center">
        <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-white text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-green-100 mb-6">Connect your wallet to view your staking contracts on Sonic Mainnet</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <p className="text-green-400 text-sm">↑ Use the Connect Wallet button in the header</p>

          <div className="flex gap-2">
            <button
              onClick={checkWalletDirect}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full text-sm font-bold transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh Connection
            </button>

            <button
              onClick={handleDirectConnect}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full text-sm font-bold transition-colors inline-flex items-center gap-2"
            >
              <Wallet size={16} />
              Connect Wallet
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-black/30 rounded-lg text-left">
          <h3 className="text-yellow-400 font-bold mb-2">🔧 Debug Info</h3>
          <div className="text-xs space-y-1">
            <div>Context Connected: {contextConnected ? "✅" : "❌"}</div>
            <div>Direct Connected: {directWalletState.isConnected ? "✅" : "❌"}</div>
            <div>
              Context Address: {contextAddress ? `${contextAddress.slice(0, 6)}...${contextAddress.slice(-4)}` : "none"}
            </div>
            <div>
              Direct Address:{" "}
              {directWalletState.address
                ? `${directWalletState.address.slice(0, 6)}...${directWalletState.address.slice(-4)}`
                : "none"}
            </div>
            <div>
              Final State: Connected={actuallyConnected ? "✅" : "❌"}, Address=
              {actualAddress ? `${actualAddress.slice(0, 6)}...${actualAddress.slice(-4)}` : "none"}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check if user is on Sonic Mainnet
  if (actualChainId !== 146) {
    return (
      <div className="bg-[#0d2416] rounded-xl p-8 text-center">
        <h2 className="text-white text-2xl font-bold mb-4">Switch to Sonic Mainnet</h2>
        <p className="text-green-100 mb-6">
          You're currently on chain ID {actualChainId}. Please switch to Sonic Mainnet (Chain ID: 146) to view your
          contracts.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleDirectNetworkSwitch}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-full font-bold transition-colors inline-flex items-center gap-2"
          >
            Switch to Sonic Mainnet
          </button>

          <button
            onClick={checkWalletDirect}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full text-sm font-bold transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      {/* Success state with wallet info */}
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-green-400">
          <Wallet size={16} />
          <span className="text-sm">
            Connected: {actualAddress?.slice(0, 6)}...{actualAddress?.slice(-4)} on Sonic Mainnet
          </span>
          <button onClick={checkWalletDirect} className="ml-auto text-green-400 hover:text-green-300">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

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

      {error && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
