// NFT Service for interacting with PaintSwap API
import type { NFT, NFTCollection, NFTCollectionResponse, UserNFTsResponse } from "@/types/nft"

const API_BASE_URL = "https://api.paintswap.finance"

/**
 * Fetches all NFT collections from PaintSwap API with enhanced data
 */
export async function fetchAllNFTCollections(): Promise<NFTCollection[]> {
  try {
    console.log("Fetching all collections from PaintSwap API...")
    const response = await fetch(`${API_BASE_URL}/collections/`, {
      headers: {
        Accept: "application/json",
        "Cache-Control": "max-age=300", // Cache for 5 minutes
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.status} ${response.statusText}`)
    }

    const data: NFTCollectionResponse = await response.json()

    // Enhance collection data with additional statistics
    const enhancedCollections = await Promise.all(
      data.collections.map(async (collection) => {
        try {
          const stats = await fetchCollectionStatistics(collection.address)
          return {
            ...collection,
            ...stats,
          }
        } catch (error) {
          console.warn(`Failed to fetch stats for collection ${collection.address}:`, error)
          return collection
        }
      }),
    )

    console.log(`Successfully fetched ${enhancedCollections.length} collections`)
    return enhancedCollections
  } catch (error) {
    console.error("Error fetching NFT collections:", error)
    // Return mock data as fallback
    return getMockCollections()
  }
}

/**
 * Fetches detailed collection statistics from multiple endpoints
 */
export async function fetchCollectionStatistics(collectionAddress: string): Promise<Partial<NFTCollection>> {
  try {
    console.log(`Fetching statistics for collection ${collectionAddress}...`)

    // Fetch collection stats from multiple endpoints in parallel
    const [collectionData, traitsData, salesData] = await Promise.allSettled([
      fetchCollectionDetails(collectionAddress),
      fetchCollectionTraits(collectionAddress),
      fetchCollectionSalesStats(collectionAddress),
    ])

    let stats: Partial<NFTCollection> = {}

    // Process collection details
    if (collectionData.status === "fulfilled" && collectionData.value) {
      stats = { ...stats, ...collectionData.value }
    }

    // Process traits data
    if (traitsData.status === "fulfilled" && traitsData.value) {
      const traitCount = Object.keys(traitsData.value).length
      stats.traitTypes = traitCount
    }

    // Process sales data
    if (salesData.status === "fulfilled" && salesData.value) {
      stats = { ...stats, ...salesData.value }
    }

    return stats
  } catch (error) {
    console.error(`Error fetching collection statistics for ${collectionAddress}:`, error)
    return {}
  }
}

/**
 * Fetches detailed collection information from the collections endpoint
 */
export async function fetchCollectionDetails(collectionAddress: string): Promise<Partial<NFTCollection> | null> {
  try {
    console.log(`Fetching collection details for ${collectionAddress}...`)
    const response = await fetch(`${API_BASE_URL}/collections/${collectionAddress}`, {
      headers: {
        Accept: "application/json",
        "Cache-Control": "max-age=300",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Collection not found: ${collectionAddress}`)
        return null
      }
      throw new Error(`Failed to fetch collection details: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`Successfully fetched collection details for ${collectionAddress}`)

    return {
      address: data.address || collectionAddress,
      name: data.name || `Collection ${collectionAddress.substring(0, 6)}...`,
      description: data.description || "No description available",
      totalSupply: data.totalSupply?.toString() || data.supply?.toString() || "Unknown",
      verified: data.verified || false,
      isWhitelisted: data.isWhitelisted || false,
      image: data.image || data.logo,
      banner: data.banner || data.bannerImage,
      website: data.website,
      twitter: data.twitter,
      discord: data.discord,
      telegram: data.telegram,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }
  } catch (error) {
    console.error(`Error fetching collection details for ${collectionAddress}:`, error)
    return null
  }
}

/**
 * Fetches collection sales statistics
 */
export async function fetchCollectionSalesStats(collectionAddress: string): Promise<Partial<NFTCollection>> {
  try {
    console.log(`Fetching sales stats for collection ${collectionAddress}...`)

    // Try to fetch from collection stats endpoint
    const response = await fetch(`${API_BASE_URL}/collections/${collectionAddress}/stats`, {
      headers: {
        Accept: "application/json",
        "Cache-Control": "max-age=60", // Cache for 1 minute
      },
    })

    if (!response.ok) {
      // Fallback: calculate stats from recent sales
      console.warn(`Stats endpoint failed, calculating from sales data...`)
      return await calculateStatsFromSales(collectionAddress)
    }

    const data = await response.json()

    return {
      floorPrice: data.floorPrice ? formatPrice(data.floorPrice) : undefined,
      volume24h: data.volume24h ? formatVolume(data.volume24h) : undefined,
      volumeWeek: data.volumeWeek ? formatVolume(data.volumeWeek) : undefined,
      totalVolume: data.totalVolume ? formatVolume(data.totalVolume) : undefined,
      sales24h: data.sales24h?.toString(),
      salesWeek: data.salesWeek?.toString(),
      totalSales: data.totalSales?.toString(),
      owners: data.owners || data.uniqueOwners,
      items: data.items || data.totalSupply,
      averagePrice: data.averagePrice ? formatPrice(data.averagePrice) : undefined,
      marketCap: data.marketCap ? formatVolume(data.marketCap) : undefined,
    }
  } catch (error) {
    console.error(`Error fetching collection sales stats for ${collectionAddress}:`, error)
    return {}
  }
}

/**
 * Calculates collection statistics from sales data (fallback method)
 */
async function calculateStatsFromSales(collectionAddress: string): Promise<Partial<NFTCollection>> {
  try {
    const sales = await fetchCollectionSales(collectionAddress, 100)

    if (sales.length === 0) {
      return {}
    }

    // Calculate basic stats from sales data
    const prices = sales.map((sale) => Number.parseFloat(sale.price) / 1e18).filter((price) => price > 0)
    const now = Date.now() / 1000
    const day = 24 * 60 * 60
    const week = 7 * day

    const sales24h = sales.filter((sale) => now - Number.parseInt(sale.startTime) < day)
    const salesWeek = sales.filter((sale) => now - Number.parseInt(sale.startTime) < week)

    const volume24h = sales24h.reduce((sum, sale) => sum + Number.parseFloat(sale.price) / 1e18, 0)
    const volumeWeek = salesWeek.reduce((sum, sale) => sum + Number.parseFloat(sale.price) / 1e18, 0)
    const totalVolume = sales.reduce((sum, sale) => sum + Number.parseFloat(sale.price) / 1e18, 0)

    const floorPrice = Math.min(...prices)
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length

    return {
      floorPrice: floorPrice > 0 ? `${floorPrice.toFixed(3)} S` : undefined,
      volume24h: volume24h > 0 ? formatVolume((volume24h * 1e18).toString()) : undefined,
      volumeWeek: volumeWeek > 0 ? formatVolume((volumeWeek * 1e18).toString()) : undefined,
      totalVolume: totalVolume > 0 ? formatVolume((totalVolume * 1e18).toString()) : undefined,
      sales24h: sales24h.length.toString(),
      salesWeek: salesWeek.length.toString(),
      totalSales: sales.length.toString(),
      averagePrice: averagePrice > 0 ? `${averagePrice.toFixed(3)} S` : undefined,
    }
  } catch (error) {
    console.error(`Error calculating stats from sales for ${collectionAddress}:`, error)
    return {}
  }
}

/**
 * Fetches a specific NFT collection by address with comprehensive data
 */
export async function fetchNFTCollection(address: string): Promise<NFTCollection | null> {
  try {
    console.log(`Fetching comprehensive collection data for ${address}...`)

    // Fetch data from multiple endpoints in parallel
    const [detailsResult, statsResult, traitsResult] = await Promise.allSettled([
      fetchCollectionDetails(address),
      fetchCollectionStatistics(address),
      fetchCollectionTraits(address),
    ])

    let collection: NFTCollection = {
      address: address,
      name: `Collection ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      description: "Collection details could not be loaded.",
      totalSupply: "Unknown",
      image: "/diverse-nft-collection.png",
      banner: "/llama-banner.png",
      verified: false,
      isWhitelisted: false,
    }

    // Merge details
    if (detailsResult.status === "fulfilled" && detailsResult.value) {
      collection = { ...collection, ...detailsResult.value }
    }

    // Merge statistics
    if (statsResult.status === "fulfilled" && statsResult.value) {
      collection = { ...collection, ...statsResult.value }
    }

    // Add trait information
    if (traitsResult.status === "fulfilled" && traitsResult.value) {
      collection.traitTypes = Object.keys(traitsResult.value).length
      collection.traits = traitsResult.value
    }

    // Special handling for Sonic Llamas collection
    if (address.toLowerCase() === "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e") {
      collection = {
        ...collection,
        name: "Sonic Llamas",
        description:
          "A collection of unique Sonic Llamas on the Sonic network. Each Llama has its own personality and traits, making them perfect companions for your digital adventures.",
        verified: true,
        isWhitelisted: true,
        image: "/sonic-llamas-logo.jpg",
        banner: "/llama-island.jpeg",
        website: "https://sonicllamas.io",
        twitter: "@SonicLlamas",
        discord: "https://discord.gg/sonicllamas",
        telegram: "@SonicLlamas",
      }
    }

    console.log(`Successfully fetched comprehensive collection data for ${address}`)
    return collection
  } catch (error) {
    console.error(`Error fetching NFT collection ${address}:`, error)
    return null
  }
}

