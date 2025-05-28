import { type NextRequest, NextResponse } from "next/server"

const OPENOCEAN_API_BASE = "https://open-api.openocean.finance"

export async function POST(request: NextRequest) {
  try {
    const { endpoint, params } = await request.json()

    // Get API key from server environment (secure - not client exposed)
    const apiKey = process.env.OPENOCEAN_API_KEY

    if (!apiKey || apiKey.length < 10) {
      return NextResponse.json({ error: "OpenOcean API key not configured" }, { status: 401 })
    }

    // Build URL with parameters
    const url = new URL(endpoint, OPENOCEAN_API_BASE)
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key].toString())
      }
    })

    // Make request to OpenOcean API
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `API request failed: ${response.status} ${response.statusText} - ${errorText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("OpenOcean proxy error:", error)
    return NextResponse.json({ error: `Proxy request failed: ${error.message}` }, { status: 500 })
  }
}
