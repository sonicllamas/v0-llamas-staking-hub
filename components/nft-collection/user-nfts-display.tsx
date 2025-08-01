"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import type { NFT } from "@/types/nft"
import { Loading } from "@/components/loading"
import { Button } from "@/components/ui/button"
import { AlertCircle, Wallet, ArrowUp, RefreshCw, Search, CheckCircle, Filter, Send } from "lucide-react"
import { BackButton } from "@/components/back-button"
import { sonicNFTService, type SonicNFT } from "@/lib/sonic-nft-api"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TransferNFTModal } from "@/components/nft-transfer/transfer-nft-modal"
import { BulkTransferModal } from "@/components/nft-transfer/bulk-transfer-modal"
import { Checkbox } from "@/components/ui/checkbox"

export default function UserNFTsDisplay() {
  const walletContext = useWallet()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeCollection, setActiveCollection] = useState<string>("all")
  const [loadingProgress, setLoadingProgress] = useState<{
    stage: string
    details: string
    progress: number
    nftsFound: number
  } | null>(null)

  // Direct wallet state
  const [directWalletState, setDirectWalletState] = useState<{
    address: string | null
    chainId: number | null
    isConnected: boolean
    checked: boolean
  }>({
    address: null,
    chainId: null,
    isConnected: false,
    checked: false,
  })

  const [selectedNFTs, setSelectedNFTs] = useState<NFT[]>([])
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [bulkTransferModalOpen, setBulkTransferModalOpen] = useState(false)
  const [selectedNFTForTransfer, setSelectedNFTForTransfer] = useState<NFT | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)

  // Direct wallet check function
  const checkWalletDirect = async () => {
    console.log("🔍 Direct wallet check...")

    if (typeof window === "undefined" || !window.ethereum) {
      console.log("❌ No ethereum provider")
      setDirectWalletState({
        address: null,
        chainId: null,
        isConnected: false,
        checked: true,
      })
      return
    }

    try {
      const [accounts, chainIdHex] = await Promise.all([
        window.ethereum.request({ method: "eth_accounts" }),
        window.ethereum.request({ method: "eth_chainId" }),
      ])

      const address = accounts && accounts.length > 0 ? accounts[0] : null
      const chainId = chainIdHex ? Number.parseInt(chainIdHex, 16) : null
      const isConnected = !!address

      console.log("📱 Direct wallet results:", {
        address,
        chainId,
        isConnected,
      })

      setDirectWalletState({
        address,
        chainId,
        isConnected,
        checked: true,
      })
    } catch (error) {
      console.error("❌ Direct wallet check failed:", error)
      setDirectWalletState({
        address: null,
        chainId: null,
        isConnected: false,
        checked: true,
      })
    }
  }

  // Check wallet on mount
  useEffect(() => {
    checkWalletDirect()
    const interval = setInterval(checkWalletDirect, 3000)
    return () => clearInterval(interval)
  }, [])

  // Use direct wallet state or fallback to context
  const address = directWalletState.address || walletContext.address
  const chainId = directWalletState.chainId || walletContext.chainId
  const isConnected = directWalletState.isConnected || walletContext.isConnected
  const isSonicNetwork = chainId === 146

  // Enhanced NFT loading with better error handling
  useEffect(() => {
    async function loadAllUserNFTs() {
      if (!address || !isConnected || !isSonicNetwork) {
        console.log("❌ Not ready to load NFTs:", { address, isConnected, isSonicNetwork })
        return
      }

      setLoading(true)
      setError(null)
      setLoadingProgress({
        stage: "Initializing",
        details: "Starting NFT discovery...",
        progress: 0,
        nftsFound: 0,
      })

      try {
        console.log(`🔄 Loading ALL NFTs for wallet: ${address}`)

        // Stage 1: Initialize
        setLoadingProgress({
          stage: "Connecting",
          details: "Connecting to PaintSwap API...",
          progress: 10,
          nftsFound: 0,
        })

        // Load from PaintSwap API only (most reliable)
        const sonicNFTs = await sonicNFTService.getAllUserNFTs(address)

        setLoadingProgress({
          stage: "Processing",
          details: `Found ${sonicNFTs.length} NFTs, processing data...`,
          progress: 70,
          nftsFound: sonicNFTs.length,
        })

        // Transform to our NFT format
        const processedNFTs: NFT[] = sonicNFTs.map((sonicNFT: SonicNFT) => ({
          id: `${address}_${sonicNFT.contractAddress}_${sonicNFT.tokenId}`,
          tokenId: sonicNFT.tokenId,
          address: sonicNFT.contractAddress,
          contractAddress: sonicNFT.contractAddress,
          name: sonicNFT.name || `${sonicNFT.collection?.name || "NFT"} #${sonicNFT.tokenId}`,
          description: sonicNFT.description || "",
          image: sonicNFT.image || `/placeholder.svg?height=400&width=400&query=NFT%20${sonicNFT.tokenId}`,
          thumbnail: sonicNFT.image || `/placeholder.svg?height=200&width=200&query=NFT%20${sonicNFT.tokenId}`,
          owner: sonicNFT.owner,
          creator: "unknown",
          collection: {
            address: sonicNFT.contractAddress,
            name: sonicNFT.collection?.name || "Unknown Collection",
            isVerified: sonicNFT.collection?.verified || false,
            isWhitelisted: sonicNFT.collection?.verified || false,
          },
          attributes: sonicNFT.attributes || [],
          rarity: "Common",
          createdAt: new Date().toISOString(),
          lastTransferAt: new Date().toISOString(),
          isOnSale: false,
          price: "0",
          isERC721: true,
          mintOrder: "0",
          approvalState: "pending",
          contentVerified: false,
          verified: sonicNFT.collection?.verified || false,
          whitelisted: sonicNFT.collection?.verified || false,
        }))

        setLoadingProgress({
          stage: "Organizing",
          details: "Organizing collections...",
          progress: 85,
          nftsFound: processedNFTs.length,
        })

        // Group by collection and prioritize SLLAMA
        const sllamaNFTs = processedNFTs.filter(
          (nft) => nft.contractAddress.toLowerCase() === "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e",
        )
        const otherNFTs = processedNFTs.filter(
          (nft) => nft.contractAddress.toLowerCase() !== "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e",
        )

        // Sort SLLAMA by token ID
        sllamaNFTs.sort((a, b) => Number.parseInt(a.tokenId) - Number.parseInt(b.tokenId))

        // Sort other NFTs by collection
        otherNFTs.sort((a, b) => a.collection.name.localeCompare(b.collection.name))

        // Combine with SLLAMA first
        const sortedNFTs = [...sllamaNFTs, ...otherNFTs]

        setLoadingProgress({
          stage: "Complete",
          details: `Successfully loaded ${sortedNFTs.length} NFTs!`,
          progress: 100,
          nftsFound: sortedNFTs.length,
        })

        setNfts(sortedNFTs)

        console.log(`🎉 Final result: ${sortedNFTs.length} NFTs`)
        console.log(`🦙 SLLAMA NFTs: ${sllamaNFTs.length}`)
        console.log(`📦 Other NFTs: ${otherNFTs.length}`)

        // Group by collection for logging
        const collections = new Map<string, number>()
        sortedNFTs.forEach((nft) => {
          const count = collections.get(nft.collection.name) || 0
          collections.set(nft.collection.name, count + 1)
        })

        console.log("📊 Collections found:")
        collections.forEach((count, name) => {
          console.log(`  ${name}: ${count} NFTs`)
        })
      } catch (err) {
        console.error("❌ Error fetching user NFTs:", err)
        setError("Failed to load your NFTs from PaintSwap API. Please try again later.")
      } finally {
        setLoading(false)
        setTimeout(() => setLoadingProgress(null), 3000)
      }
    }

    loadAllUserNFTs()
  }, [address, isConnected, isSonicNetwork])

  const handleRefreshConnection = async () => {
    setRefreshing(true)
    await checkWalletDirect()
    if (walletContext.refreshConnection) {
      await walletContext.refreshConnection()
    }
    setRefreshing(false)
  }

  const handleConnect = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        await checkWalletDirect()
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const handleSwitchNetwork = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x92" }], // 146 in hex
        })
        await checkWalletDirect()
      }
    } catch (error: any) {
      if (error.code === 4902) {
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
          await checkWalletDirect()
        } catch (addError) {
          console.error("Failed to add network:", addError)
        }
      }
    }
  }

  // Group NFTs by collection
  const collections = new Map<string, NFT[]>()
  const collectionCounts = new Map<string, number>()

  nfts.forEach((nft) => {
    const collectionName = nft.collection.name
    if (!collections.has(collectionName)) {
      collections.set(collectionName, [])
    }
    collections.get(collectionName)!.push(nft)
    collectionCounts.set(collectionName, (collectionCounts.get(collectionName) || 0) + 1)
  })

  // Sort collections by size (largest first)
  const sortedCollections = Array.from(collections.entries()).sort((a, b) => b[1].length - a[1].length)

  // Get NFTs for the active collection
  const displayNFTs = activeCollection === "all" ? nfts : nfts.filter((nft) => nft.collection.name === activeCollection)

  const handleNFTSelect = (nft: NFT, selected: boolean) => {
    if (selected) {
      setSelectedNFTs((prev) => [...prev, nft])
    } else {
      setSelectedNFTs((prev) => prev.filter((n) => n.id !== nft.id))
    }
  }

  const handleSelectAll = () => {
    if (selectedNFTs.length === displayNFTs.length) {
      setSelectedNFTs([])
    } else {
      setSelectedNFTs(displayNFTs)
    }
  }

  const handleTransferSingle = (nft: NFT) => {
    setSelectedNFTForTransfer(nft)
    setTransferModalOpen(true)
  }

  const handleBulkTransfer = () => {
    setBulkTransferModalOpen(true)
  }

  // Show loading while checking wallet
  if (!directWalletState.checked) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton href="/" label="Back to Home" />
          <h1 className="text-3xl font-bold">NFT Marketplace - My Collection</h1>
        </div>
        <div className="flex flex-col items-center justify-center p-8">
          <Loading />
          <p className="mt-4 text-gray-400">Checking wallet connection...</p>
        </div>
      </div>
    )
  }

  if (!isConnected || !address) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton href="/" label="Back to Home" />
          <h1 className="text-3xl font-bold">NFT Marketplace - My Collection</h1>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Wallet className="mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold">Connect Your Wallet</h2>
          <p className="mb-6 text-gray-400">Connect your wallet to view your NFTs in the marketplace</p>

          <div className="space-y-4">
            <div className="flex justify-center items-center text-green-400">
              <ArrowUp className="animate-bounce mr-2" size={20} />
              <span>Use the Connect Wallet button in the header</span>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleRefreshConnection} disabled={refreshing} variant="outline">
                {refreshing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Connection
                  </>
                )}
              </Button>

              <Button onClick={handleConnect} variant="default">
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isSonicNetwork) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton href="/" label="Back to Home" />
          <h1 className="text-3xl font-bold">NFT Marketplace - My Collection</h1>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="mb-4 h-16 w-16 text-yellow-400" />
          <h2 className="mb-2 text-2xl font-bold">Wrong Network</h2>
          <p className="mb-6 text-gray-400">
            Please switch to Sonic Mainnet to access the marketplace
            {chainId && <span className="block text-sm mt-2">Currently on chain ID: {chainId}</span>}
          </p>
          <Button onClick={handleSwitchNetwork}>Switch to Sonic</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton href="/" label="Back to Home" />
          <h1 className="text-3xl font-bold">NFT Marketplace - My Collection</h1>
        </div>
        <div className="flex flex-col items-center justify-center p-8">
          <div className="flex items-center gap-3 mb-4">
            {loadingProgress?.stage === "Complete" ? (
              <CheckCircle className="h-8 w-8 text-green-400" />
            ) : (
              <Search className="h-8 w-8 text-blue-400 animate-pulse" />
            )}
            <Loading />
          </div>
          <div className="text-center space-y-4">
            <p className="text-gray-400">
              Scanning wallet {address?.substring(0, 6)}...{address?.substring(address.length - 4)} for NFTs
            </p>
            {loadingProgress && (
              <div className="space-y-3 max-w-md">
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      loadingProgress.stage === "Complete"
                        ? "bg-gradient-to-r from-green-500 to-green-400"
                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                    }`}
                    style={{ width: `${loadingProgress.progress}%` }}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-400">{loadingProgress.stage}</p>
                  <p className="text-xs text-gray-500">{loadingProgress.details}</p>
                  {loadingProgress.nftsFound > 0 && (
                    <p className="text-xs text-green-400">
                      Found {loadingProgress.nftsFound} NFT{loadingProgress.nftsFound !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton href="/" label="Back to Home" />
          <h1 className="text-3xl font-bold">NFT Marketplace - My Collection</h1>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="mb-4 h-16 w-16 text-red-400" />
          <h2 className="mb-2 text-2xl font-bold">Error Loading Marketplace</h2>
          <p className="mb-6 text-gray-400">{error}</p>
          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
            <Button onClick={handleRefreshConnection} variant="outline">
              Refresh Connection
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton href="/" label="Back to Home" />
          <h1 className="text-3xl font-bold">NFT Marketplace - My Collection</h1>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold">No NFTs Found</h2>
          <p className="text