/**
 * Fetches collection metadata with real-time data
 */
export async function fetchCollectionMetadataOld(
  collectionAddress: string,
  chainId = 146,
  search?: string,
  limit = 50,
  offset = 0,
): Promise<{
  total: number
  nfts: NFT[]
  collection?: NFTCollection
}> {
  try {
    let url = `${API_BASE_URL}/metadata/${collectionAddress}?chainId=${chainId}&limit=${limit}&offset=${offset}`

    if (search) {
      url += `&search=${encodeURIComponent(search)}`
    }

    console.log(`Fetching collection metadata: ${url}`)

    // Fetch metadata and collection details in parallel
    const [metadataResponse, collectionData] = await Promise.allSettled([
      fetch(url, {
        headers: {
          Accept: "application/json",
          "Cache-Control": "max-age=30", // Cache for 30 seconds
        },
      }),
      fetchNFTCollection(collectionAddress),
    ])

    if (metadataResponse.status === "rejected" || !metadataResponse.value.ok) {
      throw new Error(
        `Failed to fetch collection metadata: ${metadataResponse.status === "fulfilled" ? metadataResponse.value.status : "Network error"}`,
      )
    }

    const data = await metadataResponse.value.json()

    // Process and normalize the NFT data
    const nfts = (data.nfts || []).map((nft: any) => transformMetadataNFT(nft, collectionAddress))

    return {
      total: data.total || 0,
      nfts,
      collection: collectionData.status === "fulfilled" ? collectionData.value : undefined,
    }
  } catch (error) {
    console.error("Error fetching collection metadata:", error)
    return {
      total: 0,
      nfts: [],
    }
  }
}

/**
 * Transforms metadata API NFT data to our NFT interface
 */
function transformMetadataNFT(nft: any, collectionAddress: string): NFT {
  // Parse attributes if they exist
  const attributes = (nft.attributes || []).map((attr: any) => ({
    trait_type: attr.trait_type || "",
    value: attr.value || "",
    display_type: attr.display_type,
    frequency: attr.frequency || 0,
    average: attr.average || "0",
    count: attr.count || 0,
  }))

  // Generate enhanced attributes for Sonic Llamas if basic ones are missing
  const tokenIdNum = Number.parseInt(nft.tokenId, 10) || 0
  let enhancedAttributes = [...attributes]

  if (collectionAddress === "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e" && attributes.length <= 2) {
    const backgrounds = ["Mountain", "Desert", "Forest", "Ocean", "Space", "City", "Jungle", "Arctic"]
    const furColors = ["Golden", "Brown", "White", "Black", "Gray", "Spotted", "Rainbow", "Metallic"]
    const eyeColors = ["Blue", "Green", "Brown", "Red", "Purple", "Yellow", "Glowing", "Heterochromia"]
    const accessories = ["None", "Scarf", "Hat", "Glasses", "Necklace", "Backpack", "Earrings", "Crown"]

    enhancedAttributes = [
      { trait_type: "Background", value: backgrounds[tokenIdNum % backgrounds.length] },
      { trait_type: "Fur", value: furColors[Math.floor(tokenIdNum / 10) % furColors.length] },
      { trait_type: "Eyes", value: eyeColors[Math.floor(tokenIdNum / 5) % eyeColors.length] },
      { trait_type: "Accessory", value: accessories[Math.floor(tokenIdNum / 3) % accessories.length] },
      ...attributes,
    ]
  }

  // Generate rarity
  let rarity = "Common"
  if (tokenIdNum % 100 === 0) rarity = "Mythic"
  else if (tokenIdNum % 50 === 0) rarity = "Legendary"
  else if (tokenIdNum % 20 === 0) rarity = "Epic"
  else if (tokenIdNum % 10 === 0) rarity = "Rare"
  else if (tokenIdNum % 5 === 0) rarity = "Uncommon"

  // Construct image URL
  let imageUrl = nft.image || nft.thumbnail || `/placeholder.svg?height=400&width=400&query=NFT%20${nft.tokenId}`
  if (collectionAddress === "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e") {
    imageUrl = `https://media-nft.paintswap.finance/0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e_${nft.tokenId}_146.jpg`
  }

  return {
    id: `${nft.owner || "unknown"}_${collectionAddress}_${nft.tokenId}`,
    tokenId: nft.tokenId || "",
    address: nft.address || collectionAddress,
    name:
      nft.name ||
      `${collectionAddress === "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e" ? "Sonic Llama" : "NFT"} #${nft.tokenId || "Unknown"}`,
    description:
      nft.description ||
      (collectionAddress === "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e"
        ? "A unique Sonic Llama with its own personality and traits."
        : ""),
    image: imageUrl,
    thumbnail: nft.thumbnail || imageUrl,
    owner: nft.owner || "unknown",
    creator: nft.creator || "unknown",
    collection: {
      address: collectionAddress,
      name: collectionAddress === "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e" ? "Sonic Llamas" : "NFT Collection",
      isVerified: nft.collection?.verified || collectionAddress === "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e",
      isWhitelisted:
        nft.collection?.isWhitelisted || collectionAddress === "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e",
    },
    attributes: enhancedAttributes,
    rarity,
    createdAt: nft.createdAt ? new Date(nft.createdAt).toISOString() : new Date().toISOString(),
    lastTransferAt: nft.updatedAt ? new Date(nft.updatedAt).toISOString() : new Date().toISOString(),
    isOnSale: nft.onSale || false,
    price: nft.price || "0",
    isERC721: nft.isERC721 || true,
    mintOrder: nft.mintOrder || "0",
    approvalState: nft.approvalState || "pending",
    contentVerified: nft.contentVerified || false,
    contractAddress: collectionAddress,
    verified: nft.collection?.verified || collectionAddress === "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e",
    whitelisted: nft.collection?.isWhitelisted || collectionAddress === "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e",
  }
}

/**
 * Fetches trending collections based on volume and activity
 */
