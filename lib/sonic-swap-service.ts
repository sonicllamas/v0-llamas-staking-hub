/**
 * Sonic Swap Service
 * Provides functionality for interacting with Sonic DEX
 */

// Token definitions for Sonic Network
export const SONIC_TOKENS = [
  {
    symbol: "SONIC",
    name: "Sonic",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    logoURI: "/sonic-llamas-logo.jpg",
    isNative: true,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    decimals: 6,
    logoURI: "/usdc-logo.png",
    isNative: false,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    decimals: 6,
    logoURI: "/usdt-coins.png",
    isNative: false,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ethereum",
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    decimals: 18,
    logoURI: "/ethereum-logo.svg",
    isNative: false,
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    decimals: 8,
    logoURI: "/bitcoin-concept.png",
    isNative: false,
  },
]

/**
 * Checks if the user is connected to the Sonic Network
 * @returns Promise<boolean> True if connected to Sonic Network
 */
export async function checkSonicNetwork(): Promise<boolean> {
  try {
    // Check if window.ethereum is available
    if (!window.ethereum) {
      console.error("No ethereum provider found")
      return false
    }

    // Get the current chain ID
    const chainId = await window.ethereum.request({ method: "eth_chainId" })

    // Sonic Network Chain ID is 146 (0x92 in hex)
    return chainId === "0x92"
  } catch (error) {
    console.error("Error checking network:", error)
    return false
  }
}

/**
 * Gets token balances for the connected wallet
 * @returns Promise with token balances
 */
export async function getSonicTokenBalances(): Promise<
  Array<{
    symbol: string
    balance: string
    formattedBalance: string
  }>
> {
  try {
    // Check if window.ethereum is available
    if (!window.ethereum) {
      throw new Error("No ethereum provider found")
    }

    // Get accounts
    const accounts = await window.ethereum.request({ method: "eth_accounts" })

    if (!accounts || accounts.length === 0) {
      throw new Error("No connected accounts found")
    }

    const userAddress = accounts[0]

    // Get balances for each token
    const balancePromises = SONIC_TOKENS.map(async (token) => {
      let balance = "0"
      let formattedBalance = "0"

      try {
        if (token.isNative) {
          // For native token (SONIC), use eth_getBalance
          const balanceHex = await window.ethereum.request({
            method: "eth_getBalance",
            params: [userAddress, "latest"],
          })

          balance = Number.parseInt(balanceHex, 16).toString()
          formattedBalance = formatBalance(balance, token.decimals)
        } else {
          // For ERC20 tokens, use contract call
          // This is a simplified version - in a real app, you'd use the ERC20 balanceOf method
          balance = "0" // Mock balance for now
          formattedBalance = "0"
        }
      } catch (err) {
        console.error(`Error fetching balance for ${token.symbol}:`, err)
      }

      return {
        symbol: token.symbol,
        balance,
        formattedBalance,
      }
    })

    return await Promise.all(balancePromises)
  } catch (error) {
    console.error("Error getting token balances:", error)
    return []
  }
}

/**
 * Generates a swap quote for trading tokens on Sonic DEX
 * @param fromToken Source token symbol
 * @param toToken Destination token symbol
 * @param amount Amount to swap in base units
 * @returns Promise with swap quote details
 */
export async function generateSonicSwapQuote(
  fromToken: string,
  toToken: string,
  amount: string,
): Promise<{
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  exchangeRate: string
  priceImpact: string
  fee: string
  estimatedGas: string
}> {
  try {
    // In a real implementation, this would call the Sonic DEX API
    // For now, we'll return mock data

    // Find token details
    const sourceToken = SONIC_TOKENS.find((t) => t.symbol === fromToken)
    const destToken = SONIC_TOKENS.find((t) => t.symbol === toToken)

    if (!sourceToken || !destToken) {
      throw new Error("Invalid token symbols")
    }

    // Mock exchange rate based on token pairs
    let exchangeRate = "1"
    if (fromToken === "SONIC" && toToken === "USDC") {
      exchangeRate = "0.95"
    } else if (fromToken === "USDC" && toToken === "SONIC") {
      exchangeRate = "1.05"
    } else if (fromToken === "SONIC" && toToken === "WETH") {
      exchangeRate = "0.0005"
    } else if (fromToken === "WETH" && toToken === "SONIC") {
      exchangeRate = "2000"
    }

    // Calculate to amount based on exchange rate
    const numAmount = Number.parseFloat(amount)
    const toAmount = (numAmount * Number.parseFloat(exchangeRate)).toString()

    // Mock other values
    const priceImpact = numAmount > 1000 ? "0.5" : "0.1"
    const fee = (numAmount * 0.003).toString() // 0.3% fee
    const estimatedGas = "150000"

    return {
      fromToken,
      toToken,
      fromAmount: amount,
      toAmount,
      exchangeRate,
      priceImpact,
      fee,
      estimatedGas,
    }
  } catch (error) {
    console.error("Error generating swap quote:", error)
    throw error
  }
}

/**
 * Helper function to format token balance with proper decimals
 */
function formatBalance(balance: string, decimals: number): string {
  try {
    const num = Number.parseInt(balance)
    return (num / Math.pow(10, decimals)).toFixed(4)
  } catch (error) {
    return "0"
  }
}
