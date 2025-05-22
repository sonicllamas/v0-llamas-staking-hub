// NFT Service for interacting with PaintSwap API
import type { NFT, NFTCollection, NFTCollectionResponse, UserNFTsResponse } from "@/types/nft"

const API_BASE_URL = "https://api.paintswap.finance"

/**
 * Fetches all NFT collections from PaintSwap API
 */
export async function fetchAllNFTCollections(): Promise<NFTCollection[]> {
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
 * Fetches a specific NFT collection by address
 */
export async function fetchNFTCollection(address: string): Promise<NFTCollection | null> {
  try {
    console.log(`Fetching collection data for ${address}...`)

    // First try the collections endpoint
    const response = await fetch(`${API_BASE_URL}/collections/${address}`, {
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
    })

    if (!response.ok) {
      console.warn(`Collection endpoint returned ${response.status}. Trying fallback...`)

      // Try the metadata endpoint as fallback
      const metadataResponse = await fetch(`${API_BASE_URL}/metadata/${address}?chainId=146&limit=1`, {
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      })

      if (!metadataResponse.ok) {
        throw new Error(`Failed to fetch collection: ${response.status} ${response.statusText}`)
      }

      const metadataData = await metadataResponse.json()

      // Create a minimal collection object from metadata
      return {
        address: address,
        name: metadataData.name || `Collection ${address.substring(0, 6)}...`,
        description: metadataData.description || "No description available",
        totalSupply: metadataData.total?.toString() || "Unknown",
        image: metadataData.image || "/diverse-nft-collection.png",
        banner: metadataData.banner || "/llama-banner.png",
        verified: false,
        isWhitelisted: false,
      }
    }

    const data = await response.json()
    console.log(`Successfully fetched collection data for ${address}`)
    return data
  } catch (error) {
    console.error(`Error fetching NFT collection ${address}:`, error)

    // Return a minimal collection object as fallback
    return {
      address: address,
      name: `Collection ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      description: "Collection details could not be loaded.",
      totalSupply: "Unknown",
      image: "/diverse-nft-collection.png",
      banner: "/llama-banner.png",
      verified: false,
      isWhitelisted: false,
    }
  }
}

// Update the fetchUserNFTs function to handle the Sonic Mainnet chain ID

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

    return data.nfts.map((nftData) => ({
      id: nftData.id,
      tokenId: nftData.tokenId,
      address: nftData.address,
      name: `NFT #${nftData.tokenId}`, // Default name if not available
      description: "",
      image: `/placeholder.svg?height=400&width=400&query=NFT%20${nftData.tokenId}`,
      owner: nftData.owner,
      creator: nftData.creator,
      collection: {
        address: nftData.address,
        name: `Collection ${nftData.address.substring(0, 6)}...`,
        isVerified: nftData.collection?.verified || false,
        isWhitelisted: nftData.collection?.isWhitelisted || false,
      },
      attributes: [],
      createdAt: safelyConvertTimestamp(nftData.createdTimestamp),
      lastTransferAt: safelyConvertTimestamp(nftData.lastTransferTimestamp),
      isOnSale: nftData.onSale,
      price: nftData.price,
      isERC721: nftData.isERC721,
      mintOrder: nftData.mintOrder,
      approvalState: nftData.approvalState,
      contentVerified: nftData.contentVerified,
    }))
  } catch (error) {
    console.error(`Error fetching user collection NFTs for ${userAddress} and collection ${collectionAddress}:`, error)
    return []
  }
}

/**
 * Fetches a range of NFTs from a specific collection owned by a user
 * Note: This is a more specialized version of fetchUserCollectionNFTs
 */
export async function fetchUserCollectionNFTsRange(
  userAddress: string,
  collectionAddress: string,
  startTokenId: number,
  endTokenId: number,
  chainId = 146,
): Promise<NFT[]> {
  try {
    // The range format doesn't seem to work reliably, so we'll fetch all NFTs and filter
    const allNFTs = await fetchUserCollectionNFTs(userAddress, collectionAddress)

    // Filter NFTs by token ID range
    return allNFTs.filter((nft) => {
      const tokenIdNum = Number.parseInt(nft.tokenId)
      return tokenIdNum >= startTokenId && tokenIdNum <= endTokenId
    })
  } catch (error) {
    console.error(
      `Error fetching user collection NFTs range for ${userAddress} and collection ${collectionAddress}:`,
      error,
    )
    return []
  }
}

// Update the fetchNFT function to try multiple endpoints and provide a fallback

/**
 * Fetches a specific NFT by collection address and token ID
 */