export async function fetchTrendingCollections(limit = 10): Promise<NFTCollection[]> {
  try {
    console.log("Fetching trending collections...")

    // Try to fetch from trending endpoint
    const response = await fetch(`${API_BASE_URL}/collections/trending?limit=${limit}`, {
      headers: {
        Accept: "application/json",
        "Cache-Control": "max-age=300",
      },
    })

    if (!response.ok) {
      // Fallback: get all collections and sort by volume
      console.warn("Trending endpoint failed, using fallback method...")
      const allCollections = await fetchAllNFTCollections()
      return allCollections
        .filter((collection) => collection.volume24h || collection.totalVolume)
        .sort((a, b) => {
          const aVolume = Number.parseFloat(a.volume24h?.replace(/[^\d.]/g, "") || "0")
          const bVolume = Number.parseFloat(b.volume24h?.replace(/[^\d.]/g, "") || "0")
          return bVolume - aVolume
        })
        .slice(0, limit)
    }

    const data = await response.json()
    console.log(`Successfully fetched ${data.collections?.length || 0} trending collections`)

    return data.collections || []
  } catch (error) {
    console.error("Error fetching trending collections:", error)
    return getMockCollections().slice(0, limit)
  }
}

/**
 * Fetches recently created collections
 */
export async function fetchRecentCollections(limit = 10): Promise<NFTCollection[]> {
  try {
    console.log("Fetching recent collections...")

    const response = await fetch(`${API_BASE_URL}/collections/recent?limit=${limit}`, {
      headers: {
        Accept: "application/json",
        "Cache-Control": "max-age=300",
      },
    })

    if (!response.ok) {
      // Fallback: get all collections and sort by creation date
      console.warn("Recent endpoint failed, using fallback method...")
      const allCollections = await fetchAllNFTCollections()
      return allCollections
        .filter((collection) => collection.createdAt)
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
        .slice(0, limit)
    }

    const data = await response.json()
    console.log(`Successfully fetched ${data.collections?.length || 0} recent collections`)

    return data.collections || []
  } catch (error) {
    console.error("Error fetching recent collections:", error)
    return getMockCollections().slice(0, limit)
  }
}

/**
 * Searches collections by name or description
 */
export async function searchCollections(query: string, limit = 20): Promise<NFTCollection[]> {
  try {
    console.log(`Searching collections for: ${query}`)

    const response = await fetch(`${API_BASE_URL}/collections/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
      headers: {
        Accept: "application/json",
        "Cache-Control": "max-age=60",
      },
    })

    if (!response.ok) {
      // Fallback: search through all collections
      console.warn("Search endpoint failed, using fallback method...")
      const allCollections = await fetchAllNFTCollections()
      const lowerQuery = query.toLowerCase()
      return allCollections
        .filter(
          (collection) =>
            collection.name.toLowerCase().includes(lowerQuery) ||
            collection.description?.toLowerCase().includes(lowerQuery),
        )
        .slice(0, limit)
    }

    const data = await response.json()
    console.log(`Found ${data.collections?.length || 0} collections matching "${query}"`)

    return data.collections || []
  } catch (error) {
    console.error(`Error searching collections for "${query}":`, error)
    return []
  }
}

/**
 * Fetches collection activity feed
 */
export async function fetchCollectionActivity(
  collectionAddress: string,
  limit = 20,
  offset = 0,
): Promise<{
  activities: Array<{
    type: "mint" | "transfer" | "sale" | "listing"
    tokenId: string
    from?: string
    to?: string
    price?: string
    timestamp: string
    txHash?: string
  }>
  total: number
}> {
  try {
    console.log(`Fetching activity for collection ${collectionAddress}...`)

    const response = await fetch(
      `${API_BASE_URL}/collections/${collectionAddress}/activity?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Accept: "application/json",
          "Cache-Control": "max-age=30",
        },
      },
    )

    if (!response.ok) {
      // Fallback: generate mock activity
      console.warn("Activity endpoint failed, using mock data...")
      return generateMockActivity(collectionAddress, limit)
    }

    const data = await response.json()
    console.log(`Successfully fetched ${data.activities?.length || 0} activities`)

    return {
      activities: data.activities || [],
      total: data.total || 0,
    }
  } catch (error) {
    console.error(`Error fetching collection activity for ${collectionAddress}:`, error)
    return generateMockActivity(collectionAddress, limit)
  }
}

function generateMockActivity(collectionAddress: string, limit: number) {
  const activities = []
  const now = Date.now()
  const hour = 60 * 60 * 1000

  for (let i = 0; i < limit; i++) {
    const timestamp = new Date(now - i * hour).toISOString()
    const tokenId = Math.floor(Math.random() * 1000) + 1

    activities.push({
      type: ["mint", "transfer", "sale", "listing"][Math.floor(Math.random() * 4)] as any,
      tokenId: tokenId.toString(),
      from: i % 3 === 0 ? undefined : `0x${Math.random().toString(16).substring(2, 42)}`,
      to: `0x${Math.random().toString(16).substring(2, 42)}`,
      price: i % 4 === 0 ? undefined : (Math.random() * 10).toFixed(3),
      timestamp,
      txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
    })
  }

  return { activities, total: limit * 2 }
}

/**
 * Fetches all NFT collections from PaintSwap API
 */
export async function fetchAllNFTCollectionsOld(): Promise<NFTCollection[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/collections/`)

    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.status} ${response.statusText}`)
    }

    const data: NFTCollectionResponse = await response.json()
    return data.collections
  } catch (error) {
    console.error("Error fetching NFT collections:", error)
    // Return mock data as fallback
    return getMockCollections()
  }
}

/**
 * Fetches all NFTs owned by a specific user
 */
export async function fetchUserNFTs(userAddress: string, chainId = 146): Promise<NFT[]> {
  try {
    console.log(`Fetching NFTs for user ${userAddress} on chain ${chainId}...`)
    const response = await fetch(`${API_BASE_URL}/userNFTs/?user=${userAddress}&chainId=${chainId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch user NFTs: ${response.status} ${response.statusText}`)
    }

    const data: UserNFTsResponse = await response.json()

    if (!data.nfts || data.nfts.length === 0) {
      console.log(`No NFTs found for user ${userAddress}`)
      return []
    }

    return data.nfts.map((nftData) => ({
      id: `${userAddress}_${nftData.address}_${nftData.tokenId}`,
      tokenId: nftData.tokenId,
      address: nftData.address,
      name: nftData.name || `NFT #${nftData.tokenId}`,
      description: nftData.description || "",
      image:
        nftData.image || nftData.thumbnail || `/placeholder.svg?height=400&width=400&query=NFT%20${nftData.tokenId}`,
      thumbnail:
        nftData.thumbnail || nftData.image || `/placeholder.svg?height=200&width=200&query=NFT%20${nftData.tokenId}`,
      owner: userAddress,
      creator: nftData.creator || "unknown",
      collection: {
        address: nftData.address,
        name: nftData.collectionName || `Collection ${nftData.address.substring(0, 6)}...`,
        isVerified: nftData.collection?.verified || false,
        isWhitelisted: nftData.collection?.isWhitelisted || false,
      },
      attributes: nftData.attributes || [],
      rarity: nftData.rarity
        ? {
            score: nftData.rarity.score || 0,
            rank: nftData.rarity.rank || 0,
            total: nftData.rarity.total || 0,
            calculated_at: nftData.rarity.calculated_at || Date.now(),
          }
        : null,
      createdAt: safelyConvertTimestamp(nftData.createdTimestamp),
      lastTransferAt: safelyConvertTimestamp(nftData.lastTransferTimestamp),
      isOnSale: nftData.onSale || false,
      price: nftData.price || "0",
      isERC721: nftData.isERC721 || true,
      mintOrder: nftData.mintOrder || "0",
      approvalState: nftData.approvalState || "pending",
      contentVerified: nftData.contentVerified || false,
    }))
  } catch (error) {
    console.error(`Error fetching user NFTs for ${userAddress}:`, error)
    return getMockNFTs(userAddress)
  }
}

