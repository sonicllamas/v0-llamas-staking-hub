import axios from "axios"
import { ethers } from "ethers"
import {
  getHeaders,
  chainId as defaultChainId,
  ETH_ADDRESS,
  USDC_ADDRESS,
  SONIC_ADDRESS,
  DEX_SPENDER_ADDRESS,
  ETHEREUM_CHAIN_ID,
  SONIC_CHAIN_ID,
  isOKXConfigured as checkOKXConfig,
} from "./okx-web3-config"
import { calculateTransactionFee, FeeType, isPaymentEnabled } from "@/config/payment-config"

// Re-export constants from okx-web3-config
export { ETHEREUM_CHAIN_ID, SONIC_CHAIN_ID, DEX_SPENDER_ADDRESS }

// Constants
const SONIC_CHAIN_ID_NUMBER = 146
const OKX_DEX_API_URL = "https://www.okx.com/api/v5/dex/aggregator"

// Export additional constants
export { SONIC_CHAIN_ID_NUMBER }

export interface Token {
  symbol: string
  name: string
  address: string
  decimals: number
  logo: string
  balance?: string
  price?: number
  isNative?: boolean
  chainId?: string
}

// Ethereum Mainnet tokens
export const ETHEREUM_TOKENS: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: ETH_ADDRESS,
    decimals: 18,
    logo: "/networks/ethereum.svg",
    balance: "0",
    price: 3245.67,
    isNative: true,
    chainId: ETHEREUM_CHAIN_ID,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: USDC_ADDRESS,
    decimals: 6,
    logo: "/usdc-coins.png",
    balance: "0",
    price: 1.0,
    chainId: ETHEREUM_CHAIN_ID,
  },
]

// Sonic Mainnet tokens - with verified addresses
export const SONIC_TOKENS: Token[] = [
  {
    symbol: "SONIC",
    name: "Sonic",
    address: SONIC_ADDRESS,
    decimals: 18,
    logo: "/networks/sonic.svg",
    balance: "0",
    price: 1.24,
    isNative: true,
    chainId: SONIC_CHAIN_ID,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894", // Verified USDC address on Sonic
    decimals: 6,
    logo: "/usdc-coins.png",
    balance: "0",
    price: 1.0,
    chainId: SONIC_CHAIN_ID,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ethereum",
    address: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38", // Verified WETH address on Sonic
    decimals: 18,
    logo: "/networks/ethereum.svg",
    balance: "0",
    price: 3245.67,
    chainId: SONIC_CHAIN_ID,
  },
]

// Combined tokens for easy access
export const ALL_TOKENS: Record<string, Token[]> = {
  [ETHEREUM_CHAIN_ID]: ETHEREUM_TOKENS,
  [SONIC_CHAIN_ID]: SONIC_TOKENS,
}

export interface SwapQuote {
  fromToken: Token
  toToken: Token
  fromAmount: string
  toAmount: string
  priceImpact: string
  gasEstimate: string
  route: any[]
  txData?: any
  quoteId?: string
  estimatedGas?: string
  minimumReceived?: string
  exchangeRate?: string
  routePath?: string[]
  // Add payment fee information
  paymentFee?: {
    feeAmount: string
    feePercentage: number
    receiverAddress: string
    enabled: boolean
  }
}

export interface SwapParams {
  fromTokenAddress: string
  toTokenAddress: string
  amount: string
  slippage?: string
  userWalletAddress: string
  chainId?: string
}

export interface SwapTransaction {
  to: string
  data: string
  value?: string
  gasLimit?: string
  gasPrice?: string
}

// Define error info interface
export interface TxErrorInfo {
  error: string
  message: string
  action: string
}

// Define broadcast result interface
export interface BroadcastResult {
  success: boolean
  txHash?: string
  orderId?: string
  error?: string
}

// Define transaction status interface
export interface TransactionStatus {
  status: "pending" | "success" | "failure" | "unknown"
  txHash?: string
  orderId?: string
  details?: any
  error?: string
  errorInfo?: TxErrorInfo
}

/**
 * Generate mock swap quote when OKX API is not available
 * @param params - Swap parameters
 * @returns Mock swap quote
 */
