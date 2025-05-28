import { ethers } from "ethers"

// OpenOcean API configuration
const OPENOCEAN_API_BASE = "https://open-api.openocean.finance"
const SUPPORTED_CHAINS = {
  ARBITRUM: 42161,
  ETHEREUM: 1,
  BSC: 56,
  POLYGON: 137,
  AVALANCHE: 43114,
  FANTOM: 250,
  OPTIMISM: 10,
}

export interface SwapQuoteParams {
  chainId: number
  inTokenAddress: string
  outTokenAddress: string
  amount: string
  gasPrice?: string
  slippage?: number
  account: string
  referrer?: string
}

export interface SwapQuoteResponse {
  inToken: {
    address: string
    symbol: string
    decimals: number
  }
  outToken: {
    address: string
    symbol: string
    decimals: number
  }
  inAmount: string
  outAmount: string
  estimatedGas: string
  gasPrice: string
  data: string
  to: string
  value: string
  minOutAmount: string
  priceImpact: string
  routes: Array<{
    name: string
    percentage: number
  }>
}

export interface LimitOrderParams {
  chainId: number
  makerTokenAddress: string
  takerTokenAddress: string
  makerAmount: string
  takerAmount: string
  maker: string
  expiry: number
  salt?: string
}

export class OpenOceanService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENOCEAN_API_KEY || ""
  }

  /**
   * Validate API key configuration
   */
  validateApiKey(): boolean {
    if (!this.apiKey || this.apiKey.length < 10) {
      console.warn("OpenOcean API key not configured or invalid")
      return false
    }
    return true
  }

  /**
   * Make API request to OpenOcean
   */
  private async makeApiRequest(endpoint: string, params: Record<string, any>) {
    const url = new URL(endpoint, OPENOCEAN_API_BASE)
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key].toString())
      }
    })

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid OpenOcean API key")
      }
      const errorText = await response.text()
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  /**
   * Get swap quote from OpenOcean aggregator
   */
  async getSwapQuote(params: SwapQuoteParams): Promise<SwapQuoteResponse> {
    if (!this.validateApiKey()) {
      throw new Error("OpenOcean API key not configured")
    }

    try {
      // Use the correct OpenOcean API endpoint format
      const response = await this.makeApiRequest("/v2/quote", {
        chain: params.chainId,
        inTokenAddress: params.inTokenAddress,
        outTokenAddress: params.outTokenAddress,
        amount: params.amount,
        gasPrice: params.gasPrice || "1",
        slippage: params.slippage || 1,
        account: params.account,
        referrer: params.referrer || "0x0000000000000000000000000000000000000000",
      })

      if (!response.data) {
        throw new Error("No quote data received from OpenOcean API")
      }

      return {
        inToken: response.data.inToken || {
          address: params.inTokenAddress,
          symbol: "Unknown",
          decimals: 18,
        },
        outToken: response.data.outToken || {
          address: params.outTokenAddress,
          symbol: "Unknown",
          decimals: 18,
        },
        inAmount: response.data.inAmount || params.amount,
        outAmount: response.data.outAmount || "0",
        estimatedGas: response.data.estimatedGas || "21000",
        gasPrice: response.data.gasPrice || params.gasPrice || "1",
        data: response.data.data || "0x",
        to: response.data.to || "0x0000000000000000000000000000000000000000",
        value: response.data.value || "0",
        minOutAmount: response.data.minOutAmount || "0",
        priceImpact: response.data.priceImpact || "0",
        routes: response.data.routes || [],
      }
    } catch (error: any) {
      console.error("OpenOcean quote error:", error)
      if (error.message.includes("API key")) {
        throw error
      }
      throw new Error(`Failed to get quote: ${error.message}`)
    }
  }

  /**
   * Execute swap transaction
   */
  async executeSwap(quoteData: SwapQuoteResponse, signer: ethers.Signer): Promise<ethers.TransactionResponse> {
    try {
      const transaction = {
        to: quoteData.to,
        data: quoteData.data,
        value: quoteData.value,
        gasLimit: quoteData.estimatedGas,
        gasPrice: quoteData.gasPrice,
      }

      const txResponse = await signer.sendTransaction(transaction)
      return txResponse
    } catch (error: any) {
      console.error("Swap execution error:", error)
      throw new Error(`Swap failed: ${error.message}`)
    }
  }

  /**
   * Get token information
   */
  async getTokenInfo(chainId: number, tokenAddress: string) {
    try {
      const response = await this.makeApiRequest("/v2/tokenInfo", {
        chain: chainId,
        address: tokenAddress,
      })
      return response.data
    } catch (error: any) {
      console.error("Token info error:", error)
      throw new Error(`Failed to get token info: ${error.message}`)
    }
  }

  /**
   * Get supported tokens for a chain
   */
  async getSupportedTokens(chainId: number) {
    try {
      const response = await this.makeApiRequest("/v2/tokenList", {
        chain: chainId,
      })
      return response.data
    } catch (error: any) {
      console.error("Supported tokens error:", error)
      throw new Error(`Failed to get supported tokens: ${error.message}`)
    }
  }

  /**
   * Create limit order (mock implementation)
   */
  async createLimitOrder(params: LimitOrderParams, signer: ethers.Signer) {
    try {
      // Mock implementation for limit orders
      const order = {
        id: `order_${Date.now()}`,
        chainId: params.chainId,
        makerTokenAddress: params.makerTokenAddress,
        takerTokenAddress: params.takerTokenAddress,
        makerAmount: params.makerAmount,
        takerAmount: params.takerAmount,
        maker: params.maker,
        expiry: params.expiry,
        salt: params.salt || Date.now().toString(),
        status: "created",
      }

      return order
    } catch (error: any) {
      console.error("Limit order error:", error)
      throw new Error(`Failed to create limit order: ${error.message}`)
    }
  }

  /**
   * Get limit orders for an address (mock implementation)
   */
  async getLimitOrders(chainId: number, maker: string) {
    try {
      // Mock implementation
      return []
    } catch (error: any) {
      console.error("Get limit orders error:", error)
      throw new Error(`Failed to get limit orders: ${error.message}`)
    }
  }

  /**
   * Cancel limit order (mock implementation)
   */
  async cancelLimitOrder(orderId: string, signer: ethers.Signer) {
    try {
      // Mock implementation
      return { orderId, status: "cancelled" }
    } catch (error: any) {
      console.error("Cancel limit order error:", error)
      throw new Error(`Failed to cancel limit order: ${error.message}`)
    }
  }

  /**
   * Get gas price for a chain using ethers provider
   */
  async getGasPrice(chainId: number): Promise<string> {
    try {
      // Use ethers provider to get gas price instead of OpenOcean API
      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const feeData = await provider.getFeeData()

        if (feeData.gasPrice) {
          return feeData.gasPrice.toString()
        }
      }

      // Fallback to default gas prices
      return this.getFallbackGasPrice(chainId)
    } catch (error: any) {
      console.error("Gas price error:", error)
      return this.getFallbackGasPrice(chainId)
    }
  }

  /**
   * Get fallback gas price
   */
  private getFallbackGasPrice(chainId: number): string {
    const fallbackGasPrices: Record<number, string> = {
      [SUPPORTED_CHAINS.ETHEREUM]: "20000000000", // 20 gwei
      [SUPPORTED_CHAINS.ARBITRUM]: "100000000", // 0.1 gwei
      [SUPPORTED_CHAINS.POLYGON]: "30000000000", // 30 gwei
      [SUPPORTED_CHAINS.BSC]: "5000000000", // 5 gwei
      [SUPPORTED_CHAINS.AVALANCHE]: "25000000000", // 25 gwei
      [SUPPORTED_CHAINS.FANTOM]: "1000000000000", // 1000 gwei
      [SUPPORTED_CHAINS.OPTIMISM]: "1000000", // 0.001 gwei
    }
    return fallbackGasPrices[chainId] || "1000000000" // 1 gwei default
  }

  /**
   * Check if token needs approval
   */
  async checkTokenApproval(
    tokenAddress: string,
    owner: string,
    spender: string,
    amount: string,
    provider: ethers.Provider,
  ): Promise<boolean> {
    try {
      if (tokenAddress === "0x0000000000000000000000000000000000000000") {
        return true // ETH doesn't need approval
      }

      const tokenContract = new ethers.Contract(
        tokenAddress,
        ["function allowance(address owner, address spender) view returns (uint256)"],
        provider,
      )

      const allowance = await tokenContract.allowance(owner, spender)
      return allowance >= BigInt(amount)
    } catch (error: any) {
      console.error("Approval check error:", error)
      return false
    }
  }

  /**
   * Approve token for trading
   */
  async approveToken(
    tokenAddress: string,
    spender: string,
    amount: string,
    signer: ethers.Signer,
  ): Promise<ethers.TransactionResponse> {
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ["function approve(address spender, uint256 amount) returns (bool)"],
        signer,
      )

      const txResponse = await tokenContract.approve(spender, amount)
      return txResponse
    } catch (error: any) {
      console.error("Token approval error:", error)
      throw new Error(`Token approval failed: ${error.message}`)
    }
  }

  /**
   * Get current gas price in a human-readable format
   */
  async getFormattedGasPrice(chainId: number): Promise<string> {
    try {
      const gasPriceWei = await this.getGasPrice(chainId)
      const gasPriceGwei = ethers.formatUnits(gasPriceWei, "gwei")
      return `${Number.parseFloat(gasPriceGwei).toFixed(2)} gwei`
    } catch (error) {
      return "Unknown"
    }
  }
}

// Export singleton instance
export const openOceanService = new OpenOceanService()

// Export supported chains
export { SUPPORTED_CHAINS }
