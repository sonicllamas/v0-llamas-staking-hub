import { type NextRequest, NextResponse } from "next/server"
import {
  createOKXHeaders,
  isOKXConfigured,
  OKX_API_KEY,
  OKX_SECRET_KEY,
  OKX_API_PASSPHRASE,
  OKX_PROJECT_ID,
} from "@/lib/okx-web3-config"

export interface APIValidationResult {
  isValid: boolean
  status: "valid" | "invalid" | "error" | "unconfigured"
  message: string
  details: {
    hasCredentials: boolean
    apiKeyFormat: boolean
    secretKeyFormat: boolean
    passphraseFormat: boolean
    projectIdFormat: boolean
    authenticationTest: boolean
    permissionsTest: boolean
    rateLimitStatus: string
    responseTime: number
    lastChecked: string
    environmentStatus: {
      apiKey: boolean
      secretKey: boolean
      passphrase: boolean
      projectId: boolean
    }
  }
  errors: string[]
  warnings: string[]
  recommendations: string[]
}

/**
 * Validate OKX API key format
 */
function validateAPIKeyFormat(apiKey: string): boolean {
  return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(apiKey)
}

/**
 * Validate OKX secret key format
 */
function validateSecretKeyFormat(secretKey: string): boolean {
  return /^[A-Za-z0-9+/]+=*$/.test(secretKey) && secretKey.length >= 40
}

/**
 * Validate passphrase format
 */
function validatePassphraseFormat(passphrase: string): boolean {
  return passphrase.length >= 1 && passphrase.length <= 30
}

/**
 * Validate project ID format
 */
function validateProjectIdFormat(projectId: string): boolean {
  return projectId.length > 0 && /^[a-f0-9-]+$/i.test(projectId)
}

/**
 * Test basic API authentication
 */
async function testAuthentication(): Promise<{ success: boolean; responseTime: number; error?: string }> {
  const startTime = Date.now()

  try {
    const requestPath = "/api/v5/dex/aggregator/supported/chain"
    const headers = createOKXHeaders("GET", requestPath)

    console.log("Testing authentication with headers:", {
      hasApiKey: !!headers["OK-ACCESS-KEY"],
      hasSignature: !!headers["OK-ACCESS-SIGN"],
      hasTimestamp: !!headers["OK-ACCESS-TIMESTAMP"],
      hasPassphrase: !!headers["OK-ACCESS-PASSPHRASE"],
    })

    const response = await fetch(`https://web3.okx.com${requestPath}`, {
      method: "GET",
      headers,
    })

    const responseTime = Date.now() - startTime
    const data = await response.json()

    console.log("OKX API Response:", {
      status: response.status,
      code: data.code,
      message: data.msg,
      responseTime,
    })

    if (response.status === 200 && data.code === "0") {
      return { success: true, responseTime }
    } else if (response.status === 401 || data.code === "50102") {
      return { success: false, responseTime, error: `Invalid API credentials (${data.code}: ${data.msg})` }
    } else {
      return { success: false, responseTime, error: data.msg || `HTTP ${response.status}` }
    }
  } catch (error: any) {
    return {
      success: false,
      responseTime: Date.now() - startTime,
      error: error.message,
    }
  }
}

/**
 * Test API permissions by trying different endpoints
 */
async function testPermissions(): Promise<{ success: boolean; permissions: string[]; errors: string[] }> {
  const permissions: string[] = []
  const errors: string[] = []

  const endpoints = [
    {
      name: "DEX Aggregator - Supported Chains",
      path: "/api/v5/dex/aggregator/supported/chain",
      permission: "dex_read",
    },
    {
      name: "DEX Aggregator - Quote",
      path: "/api/v5/dex/aggregator/quote",
      permission: "dex_quote",
      params: {
        chainId: "1",
        fromTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        toTokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        amount: "1000000000000000000",
      },
    },
  ]

  for (const endpoint of endpoints) {
    try {
      const queryString = endpoint.params ? "?" + new URLSearchParams(endpoint.params).toString() : ""
      const headers = createOKXHeaders("GET", endpoint.path, endpoint.params)

      const response = await fetch(`https://web3.okx.com${endpoint.path}${queryString}`, {
        method: "GET",
        headers,
      })

      const data = await response.json()

      if (response.status === 200 && data.code === "0") {
        permissions.push(endpoint.permission)
      } else {
        errors.push(`${endpoint.name}: ${data.msg || response.statusText}`)
      }
    } catch (error: any) {
      errors.push(`${endpoint.name}: ${error.message}`)
    }
  }

  return { success: permissions.length > 0, permissions, errors }
}

/**
 * Check rate limit status
 */
async function checkRateLimit(): Promise<string> {
  try {
    const headers = createOKXHeaders("GET", "/api/v5/dex/aggregator/supported/chain")

    const response = await fetch("https://web3.okx.com/api/v5/dex/aggregator/supported/chain", {
      method: "GET",
      headers,
    })

    const remaining = response.headers.get("x-ratelimit-remaining")
    const limit = response.headers.get("x-ratelimit-limit")
    const reset = response.headers.get("x-ratelimit-reset")

    if (remaining && limit) {
      return `${remaining}/${limit} requests remaining${reset ? ` (resets at ${new Date(Number.parseInt(reset) * 1000).toLocaleTimeString()})` : ""}`
    }

    return "Rate limit info not available"
  } catch (error) {
    return "Unable to check rate limit"
  }
}

/**
 * Get environment variable status
 */
function getEnvironmentStatus() {
  return {
    apiKey: !!OKX_API_KEY,
    secretKey: !!OKX_SECRET_KEY,
    passphrase: !!OKX_API_PASSPHRASE,
    projectId: !!OKX_PROJECT_ID,
  }
}