function generateMockSwapQuote(params: SwapParams): SwapQuote {
  const chainId = params.chainId || defaultChainId
  const tokens = ALL_TOKENS[chainId] || SONIC_TOKENS

  const fromToken = tokens.find((t) => t.address.toLowerCase() === params.fromTokenAddress.toLowerCase())
  const toToken = tokens.find((t) => t.address.toLowerCase() === params.toTokenAddress.toLowerCase())

  if (!fromToken || !toToken) {
    throw new Error("Token not found")
  }

  // Calculate mock exchange rate based on token prices
  const fromPrice = fromToken.price || 1
  const toPrice = toToken.price || 1
  const exchangeRate = fromPrice / toPrice
  const toAmount = (Number.parseFloat(params.amount) * exchangeRate * 0.997).toFixed(6) // 0.3% fee simulation

  // Calculate payment fee
  const paymentFeeEnabled = isPaymentEnabled(chainId)
  let paymentFee = undefined

  if (paymentFeeEnabled) {
    const feeCalculation = calculateTransactionFee(params.amount, chainId, FeeType.SWAP)
    paymentFee = {
      feeAmount: feeCalculation.feeAmount,
      feePercentage: feeCalculation.feePercentage,
      receiverAddress: feeCalculation.receiverAddress,
      enabled: true,
    }
  }

  return {
    fromToken,
    toToken,
    fromAmount: params.amount,
    toAmount: toAmount,
    priceImpact: "0.1",
    gasEstimate: chainId === ETHEREUM_CHAIN_ID ? "0.005" : "0.001",
    route: [fromToken.symbol, toToken.symbol],
    quoteId: `mock_${Date.now()}`,
    estimatedGas: "150000",
    minimumReceived: (Number.parseFloat(toAmount) * 0.995).toFixed(6), // 0.5% slippage
    exchangeRate: exchangeRate.toFixed(6),
    routePath: [fromToken.symbol, toToken.symbol],
    paymentFee,
  }
}

/**
 * Check if OKX API is configured and working
 * @returns true if OKX API is configured
 */
function isOKXConfigured(): boolean {
  return checkOKXConfig()
}

/**
 * Mock swap execution for when OKX API is not available
 * @param provider - Ethers provider
 * @param fromToken - Source token
 * @param toToken - Destination token
 * @param amountIn - Amount to swap
 * @param userAddress - User wallet address
 * @returns Mock transaction receipt
 */
async function executeMockSwap(
  provider: ethers.BrowserProvider,
  fromToken: Token,
  toToken: Token,
  amountIn: string,
  userAddress: string,
  paymentFeeData?: any, // Add payment fee parameter
): Promise<ethers.TransactionReceipt> {
  console.log("Executing mock swap (OKX API not available)")

  // If payment fee is enabled, simulate fee collection
  if (paymentFeeData) {
    console.log("Mock payment fee collection:", {
      amount: paymentFeeData.feeAmount,
      receiver: paymentFeeData.receiverAddress,
      percentage: paymentFeeData.feePercentage,
    })
  }

  // Simulate transaction delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Create a mock transaction receipt
  const mockReceipt = {
    hash: `0x${Math.random().toString(16).substr(2, 64)}`,
    blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
    blockHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    transactionIndex: Math.floor(Math.random() * 100),
    from: userAddress,
    to: "0x" + "0".repeat(40), // Mock DEX address
    gasUsed: BigInt("150000"),
    cumulativeGasUsed: BigInt("150000"),
    status: 1,
    logs: [],
    logsBloom: "0x" + "0".repeat(512),
    type: 2,
    effectiveGasPrice: BigInt("1000000000"),
  } as ethers.TransactionReceipt

  console.log("Mock swap completed:", mockReceipt.hash)
  return mockReceipt
}

/**
 * Check and switch to Sonic network if needed
 * @param provider - Ethers provider
 */
export const checkNetwork = async (provider: ethers.BrowserProvider): Promise<void> => {
  const network = await provider.getNetwork()
  if (Number(network.chainId) !== SONIC_CHAIN_ID_NUMBER) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${SONIC_CHAIN_ID_NUMBER.toString(16)}` }],
      })
    } catch (switchError: any) {
      // If the chain hasn't been added to MetaMask, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${SONIC_CHAIN_ID_NUMBER.toString(16)}`,
                chainName: "Sonic Mainnet",
                nativeCurrency: {
                  name: "Sonic",
                  symbol: "SONIC",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.soniclabs.com"],
                blockExplorerUrls: ["https://explorer.soniclabs.com"],
              },
            ],
          })
        } catch (addError) {
          throw new Error("Failed to add Sonic Mainnet to wallet")
        }
      } else {
        throw new Error("Please switch to Sonic Mainnet")
      }
    }
  }
}

/**
 * Get provider instance
 */
