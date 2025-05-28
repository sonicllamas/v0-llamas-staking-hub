import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Check if Redis environment variables are available
    const isRedisAvailable = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN

    if (!isRedisAvailable) {
      return NextResponse.json(
        {
          error: "Redis not configured",
          message: "KV_REST_API_URL and KV_REST_API_TOKEN environment variables are required",
        },
        { status: 503 },
      )
    }

    const { updateStakingStats } = await import("@/lib/redis-service")
    const updates = await request.json()

    const updatedStats = await updateStakingStats(updates)

    return NextResponse.json({
      success: true,
      stats: updatedStats,
    })
  } catch (error) {
    console.error("Error updating stats:", error)
    return NextResponse.json({ error: "Failed to update stats" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check if Redis environment variables are available
    const isRedisAvailable = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN

    if (!isRedisAvailable) {
      return NextResponse.json(
        {
          error: "Redis not configured",
          message: "KV_REST_API_URL and KV_REST_API_TOKEN environment variables are required",
        },
        { status: 503 },
      )
    }

    const { getStakingStats } = await import("@/lib/redis-service")
    const stats = await getStakingStats()

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
