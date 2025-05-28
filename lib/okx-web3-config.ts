import Web3 from "web3"
import CryptoJS from "crypto-js"

// Initialize Web3 with a default provider
export const web3 = new Web3(
  typeof window !== "undefined" && window.ethereum ? window.ethereum : "https://rpc.soniclabs.com",
)

// API Configuration
export const baseUrl = "https://web3.okx.com/api/v5/dex/aggregator/"

// Get API credentials from environment variables
export const OKX_API_KEY = process.env.OKX_API_KEY || ""
export const OKX_SECRET_KEY = process.env.OKX_SECRET_KEY || ""
export const OKX_API_PASSPHRASE = process.env.OKX_API_PASSPHRASE || ""
export const OKX_PROJECT_ID = process.env.OKX_PROJECT_ID || ""

// Log configuration status (without exposing sensitive data)
console.log("OKX API Configuration:", {
  hasApiKey: !!OKX_API_KEY,
  hasSecretKey: !!OKX_SECRET_KEY,
  hasPassphrase: !!OKX_API_PASSPHRASE,
  hasProjectId: !!OKX_PROJECT_ID,
  baseUrl,
})

// Chain IDs
export const ETHEREUM_CHAIN_ID = "1"
export const SONIC_CHAIN_ID = "146"

// Default chain ID
export const chainId = SONIC_CHAIN_ID

// Default slippage
export const SLIPPAGE = "0.5"

// Token Addresses
export const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
export const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
export const SONIC_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
export const SONIC_USDC_ADDRESS = "0x29219dd400f2Bf60E5a23d13Be72B486D4038894"
export const SONIC_USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"
export const SONIC_WETH_ADDRESS = "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38"

// DEX Spender Address - IMPORTANT: This was missing!
export const DEX_SPENDER_ADDRESS = "0xdef1c0ded9bec7f1a1670819833240f027b25eff"

// Wallet configuration for server-side operations
export const WALLET_ADDRESS =
  (typeof process !== "undefined" ? process.env.EVM_WALLET_ADDRESS : "") || "0x1E9f317cB3A0c3B23c9D82DAec5A18d7895639F0"
export const PRIVATE_KEY =
  (typeof process !== "undefined" ? process.env.EVM_PRIVATE_KEY : "") ||
  "0x2b1a3a1517ed65cc9530b4a14c8a06502e4b1a30a426e750a4b7fed56b4e254e"

// Amount to swap in smallest unit (approx $1 of ETH)
export const SWAP_AMOUNT = "500000000000000" // 0.0005 ETH (approx $1)

/**
 * Check if OKX API is configured
 * @returns true if OKX API is configured
 */
export function isOKXConfigured(): boolean {
  const hasCredentials = !!(OKX_API_KEY && OKX_SECRET_KEY && OKX_API_PASSPHRASE)
  console.log("OKX API Configuration Check:", {
    hasApiKey: !!OKX_API_KEY,
    hasSecretKey: !!OKX_SECRET_KEY,
    hasPassphrase: !!OKX_API_PASSPHRASE,
    hasProjectId: !!OKX_PROJECT_ID,
    configured: hasCredentials,
  })
  return hasCredentials
}

/**
 * Create a pre-signature based on strings and parameters
 * @param timestamp - ISO timestamp
 * @param method - HTTP method (GET/POST)
 * @param requestPath - API request path
 * @param params - Request parameters
 * @returns Pre-hash string
 */
function preHash(timestamp: string, method: string, requestPath: string, params?: any): string {
  let queryString = ""

  if (method === "GET" && params) {
    const searchParams = new URLSearchParams()
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key].toString())
      }
    })
    queryString = "?" + searchParams.toString()
  }

  if (method === "POST" && params) {
    queryString = JSON.stringify(params)
  }

  return timestamp + method + requestPath + queryString
}

/**
 * Sign message using HMAC-SHA256
 * @param message - Message to sign
 * @param secretKey - Secret key for signing
 * @returns Base64 encoded signature
 */
function sign(message: string, secretKey: string): string {
  return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(message, secretKey))
}

/**
 * Create signature for OKX API authentication
 * @param method - HTTP method
 * @param requestPath - API request path
 * @param params - Request parameters
 * @returns Signature and timestamp
 */
function createSignature(method: string, requestPath: string, params?: any) {
  // Get timestamp in ISO 8601 format (matching your Node.js example)
  const timestamp = new Date().toISOString()

  // Generate signature
  const message = preHash(timestamp, method, requestPath, params)
  const signature = sign(message, OKX_SECRET_KEY)

  return { signature, timestamp }
}

/**
 * Generate OKX API headers with proper authentication
 * @param timestamp - Current timestamp
 * @param method - HTTP method
 * @param requestPath - API request path
 * @param params - Request parameters
 * @returns Headers for OKX API
 */
export function getHeaders(
  timestamp: string,
  method: string,
  requestPath: string,
  params?: any,
): Record<string, string> {
  if (!isOKXConfigured()) {
    console.warn("OKX API not configured, using mock headers")
    return {
      "Content-Type": "application/json",
    }
  }

  // Use the createSignature function to get proper signature
  const { signature } = createSignature(method, requestPath, params)

  return {
    "Content-Type": "application/json",
    "OK-ACCESS-KEY": OKX_API_KEY,
    "OK-ACCESS-SIGN": signature,
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": OKX_API_PASSPHRASE,
    "OK-ACCESS-PROJECT": OKX_PROJECT_ID,
  }
}

/**
 * Alternative header generation function that matches your Node.js example exactly
 * @param method - HTTP method
 * @param requestPath - API request path
 * @param params - Request parameters
 * @returns Headers for OKX API
 */
export function createOKXHeaders(method: string, requestPath: string, params?: any): Record<string, string> {
  if (!isOKXConfigured()) {
    console.warn("OKX API not configured, using mock headers")
    return {
      "Content-Type": "application/json",
    }
  }

  const { signature, timestamp } = createSignature(method, requestPath, params)

  return {
    "Content-Type": "application/json",
    "OK-ACCESS-KEY": OKX_API_KEY,
    "OK-ACCESS-SIGN": signature,
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": OKX_API_PASSPHRASE,
  }
}