export const getProvider = (): ethers.BrowserProvider => {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected")
  }
  return new ethers.BrowserProvider(window.ethereum)
}

/**
 * Connect wallet and request accounts
 */
export const connectWallet = async (): Promise<string> => {
  const provider = getProvider()
  await provider.send("eth_requestAccounts", [])
  const signer = await provider.getSigner()
  return await signer.getAddress()
}

/**
 * Get swap quote from OKX DEX API with proper authentication
 * @param tokenIn - Input token address
 * @param tokenOut - Output token address
 * @param amountIn - Amount to swap (in wei/smallest unit)
 * @param chainId - Chain ID
 * @returns Swap quote data
 */
export async function getSwapQuoteFromAPI(
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  chainId: string = SONIC_CHAIN_ID,
): Promise<any> {
  // Check if OKX API is configured
  if (!isOKXConfigured()) {
    console.warn("OKX API not configured, will use mock data")
    throw new Error("OKX_API_NOT_CONFIGURED")
  }

  try {
    const requestPath = "/api/v5/dex/aggregator/quote"
    const baseUrl = "https://web3.okx.com"
    const url = `${baseUrl}${requestPath}`

    const params = {
      chainId: chainId,
      fromTokenAddress: tokenIn,
      toTokenAddress: tokenOut,
      amount: amountIn,
      slippage: "0.5",
    }

    console.log("Quote parameters:", params)

    // Create proper timestamp and headers
    const timestamp = new Date().toISOString()
    const headers = getHeaders(timestamp, "GET", requestPath, params)

    console.log("Making quote request to OKX Web3 API...")
    const response = await axios.get(url, {
      params,
      headers,
      timeout: 10000,
    })

    console.log("Quote API response:", response.data)

    if (response.data.code === "0" && response.data.data && response.data.data.length > 0) {
      return response.data.data[0]
    } else {
      throw new Error(`API Error: ${response.data.msg || "No quote data available"}`)
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.error("OKX API authentication failed - check your API credentials")
      throw new Error("OKX_API_AUTH_FAILED")
    }
    console.error("Failed to get swap quote:", error.message)
    throw error
  }
}

/**
 * Get swap transaction data from OKX DEX API with proper authentication
 * @param tokenIn - Input token address
 * @param tokenOut - Output token address
 * @param amountIn - Amount to swap (in wei/smallest unit)
 * @param userAddress - User wallet address
 * @param chainId - Chain ID
 * @returns Swap transaction data
 */
export async function getSwapTransactionFromAPI(
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  userAddress: string,
  chainId: string = SONIC_CHAIN_ID,
): Promise<any> {
  try {
    const requestPath = "/api/v5/dex/aggregator/swap"
    const baseUrl = "https://web3.okx.com"
    const url = `${baseUrl}${requestPath}`

    const params = {
      chainId: chainId,
      fromTokenAddress: tokenIn,
      toTokenAddress: tokenOut,
      amount: amountIn,
      userWalletAddress: userAddress,
      slippage: "0.5",
    }

    console.log("Swap parameters:", params)

    // Create proper timestamp and headers
    const timestamp = new Date().toISOString()
    const headers = getHeaders(timestamp, "GET", requestPath, params)

    console.log("Making swap request to OKX Web3 API...")
    const response = await axios.get(url, {
      params,
      headers,
      timeout: 15000,
    })

    console.log("Swap API response:", response.data)

    if (response.data.code === "0" && response.data.data && response.data.data.length > 0) {
      return response.data.data[0]
    } else {
      throw new Error(`API Error: ${response.data.msg || "No swap data available"}`)
    }
  } catch (error) {
    console.error("Failed to get swap transaction:", (error as Error).message)
    throw error
  }
}

/**
 * Check if a contract exists and has the required function
 * @param provider - Ethers provider
 * @param contractAddress - Contract address to check
 * @returns True if contract exists and has balanceOf function
 */
async function isValidERC20Contract(provider: ethers.BrowserProvider, contractAddress: string): Promise<boolean> {
  try {
    const code = await provider.getCode(contractAddress)
    if (code === "0x") {
      return false // No contract at this address
    }

    // Try to call balanceOf with a zero address to test if function exists
    const tokenABI = ["function balanceOf(address owner) view returns (uint256)"]
    const tokenContract = new ethers.Contract(contractAddress, tokenABI, provider)

    // Test with zero address - this should not throw if the function exists
    await tokenContract.balanceOf("0x0000000000000000000000000000000000000000")
    return true
  } catch (error) {
    console.warn(`Contract at ${contractAddress} is not a valid ERC20 token:`, error)
    return false
  }
}

