// Enhanced Sonic NFT API service with working endpoints only
const PAINTSWAP_API_BASE = "https://api.paintswap.finance"

export interface SonicNFT {
  tokenId: string
  contractAddress: string
  name?: string
  description?: string
  image?: string
  attributes?: any[]
  owner: string
  collection?: {
    name: string
    symbol: string
    verified: boolean
  }
}

export class SonicNFTService {
  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    try {
      console.log(`🌊 Making request to: ${url}`)

      const response = await fetch(url, {
        ...options,
        headers: {
          Accept: "application/json",
          "User-Agent": "LlamasStakingHub/1.0",
          ...(options.headers || {}),
        },
      })

      if (!response.ok) {
        console.warn(`⚠️ API request failed: ${response.status} ${response.statusText}`)
        return null
      }

      const data = await response.json()
      console.log(`✅ API response received, data length:`, Array.isArray(data?.nfts) ? data.nfts.length : "unknown")
      return data
    } catch (error) {
      console.error(`❌ API request error:`, error)
      return null
    }
  }

  /**
   * Get all NFTs for a wallet using PaintSwap API with complete pagination
   */
  async getAllUserNFTs(walletAddress: string): Promise<SonicNFT[]> {
    console.log(`🔍 Loading ALL NFTs for wallet: ${walletAddress}`)

    // Use PaintSwap API with aggressive pagination
    const nfts = await this.loadFromPaintSwapComplete(walletAddress)

    console.log(`🎉 Total NFTs found: ${nfts.length}`)
    return nfts
  }

  /**
   * Load ALL NFTs from PaintSwap API with complete pagination
   */
  private async loadFromPaintSwapComplete(walletAddress: string): Promise<SonicNFT[]> {
    console.log(`🎨 Loading from PaintSwap API with complete pagination...`)

    const allNFTs: SonicNFT[] = []
    let offset = 0
    const limit = 50 // Smaller batch size for reliability
    let hasMore = true
    let totalFromAPI = 0
    let consecutiveEmptyBatches = 0

    // First request to get total count
    try {
      const initialUrl = `${PAINTSWAP_API_BASE}/userNFTs/?user=${walletAddress}&chainId=146&limit=${limit}&offset=0`
      const initialData = await this.makeRequest(initialUrl)

      if (!initialData) {
        console.warn("⚠️ Initial PaintSwap request failed")
        return []
      }

      totalFromAPI = initialData.total || 0
      console.log(`📊 PaintSwap reports ${totalFromAPI} total NFTs for this wallet`)

      if (initialData.nfts && initialData.nfts.length > 0) {
        const nfts = initialData.nfts.map((nft: any) => this.transformPaintSwapNFT(nft, walletAddress))
        allNFTs.push(...nfts)
        console.log(`📦 Initial batch: ${nfts.length} NFTs`)
      }

      offset = limit
    } catch (error) {
      console.error("❌ Initial PaintSwap request failed:", error)
      return []
    }

    // Continue loading until we have all NFTs
    while (hasMore && offset < 2000) {
      // Safety limit
      try {
        const url = `${PAINTSWAP_API_BASE}/userNFTs/?user=${walletAddress}&chainId=146&limit=${limit}&offset=${offset}`
        const data = await this.makeRequest(url)

        if (!data || !data.nfts || data.nfts.length === 0) {
          consecutiveEmptyBatches++
          console.log(`📭 Empty batch at offset ${offset} (${consecutiveEmptyBatches} consecutive empty)`)

          // If we get 3 consecutive empty batches, we're probably done
          if (consecutiveEmptyBatches >= 3) {
            console.log(`🏁 Stopping after ${consecutiveEmptyBatches} consecutive empty batches`)
            hasMore = false
            break
          }

          offset += limit
          continue
        }

        // Reset empty batch counter
        consecutiveEmptyBatches = 0

        // Filter out duplicates and add new NFTs
        const newNFTs: SonicNFT[] = []
        for (const nftData of data.nfts) {
          const nft = this.transformPaintSwapNFT(nftData, walletAddress)
          const exists = allNFTs.find(
            (existing) =>
              existing.contractAddress.toLowerCase() === nft.contractAddress.toLowerCase() &&
              existing.tokenId === nft.tokenId,
          )
          if (!exists) {
            newNFTs.push(nft)
          }
        }

        allNFTs.push(...newNFTs)

        console.log(
          `📦 Batch at offset ${offset}: ${data.nfts.length} returned, ${newNFTs.length} new (total: ${allNFTs.length}/${totalFromAPI})`,
        )

        // Check if we should continue
        if (data.nfts.length < limit) {
          console.log(`✅ Reached end of results (got ${data.nfts.length} < ${limit})`)
          hasMore = false
        } else if (allNFTs.length >= totalFromAPI && totalFromAPI > 0) {
          console.log(`✅ Loaded all ${totalFromAPI} NFTs as reported by API`)
          hasMore = false
        } else {
          offset += limit
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.warn(`⚠️ Failed to load batch at offset ${offset}:`, error)
        offset += limit

        // If we've had too many failures, stop
        if (offset > totalFromAPI + 500) {
          console.warn(`⚠️ Too many failures, stopping at offset ${offset}`)
          break
        }
      }
    }

    // Special handling for SLLAMA NFTs - if we don't have enough, try direct collection query
    const sllamaCount = allNFTs.filter(
      (nft) => nft.contractAddress.toLowerCase() === "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e",
    ).length

    console.log(`🦙 Found ${sllamaCount} SLLAMA NFTs`)

    if (sllamaCount < 50) {
      // If we have less than expected SLLAMA NFTs
      console.log(`🦙 Only found ${sllamaCount} SLLAMA NFTs, trying direct collection query...`)
      const sllamaNFTs = await this.loadSpecificContract("0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e", walletAddress)

      // Add any missing SLLAMA NFTs
      let addedCount = 0
      for (const sllamaNFT of sllamaNFTs) {
        const exists = allNFTs.find(
          (nft) =>
            nft.contractAddress.toLowerCase() === sllamaNFT.contractAddress.toLowerCase() &&
            nft.tokenId === sllamaNFT.tokenId,
        )
        if (!exists) {
          allNFTs.push(sllamaNFT)
          addedCount++
        }
      }

      if (addedCount > 0) {
        console.log(`🦙 Added ${addedCount} additional SLLAMA NFTs from direct query`)
      }
    }

    const finalSllamaCount = allNFTs.filter(
      (nft) => nft.contractAddress.toLowerCase() === "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e",
    ).length

    console.log(`✅ PaintSwap complete: ${allNFTs.length} total NFTs`)
    console.log(`🦙 Final SLLAMA count: ${finalSllamaCount}`)

    // Log collection breakdown
    const collections = new Map<string, number>()
    allNFTs.forEach((nft) => {
      const name = this.getCollectionName(nft.contractAddress)
      collections.set(name, (collections.get(name) || 0) + 1)
    })

    console.log("📊 Collection breakdown:")
    collections.forEach((count, name) => {
      console.log(`  ${name}: ${count} NFTs`)
    })

    return allNFTs
  }

  /**
   * Load NFTs from a specific contract
   */
  private async loadSpecificContract(contractAddress: string, walletAddress: string): Promise<SonicNFT[]> {
    console.log(`🔗 Loading NFTs from contract ${contractAddress}...`)

    const allNFTs: SonicNFT[] = []

    // Try different PaintSwap endpoints for specific contracts
    const endpoints = [
      `${PAINTSWAP_API_BASE}/userNFTs/?user=${walletAddress}&chainId=146&collection=${contractAddress}`,
      `${PAINTSWAP_API_BASE}/userNFTs/${contractAddress}?user=${walletAddress}&chainId=146`,
      `${PAINTSWAP_API_BASE}/metadata/${contractAddress}?chainId=146&owner=${walletAddress}`,
    ]

    for (const endpoint of endpoints) {
      try {
        const data = await this.makeRequest(endpoint)

        if (data && data.nfts && data.nfts.length > 0) {
          const nfts = data.nfts
            .filter((nft: any) => nft.owner && nft.owner.toLowerCase() === walletAddress.toLowerCase())
            .map((nft: any) => this.transformPaintSwapNFT(nft, walletAddress))

          allNFTs.push(...nfts)
          console.log(`✅ Contract endpoint returned ${nfts.length} NFTs`)
          break // Use first successful endpoint
        }
      } catch (error) {
        console.warn(`⚠️ Contract endpoint failed: ${endpoint}`, error)
      }
    }

    return allNFTs
  }

  private transformPaintSwapNFT(nft: any, walletAddress: string): SonicNFT {
    const contractAddress = nft.address || nft.contractAddress || ""
    const tokenId = nft.tokenId || nft.token_id || ""

    return {
      tokenId,
      contractAddress,
      name: nft.name || `${this.getCollectionName(contractAddress)} #${tokenId}`,
      description: nft.description || "",
      image: nft.image || `https://media-nft.paintswap.finance/${contractAddress}_${tokenId}_146.jpg`,
      attributes: nft.attributes || nft.traits || [],
      owner: walletAddress,
      collection: {
        name: this.getCollectionName(contractAddress),
        symbol: this.getCollectionSymbol(contractAddress),
        verified: nft.collection?.verified || this.isVerifiedCollection(contractAddress),
      },
    }
  }

  private getCollectionName(address: string): string {
    const collections: Record<string, string> = {
      "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e": "Sonic Llamas",
      "0x014f74668e8802cead8a54739816408bbdbf1101": "Sonic Creatures",
      "0x1234567890123456789012345678901234567890": "Test Collection",
    }
    return collections[address?.toLowerCase()] || `Collection ${address?.substring(0, 6)}...`
  }

  private getCollectionSymbol(address: string): string {
    const symbols: Record<string, string> = {
      "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e": "SLLAMA",
      "0x014f74668e8802cead8a54739816408bbdbf1101": "SCREATURE",
    }
    return symbols[address?.toLowerCase()] || "NFT"
  }

  private isVerifiedCollection(address: string): boolean {
    const verifiedCollections = [
      "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e", // Sonic Llamas
      "0x014f74668e8802cead8a54739816408bbdbf1101", // Sonic Creatures
    ]
    return verifiedCollections.includes(address?.toLowerCase())
  }
}

// Export the service instance
export const sonicNFTService = new SonicNFTService()