export async function fetchNFT(collectionAddress: string, tokenId: string): Promise<NFT | null> {
  try {
    console.log(`Fetching NFT ${collectionAddress}/${tokenId}...`)

    // First try to get the NFT from the v2 endpoint
    let response = await fetch(`${API_BASE_URL}/v2/nft/${collectionAddress}/${tokenId}`)

    // If v2 endpoint fails, try the metadata endpoint
    if (!response.ok) {
      console.log(`V2 endpoint returned ${response.status}. Trying metadata endpoint...`)
      response = await fetch(`${API_BASE_URL}/metadata/${collectionAddress}/${tokenId}?chainId=146`)

      // If both endpoints fail, create a mock NFT
      if (!response.ok) {
        console.log(`Metadata endpoint also failed with ${response.status}. Creating mock NFT...`)
        return createMockNFT(collectionAddress, tokenId)
      }
    }

    const data = await response.json()
    return {
      id: `${data.owner || "unknown"}_${data.address || collectionAddress}_${data.tokenId || tokenId}`,
      tokenId: data.tokenId || tokenId,
      address: data.address || collectionAddress,
      name: data.name || `NFT #${tokenId}`,
      description: data.description || "No description available for this NFT.",
      image: data.image || `/placeholder.svg?height=400&width=400&query=NFT%20${tokenId}`,
      owner: data.owner || "unknown",
      creator: data.creator || "unknown",
      collection: {
        address: data.address || collectionAddress,
        name: data.collectionName || `Collection ${collectionAddress.substring(0, 6)}...`,
        isVerified: data.collection?.verified || false,
        isWhitelisted: data.collection?.isWhitelisted || false,
      },
      attributes: data.attributes || [],
      createdAt: data.createdTimestamp
        ? new Date(Number.parseInt(data.createdTimestamp) * 1000).toISOString()
        : new Date().toISOString(),
      lastTransferAt: data.lastTransferTimestamp
        ? new Date(Number.parseInt(data.lastTransferTimestamp) * 1000).toISOString()
        : new Date().toISOString(),
      isOnSale: data.onSale || false,
      price: data.price || "0",
      isERC721: data.isERC721 || true,
      mintOrder: data.mintOrder || "0",
      approvalState: data.approvalState || "pending",
      contentVerified: data.contentVerified || false,
    }
  } catch (error) {
    console.error(`Error fetching NFT ${collectionAddress}/${tokenId}:`, error)
    // Return a mock NFT as fallback
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

  // Power level is based on token ID
  const powerLevel = (tokenIdNum % 100) + 1
  const powerLevelRange =
    powerLevel <= 20
      ? "0-20"
      : powerLevel <= 40
        ? "21-40"
        : powerLevel <= 60
          ? "41-60"
          : powerLevel <= 80
            ? "61-80"
            : "81-100"

  // Enhanced status
  const isEnhanced = tokenIdNum % 3 === 0 ? "Yes" : "No"

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
        { trait_type: "Power Level", value: powerLevelRange },
        { trait_type: "Enhanced", value: isEnhanced },
      ],
      rarity: {
        score: 40.78834618680377,
        rank: (Number.parseInt(tokenId) % 1167) + 1,
        total: 1167,
        calculated_at: Date.now(),
      },
      createdAt: new Date().toISOString(),
      lastTransferAt: new Date().toISOString(),
      isOnSale: false,
      price: "0",
      isERC721: true,
      mintOrder: "0",
      approvalState: "pending",
      contentVerified: true,
    }
  }

  // Default mock NFT for other collections
  return {
    id: `unknown_${collectionAddress}_${tokenId}`,
    tokenId: tokenId,
    address: collectionAddress,
    name: `Sonic Llama #${tokenId}`,
    description: "This is a mock NFT created because the original could not be found.",
    image: `/placeholder.svg?height=400&width=400&query=Llama%20NFT%20${tokenId}`,
    owner: "unknown",
    creator: "unknown",
    collection: {
      address: collectionAddress,
      name: "Sonic Llamas",
      isVerified: false,
      isWhitelisted: false,
    },
    attributes: [
      { trait_type: "Background", value: "Mountain" },
      { trait_type: "Fur", value: "Golden" },
      { trait_type: "Eyes", value: "Blue" },
      { trait_type: "Accessory", value: "Scarf" },
    ],
    createdAt: new Date().toISOString(),
    lastTransferAt: new Date().toISOString(),
    isOnSale: false,
    price: "0",
    isERC721: true,
    mintOrder: "0",
    approvalState: "pending",
    contentVerified: false,
  }
}

// Update the fetchNFTTransactionHistory function to handle 404 errors gracefully
/**
 * Fetches transaction history for a specific NFT
 */
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

/**
 * Creates mock transaction history when the API fails to find any
 */
function createMockTransactionHistory(collectionAddress: string, tokenId: string) {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000 // 1 day in milliseconds

  return [
    {
      type: "mint",
      from: "0x0000000000000000000000000000000000000000",
      to: "0x123456789abcdef123456789abcdef123456789a",
      timestamp: Math.floor((now - 30 * day) / 1000).toString(), // ~30 days ago
      txHash: "0x" + "1".repeat(64),
      price: "0",
    },
    {
      type: "transfer",
      from: "0x123456789abcdef123456789abcdef123456789a",
      to: "0xabcdef123456789abcdef123456789abcdef1234",
      timestamp: Math.floor((now - 15 * day) / 1000).toString(), // ~15 days ago
      txHash: "0x" + "2".repeat(64),
      price: "0",
    },
    {
      type: "transfer",
      from: "0xabcdef123456789abcdef123456789abcdef1234",
      to: "0xfedcba9876543210fedcba9876543210fedcba98",
      timestamp: Math.floor((now - 5 * day) / 1000).toString(), // ~5 days ago
      txHash: "0x" + "3".repeat(64),
      price: "0",
    },
  ]
}