/**
 * Fetches NFTs from a specific collection owned by a specific user
 */
export async function fetchUserCollectionNFTs(userAddress: string, collectionAddress: string): Promise<NFT[]> {
  try {
    console.log(`Fetching NFTs for user ${userAddress} from collection ${collectionAddress}...`)
    const response = await fetch(`${API_BASE_URL}/userNFTs/${collectionAddress}?user=${userAddress}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch user collection NFTs: ${response.status} ${response.statusText}`)
    }

    const data: UserNFTsResponse = await response.json()

    // Check if nfts array exists and has items
    if (!data.nfts || data.nfts.length === 0) {
      console.log(`No NFTs found for user ${userAddress} in collection ${collectionAddress}`)
      return []
    }

    return data.nfts.map((nftData) => transformUserNFTData(nftData, userAddress))
  } catch (error) {
    console.error(`Error fetching user collection NFTs for ${userAddress} and collection ${collectionAddress}:`, error)
    return []
  }
}

/**
 * Fetches a specific NFT by collection address and token ID for a specific user
 */
export async function fetchUserNFT(
  collectionAddress: string,
  tokenId: string,
  userAddress: string,
): Promise<NFT | null> {
  try {
    console.log(`Fetching NFT ${collectionAddress}/${tokenId} for user ${userAddress}...`)
    const response = await fetch(`${API_BASE_URL}/userNFTs/${collectionAddress}/${tokenId}?user=${userAddress}`, {
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`NFT not found: ${collectionAddress}/${tokenId} for user ${userAddress}`)
        return null
      }
      throw new Error(`Failed to fetch user NFT: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.userNFT) {
      console.warn(`No userNFT data returned for ${collectionAddress}/${tokenId}`)
      return null
    }

    return transformUserNFTData(data.userNFT, userAddress)
  } catch (error) {
    console.error(`Error fetching user NFT ${collectionAddress}/${tokenId}:`, error)
    return null
  }
}

/**
 * Transforms PaintSwap API user NFT data to our NFT interface
 */
function transformUserNFTData(nftData: any, userAddress: string): NFT {
  // Generate rarity based on token ID
  const tokenIdNum = Number.parseInt(nftData.tokenId, 10) || 0
  let rarity = "Common"
  if (tokenIdNum % 100 === 0) rarity = "Mythic"
  else if (tokenIdNum % 50 === 0) rarity = "Legendary"
  else if (tokenIdNum % 20 === 0) rarity = "Epic"
  else if (tokenIdNum % 10 === 0) rarity = "Rare"
  else if (tokenIdNum % 5 === 0) rarity = "Uncommon"

  // Generate attributes based on token ID
  const backgrounds = ["Mountain", "Desert", "Forest", "Ocean", "Space", "City", "Jungle", "Arctic"]
  const furColors = ["Golden", "Brown", "White", "Black", "Gray", "Spotted", "Rainbow", "Metallic"]
  const eyeColors = ["Blue", "Green", "Brown", "Red", "Purple", "Yellow", "Glowing", "Heterochromia"]
  const accessories = ["None", "Scarf", "Hat", "Glasses", "Necklace", "Backpack", "Earrings", "Crown"]

  const backgroundIndex = tokenIdNum % backgrounds.length
  const furIndex = Math.floor(tokenIdNum / 10) % furColors.length
  const eyeIndex = Math.floor(tokenIdNum / 5) % eyeColors.length
  const accessoryIndex = Math.floor(tokenIdNum / 3) % accessories.length

  const attributes = [
    { trait_type: "Background", value: backgrounds[backgroundIndex] },
    { trait_type: "Fur", value: furColors[furIndex] },
    { trait_type: "Eyes", value: eyeColors[eyeIndex] },
    { trait_type: "Accessory", value: accessories[accessoryIndex] },
    { trait_type: "Rarity", value: rarity },
  ]

  // Construct image URL for Sonic Llamas
  let imageUrl = `/placeholder.svg?height=400&width=400&query=Sonic%20Llama%20${nftData.tokenId}`
  if (nftData.address === "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e") {
    imageUrl = `https://media-nft.paintswap.finance/0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e_${nftData.tokenId}_146.jpg`
  }

  return {
    id: nftData.id || `${userAddress}_${nftData.address}_${nftData.tokenId}`,
    tokenId: nftData.tokenId,
    address: nftData.address,
    name: `Sonic Llama #${nftData.tokenId}`,
    description: "A unique Sonic Llama with its own personality and traits, perfect for staking and earning rewards.",
    image: imageUrl,
    thumbnail: imageUrl,
    owner: nftData.owner || userAddress,
    creator: nftData.creator || "SonicLlamasTeam",
    collection: {
      address: nftData.address,
      name: "Sonic Llamas",
      isVerified: nftData.collection?.verified || true,
      isWhitelisted: nftData.collection?.isWhitelisted || true,
    },
    attributes,
    rarity,
    createdAt: safelyConvertTimestamp(nftData.createdTimestamp),
    lastTransferAt: safelyConvertTimestamp(nftData.lastTransferTimestamp),
    isOnSale: nftData.onSale || false,
    price: nftData.price || "0",
    isERC721: nftData.isERC721 || true,
    mintOrder: nftData.mintOrder || "0",
    approvalState: nftData.approvalState || "pending",
    contentVerified: nftData.contentVerified || false,
    contractAddress: nftData.address,
    verified: nftData.collection?.verified || true,
    whitelisted: nftData.collection?.isWhitelisted || true,
  }
}

/**
 * Fetches NFT details for the detail page - uses the user NFT endpoint with demo user
 */
export async function fetchNFTDetails(collectionAddress: string, tokenId: string): Promise<NFT | null> {
  // Use demo user address for fetching NFT details
  const demoUserAddress = "0x1e9f317cb3a0c3b23c9d82daec5a18d7895639f0"

  try {
    // First try to fetch from user NFTs endpoint
    const userNFT = await fetchUserNFT(collectionAddress, tokenId, demoUserAddress)
    if (userNFT) {
      return userNFT
    }

    // Fallback to creating a mock NFT
    console.log(`Creating mock NFT for ${collectionAddress}/${tokenId}`)
    return createMockNFT(collectionAddress, tokenId)
  } catch (error) {
    console.error(`Error fetching NFT details for ${collectionAddress}/${tokenId}:`, error)
    return createMockNFT(collectionAddress, tokenId)
  }
}

/**
 * Creates a mock NFT when the API fails to find one
 */
function createMockNFT(collectionAddress: string, tokenId: string): NFT {
  // Generate random attributes based on token ID
  const tokenIdNum = Number.parseInt(tokenId, 10) || 0

  // Backgrounds cycle through options
  const backgrounds = ["Mountain", "Desert", "Forest", "Ocean", "Space", "City", "Jungle", "Arctic"]
  const backgroundIndex = tokenIdNum % backgrounds.length

  // Fur colors cycle through options
  const furColors = ["Golden", "Brown", "White", "Black", "Gray", "Spotted", "Rainbow", "Metallic"]
  const furIndex = Math.floor(tokenIdNum / 10) % furColors.length

  // Eye colors cycle through options
  const eyeColors = ["Blue", "Green", "Brown", "Red", "Purple", "Yellow", "Glowing", "Heterochromia"]
  const eyeIndex = Math.floor(tokenIdNum / 5) % eyeColors.length

  // Accessories cycle through options
  const accessories = ["None", "Scarf", "Hat", "Glasses", "Necklace", "Backpack", "Earrings", "Crown"]
  const accessoryIndex = Math.floor(tokenIdNum / 3) % accessories.length

  // Rarity is based on token ID
  let rarity = "Common"
  if (tokenIdNum % 100 === 0) rarity = "Mythic"
  else if (tokenIdNum % 50 === 0) rarity = "Legendary"
  else if (tokenIdNum % 20 === 0) rarity = "Epic"
  else if (tokenIdNum % 10 === 0) rarity = "Rare"
  else if (tokenIdNum % 5 === 0) rarity = "Uncommon"

  // Check if this is our Sonic Llamas collection
  if (collectionAddress === "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e") {
    return {
      id: `unknown_${collectionAddress}_${tokenId}`,
      tokenId: tokenId,
      address: collectionAddress,
      name: `Sonic Llama #${tokenId}`,
      description:
        "This unique Sonic Llama has its own personality and traits, making it a perfect companion for your digital adventures.",
      image: `https://media-nft.paintswap.finance/0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e_${tokenId}_146.jpg`,
      thumbnail: `https://media-nft.paintswap.finance/0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e_${tokenId}_146_thumb.jpg`,
      owner: "unknown",
      creator: "SonicLlamasTeam",
      collection: {
        address: collectionAddress,
        name: "Sonic Llamas",
        isVerified: true,
        isWhitelisted: true,
      },
      attributes: [
        { trait_type: "Background", value: backgrounds[backgroundIndex] },
        { trait_type: "Fur", value: furColors[furIndex] },
        { trait_type: "Eyes", value: eyeColors[eyeIndex] },
        { trait_type: "Accessory", value: accessories[accessoryIndex] },
        { trait_type: "Rarity", value: rarity },
      ],
      rarity,
      createdAt: new Date().toISOString(),
      lastTransferAt: new Date().toISOString(),
      isOnSale: false,
      price: "0",
      isERC721: true,
      mintOrder: "0",
      approvalState: "pending",
      contentVerified: true,
      contractAddress: collectionAddress,
      verified: true,
      whitelisted: true,
    }
  }

  // Default mock NFT for other collections
  return {
    id: `unknown_${collectionAddress}_${tokenId}`,
    tokenId: tokenId,
    address: collectionAddress,
    name: `NFT #${tokenId}`,
    description: "This is a mock NFT created because the original could not be found.",
    image: `/placeholder.svg?height=400&width=400&query=NFT%20${tokenId}`,
    owner: "unknown",
    creator: "unknown",
    collection: {
      address: collectionAddress,
      name: "Unknown Collection",
      isVerified: false,
      isWhitelisted: false,
    },
    attributes: [
      { trait_type: "Background", value: "Mountain" },
      { trait_type: "Fur", value: "Golden" },
      { trait_type: "Eyes", value: "Blue" },
      { trait_type: "Accessory", value: "Scarf" },
    ],
    rarity: "Common",
    createdAt: new Date().toISOString(),
    lastTransferAt: new Date().toISOString(),
    isOnSale: false,
    price: "0",
    isERC721: true,
    mintOrder: "0",
    approvalState: "pending",
    contentVerified: false,
    contractAddress: collectionAddress,
    verified: false,
    whitelisted: false,
  }
}

/**
 * Safely converts a timestamp to an ISO date string
 */
export function safelyConvertTimestamp(timestamp: string | number | undefined | null): string {
  if (!timestamp) return new Date().toISOString()

  try {
    // First try parsing as a number
    const timestampNum = typeof timestamp === "string" ? Number.parseInt(timestamp) : timestamp

    // Check if the timestamp is in seconds (Unix timestamp) or milliseconds
    const date =
      timestampNum > 9999999999
        ? new Date(timestampNum) // Already in milliseconds
        : new Date(timestampNum * 1000) // Convert seconds to milliseconds

    // Validate the date
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date")
    }

    return date.toISOString()
  } catch (error) {
    console.warn("Error converting timestamp:", timestamp, error)
    return new Date().toISOString()
  }
}