/**
 * Comprehensive OKX API validation (server-side)
 */
async function validateOKXAPIKeys(): Promise<APIValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []
  const recommendations: string[] = []

  console.log("🔍 Starting OKX API validation...")
  console.log("Environment status:", getEnvironmentStatus())

  // Check if credentials are configured
  const hasCredentials = isOKXConfigured()

  if (!hasCredentials) {
    return {
      isValid: false,
      status: "unconfigured",
      message: "OKX API credentials not configured",
      details: {
        hasCredentials: false,
        apiKeyFormat: false,
        secretKeyFormat: false,
        passphraseFormat: false,
        projectIdFormat: false,
        authenticationTest: false,
        permissionsTest: false,
        rateLimitStatus: "N/A",
        responseTime: 0,
        lastChecked: new Date().toISOString(),
        environmentStatus: getEnvironmentStatus(),
      },
      errors: ["Missing OKX_API_KEY, OKX_SECRET_KEY, or OKX_API_PASSPHRASE in environment variables"],
      warnings: [],
      recommendations: [
        "Add your OKX API credentials to environment variables",
        "Ensure you have created API keys in your OKX account",
        "Verify that your API keys have DEX trading permissions enabled",
      ],
    }
  }

  // Validate credential formats
  const apiKeyFormat = validateAPIKeyFormat(OKX_API_KEY)
  const secretKeyFormat = validateSecretKeyFormat(OKX_SECRET_KEY)
  const passphraseFormat = validatePassphraseFormat(OKX_API_PASSPHRASE)
  const projectIdFormat = validateProjectIdFormat(OKX_PROJECT_ID)

  console.log("Format validation:", {
    apiKeyFormat,
    secretKeyFormat,
    passphraseFormat,
    projectIdFormat,
  })

  if (!apiKeyFormat) {
    errors.push("API Key format appears invalid (should be UUID format)")
  }

  if (!secretKeyFormat) {
    errors.push("Secret Key format appears invalid (should be base64 encoded)")
  }

  if (!passphraseFormat) {
    errors.push("Passphrase format appears invalid (should be 1-30 characters)")
  }

  if (!projectIdFormat) {
    warnings.push("Project ID format may be invalid")
  }

  // Test authentication
  console.log("🔐 Testing OKX API authentication...")
  const authTest = await testAuthentication()

  if (!authTest.success) {
    errors.push(`Authentication failed: ${authTest.error}`)
  }

  // Test permissions
  console.log("🔑 Testing API permissions...")
  const permissionsTest = await testPermissions()

  if (!permissionsTest.success) {
    errors.push("No valid API permissions found")
    permissionsTest.errors.forEach((error) => errors.push(error))
  } else {
    console.log(`✅ Found permissions: ${permissionsTest.permissions.join(", ")}`)
  }

  // Check rate limits
  console.log("⏱️ Checking rate limits...")
  const rateLimitStatus = await checkRateLimit()

  // Generate recommendations
  if (errors.length > 0) {
    recommendations.push("Double-check your API credentials in the OKX dashboard")
    recommendations.push("Ensure your API keys are not expired")
    recommendations.push("Verify that DEX trading permissions are enabled")
  }

  if (authTest.responseTime > 5000) {
    warnings.push("API response time is slow (>5 seconds)")
    recommendations.push("Check your internet connection")
  }

  // Determine overall status
  let status: "valid" | "invalid" | "error" | "unconfigured"
  let message: string
  let isValid: boolean

  if (errors.length === 0 && authTest.success && permissionsTest.success) {
    status = "valid"
    message = "OKX API credentials are valid and active"
    isValid = true
  } else if (authTest.success === false) {
    status = "invalid"
    message = "OKX API credentials are invalid or inactive"
    isValid = false
  } else {
    status = "error"
    message = "Unable to fully validate OKX API credentials"
    isValid = false
  }

  console.log("🏁 Validation complete:", { status, isValid, errors: errors.length })

  return {
    isValid,
    status,
    message,
    details: {
      hasCredentials,
      apiKeyFormat,
      secretKeyFormat,
      passphraseFormat,
      projectIdFormat,
      authenticationTest: authTest.success,
      permissionsTest: permissionsTest.success,
      rateLimitStatus,
      responseTime: authTest.responseTime,
      lastChecked: new Date().toISOString(),
      environmentStatus: getEnvironmentStatus(),
    },
    errors,
    warnings,
    recommendations,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "full"

    if (type === "quick") {
      // Quick validation - just test authentication
      if (!isOKXConfigured()) {
        return NextResponse.json({
          isValid: false,
          message: "API credentials not configured",
        })
      }

      const authTest = await testAuthentication()
      return NextResponse.json({
        isValid: authTest.success,
        message: authTest.success ? "API credentials are valid" : authTest.error || "Authentication failed",
      })
    }

    // Full validation
    const result = await validateOKXAPIKeys()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Validation API error:", error)
    return NextResponse.json(
      {
        isValid: false,
        status: "error",
        message: "Validation failed",
        details: {
          hasCredentials: false,
          apiKeyFormat: false,
          secretKeyFormat: false,
          passphraseFormat: false,
          projectIdFormat: false,
          authenticationTest: false,
          permissionsTest: false,
          rateLimitStatus: "Error",
          responseTime: 0,
          lastChecked: new Date().toISOString(),
          environmentStatus: {
            apiKey: false,
            secretKey: false,
            passphrase: false,
            projectId: false,
          },
        },
        errors: [error.message],
        warnings: [],
        recommendations: [],
      },
      { status: 500 },
    )
  }
}
