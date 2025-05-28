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
    environmentStatus?: {
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
 * Client-side API validation using server endpoint
 */
export async function validateOKXAPIKeys(): Promise<APIValidationResult> {
  try {
    const response = await fetch("/api/validate-okx")

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    return result
  } catch (error: any) {
    console.error("Client-side validation error:", error)

    return {
      isValid: false,
      status: "error",
      message: "Failed to validate API credentials",
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
      errors: [error.message || "Unknown validation error"],
      warnings: [],
      recommendations: [
        "Check your internet connection",
        "Verify that the validation API is working",
        "Try refreshing the page",
      ],
    }
  }
}

/**
 * Quick validation check (lighter version) - client-side wrapper
 */
export async function quickValidateOKXAPI(): Promise<{ isValid: boolean; message: string }> {
  try {
    const response = await fetch("/api/validate-okx?type=quick")

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    return result
  } catch (error: any) {
    return {
      isValid: false,
      message: error.message || "Validation request failed",
    }
  }
}

/**
 * Check if OKX API validation is available (client-side check)
 */
export async function isOKXValidationAvailable(): Promise<boolean> {
  try {
    const response = await fetch("/api/validate-okx?type=quick")
    return response.ok
  } catch (error) {
    return false
  }
}