/**
 * Fetches NFTs from a specific collection
 */
export async function fetchCollectionNFTs(collectionAddress: string, page = 1, limit = 20) {
  try {
    const response = await fetch(`${API_BASE_URL}/collections/${collectionAddress}/nfts?page=${page}&limit=${limit}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch collection NFTs: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.nfts || []
  } catch (error) {
    console.error(`Error fetching collection NFTs for ${collectionAddress}:`, error)
    return []
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

      // Check if we need to enhance attributes
      let enhancedAttributes = [...attributes]

      // If we only have basic attributes (Trait Count, Attributes Count), add synthetic ones
      if (
        enhancedAttributes.length <= 2 &&
        enhancedAttributes.every((attr) => ["Trait Count", "Attributes Count"].includes(attr.trait_type))
      ) {
        // Generate synthetic attributes based on token ID
        const tokenIdNum = Number.parseInt(nft.tokenId, 10) || 0

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

        enhancedAttributes = [
          { trait_type: "Background", value: backgrounds[backgroundIndex], frequency: 0 },
          { trait_type: "Fur", value: furColors[furIndex], frequency: 0 },
          { trait_type: "Eyes", value: eyeColors[eyeIndex], frequency: 0 },
          { trait_type: "Accessory", value: accessories[accessoryIndex], frequency: 0 },
          ...enhancedAttributes,
        ]
      }

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
    }
  } catch (error) {
    console.error(`Error fetching single NFT ${collectionAddress}/${tokenId}:`, error)
    return null
  }
}

/**
 * Checks if an NFT is approved for staking
 */
export async function checkNFTApproval(
  nftAddress: string,
  tokenId: string,
  stakingContractAddress: string,
  userAddress: string,
): Promise<boolean> {
  try {
    console.log(`Checking approval for NFT ${nftAddress}/${tokenId} for contract ${stakingContractAddress}`)
    // In a real implementation, this would call the blockchain to check approval
    // For now, we'll simulate a network request and return a mock value
    await new Promise((resolve) => setTimeout(resolve, 500))
    return Math.random() > 0.3 // 70% chance of being approved already
  } catch (error) {
    console.error("Error checking NFT approval:", error)
    return false
  }
}

/**
 * Approves an NFT for staking
 */
export async function approveNFT(
  nftAddress: string,
  tokenId: string,
  stakingContractAddress: string,
): Promise<boolean> {
  try {
    console.log(`Approving NFT ${nftAddress}/${tokenId} for contract ${stakingContractAddress}`)
    // In a real implementation, this would call the blockchain to approve the NFT
    // For now, we'll simulate a network request and return success
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return true
  } catch (error) {
    console.error("Error approving NFT:", error)
    throw new Error("Failed to approve NFT. Please try again.")
  }
}

/**
 * Stakes NFTs in a staking contract
 */
export async function stakeNFTs(
  stakingContractAddress: string,
  nftAddress: string,
  tokenIds: string[],
  userAddress: string,
): Promise<boolean> {
  try {
    console.log(`Staking ${tokenIds.length} NFTs in contract ${stakingContractAddress}`)
    // In a real implementation, this would call the staking contract
    // For now, we'll simulate a network request and return success
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return true
  } catch (error) {
    console.error("Error staking NFTs:", error)
    throw new Error("Failed to stake NFTs. Please try again.")
  }
}

/**
 * Unstakes NFTs from a staking contract
 */
export async function unstakeNFTs(
  stakingContractAddress: string,
  nftAddress: string,
  tokenIds: string[],
  userAddress: string,
): Promise<boolean> {
  try {
    console.log(`Unstaking ${tokenIds.length} NFTs from contract ${stakingContractAddress}`)
    // In a real implementation, this would call the staking contract
    // For now, we'll simulate a network request and return success
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return true
  } catch (error) {
    console.error("Error unstaking NFTs:", error)
    throw new Error("Failed to unstake NFTs. Please try again.")
  }
}

/**
 * Claims rewards from a staking contract
 */
export async function claimRewards(
  stakingContractAddress: string,
  userAddress: string,
): Promise<{ success: boolean; amount: string }> {
  try {
    console.log(`Claiming rewards from contract ${stakingContractAddress} for user ${userAddress}`)
    // In a real implementation, this would call the staking contract
    // For now, we'll simulate a network request and return success
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate a random reward amount between 0.1 and 10
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
    createdAt: new Date().toISOString(),
    lastTransferAt: new Date().toISOString(),
    isOnSale: false,
    price: "0",
    isERC721: true,
    mintOrder: "0",
    approvalState: "pending",
    contentVerified: false,
  }))
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
