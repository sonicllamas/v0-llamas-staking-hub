import { type NextRequest, NextResponse } from "next/server"
import {
  createOKXHeaders,
  isOKXConfigured,
  OKX_API_KEY,
  OKX_SECRET_KEY,
  OKX_API_PASSPHRASE,
  OKX_PROJECT_ID,
} from "@/lib/okx-web3-config"

export interface OKXAPIResponse {
  success: boolean
  message: string
  data?: any
  error?: string
  credentials?: {
    configured: boolean
    apiKey: boolean
    secretKey: boolean
    passphrase: boolean
    projectId: boolean
  }
}

/**
 * Test OKX API connection and credentials
 */
async function testOKXConnection(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const requestPath = "/api/v5/dex/aggregator/supported/chain"
    const headers = createOKXHeaders("GET", requestPath)

    console.log("🔐 Testing OKX API connection...")
    console.log("Headers created:", {
      hasApiKey: !!headers["OK-ACCESS-KEY"],
      hasSignature: !!headers["OK-ACCESS-SIGN"],
      hasTimestamp: !!headers["OK-ACCESS-TIMESTAMP"],
      hasPassphrase: !!headers["OK-ACCESS-PASSPHRASE"],
    })

    const response = await fetch(`https://web3.okx.com${requestPath}`, {
      method: "GET",
      headers,
    })

    const data = await response.json()

    console.log("OKX API Response:", {
      status: response.status,
      code: data.code,
      message: data.msg,
    })

    if (response.status === 200 && data.code === "0") {
      return { success: true, data }
    } else {
      return { success: false, error: `API Error: ${data.code} - ${data.msg}` }
    }
  } catch (error: any) {
    console.error("OKX API Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get OKX DEX quote
 */
async function getOKXQuote(params: {
  chainId: string
  fromTokenAddress: string
  toTokenAddress: string
  amount: string
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const requestPath = "/api/v5/dex/aggregator/quote"
    const headers = createOKXHeaders("GET", requestPath, params)

    const queryString = new URLSearchParams(params).toString()
    const response = await fetch(`https://web3.okx.com${requestPath}?${queryString}`, {
      method: "GET",
      headers,
    })

    const data = await response.json()

    if (response.status === 200 && data.code === "0") {
      return { success: true, data }
    } else {
      return { success: false, error: `Quote Error: ${data.code} - ${data.msg}` }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Get credentials status
 */
function getCredentialsStatus() {
  return {
    configured: isOKXConfigured(),
    apiKey: !!OKX_API_KEY,
    secretKey: !!OKX_SECRET_KEY,
    passphrase: !!OKX_API_PASSPHRASE,
    projectId: !!OKX_PROJECT_ID,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action") || "test"

    console.log(`🚀 OKX API Route - Action: ${action}`)

    // Check credentials first
    const credentials = getCredentialsStatus()

    if (!credentials.configured) {
      return NextResponse.json({
        success: false,
        message: "OKX API credentials not configured",
        credentials,
        error: "Missing required environment variables",
      } as OKXAPIResponse)
    }

    switch (action) {
      case "test":
        // Test basic API connection
        const testResult = await testOKXConnection()
        return NextResponse.json({
          success: testResult.success,
          message: testResult.success ? "OKX API connection successful" : "OKX API connection failed",
          data: testResult.data,
          error: testResult.error,
          credentials,
        } as OKXAPIResponse)

      case "quote":
        // Get a sample quote
        const chainId = searchParams.get("chainId") || "146" // Sonic
        const fromToken = searchParams.get("fromToken") || "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" // Native token
        const toToken = searchParams.get("toToken") || "0x29219dd400f2Bf60E5a23d13Be72B486D4038894" // USDC
        const amount = searchParams.get("amount") || "1000000000000000000" // 1 token

        const quoteResult = await getOKXQuote({
          chainId,
          fromTokenAddress: fromToken,
          toTokenAddress: toToken,
          amount,
        })

        return NextResponse.json({
          success: quoteResult.success,
          message: quoteResult.success ? "Quote generated successfully" : "Quote generation failed",
          data: quoteResult.data,
          error: quoteResult.error,
          credentials,
        } as OKXAPIResponse)

      case "chains":
        // Get supported chains
        const chainsResult = await testOKXConnection()
        return NextResponse.json({
          success: chainsResult.success,
          message: chainsResult.success ? "Supported chains retrieved" : "Failed to get supported chains",
          data: chainsResult.data,
          error: chainsResult.error,
          credentials,
        } as OKXAPIResponse)

      default:
        return NextResponse.json({
          success: false,
          message: "Invalid action",
          error: `Unknown action: ${action}`,
          credentials,
        } as OKXAPIResponse)
    }
  } catch (error: any) {
    console.error("OKX API Route Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "OKX API interaction failed",
        error: error.message,
        credentials: getCredentialsStatus(),
      } as OKXAPIResponse,
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, params } = body

    console.log(`🚀 OKX API Route POST - Action: ${action}`)

    const credentials = getCredentialsStatus()

    if (!credentials.configured) {
      return NextResponse.json({
        success: false,
        message: "OKX API credentials not configured",
        credentials,
        error: "Missing required environment variables",
      } as OKXAPIResponse)
    }

    switch (action) {
      case "quote":
        const quoteResult = await getOKXQuote(params)
        return NextResponse.json({
          success: quoteResult.success,
          message: quoteResult.success ? "Quote generated successfully" : "Quote generation failed",
          data: quoteResult.data,
          error: quoteResult.error,
          credentials,
        } as OKXAPIResponse)

      default:
        return NextResponse.json({
          success: false,
          message: "Invalid action",
          error: `Unknown action: ${action}`,
          credentials,
        } as OKXAPIResponse)
    }
  } catch (error: any) {
    console.error("OKX API Route POST Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "OKX API interaction failed",
        error: error.message,
        credentials: getCredentialsStatus(),
      } as OKXAPIResponse,
      { status: 500 },
    )
  }
}