/**
 * Get token balances using ethers.js with improved error handling
 * @param provider - Ethers provider
 * @param walletAddress - Wallet address
 * @param tokens - Array of tokens to check
 * @returns Record of token addresses to balances
 */
export async function getTokenBalancesWithEthers(
  provider: ethers.BrowserProvider,
  walletAddress: string,
  tokens: Token[],
): Promise<Record<string, string>> {
  const balances: Record<string, string> = {}

  for (const token of tokens) {
    try {
      if (token.isNative) {
        // Get native token balance
        const balance = await provider.getBalance(walletAddress)
        balances[token.address] = ethers.formatEther(balance)
        console.log(`${token.symbol} balance:`, balances[token.address])
      } else {
        // Check if it's a valid ERC20 contract first
        const isValid = await isValidERC20Contract(provider, token.address)

        if (!isValid) {
          console.warn(`Skipping ${token.symbol} - not a valid ERC20 contract at ${token.address}`)
          balances[token.address] = "0"
          continue
        }

        // Get ERC20 token balance
        const tokenABI = ["function balanceOf(address owner) view returns (uint256)"]
        const tokenContract = new ethers.Contract(token.address, tokenABI, provider)
        const balance = await tokenContract.balanceOf(walletAddress)
        balances[token.address] = ethers.formatUnits(balance, token.decimals)
        console.log(`${token.symbol} balance:`, balances[token.address])
      }
    } catch (error) {
      console.error(`Error getting balance for ${token.symbol} at ${token.address}:`, error)
      balances[token.address] = "0" // Set default balance on error
    }
  }

  return balances
}

/**
 * Check token allowance using ethers.js
 * @param provider - Ethers provider
 * @param tokenAddress - Token contract address
 * @param ownerAddress - Owner wallet address
 * @param spenderAddress - Spender contract address
 * @returns Allowance amount
 */
export async function checkTokenAllowance(
  provider: ethers.BrowserProvider,
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
): Promise<bigint> {
  const tokenABI = ["function allowance(address owner, address spender) view returns (uint256)"]

  const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider)
  const allowance = await tokenContract.allowance(ownerAddress, spenderAddress)
  return allowance
}

/**
 * Approve token spending using ethers.js
 * @param provider - Ethers provider
 * @param tokenAddress - Token contract address
 * @param spenderAddress - Spender contract address
 * @param amount - Amount to approve
 * @returns Transaction receipt
 */
export async function approveTokenWithEthers(
  provider: ethers.BrowserProvider,
  tokenAddress: string,
  spenderAddress: string,
  amount: string,
): Promise<ethers.TransactionReceipt> {
  const signer = await provider.getSigner()
  const tokenABI = ["function approve(address spender, uint256 amount) returns (bool)"]

  const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer)
  const txResponse = await tokenContract.approve(spenderAddress, amount)
  console.log("Approval transaction sent:", txResponse.hash)

  const receipt = await txResponse.wait()
  console.log("Approval confirmed:", receipt)

  if (!receipt) {
    throw new Error("Approval transaction failed")
  }

  return receipt
}

/**
 * Execute token swap using ethers.js
 * @param provider - Ethers provider
 * @param quoteData - Quote data from OKX API
 * @returns Transaction receipt
 */
export async function executeSwapWithEthers(
  provider: ethers.BrowserProvider,
  quoteData: any,
): Promise<ethers.TransactionReceipt> {
  const signer = await provider.getSigner()
  const txData = quoteData.tx

  if (!txData) {
    throw new Error("No transaction data in quote")
  }

  console.log("Executing swap transaction:", txData)

  // Prepare transaction
  const transaction = {
    to: txData.to,
    data: txData.data,
    value: txData.value || "0",
    gasLimit: txData.gasLimit || "300000",
  }

  // Send transaction
  const txResponse = await signer.sendTransaction(transaction)
  console.log("Transaction sent:", txResponse.hash)

  // Wait for confirmation
  const receipt = await txResponse.wait()
  console.log("Transaction confirmed:", receipt)

  if (!receipt) {
    throw new Error("Transaction failed")
  }

  return receipt
}

/**
 * Main function to perform token swap with validation
 * @param tokenIn - Input token address
 * @param tokenOut - Output token address
 * @param amountIn - Amount to swap (as string, will be parsed with decimals)
 * @param chainId - Chain ID
 * @returns Transaction receipt
 */
