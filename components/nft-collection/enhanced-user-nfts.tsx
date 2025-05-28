"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import type { NFT } from "@/types/nft"
import { NFTGrid } from "@/components/nft-collection/nft-grid"
import { Loading } from "@/components/loading"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Wallet, ArrowUp, Grid, List, CheckCircle, XCircle } from "lucide-react"

interface CollectionGroup {
  address: string
  name: string
  isVerified: boolean
  isWhitelisted: boolean
  nfts: NFT[]
  totalValue: string
}

export default function EnhancedUserNFTs() {
  const { address, isConnected, chainId, switchNetwork } = useWallet()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [collections, setCollections] = useState<CollectionGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null)

  const isSonicNetwork = chainId === 146

  useEffect(() => {
    async function loadUserNFTs() {
      if (!address || !isConnected || !isSonicNetwork) return

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`https://api.paintswap.finance/userNFTs/?user=${address}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch user NFTs: ${response.status}`)
        }

        const data = await response.json()

        // Process the enhanced NFT data
        const processedNFTs = (data.nfts || []).map((nftData: any) => ({
          id: nftData.id,
          tokenId: nftData.tokenId,
          address: nftData.address,
          name:
            getCollectionName(nftData.address) === "Sonic Llamas"
              ? `Sonic Llama #${nftData.tokenId}`
              : `NFT #${nftData.tokenId}`,
          description: "",
          image: `https://media-nft.paintswap.finance/${nftData.address}_${nftData.tokenId}_146.jpg`,
          thumbnail: `https://media-nft.paintswap.finance/${nftData.address}_${nftData.tokenId}_146_thumb.jpg`,
          owner: nftData.owner,
          creator: nftData.creator,
          collection: {
            address: nftData.address,
            name: getCollectionName(nftData.address),
            isVerified: nftData.collection?.verified || false,
            isWhitelisted: nftData.collection?.isWhitelisted || false,
          },
          attributes: [],
          rarity: null,
          createdAt: new Date(Number.parseInt(nftData.createdTimestamp) * 1000).toISOString(),
          lastTransferAt: new Date(Number.parseInt(nftData.lastTransferTimestamp) * 1000).toISOString(),
          isOnSale: nftData.onSale || false,
          price: nftData.price || "0",
          isERC721: nftData.isERC721,
          mintOrder: nftData.mintOrder,
          approvalState: nftData.approvalState,
          contentVerified: nftData.contentVerified,
          locked: Number.parseInt(nftData.locked) > 0,
          isTransferable: nftData.isTransferable,
          isTracked: nftData.isTracked,
        }))

        setNfts(processedNFTs)

        // Group NFTs by collection
        const collectionGroups = groupNFTsByCollection(processedNFTs)
        setCollections(collectionGroups)
      } catch (err) {
        console.error("Error fetching user NFTs:", err)
        setError("Failed to load your NFTs. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadUserNFTs()
  }, [address, isConnected, isSonicNetwork])

  function getCollectionName(address: string): string {
    const collections: Record<string, string> = {
      "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e": "Sonic Llamas",
      "0x014f74668e8802cead8a54739816408bbdbf1101": "Sonic Creatures",
      "0x00000000001594c61dd8a6804da9ab58ed2483ce": "Unknown Collection",
    }
    return collections[address] || `Collection ${address.substring(0, 6)}...`
  }

  function groupNFTsByCollection(nfts: NFT[]): CollectionGroup[] {
    const groups: Record<string, CollectionGroup> = {}

    nfts.forEach((nft) => {
      if (!groups[nft.address]) {
        groups[nft.address] = {
          address: nft.address,
          name: nft.collection.name,
          isVerified: nft.collection.isVerified,
          isWhitelisted: nft.collection.isWhitelisted,
          nfts: [],
          totalValue: "0",
        }
      }
      groups[nft.address].nfts.push(nft)
    })

    return Object.values(groups).sort((a, b) => {
      // Sort verified collections first, then by NFT count
      if (a.isVerified && !b.isVerified) return -1
      if (!a.isVerified && b.isVerified) return 1
      return b.nfts.length - a.nfts.length
    })
  }

  const filteredCollections = collections.filter((collection) => {
    if (filterVerified === null) return true
    return collection.isVerified === filterVerified
  })

  const totalNFTs = nfts.length
  const verifiedNFTs = nfts.filter((nft) => nft.collection.isVerified).length
  const lockedNFTs = nfts.filter((nft) => nft.locked).length

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Wallet className="mb-4 h-16 w-16 text-gray-400" />
        <h2 className="mb-2 text-2xl font-bold">Connect Your Wallet</h2>
        <p className="mb-6 text-gray-400">Connect your wallet to view your NFTs on Sonic Mainnet</p>
        <div className="flex justify-center items-center text-green-400">
          <ArrowUp className="animate-bounce mr-2" size={20} />
          <span>Use the Connect Wallet button in the header</span>
        </div>
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
      {/* Header with Stats */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">My NFT Collection</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">{totalNFTs}</div>
              <div className="text-sm text-gray-400">Total NFTs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">{verifiedNFTs}</div>
              <div className="text-sm text-gray-400">Verified NFTs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-400">{collections.length}</div>
              <div className="text-sm text-gray-400">Collections</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-400">{lockedNFTs}</div>
              <div className="text-sm text-gray-400">Locked/Staked</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={filterVerified === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterVerified(null)}
            >
              All Collections
            </Button>
            <Button
              variant={filterVerified === true ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterVerified(true)}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Verified Only
            </Button>
            <Button
              variant={filterVerified === false ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterVerified(false)}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Unverified
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Collections Display */}
      <Tabs defaultValue="collections" className="w-full">
        <TabsList>
          <TabsTrigger value="collections">By Collection</TabsTrigger>
          <TabsTrigger value="all">All NFTs</TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-6">
          {filteredCollections.map((collection) => (
            <Card key={collection.address}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">{collection.name}</CardTitle>
                    <div className="flex gap-2">
                      {collection.isVerified && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {collection.isWhitelisted && <Badge variant="secondary">Whitelisted</Badge>}
                    </div>
                  </div>
                  <Badge variant="outline">{collection.nfts.length} NFTs</Badge>
                </div>
                <p className="text-sm text-gray-400">Contract: {collection.address}</p>
              </CardHeader>
              <CardContent>
                <NFTGrid nfts={collection.nfts} />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="all">
          <NFTGrid nfts={nfts} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
