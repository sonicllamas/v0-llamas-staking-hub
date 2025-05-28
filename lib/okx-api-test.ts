import axios from "axios"
import CryptoJS from "crypto-js"

// Test configuration matching your Node.js example
const OKX_WEB3_BASE_URL = "https://web3.okx.com"

interface OKXApiConfig {
  api_key: string
  secret_key: string
  passphrase: string
}

/**
 * Create pre-hash string for OKX API authentication
 * @param timestamp - ISO timestamp
 * @param method - HTTP method
 * @param requestPath - API path
 * @param params - Request parameters
 * @returns Pre-hash string
 */
function preHash(timestamp: string, method: string, requestPath: string, params?: any): string {
  let queryString = ""

  if (method === "GET" && params) {
    queryString = "?" + new URLSearchParams(params).toString()
  }
  if (method === "POST" && params) {
    queryString = JSON.stringify(params)
  }

  return timestamp + method + requestPath + queryString
}

/**
 * Sign message using HMAC-SHA256
 * @param message - Message to sign
 * @param secretKey - Secret key
 * @returns Base64 signature
 */
function sign(message: string, secretKey: string): string {
  return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(message, secretKey))
}

/**
 * Create signature for OKX API
 * @param method - HTTP method
 * @param requestPath - API path
 * @param params - Request parameters
 * @param config - API configuration
 * @returns Signature and timestamp
 */
function createSignature(
  method: string,
  requestPath: string,
  params: any,
  config: OKXApiConfig,
): { signature: string; timestamp: string } {
  // Get timestamp in ISO format (matching your Node.js example)
  const timestamp = new Date().toISOString()

  // Generate signature
  const message = preHash(timestamp, method, requestPath, params)
  const signature = sign(message, config.secret_key)

  return { signature, timestamp }
}

/**
 * Test OKX DEX API with proper authentication
 * @param config - API configuration
 */
export async function testOKXDexAPI(config: OKXApiConfig) {
  try {
    console.log("Testing OKX DEX API with proper authentication...")

    // Test GET request - Quote API (matching your example)
    const requestPath = "/api/v5/dex/aggregator/quote"
    const params = {
      chainId: "146", // Sonic chain ID
      amount: "1000000000000000000", // 1 token
      toTokenAddress: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894", // USDC on Sonic
      fromTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native SONIC
    }

    // Generate signature
    const { signature, timestamp } = createSignature("GET", requestPath, params, config)

    // Create headers
    const headers = {
      "OK-ACCESS-KEY": config.api_key,
      "OK-ACCESS-SIGN": signature,
      "OK-ACCESS-TIMESTAMP": timestamp,
      "OK-ACCESS-PASSPHRASE": config.passphrase,
      "Content-Type": "application/json",
    }

    console.log("Request headers:", {
      ...headers,
      "OK-ACCESS-KEY": config.api_key ? "***" : "missing",
      "OK-ACCESS-SIGN": signature ? "***" : "missing",
    })

    // Make request
    const url = `${OKX_WEB3_BASE_URL}${requestPath}`
    const response = await axios.get(url, { params, headers, timeout: 10000 })

    console.log("OKX API Response:", response.data)

    if (response.data.code === "0") {
      console.log("✅ OKX API authentication successful!")
      return response.data
    } else {
      console.error("❌ OKX API error:", response.data.msg)
      return null
    }
  } catch (error: any) {
    console.error("❌ OKX API test failed:", error.message)
    if (error.response) {
      console.error("Response status:", error.response.status)
      console.error("Response data:", error.response.data)
    }
    return null
  }
}

/**
 * Test OKX API with environment variables
 */
export async function testOKXWithEnvVars() {
  const config: OKXApiConfig = {
    api_key: process.env.OKX_API_KEY || "",
    secret_key: process.env.OKX_SECRET_KEY || "",
    passphrase: process.env.OKX_API_PASSPHRASE || "",
  }

  console.log("Testing with environment variables:", {
    hasApiKey: !!config.api_key,
    hasSecretKey: !!config.secret_key,
    hasPassphrase: !!config.passphrase,
  })

  if (!config.api_key || !config.secret_key || !config.passphrase) {
    console.error("❌ Missing OKX API credentials in environment variables")
    return null
  }

  return await testOKXDexAPI(config)
}