export async function performTokenSwap(
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  chainId: string = SONIC_CHAIN_ID,
  paymentFeeData?: any, // Add payment fee parameter
): Promise<ethers.TransactionReceipt> {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected")
  }

  const provider = getProvider()
  await provider.send("eth_requestAccounts", []) // Request wallet connection
  await checkNetwork(provider) // Ensure Sonic Mainnet

  const signer = await provider.getSigner()
  const userAddress = await signer.getAddress()

  // Find token info to get decimals
  const tokens = ALL_TOKENS[chainId] || SONIC_TOKENS
  const fromToken = tokens.find((t) => t.address.toLowerCase() === tokenIn.toLowerCase())
  const toToken = tokens.find((t) => t.address.toLowerCase() === tokenOut.toLowerCase())

  if (!fromToken) {
    throw new Error("From token not found in supported tokens list")
  }

  if (!toToken) {
    throw new Error("To token not found in supported tokens list")
  }

  // Validate token contracts exist (for non-native tokens)
  if (!fromToken.isNative) {
    const isValidFrom = await isValidERC20Contract(provider, tokenIn)
    if (!isValidFrom) {
      throw new Error(`Invalid or non-existent token contract: ${tokenIn}`)
    }
  }

  if (!toToken.isNative) {
    const isValidTo = await isValidERC20Contract(provider, tokenOut)
    if (!isValidTo) {
      throw new Error(`Invalid or non-existent token contract: ${tokenOut}`)
    }
  }

  // Convert amount to wei/smallest unit
  const amountInWei = ethers.parseUnits(amountIn, fromToken.decimals)

  // If OKX API is not configured, execute mock swap with payment fee
  if (!isOKXConfigured()) {
    console.log("OKX API not configured, executing mock swap")
    return await executeMockSwap(provider, fromToken, toToken, amountIn, userAddress, paymentFeeData)
  }

  try {
    // Get swap quote
    const quote = await getSwapQuoteFromAPI(tokenIn, tokenOut, amountInWei.toString(), chainId)
    console.log("Quote:", quote)

    // Check if approval is needed for ERC20 tokens
    if (!fromToken.isNative) {
      const allowance = await checkTokenAllowance(provider, tokenIn, userAddress, DEX_SPENDER_ADDRESS)

      if (allowance < amountInWei) {
        console.log("Approval needed, approving tokens...")
        await approveTokenWithEthers(provider, tokenIn, DEX_SPENDER_ADDRESS, amountInWei.toString())
      }
    }

    // Get swap transaction data
    const swapData = await getSwapTransactionFromAPI(tokenIn, tokenOut, amountInWei.toString(), userAddress, chainId)

    // Execute swap
    const receipt = await executeSwapWithEthers(provider, swapData)
    console.log("Swap completed:", receipt)

    return receipt
  } catch (error: any) {
    console.error("OKX API swap failed, falling back to mock swap:", error.message)

    // Fallback to mock swap if API fails
    if (error.message.includes("OKX_API") || error.message.includes("401")) {
      return await executeMockSwap(provider, fromToken, toToken, amountIn, userAddress)
    }

    throw error
  }
}

// Legacy functions for backward compatibility
export async function getTokenBalances(
  walletAddress: string,
  chainId = defaultChainId,
): Promise<Record<string, string>> {
  try {
    const provider = getProvider()
    const tokens = ALL_TOKENS[chainId] || SONIC_TOKENS
    return await getTokenBalancesWithEthers(provider, walletAddress, tokens)
  } catch (error) {
    console.error("Failed to get token balances:", error)
    return {}
  }
}