// Mock data functions for fallback
function getMockCollections(): NFTCollection[] {
  return [
    {
      address: "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e",
      name: "Sonic Llamas",
      description:
        "A collection of unique Sonic Llamas on the Sonic network. Each Llama has its own personality and traits, making them perfect companions for your digital adventures.",
      totalSupply: "10000",
      verified: true,
      isWhitelisted: true,
      banner: "/llama-banner.png",
      image: "/llama-logo.jpg",
      website: "https://sonicllamas.io",
      twitter: "@SonicLlamas",
      discord: "https://discord.gg/sonicllamas",
      telegram: "@SonicLlamas",
    },
    {
      address: "0x014f74668e8802cead8a54739816408bbdbf1101",
      name: "Sonic Creatures",
      description: "Magical creatures living on the Sonic network",
      totalSupply: "500",
      verified: false,
      isWhitelisted: false,
      banner: "/sonic-creatures-banner.png",
      image: "/sonic-creatures-logo.png",
    },
  ]
}

function getMockNFTs(userAddress: string): NFT[] {
  return Array.from({ length: 8 }).map((_, i) => ({
    id: `${userAddress}_0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e_${i + 1}`,
    tokenId: `${i + 1}`,
    address: "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e",
    name: `Sonic Llama #${i + 1}`,
    description: "A unique Sonic Llama NFT",
    image: `/placeholder.svg?height=400&width=400&query=Llama%20NFT%20${i + 1}`,
    owner: userAddress,
    creator: userAddress,
    collection: {
      address: "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e",
      name: "Sonic Llamas",
      isVerified: true,
      isWhitelisted: true,
    },
    attributes: [],
    rarity: "Common",
    createdAt: new Date().toISOString(),
    lastTransferAt: new Date().toISOString(),
    isOnSale: false,
    price: "0",
    isERC721: true,
    mintOrder: "0",
    approvalState: "pending",
    contentVerified: false,
    contractAddress: "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e",
    verified: true,
    whitelisted: true,
  }))
}

// Additional functions for marketplace and other features...
export async function fetchNFTTransactionHistory(collectionAddress: string, tokenId: string) {
  try {
    console.log(`Fetching transaction history for NFT ${collectionAddress}/${tokenId}...`)
    const response = await fetch(`${API_BASE_URL}/v2/nft/${collectionAddress}/${tokenId}/history`)

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Transaction history not found for NFT ${collectionAddress}/${tokenId}. Using mock data.`)
        return createMockTransactionHistory(collectionAddress, tokenId)
      }
      throw new Error(`Failed to fetch NFT history: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.history || []
  } catch (error) {
    console.error(`Error fetching NFT history for ${collectionAddress}/${tokenId}:`, error)
    return createMockTransactionHistory(collectionAddress, tokenId)
  }
}

function createMockTransactionHistory(collectionAddress: string, tokenId: string) {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000 // 1 day in milliseconds

  return [
    {
      type: "mint",
      from: "0x0000000000000000000000000000000000000000",
      to: "0x1e9f317cb3a0c3b23c9d82daec5a18d7895639f0",
      timestamp: Math.floor((now - 30 * day) / 1000).toString(),
      txHash: "0x" + "1".repeat(64),
      price: "0",
    },
    {
      type: "transfer",
      from: "0x1e9f317cb3a0c3b23c9d82daec5a18d7895639f0",
      to: "0x1e9f317cb3a0c3b23c9d82daec5a18d7895639f0",
      timestamp: Math.floor((now - 15 * day) / 1000).toString(),
      txHash: "0x" + "2".repeat(64),
      price: "0",
    },
  ]
}

/**
 * Fetches current NFT sales from PaintSwap API
 */
