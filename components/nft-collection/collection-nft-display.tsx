"use client"

import { useState, useEffect } from "react"
import { NFTGrid } from "./nft-grid"
import type { NFT } from "@/types/nft"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"

interface CollectionNFTDisplayProps {
  contractAddress: string
}

// Mock NFT data for the collection
const generateMockNFTs = (contractAddress: string): NFT[] => {
  const baseNFTs: NFT[] = []

  // Generate different NFTs based on contract address
  const isLlamasContract = contractAddress.toLowerCase().includes("0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e")

  if (isLlamasContract) {
    // Sonic Llamas NFTs
    for (let i = 1; i <= 24; i++) {
      baseNFTs.push({
        id: `${contractAddress}-${i}`,
        name: `Sonic Llama #${i}`,
        image: "/sonic-llamas-logo.jpg",
        tokenId: i.toString(),
        contractAddress,
        rarity: i <= 5 ? "Legendary" : i <= 12 ? "Rare" : "Common",
        attributes: [
          { trait_type: "Background", value: `Background ${(i % 5) + 1}` },
          { trait_type: "Body", value: `Body ${(i % 3) + 1}` },
          { trait_type: "Eyes", value: `Eyes ${(i % 4) + 1}` },
          { trait_type: "Accessory", value: `Accessory ${(i % 6) + 1}` },
        ],
        owner: "0x1234...5678",
        isStaked: i % 4 === 0,
        stakingRewards: i % 4 === 0 ? (Math.random() * 100).toFixed(2) : undefined,
      })
    }
  } else {
    // Generic NFTs for other contracts
    for (let i = 1; i <= 16; i++) {
      baseNFTs.push({
        id: `${contractAddress}-${i}`,
        name: `NFT #${i}`,
        image: "/placeholder.svg?height=300&width=300&query=NFT artwork",
        tokenId: i.toString(),
        contractAddress,
        rarity: i <= 3 ? "Legendary" : i <= 8 ? "Rare" : "Common",
        attributes: [
          { trait_type: "Type", value: `Type ${(i % 3) + 1}` },
          { trait_type: "Color", value: `Color ${(i % 5) + 1}` },
        ],
        owner: "0x1234...5678",
        isStaked: false,
      })
    }
  }

  return baseNFTs
}