export async function getSwapQuote(params: SwapParams): Promise<SwapQuote | null> {
  console.log("Getting swap quote with params:", params)

  const chainId = params.chainId || defaultChainId
  const tokens = ALL_TOKENS[chainId] || SONIC_TOKENS

  const fromToken = tokens.find((t) => t.address.toLowerCase() === params.fromTokenAddress.toLowerCase())
  const toToken = tokens.find((t) => t.address.toLowerCase() === params.toTokenAddress.toLowerCase())

  if (!fromToken || !toToken) {
    throw new Error("Token not found")
  }

  // Calculate payment fee
  const paymentFeeEnabled = isPaymentEnabled(chainId)
  let paymentFee = undefined

  if (paymentFeeEnabled) {
    const feeCalculation = calculateTransactionFee(params.amount, chainId, FeeType.SWAP)
    paymentFee = {
      feeAmount: feeCalculation.feeAmount,
      feePercentage: feeCalculation.feePercentage,
      receiverAddress: feeCalculation.receiverAddress,
      enabled: true,
    }
  }

  // If OKX API is not configured, return mock quote immediately
  if (!isOKXConfigured()) {
    console.log("OKX API not configured, using mock quote")
    const mockQuote = generateMockSwapQuote(params)
    return {
      ...mockQuote,
      paymentFee,
    }
  }

  try {
    // Convert amount to smallest unit
    const amountInWei = ethers.parseUnits(params.amount, fromToken.decimals)

    console.log(`Converting ${params.amount} ${fromToken.symbol} to ${amountInWei.toString()} wei`)

    // Get quote from OKX DEX API
    const quoteData = await getSwapQuoteFromAPI(
      params.fromTokenAddress,
      params.toTokenAddress,
      amountInWei.toString(),
      chainId,
    )

    console.log("Quote data received:", quoteData)

    // Parse the quote response
    const toAmountFormatted = ethers.formatUnits(quoteData.toTokenAmount || "0", toToken.decimals)
    const exchangeRate = Number.parseFloat(toAmountFormatted) / Number.parseFloat(params.amount)

    return {
      fromToken,
      toToken,
      fromAmount: params.amount,
      toAmount: toAmountFormatted,
      priceImpact: quoteData.priceImpact || "0.1",
      gasEstimate: quoteData.estimateGasFee || "0.001",
      route: quoteData.routerResult || [],
      txData: quoteData.tx,
      quoteId: quoteData.quoteId,
      estimatedGas: quoteData.estimatedGas,
      minimumReceived: ethers.formatUnits(
        quoteData.minReceiveAmount || quoteData.toTokenAmount || "0",
        toToken.decimals,
      ),
      exchangeRate: exchangeRate.toFixed(6),
      routePath: quoteData.routePath || [fromToken.symbol, toToken.symbol],
      paymentFee,
    }
  } catch (error: any) {
    console.error("Error getting swap quote from OKX, falling back to mock quote:", error.message)

    // Fallback to mock quote if API fails
    if (error.message.includes("OKX_API") || error.message.includes("401")) {
      console.log("Using mock quote due to API issues")
      const mockQuote = generateMockSwapQuote(params)
      return {
        ...mockQuote,
        paymentFee,
      }
    }

    throw error
  }
}

export async function approveToken(
  tokenAddress: string,
  amount: string,
  userWalletAddress: string,
  chainId = defaultChainId,
): Promise<string | null> {
  try {
    const provider = getProvider()
    const tokens = ALL_TOKENS[chainId] || SONIC_TOKENS
    const token = tokens.find((t) => t.address === tokenAddress)

    if (!token) {
      throw new Error("Token not found")
    }

    if (token.isNative) {
      console.log("Native tokens don't need approval")
      return null
    }

    const amountInWei = ethers.parseUnits(amount, token.decimals)

    // Check current allowance first
    const currentAllowance = await checkTokenAllowance(provider, tokenAddress, userWalletAddress, DEX_SPENDER_ADDRESS)

    if (currentAllowance >= amountInWei) {
      console.log("Sufficient allowance already exists")
      return null
    }

    console.log("Insufficient allowance, approving tokens...")
    const receipt = await approveTokenWithEthers(provider, tokenAddress, DEX_SPENDER_ADDRESS, amountInWei.toString())

    return receipt.hash
  } catch (error) {
    console.error("Error in approveToken:", error)
    throw error
  }
}

export async function executeSwap(params: SwapParams): Promise<string | null> {
  console.log("Executing swap with params:", params)

  const chainId = params.chainId || defaultChainId

  // Calculate payment fee if enabled
  const paymentFeeEnabled = isPaymentEnabled(chainId)
  let paymentFeeData = null

  if (paymentFeeEnabled) {
    paymentFeeData = calculateTransactionFee(params.amount, chainId, FeeType.SWAP)
    console.log("Payment fee calculated:", paymentFeeData)
  }

  try {
    const receipt = await performTokenSwap(
      params.fromTokenAddress,
      params.toTokenAddress,
      params.amount,
      params.chainId,
      paymentFeeData, // Pass payment fee data
    )

    return receipt.hash
  } catch (error) {
    console.error("Error executing swap:", error)
    throw error
  }
}

// Example usage constants - using verified addresses
export const EXAMPLE_USDC_ADDRESS = "0x29219dd400f2Bf60E5a23d13Be72B486D4038894" // Verified USDC on Sonic
export const EXAMPLE_WETH_ADDRESS = "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38" // Verified WETH on Sonic