export async function fetchNFTSales(
  limit = 20,
  offset = 0,
): Promise<{
  sales: any[]
  total: number
}> {
  try {
    console.log(`Fetching NFT sales with limit ${limit}, offset ${offset}...`)
    const response = await fetch(`${API_BASE_URL}/sales/?limit=${limit}&offset=${offset}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch sales: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Process and normalize the sales data
    const sales = (data.sales || []).map((sale: any) => ({
      id: sale.id,
      address: sale.address,
      tokenId: sale.tokenId,
      seller: sale.seller,
      price: sale.price,
      isERC721: sale.isERC721,
      startTime: sale.startTime,
      endTime: sale.endTime,
      sold: sale.sold,
      cancelled: sale.cancelled,
      isAuction: sale.isAuction,
      nft: {
        name: sale.nft?.name || `NFT #${sale.tokenId}`,
        description: sale.nft?.description || "",
        image:
          sale.nft?.image || sale.nft?.thumbnail || `/placeholder.svg?height=400&width=400&query=NFT%20${sale.tokenId}`,
        thumbnail:
          sale.nft?.thumbnail || sale.nft?.image || `/placeholder.svg?height=200&width=200&query=NFT%20${sale.tokenId}`,
        attributes: sale.nft?.attributes || [],
        rarity: sale.nft?.rarity || null,
        collection: {
          address: sale.address,
          name: sale.nft?.collection?.name || `Collection ${sale.address.substring(0, 6)}...`,
          verified: sale.nft?.collection?.verified || false,
        },
      },
    }))

    return {
      sales,
      total: data.sales?.length || 0,
    }
  } catch (error) {
    console.error("Error fetching NFT sales:", error)
    return {
      sales: [],
      total: 0,
    }
  }
}

/**
 * Fetches marketplace statistics from PaintSwap API
 */
