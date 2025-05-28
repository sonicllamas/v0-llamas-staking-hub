declare global {
  interface Window {
    ethereum?: any
  }
}

export interface TransferResult {
  success: boolean
  txHash?: string
  error?: string
  gasUsed?: string
  gasCost?: string
}

export interface BulkTransferResult {
  successful: TransferResult[]
  failed: TransferResult[]
  totalGasCost: string
  summary: {
    successCount: number
    failCount: number
    totalTransfers: number
  }
}

export class NFTTransferService {
  private provider: any = null

  constructor() {
    // Initialize provider only when needed
  }

  /**
   * Initialize Web3 provider
   */
  private async initializeProvider() {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("No Web3 provider found. Please install MetaMask or another Web3 wallet.")
    }

    try {
      // Use the native Web3 provider
      this.provider = window.ethereum

      // Request account access
      await this.provider.request({ method: "eth_requestAccounts" })

      return true
    } catch (error) {
      console.error("Failed to initialize Web3 provider:", error)
      throw new Error("Failed to connect to wallet")
    }
  }

  /**
   * Get current gas price using Web3 RPC
   */
  private async getGasPrice(): Promise<string> {
    if (!this.provider) {
      await this.initializeProvider()
    }

    try {
      const gasPrice = await this.provider.request({
        method: "eth_gasPrice",
      })
      return gasPrice
    } catch (error) {
      console.error("Failed to get gas price:", error)
      // Fallback gas price for Sonic (1 gwei)
      return "0x3b9aca00"
    }
  }

  /**
   * Convert hex to decimal
   */
  private hexToDecimal(hex: string): string {
    return Number.parseInt(hex, 16).toString()
  }

  /**
   * Format Wei to Ether using native BigInt
   */
  private formatEther(wei: string): string {
    const weiNum = BigInt(wei)
    const etherNum = Number(weiNum) / 1e18
    return etherNum.toFixed(6)
  }

  /**
   * Parse Ether to Wei using native BigInt
   */
  private parseEther(ether: string): string {
    const etherNum = Number.parseFloat(ether)
    const weiNum = BigInt(Math.floor(etherNum * 1e18))
    return "0x" + weiNum.toString(16)
  }

  /**
   * Initialize the service with current wallet
   */
  async initialize(): Promise<boolean> {
    try {
      await this.initializeProvider()

      // Check network
      const chainId = await this.provider.request({ method: "eth_chainId" })
      const chainIdDecimal = Number.parseInt(chainId, 16)

      if (chainIdDecimal !== 146) {
        throw new Error("Please switch to Sonic Mainnet (Chain ID: 146)")
      }

      return true
    } catch (error) {
      console.error("Failed to initialize NFT transfer service:", error)
      return false
    }
  }

  /**
   * Validate Ethereum address
   */
  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  /**
   * Estimate gas for a transfer using Web3 RPC
   */
  async estimateTransferGas(
    contractAddress: string,
    tokenId: string,
    fromAddress: string,
    toAddress: string,
  ): Promise<{
    gasLimit: string
    gasPrice: string
    estimatedCost: string
  }> {
    if (!this.provider) {
      await this.initializeProvider()
    }

    if (!this.isValidAddress(contractAddress) || !this.isValidAddress(toAddress)) {
      throw new Error("Invalid contract or recipient address")
    }

    try {
      const gasPrice = await this.getGasPrice()

      // Encode safeTransferFrom function call
      const functionSignature = "0x42842e0e" // safeTransferFrom(address,address,uint256)
      const paddedFrom = fromAddress.slice(2).padStart(64, "0")
      const paddedTo = toAddress.slice(2).padStart(64, "0")
      const paddedTokenId = Number.parseInt(tokenId).toString(16).padStart(64, "0")
      const data = functionSignature + paddedFrom + paddedTo + paddedTokenId

      // Estimate gas
      const gasEstimate = await this.provider.request({
        method: "eth_estimateGas",
        params: [
          {
            from: fromAddress,
            to: contractAddress,
            data: data,
          },
        ],
      })

      // Add 20% buffer
      const gasLimit = Math.floor(Number.parseInt(gasEstimate, 16) * 1.2)
      const gasLimitHex = "0x" + gasLimit.toString(16)

      // Calculate cost using native BigInt
      const gasCost = BigInt(gasLimit) * BigInt(gasPrice)
      const estimatedCost = this.formatEther(gasCost.toString())

      return {
        gasLimit: gasLimitHex,
        gasPrice,
        estimatedCost,
      }
    } catch (error) {
      console.error("Gas estimation failed:", error)
      // Return fallback values
      return {
        gasLimit: "0x5208", // 21000 gas
        gasPrice: "0x3b9aca00", // 1 gwei
        estimatedCost: "0.000021",
      }
    }
  }

  /**
   * Check if user owns the NFT using Web3 RPC
   */
  async verifyOwnership(contractAddress: string, tokenId: string, userAddress: string): Promise<boolean> {
    if (!this.provider) {
      await this.initializeProvider()
    }

    try {
      // Encode ownerOf function call
      const functionSignature = "0x6352211e" // ownerOf(uint256)
      const paddedTokenId = Number.parseInt(tokenId).toString(16).padStart(64, "0")
      const data = functionSignature + paddedTokenId

      const result = await this.provider.request({
        method: "eth_call",
        params: [
          {
            to: contractAddress,
            data: data,
          },
          "latest",
        ],
      })

      // Extract owner address from result
      const ownerAddress = "0x" + result.slice(-40)
      return ownerAddress.toLowerCase() === userAddress.toLowerCase()
    } catch (error) {
      console.error("Ownership verification failed:", error)
      return false
    }
  }

  /**
   * Transfer a single NFT using Web3 RPC
   */
  async transferNFT(
    contractAddress: string,
    tokenId: string,
    toAddress: string,
    fromAddress: string,
  ): Promise<TransferResult> {
    if (!this.provider) {
      try {
        await this.initializeProvider()
      } catch (error) {
        return { success: false, error: "Failed to connect to wallet" }
      }
    }

    if (!this.isValidAddress(contractAddress) || !this.isValidAddress(toAddress)) {
      return { success: false, error: "Invalid contract or recipient address" }
    }

    try {
      console.log(`🔄 Transferring NFT ${contractAddress}/${tokenId} to ${toAddress}`)

      // Verify ownership
      const isOwner = await this.verifyOwnership(contractAddress, tokenId, fromAddress)
      if (!isOwner) {
        return { success: false, error: "You don't own this NFT" }
      }

      // Get gas estimation
      const { gasLimit, gasPrice } = await this.estimateTransferGas(contractAddress, tokenId, fromAddress, toAddress)

      // Encode safeTransferFrom function call
      const functionSignature = "0x42842e0e" // safeTransferFrom(address,address,uint256)
      const paddedFrom = fromAddress.slice(2).padStart(64, "0")
      const paddedTo = toAddress.slice(2).padStart(64, "0")
      const paddedTokenId = Number.parseInt(tokenId).toString(16).padStart(64, "0")
      const data = functionSignature + paddedFrom + paddedTo + paddedTokenId

      // Send transaction
      const txHash = await this.provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: fromAddress,
            to: contractAddress,
            gas: gasLimit,
            gasPrice: gasPrice,
            data: data,
          },
        ],
      })

      console.log(`📤 Transfer transaction sent: ${txHash}`)

      // Calculate gas cost (estimate since we don't have receipt yet)
      const gasCost = BigInt(gasLimit) * BigInt(gasPrice)
      const gasCostFormatted = this.formatEther(gasCost.toString())

      console.log(`✅ Transfer initiated: ${txHash}`)

      return {
        success: true,
        txHash: txHash,
        gasUsed: this.hexToDecimal(gasLimit),
        gasCost: gasCostFormatted,
      }
    } catch (error: any) {
      console.error("Transfer failed:", error)

      let errorMessage = "Transfer failed"
      if (error.code === 4001) {
        errorMessage = "Transaction rejected by user"
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas fees"
      } else if (error.message?.includes("revert")) {
        errorMessage = "Transaction reverted - check NFT approval"
      }

      return { success: false, error: errorMessage }
    }
  }

  /**
   * Bulk transfer multiple NFTs
   */
  async bulkTransferNFTs(
    transfers: Array<{
      contractAddress: string
      tokenId: string
      toAddress: string
    }>,
    fromAddress: string,
    onProgress?: (completed: number, total: number, currentNFT: string) => void,
  ): Promise<BulkTransferResult> {
    const successful: TransferResult[] = []
    const failed: TransferResult[] = []
    let totalGasCostBigInt = BigInt(0)

    console.log(`🔄 Starting bulk transfer of ${transfers.length} NFTs`)

    for (let i = 0; i < transfers.length; i++) {
      const transfer = transfers[i]
      const nftIdentifier = `${transfer.contractAddress}/${transfer.tokenId}`

      if (onProgress) {
        onProgress(i, transfers.length, nftIdentifier)
      }

      try {
        const result = await this.transferNFT(
          transfer.contractAddress,
          transfer.tokenId,
          transfer.toAddress,
          fromAddress,
        )

        if (result.success) {
          successful.push(result)
          if (result.gasCost) {
            // Parse the gas cost and add to total using BigInt
            const gasCostWei = this.parseEther(result.gasCost)
            totalGasCostBigInt = totalGasCostBigInt + BigInt(gasCostWei)
          }
        } else {
          failed.push(result)
        }

        // Small delay between transfers to avoid rate limiting
        if (i < transfers.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`Failed to transfer ${nftIdentifier}:`, error)
        failed.push({
          success: false,
          error: `Failed to transfer ${nftIdentifier}: ${error}`,
        })
      }
    }

    if (onProgress) {
      onProgress(transfers.length, transfers.length, "Complete")
    }

    const result: BulkTransferResult = {
      successful,
      failed,
      totalGasCost: this.formatEther(totalGasCostBigInt.toString()),
      summary: {
        successCount: successful.length,
        failCount: failed.length,
        totalTransfers: transfers.length,
      },
    }

    console.log(`✅ Bulk transfer complete:`, result.summary)

    return result
  }

  /**
   * Estimate total gas cost for bulk transfer
   */
  async estimateBulkTransferCost(
    transfers: Array<{
      contractAddress: string
      tokenId: string
      toAddress: string
    }>,
    fromAddress: string,
  ): Promise<{
    totalEstimatedCost: string
    perTransferCost: string
    gasPrice: string
  }> {
    if (transfers.length === 0) {
      return { totalEstimatedCost: "0", perTransferCost: "0", gasPrice: "0" }
    }

    try {
      // Use first transfer for estimation
      const firstTransfer = transfers[0]
      const estimation = await this.estimateTransferGas(
        firstTransfer.contractAddress,
        firstTransfer.tokenId,
        fromAddress,
        firstTransfer.toAddress,
      )

      const perTransferCost = estimation.estimatedCost
      const totalCost = Number.parseFloat(perTransferCost) * transfers.length

      return {
        totalEstimatedCost: totalCost.toFixed(6),
        perTransferCost,
        gasPrice: this.formatEther(estimation.gasPrice),
      }
    } catch (error) {
      console.error("Bulk gas estimation failed:", error)
      throw new Error("Failed to estimate bulk transfer cost")
    }
  }

  /**
   * Get user's Sonic balance
   */
  async getUserBalance(userAddress: string): Promise<string> {
    if (!this.provider) {
      await this.initializeProvider()
    }

    try {
      const balance = await this.provider.request({
        method: "eth_getBalance",
        params: [userAddress, "latest"],
      })

      return this.formatEther(balance)
    } catch (error) {
      console.error("Failed to get user balance:", error)
      return "0"
    }
  }
}

// Export singleton instance
export const nftTransferService = new NFTTransferService()
