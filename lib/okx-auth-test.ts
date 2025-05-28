import {
  createOKXHeaders,
  getHeaders,
  isOKXConfigured,
  OKX_API_KEY,
  OKX_SECRET_KEY,
  OKX_API_PASSPHRASE,
} from "./okx-web3-config"

export interface AuthTestResult {
  success: boolean
  message: string
  details?: any
  error?: string
  timestamp?: string
  signature?: string
  headers?: Record<string, string>
}

/**
 * Test OKX API authentication with a simple quote request
 */
export async function testOKXAuthentication(): Promise<AuthTestResult> {
  console.log("🔐 Testing OKX API Authentication...")

  // Check if API is configured
  if (!isOKXConfigured()) {
    return {
      success: false,
      message: "OKX API not configured",
      error: "Missing API credentials in environment variables",
      details: {
        hasApiKey: !!OKX_API_KEY,
        hasSecretKey: !!OKX_SECRET_KEY,
        hasPassphrase: !!OKX_API_PASSPHRASE,
      },
    }
  }

  try {
    // Test parameters for a simple quote request
    const requestPath = "/api/v5/dex/aggregator/quote"
    const params = {
      chainId: "146", // Sonic
      fromTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native SONIC
      toTokenAddress: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894", // USDC on Sonic
      amount: "1000000000000000000", // 1 SONIC
    }

    console.log("📝 Request parameters:", params)

    // Generate headers using the new authentication method
    const timestamp = new Date().toISOString()
    const headers = createOKXHeaders("GET", requestPath, params)

    console.log("🔑 Generated headers:", {
      timestamp,
      hasApiKey: !!headers["OK-ACCESS-KEY"],
      hasSignature: !!headers["OK-ACCESS-SIGN"],
      hasTimestamp: !!headers["OK-ACCESS-TIMESTAMP"],
      hasPassphrase: !!headers["OK-ACCESS-PASSPHRASE"],
    })

    // Make the API request
    const baseUrl = "https://web3.okx.com"
    const queryString = new URLSearchParams(params).toString()
    const url = `${baseUrl}${requestPath}?${queryString}`

    console.log("🌐 Making request to:", url)

    const response = await fetch(url, {
      method: "GET",
      headers,
    })

    const responseData = await response.json()

    console.log("📡 API Response:", {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
    })

    if (response.ok && responseData.code === "0") {
      return {
        success: true,
        message: "OKX API authentication successful!",
        details: {
          status: response.status,
          responseCode: responseData.code,
          dataReceived: !!responseData.data,
          quoteData: responseData.data?.[0] || null,
        },
        timestamp,
        signature: headers["OK-ACCESS-SIGN"],
        headers,
      }
    } else {
      return {
        success: false,
        message: "OKX API request failed",
        error: responseData.msg || response.statusText,
        details: {
          status: response.status,
          responseCode: responseData.code,
          fullResponse: responseData,
        },
        timestamp,
        signature: headers["OK-ACCESS-SIGN"],
        headers,
      }
    }
  } catch (error: any) {
    console.error("❌ Authentication test failed:", error)
    return {
      success: false,
      message: "Authentication test failed",
      error: error.message,
      details: {
        errorType: error.name,
        stack: error.stack,
      },
    }
  }
}

/**
 * Test signature generation specifically
 */
export function testSignatureGeneration(): AuthTestResult {
  console.log("🔐 Testing Signature Generation...")

  try {
    const method = "GET"
    const requestPath = "/api/v5/dex/aggregator/quote"
    const params = {
      chainId: "146",
      fromTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      toTokenAddress: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
      amount: "1000000000000000000",
    }

    // Test both header generation methods
    const timestamp = new Date().toISOString()
    const headers1 = getHeaders(timestamp, method, requestPath, params)
    const headers2 = createOKXHeaders(method, requestPath, params)

    return {
      success: true,
      message: "Signature generation test completed",
      details: {
        timestamp,
        method,
        requestPath,
        params,
        headers1,
        headers2,
        signaturesMatch: headers1["OK-ACCESS-SIGN"] === headers2["OK-ACCESS-SIGN"],
      },
    }
  } catch (error: any) {
    return {
      success: false,
      message: "Signature generation failed",
      error: error.message,
    }
  }
}

/**
 * Test different API endpoints
 */
export async function testMultipleEndpoints(): Promise<AuthTestResult[]> {
  const endpoints = [
    {
      name: "DEX Quote",
      path: "/api/v5/dex/aggregator/quote",
      params: {
        chainId: "146",
        fromTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        toTokenAddress: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
        amount: "1000000000000000000",
      },
    },
    {
      name: "Supported Chains",
      path: "/api/v5/dex/aggregator/supported/chain",
      params: {},
    },
  ]

  const results: AuthTestResult[] = []

  for (const endpoint of endpoints) {
    try {
      console.log(`🧪 Testing ${endpoint.name}...`)

      const headers = createOKXHeaders("GET", endpoint.path, endpoint.params)
      const baseUrl = "https://web3.okx.com"
      const queryString =
        Object.keys(endpoint.params).length > 0 ? "?" + new URLSearchParams(endpoint.params).toString() : ""
      const url = `${baseUrl}${endpoint.path}${queryString}`

      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      const responseData = await response.json()

      results.push({
        success: response.ok && responseData.code === "0",
        message: `${endpoint.name}: ${response.ok ? "Success" : "Failed"}`,
        details: {
          endpoint: endpoint.name,
          status: response.status,
          responseCode: responseData.code,
          data: responseData.data,
        },
      })
    } catch (error: any) {
      results.push({
        success: false,
        message: `${endpoint.name}: Error`,
        error: error.message,
      })
    }
  }

  return results
}