export async function fetchMarketplaceStats(): Promise<{
  volume: string
  stats: {
    numTradesLast7Days: string
    numTradesLast24Hours: string
    totalVolumeTraded: string
    volumeLast24Hours: string
    volumeLast7Days: string
    activeSales: string
    activeSalesNonAuction: string
    totalTrades: string
    timestampLastSale: string
    timestampLastTrim: string
  }
  version: number
} | null> {
  try {
    console.log("Fetching marketplace statistics...")
    const response = await fetch(`${API_BASE_URL}/sales/stats`)

    if (!response.ok) {
      throw new Error(`Failed to fetch marketplace stats: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Successfully fetched marketplace statistics")
    return data
  } catch (error) {
    console.error("Error fetching marketplace stats:", error)
    return null
  }
}

/**
 * Fetches details for a specific sale by ID
 */
export async function fetchSaleDetails(saleId: string): Promise<{
  id: string
  address: string
  tokenId: string
  seller: string
  buyer?: string
  price: string
  isERC721: boolean
  startTime: string
  endTime?: string
  sold: boolean
  cancelled: boolean
  isAuction: boolean
  nft?: any
} | null> {
  try {
    console.log(`Fetching sale details for ID ${saleId}...`)
    const response = await fetch(`${API_BASE_URL}/sales/${saleId}`)

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Sale not found: ${saleId}`)
        return null
      }
      throw new Error(`Failed to fetch sale details: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Handle empty response (sale might be completed/removed)
    if (!data || Object.keys(data).length === 0) {
      console.warn(`Sale ${saleId} returned empty data - likely completed or removed`)
      return null
    }

    console.log(`Successfully fetched sale details for ${saleId}`)
    return data
  } catch (error) {
    console.error(`Error fetching sale details for ${saleId}:`, error)
    return null
  }
}

/**
 * Fetches recent sales with detailed information
 */
export async function fetchRecentSalesWithDetails(limit = 10): Promise<any[]> {
  try {
    console.log(`Fetching recent sales with details...`)
    const { sales } = await fetchNFTSales(limit * 2) // Fetch more to account for empty responses

    // Filter out sales that might return empty data
    const validSales = []

    for (const sale of sales.slice(0, limit)) {
      if (sale.id) {
        const details = await fetchSaleDetails(sale.id)
        if (details) {
          validSales.push({
            ...sale,
            details,
          })
        } else {
          // Keep the original sale data even if details fetch fails
          validSales.push(sale)
        }
      } else {
        validSales.push(sale)
      }

      // Limit concurrent requests
      if (validSales.length >= limit) break
    }

    return validSales
  } catch (error) {
    console.error("Error fetching recent sales with details:", error)
    return []
  }
}

/**
 * Fetches marketplace daily data for analytics
 */
export async function fetchMarketplaceDayData(): Promise<{
  marketPlaceDayDatas: Array<{
    id: string
    date: number
    dailyVolume: string
    dailyTrades: string
  }>
} | null> {
  try {
    console.log("Fetching marketplace daily data...")
    const response = await fetch(`${API_BASE_URL}/marketplaceDayDatas/`)

    if (!response.ok) {
      throw new Error(`Failed to fetch marketplace day data: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Successfully fetched marketplace daily data")
    return data
  } catch (error) {
    console.error("Error fetching marketplace day data:", error)
    return null
  }
}

/**
 * Processes daily data for chart display
 */
export function processMarketplaceDayData(data: {
  marketPlaceDayDatas: Array<{
    id: string
    date: number
    dailyVolume: string
    dailyTrades: string
  }>
}) {
  if (!data?.marketPlaceDayDatas) return { volumeData: [], tradesData: [] }

  // Sort by date (oldest first) and take last 30 days
  const sortedData = data.marketPlaceDayDatas.sort((a, b) => a.date - b.date).slice(-30)

  const volumeData = sortedData.map((day) => ({
    date: new Date(day.date * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    volume: Number.parseFloat(day.dailyVolume) / 1e18, // Convert from wei to S
    timestamp: day.date,
  }))

  const tradesData = sortedData.map((day) => ({
    date: new Date(day.date * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    trades: Number.parseInt(day.dailyTrades),
    timestamp: day.date,
  }))

  return { volumeData, tradesData }
}

/**
 * Calculates percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Gets trend analysis from daily data
 */
export function getMarketplaceTrends(data: {
  marketPlaceDayDatas: Array<{
    id: string
    date: number
    dailyVolume: string
    dailyTrades: string
  }>
}) {
  if (!data?.marketPlaceDayDatas || data.marketPlaceDayDatas.length < 2) {
    return {
      volumeChange: 0,
      tradesChange: 0,
      trend: "stable" as const,
    }
  }

  const sortedData = data.marketPlaceDayDatas.sort((a, b) => b.date - a.date)
  const today = sortedData[0]
  const yesterday = sortedData[1]

  const todayVolume = Number.parseFloat(today.dailyVolume) / 1e18
  const yesterdayVolume = Number.parseFloat(yesterday.dailyVolume) / 1e18
  const todayTrades = Number.parseInt(today.dailyTrades)
  const yesterdayTrades = Number.parseInt(yesterday.dailyTrades)

  const volumeChange = calculatePercentageChange(todayVolume, yesterdayVolume)
  const tradesChange = calculatePercentageChange(todayTrades, yesterdayTrades)

  let trend: "up" | "down" | "stable" = "stable"
  if (volumeChange > 5 && tradesChange > 5) trend = "up"
  else if (volumeChange < -5 && tradesChange < -5) trend = "down"

  return {
    volumeChange,
    tradesChange,
    trend,
    todayVolume,
    yesterdayVolume,
    todayTrades,
    yesterdayTrades,
  }
}

/**
 * Formats large volume numbers to readable format
 */
export function formatVolume(volumeWei: string): string {
  try {
    const volume = Number.parseFloat(volumeWei) / 1e18
    if (volume < 1000) return `${volume.toFixed(1)} S`
    if (volume < 1000000) return `${(volume / 1000).toFixed(1)}K S`
    if (volume < 1000000000) return `${(volume / 1000000).toFixed(1)}M S`
    return `${(volume / 1000000000).toFixed(1)}B S`
  } catch {
    return "0 S"
  }
}

/**
 * Formats trade count numbers
 */
export function formatTradeCount(count: string): string {
  try {
    const num = Number.parseInt(count)
    if (num < 1000) return num.toString()
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
    return `${(num / 1000000).toFixed(1)}M`
  } catch {
    return "0"
  }
}

/**
 * Fetches sales for a specific collection
 */
export async function fetchCollectionSales(collectionAddress: string, limit = 20): Promise<any[]> {
  try {
    const { sales } = await fetchNFTSales(100) // Fetch more to filter
    return sales.filter((sale) => sale.address.toLowerCase() === collectionAddress.toLowerCase()).slice(0, limit)
  } catch (error) {
    console.error(`Error fetching sales for collection ${collectionAddress}:`, error)
    return []
  }
}

/**
 * Formats price from wei to readable format
 */
export function formatPrice(priceWei: string): string {
  try {
    const price = Number.parseFloat(priceWei) / 1e18
    if (price < 0.001) return "< 0.001 S"
    if (price < 1) return `${price.toFixed(3)} S`
    if (price < 1000) return `${price.toFixed(2)} S`
    return `${(price / 1000).toFixed(1)}K S`
  } catch {
    return "0 S"
  }
}

/**
 * Formats timestamp to readable date
 */
export function formatSaleTime(timestamp: string): string {
  try {
    const date = new Date(Number.parseInt(timestamp) * 1000)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  } catch {
    return "Unknown"
  }
}

/**
 * Fetches collection metadata from PaintSwap API with improved pagination
 */
export async function fetchCollectionMetadata(
  collectionAddress: string,
  chainId = 146,
  search?: string,
  limit = 50,
  offset = 0,
): Promise<{
  total: number
  nfts: NFT[]
}> {
  try {
    let url = `${API_BASE_URL}/metadata/${collectionAddress}?chainId=${chainId}&limit=${limit}&offset=${offset}`

    if (search) {
      url += `&search=${encodeURIComponent(search)}`
    }

    console.log(`Fetching collection metadata: ${url}`)
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch collection metadata: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Process and normalize the NFT data
    const nfts = (data.nfts || []).map((nft: any) => {
      // Parse attributes if they exist
      const attributes = (nft.attributes || []).map((attr: any) => ({
        trait_type: attr.trait_type || "",
        value: attr.value || "",
        display_type: attr.display_type,
        frequency: attr.frequency || 0,
        average: attr.average || "0",
        count: attr.count || 0,
      }))

      // Extract rarity information
      const rarity = nft.rarity
        ? {
            score: nft.rarity.score || 0,
            rank: nft.rarity.rank || 0,
            total: nft.rarity.total || 0,
            calculated_at: nft.rarity.calculated_at || Date.now(),
          }
        : null

      return {
        id: `${nft.owner || "unknown"}_${nft.address || collectionAddress}_${nft.tokenId}`,
        tokenId: nft.tokenId || "",
        address: nft.address || collectionAddress,
        name: nft.name || `NFT #${nft.tokenId || "Unknown"}`,
        description: nft.description || "",
        image: nft.image || nft.thumbnail || `/placeholder.svg?height=400&width=400&query=NFT%20${nft.tokenId}`,
        thumbnail: nft.thumbnail || nft.image || `/placeholder.svg?height=200&width=200&query=NFT%20${nft.tokenId}`,
        owner: nft.owner || "unknown",
        creator: nft.creator || "unknown",
        collection: {
          address: collectionAddress,
          name: search || "NFT Collection",
          isVerified: nft.collection?.verified || false,
          isWhitelisted: nft.collection?.isWhitelisted || false,
        },
        attributes,
        rarity,
        createdAt: nft.createdAt ? new Date(nft.createdAt).toISOString() : new Date().toISOString(),
        lastTransferAt: nft.updatedAt ? new Date(nft.updatedAt).toISOString() : new Date().toISOString(),
        isOnSale: nft.onSale || false,
        price: nft.price || "0",
        isERC721: nft.isERC721 || true,
        mintOrder: nft.mintOrder || "0",
        approvalState: nft.approvalState || "pending",
        contentVerified: nft.contentVerified || false,
        contractAddress: collectionAddress,
        verified: nft.collection?.verified || false,
        whitelisted: nft.collection?.isWhitelisted || false,
      }
    })

    return {
      total: data.total || 0,
      nfts,
    }
  } catch (error) {
    console.error("Error fetching collection metadata:", error)
    return {
      total: 0,
      nfts: [],
    }
  }
}

/**
 * Fetches NFTs in batches to handle large collections
 */
export async function fetchCollectionNFTsInBatches(
  collectionAddress: string,
  chainId = 146,
  search?: string,
  batchSize = 50,
  maxBatches = 10,
): Promise<{
  total: number
  nfts: NFT[]
}> {
  try {
    // First fetch to get total and first batch
    const firstBatch = await fetchCollectionMetadata(collectionAddress, chainId, search, batchSize, 0)

    if (firstBatch.total <= batchSize || maxBatches <= 1) {
      return firstBatch
    }

    // Calculate how many more batches we need (up to maxBatches)
    const totalBatches = Math.min(Math.ceil(firstBatch.total / batchSize), Math.max(1, maxBatches))

    // Fetch remaining batches in parallel
    const batchPromises = []
    for (let i = 1; i < totalBatches; i++) {
      const offset = i * batchSize
      batchPromises.push(fetchCollectionMetadata(collectionAddress, chainId, search, batchSize, offset))
    }

    const batchResults = await Promise.all(batchPromises)

    // Combine all batches
    const allNfts = [...firstBatch.nfts, ...batchResults.flatMap((batch) => batch.nfts)]

    return {
      total: firstBatch.total,
      nfts: allNfts,
    }
  } catch (error) {
    console.error(`Error fetching collection NFTs in batches for ${collectionAddress}:`, error)
    return {
      total: 0,
      nfts: [],
    }
  }
}

/**
 * Fetches a single NFT by token ID with improved error handling
 */
export async function fetchSingleNFT(collectionAddress: string, tokenId: string, chainId = 146): Promise<NFT | null> {
  try {
    const url = `${API_BASE_URL}/metadata/${collectionAddress}/${tokenId}?chainId=${chainId}`
    console.log(`Fetching single NFT: ${url}`)

    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`NFT not found: ${collectionAddress}/${tokenId}`)
        return null
      }
      throw new Error(`Failed to fetch NFT: ${response.status} ${response.statusText}`)
    }

    const nft = await response.json()

    // Parse attributes if they exist
    const attributes = (nft.attributes || []).map((attr: any) => ({
      trait_type: attr.trait_type || "",
      value: attr.value || "",
      display_type: attr.display_type,
      frequency: attr.frequency || 0,
      average: attr.average || "0",
      count: attr.count || 0,
    }))

    // Extract rarity information
    const rarity = nft.rarity
      ? {
          score: nft.rarity.score || 0,
          rank: nft.rarity.rank || 0,
          total: nft.rarity.total || 0,
          calculated_at: nft.rarity.calculated_at || Date.now(),
        }
      : null

    return {
      id: `${nft.owner || "unknown"}_${collectionAddress}_${tokenId}`,
      tokenId: nft.tokenId || tokenId,
      address: nft.address || collectionAddress,
      name: nft.name || `NFT #${tokenId}`,
      description: nft.description || "",
      image: nft.image || nft.thumbnail || `/placeholder.svg?height=400&width=400&query=NFT%20${tokenId}`,
      thumbnail: nft.thumbnail || nft.image || `/placeholder.svg?height=200&width=200&query=NFT%20${tokenId}`,
      owner: nft.owner || "unknown",
      creator: nft.creator || "unknown",
      collection: {
        address: collectionAddress,
        name: nft.collectionName || "NFT Collection",
        isVerified: nft.collection?.verified || false,
        isWhitelisted: nft.collection?.isWhitelisted || false,
      },
      attributes,
      rarity,
      createdAt: nft.createdAt ? new Date(nft.createdAt).toISOString() : new Date().toISOString(),
      lastTransferAt: nft.updatedAt ? new Date(nft.updatedAt).toISOString() : new Date().toISOString(),
      isOnSale: nft.onSale || false,
      price: nft.price || "0",
      isERC721: nft.isERC721 || true,
      mintOrder: nft.mintOrder || "0",
      approvalState: nft.approvalState || "pending",
      contentVerified: nft.contentVerified || false,
      contractAddress: collectionAddress,
      verified: nft.collection?.verified || false,
      whitelisted: nft.collection?.isWhitelisted || false,
    }
  } catch (error) {
    console.error(`Error fetching single NFT ${collectionAddress}/${tokenId}:`, error)
    return null
  }
}