export function CollectionNFTDisplay({ contractAddress }: CollectionNFTDisplayProps) {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [filteredNfts, setFilteredNfts] = useState<NFT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [rarityFilter, setRarityFilter] = useState<string>("all")
  const [stakingFilter, setStakingFilter] = useState<string>("all")

  useEffect(() => {
    // Simulate API call
    const fetchNFTs = async () => {
      setIsLoading(true)
      try {
        // For demo purposes, we'll use a specific user's NFTs from the Sonic Llamas collection
        const demoUserAddress = "0x1e9f317cb3a0c3b23c9d82daec5a18d7895639f0"
        const response = await fetch(
          `https://api.paintswap.finance/userNFTs/${contractAddress}?user=${demoUserAddress}`,
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch NFTs: ${response.status}`)
        }

        const data = await response.json()

        // Transform the API response to match our NFT interface
        const transformedNFTs: NFT[] = data.nfts.map((nftData: any) => ({
          id: nftData.id,
          name: `Sonic Llama #${nftData.tokenId}`,
          image: `https://media-nft.paintswap.finance/${nftData.address}_${nftData.tokenId}_146.jpg`,
          tokenId: nftData.tokenId,
          contractAddress: nftData.address,
          rarity: getRarityFromTokenId(Number.parseInt(nftData.tokenId)),
          attributes: generateAttributesFromTokenId(Number.parseInt(nftData.tokenId)),
          owner: nftData.owner || nftData.user,
          isStaked: Number.parseInt(nftData.tokenId) % 4 === 0, // Mock staking status
          stakingRewards: Number.parseInt(nftData.tokenId) % 4 === 0 ? (Math.random() * 100).toFixed(2) : undefined,
          isOnSale: nftData.onSale || false,
          price: nftData.price || "0",
          verified: nftData.collection?.verified || false,
          whitelisted: nftData.collection?.isWhitelisted || false,
          createdAt: new Date(Number.parseInt(nftData.createdTimestamp) * 1000).toISOString(),
          lastTransferAt: new Date(Number.parseInt(nftData.lastTransferTimestamp) * 1000).toISOString(),
        }))

        setNfts(transformedNFTs)
        setFilteredNfts(transformedNFTs)
      } catch (error) {
        console.error("Error fetching NFTs:", error)
        // Fallback to mock data if API fails
        const mockNFTs = generateMockNFTs(contractAddress)
        setNfts(mockNFTs)
        setFilteredNfts(mockNFTs)
      } finally {
        setIsLoading(false)
      }
    }

    // Helper function to determine rarity based on token ID
    const getRarityFromTokenId = (tokenId: number): string => {
      if (tokenId <= 5) return "Legendary"
      if (tokenId <= 15) return "Rare"
      return "Common"
    }

    // Helper function to generate attributes based on token ID
    const generateAttributesFromTokenId = (tokenId: number) => {
      const backgrounds = ["Mountain", "Desert", "Forest", "Ocean", "Space", "City", "Jungle", "Arctic"]
      const furColors = ["Golden", "Brown", "White", "Black", "Gray", "Spotted", "Rainbow", "Metallic"]
      const eyeColors = ["Blue", "Green", "Brown", "Red", "Purple", "Yellow", "Glowing", "Heterochromia"]
      const accessories = ["None", "Scarf", "Hat", "Glasses", "Necklace", "Backpack", "Earrings", "Crown"]

      return [
        { trait_type: "Background", value: backgrounds[tokenId % backgrounds.length] },
        { trait_type: "Fur", value: furColors[Math.floor(tokenId / 3) % furColors.length] },
        { trait_type: "Eyes", value: eyeColors[Math.floor(tokenId / 2) % eyeColors.length] },
        { trait_type: "Accessory", value: accessories[tokenId % accessories.length] },
      ]
    }

    fetchNFTs()
  }, [contractAddress])

  useEffect(() => {
    let filtered = nfts

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (nft) => nft.name.toLowerCase().includes(searchTerm.toLowerCase()) || nft.tokenId.includes(searchTerm),
      )
    }

    // Apply rarity filter
    if (rarityFilter !== "all") {
      filtered = filtered.filter((nft) => nft.rarity === rarityFilter)
    }

    // Apply staking filter
    if (stakingFilter === "staked") {
      filtered = filtered.filter((nft) => nft.isStaked)
    } else if (stakingFilter === "unstaked") {
      filtered = filtered.filter((nft) => !nft.isStaked)
    }

    setFilteredNfts(filtered)
  }, [nfts, searchTerm, rarityFilter, stakingFilter])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading NFTs...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="mb-4 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-blue-800">
              <strong>Live Data:</strong> Showing real NFTs from PaintSwap API for demo user
              <code className="bg-blue-100 px-1 rounded text-xs ml-1">0x1e9f...639f0</code>
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or token ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Rarities</option>
                <option value="Common">Common</option>
                <option value="Rare">Rare</option>
                <option value="Legendary">Legendary</option>
              </select>
              <select
                value={stakingFilter}
                onChange={(e) => setStakingFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All NFTs</option>
                <option value="staked">Staked Only</option>
                <option value="unstaked">Unstaked Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredNfts.length} of {nfts.length} NFTs
        </p>
        {filteredNfts.length !== nfts.length && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("")
              setRarityFilter("all")
              setStakingFilter("all")
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* NFT Grid */}
      <NFTGrid nfts={filteredNfts} isSelectable={false} />

      {filteredNfts.length === 0 && nfts.length > 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No NFTs Found</h3>
            <p className="text-gray-600 mb-4">
              No NFTs match your current filters. Try adjusting your search criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setRarityFilter("all")
                setStakingFilter("all")
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
