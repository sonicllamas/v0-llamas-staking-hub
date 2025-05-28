// Sonic API Service for transaction lookups
export interface SonicTransactionData {
  hash: string
  status: "success" | "failed" | "pending"
  blockNumber: number
  blockHash: string
  transactionIndex: number
  from: string
  to: string
  value: string
  gasPrice: string
  gasUsed?: string
  gasLimit: string
  nonce: number
  input: string
  confirmations: number
  timestamp?: number
  logs?: any[]
  contractAddress?: string
}

export interface SonicBlockData {
  number: number
  hash: string
  timestamp: number
  gasUsed: string
  gasLimit: string
  transactions: string[]
}

export class SonicAPIService {
  private rpcUrl = "https://rpc.soniclabs.com"
  private explorerApiUrl = "https://api.sonicscan.org/api" // If available

  /**
   * Get transaction by hash using Sonic RPC
   */
  async getTransactionByHash(txHash: string): Promise<SonicTransactionData | null> {
    try {
      // Validate hash format first
      if (!this.isValidTxHash(txHash)) {
        throw new Error("Invalid transaction hash format")
      }

      // Get transaction details
      const txResponse = await this.makeRPCCall("eth_getTransactionByHash", [txHash])

      if (!txResponse.result) {
        return null // Transaction not found
      }

      // Get transaction receipt for additional details
      const receiptResponse = await this.makeRPCCall("eth_getTransactionReceipt", [txHash])
      const receipt = receiptResponse.result

      // Get current block number for confirmations
      const currentBlockResponse = await this.makeRPCCall("eth_blockNumber", [])
      const currentBlock = Number.parseInt(currentBlockResponse.result, 16)

      // Get block details for timestamp
      const blockResponse = await this.makeRPCCall("eth_getBlockByNumber", [txResponse.result.blockNumber, false])
      const blockData = blockResponse.result

      const tx = txResponse.result
      const blockNumber = tx.blockNumber ? Number.parseInt(tx.blockNumber, 16) : 0
      const confirmations = blockNumber > 0 ? currentBlock - blockNumber : 0

      return {
        hash: tx.hash,
        status: receipt ? (receipt.status === "0x1" ? "success" : "failed") : tx.blockNumber ? "success" : "pending",
        blockNumber: blockNumber,
        blockHash: tx.blockHash || "",
        transactionIndex: Number.parseInt(tx.transactionIndex || "0x0", 16),
        from: tx.from,
        to: tx.to || "",
        value: this.weiToEther(tx.value),
        gasPrice: this.weiToGwei(tx.gasPrice),
        gasUsed: receipt ? Number.parseInt(receipt.gasUsed, 16).toString() : undefined,
        gasLimit: Number.parseInt(tx.gas, 16).toString(),
        nonce: Number.parseInt(tx.nonce, 16),
        input: tx.input,
        confirmations: confirmations,
        timestamp: blockData ? Number.parseInt(blockData.timestamp, 16) : undefined,
        logs: receipt?.logs || [],
        contractAddress: receipt?.contractAddress || undefined,
      }
    } catch (error) {
      console.error("Error fetching transaction:", error)
      throw error
    }
  }

  /**
   * Get multiple transactions by hashes
   */
  async getTransactionsByHashes(txHashes: string[]): Promise<(SonicTransactionData | null)[]> {
    const promises = txHashes.map((hash) => this.getTransactionByHash(hash))
    return Promise.all(promises)
  }

  /**
   * Get latest transactions from a block
   */
  async getLatestTransactions(count = 10): Promise<SonicTransactionData[]> {
    try {
      // Get latest block
      const latestBlockResponse = await this.makeRPCCall("eth_blockNumber", [])
      const latestBlockNumber = Number.parseInt(latestBlockResponse.result, 16)

      // Get recent blocks and their transactions
      const transactions: SonicTransactionData[] = []
      let currentBlock = latestBlockNumber

      while (transactions.length < count && currentBlock > latestBlockNumber - 10) {
        const blockResponse = await this.makeRPCCall("eth_getBlockByNumber", [
          `0x${currentBlock.toString(16)}`,
          true, // Include full transaction objects
        ])

        if (blockResponse.result && blockResponse.result.transactions) {
          for (const tx of blockResponse.result.transactions.slice(0, count - transactions.length)) {
            const txData = await this.getTransactionByHash(tx.hash)
            if (txData) {
              transactions.push(txData)
            }
          }
        }
        currentBlock--
      }

      return transactions.slice(0, count)
    } catch (error) {
      console.error("Error fetching latest transactions:", error)
      return []
    }
  }

  /**
   * Get transaction status (for pending transaction monitoring)
   */
  async getTransactionStatus(txHash: string): Promise<"pending" | "success" | "failed" | "not_found"> {
    try {
      const txData = await this.getTransactionByHash(txHash)
      if (!txData) return "not_found"
      return txData.status
    } catch (error) {
      return "not_found"
    }
  }

  /**
   * Search transactions by address
   */
  async getTransactionsByAddress(address: string, page = 1, limit = 20): Promise<SonicTransactionData[]> {
    // This would typically use an explorer API
    // For now, we'll return empty array as RPC doesn't support this directly
    console.warn("Transaction search by address requires explorer API")
    return []
  }

  /**
   * Get gas price recommendations
   */
  async getGasPriceRecommendations(): Promise<{
    slow: string
    standard: string
    fast: string
  }> {
    try {
      const gasPriceResponse = await this.makeRPCCall("eth_gasPrice", [])
      const gasPrice = Number.parseInt(gasPriceResponse.result, 16)
      const gasPriceGwei = gasPrice / 1e9

      return {
        slow: (gasPriceGwei * 0.8).toFixed(2),
        standard: gasPriceGwei.toFixed(2),
        fast: (gasPriceGwei * 1.2).toFixed(2),
      }
    } catch (error) {
      console.error("Error fetching gas price:", error)
      return {
        slow: "1.0",
        standard: "1.5",
        fast: "2.0",
      }
    }
  }

  /**
   * Make RPC call to Sonic network
   */
  private async makeRPCCall(method: string, params: any[]): Promise<any> {
    const response = await fetch(this.rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: method,
        params: params,
        id: Date.now(),
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`)
    }

    return data
  }

  /**
   * Validate transaction hash format
   */
  private isValidTxHash(hash: string): boolean {
    return /^0x[0-9a-fA-F]{64}$/.test(hash)
  }

  /**
   * Convert wei to ether
   */
  private weiToEther(wei: string): string {
    const weiNum = BigInt(wei)
    const etherNum = Number(weiNum) / 1e18
    return etherNum.toFixed(6)
  }

  /**
   * Convert wei to gwei
   */
  private weiToGwei(wei: string): string {
    const weiNum = BigInt(wei)
    const gweiNum = Number(weiNum) / 1e9
    return gweiNum.toFixed(2)
  }

  /**
   * Format timestamp to readable date
   */
  formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString()
  }

  /**
   * Get explorer URL for transaction
   */
  getExplorerUrl(txHash: string): string {
    return `https://sonicscan.org/tx/${txHash}`
  }

  /**
   * Get explorer URL for address
   */
  getAddressExplorerUrl(address: string): string {
    return `https://sonicscan.org/address/${address}`
  }

  /**
   * Get explorer URL for block
   */
  getBlockExplorerUrl(blockNumber: number): string {
    return `https://sonicscan.org/block/${blockNumber}`
  }
}

// Export singleton instance
export const sonicAPI = new SonicAPIService()