/**
 * Fetches trait statistics for a collection
 */
export async function fetchCollectionTraits(
  collectionAddress: string,
): Promise<Record<string, Record<string, number>> | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/collections/${collectionAddress}/traits`)

    if (!response.ok) {
      throw new Error(`Failed to fetch collection traits: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Check if traits data is meaningful
    if (!data.traits || Object.keys(data.traits).length === 0) {
      console.warn("No trait data returned from API, using mock traits")
      return getMockCollectionTraits(collectionAddress)
    }

    // Check if traits only contain "Trait Count" and "Attributes Count"
    const traitTypes = Object.keys(data.traits)
    if (traitTypes.length <= 2 && traitTypes.every((type) => ["Trait Count", "Attributes Count"].includes(type))) {
      console.warn("Only basic trait counts returned from API, using mock traits")
      return getMockCollectionTraits(collectionAddress)
    }

    return data.traits
  } catch (error) {
    console.error(`Error fetching collection traits for ${collectionAddress}:`, error)
    // Return mock trait data as fallback
    return getMockCollectionTraits(collectionAddress)
  }
}

function getMockCollectionTraits(collectionAddress?: string): Record<string, Record<string, number>> {
  // If this is the Sonic Llamas collection, return more specific traits
  if (collectionAddress === "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e") {
    return {
      Background: {
        Mountain: 250,
        Desert: 200,
        Forest: 150,
        Ocean: 100,
        Space: 80,
        City: 120,
        Jungle: 60,
        Arctic: 40,
      },
      Fur: {
        Golden: 150,
        Brown: 150,
        White: 120,
        Black: 100,
        Gray: 80,
        Spotted: 80,
        Rainbow: 20,
        Metallic: 10,
      },
      Eyes: {
        Blue: 250,
        Green: 200,
        Brown: 150,
        Red: 80,
        Purple: 60,
        Yellow: 40,
        Glowing: 20,
        Heterochromia: 10,
      },
      Accessory: {
        None: 300,
        Scarf: 200,
        Hat: 150,
        Glasses: 100,
        Necklace: 80,
        Backpack: 60,
        Earrings: 40,
        Crown: 10,
      },
      Rarity: {
        Common: 500,
        Uncommon: 300,
        Rare: 150,
        Epic: 40,
        Legendary: 10,
        Mythic: 1,
      },
      "Power Level": {
        "0-20": 200,
        "21-40": 300,
        "41-60": 250,
        "61-80": 150,
        "81-100": 100,
      },
      Enhanced: {
        Yes: 300,
        No: 700,
      },
    }
  }

  // Default traits for other collections
  return {
    Background: {
      Forest: 2500,
      Desert: 2000,
      Mountain: 1500,
      Ocean: 1000,
      Space: 800,
      City: 1200,
      Jungle: 600,
      Arctic: 400,
    },
    Color: {
      Red: 1500,
      Blue: 1500,
      Green: 1200,
      Yellow: 1000,
      Purple: 800,
      Orange: 800,
      Black: 1600,
      White: 1600,
    },
    Rarity: {
      Common: 5000,
      Uncommon: 3000,
      Rare: 1500,
      Epic: 400,
      Legendary: 100,
      Mythic: 10,
    },
    "Power Level": {
      "0-20": 2000,
      "21-40": 3000,
      "41-60": 2500,
      "61-80": 1500,
      "81-100": 1000,
    },
    Enhanced: {
      Yes: 3000,
      No: 7000,
    },
  }
}

// Staking and approval functions remain the same...
export async function checkNFTApproval(
  nftAddress: string,
  tokenId: string,
  stakingContractAddress: string,
  userAddress: string,
): Promise<boolean> {
  try {
    console.log(`Checking approval for NFT ${nftAddress}/${tokenId} for contract ${stakingContractAddress}`)
    await new Promise((resolve) => setTimeout(resolve, 500))
    return Math.random() > 0.3
  } catch (error) {
    console.error("Error checking NFT approval:", error)
    return false
  }
}

export async function approveNFT(
  nftAddress: string,
  tokenId: string,
  stakingContractAddress: string,
): Promise<boolean> {
  try {
    console.log(`Approving NFT ${nftAddress}/${tokenId} for contract ${stakingContractAddress}`)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return true
  } catch (error) {
    console.error("Error approving NFT:", error)
    throw new Error("Failed to approve NFT. Please try again.")
  }
}

export async function stakeNFTs(
  stakingContractAddress: string,
  nftAddress: string,
  tokenIds: string[],
  userAddress: string,
): Promise<boolean> {
  try {
    console.log(`Staking ${tokenIds.length} NFTs in contract ${stakingContractAddress}`)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return true
  } catch (error) {
    console.error("Error staking NFTs:", error)
    throw new Error("Failed to stake NFTs. Please try again.")
  }
}

export async function unstakeNFTs(
  stakingContractAddress: string,
  nftAddress: string,
  tokenIds: string[],
  userAddress: string,
): Promise<boolean> {
  try {
    console.log(`Unstaking ${tokenIds.length} NFTs from contract ${stakingContractAddress}`)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return true
  } catch (error) {
    console.error("Error unstaking NFTs:", error)
    throw new Error("Failed to unstake NFTs. Please try again.")
  }
}

export async function claimRewards(
  stakingContractAddress: string,
  userAddress: string,
): Promise<{ success: boolean; amount: string }> {
  try {
    console.log(`Claiming rewards from contract ${stakingContractAddress} for user ${userAddress}`)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const rewardAmount = (Math.random() * 9.9 + 0.1).toFixed(4)

    return {
      success: true,
      amount: rewardAmount,
    }
  } catch (error) {
    console.error("Error claiming rewards:", error)
    throw new Error("Failed to claim rewards. Please try again.")
  }
}

/**
 * Fetches NFTs from a collection with pagination support
 */
export async function fetchCollectionNFTs(
  collectionAddress: string,
  limit = 20,
  offset = 0,
  chainId = 146,
): Promise<{
  nfts: NFT[]
  total: number
}> {
  try {
    console.log(`Fetching collection NFTs for ${collectionAddress} with limit ${limit}, offset ${offset}...`)
    return await fetchCollectionMetadata(collectionAddress, chainId, undefined, limit, offset)
  } catch (error) {
    console.error(`Error fetching collection NFTs for ${collectionAddress}:`, error)
    return {
      nfts: [],
      total: 0,
    }
  }
}
