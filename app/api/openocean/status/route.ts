import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if API key is configured (server-side only - not client exposed)
    const apiKey = process.env.OPENOCEAN_API_KEY

    if (!apiKey || apiKey.length < 10) {
      return NextResponse.json({
        valid: false,
        message: "OpenOcean API key not configured properly",
      })
    }

    // Test API key with a simple request
    try {
      const testUrl = "https://open-api.openocean.finance/v2/tokenList?chain=42161"
      const response = await fetch(testUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })

      if (response.ok) {
        return NextResponse.json({
          valid: true,
          message: "OpenOcean API key is valid and working",
        })
      } else {
        return NextResponse.json({
          valid: false,
          message: "OpenOcean API key is invalid or expired",
        })
      }
    } catch (error) {
      return NextResponse.json({
        valid: false,
        message: "Unable to validate API key - network error",
      })
    }
  } catch (error: any) {
    console.error("API status check error:", error)
    return NextResponse.json({
      valid: false,
      message: "Server error checking API status",
    })
  }
}
