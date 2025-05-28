// Check if Redis environment variables are available
const isRedisAvailable = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN

export interface StakingStats {
  totalStakedNFTs: number
  totalValueLocked: number
  activeCollections: number
  activeStakers: number
  averageStakingPeriod: number
  totalRewardsDistributed: number
  highestAPYCollection: string
  highestAPYValue: number
  newStakers24h: number
  networkStatus: string
  networkUptime: number
  gasPrice: number
  communityMembers: number
  platformVersion: string
  lastUpdated: number
}

// Default stats to use when Redis is not available
const defaultStats: StakingStats = {
  totalStakedNFTs: 1234,
  totalValueLocked: 45678,
  activeCollections: 24,
  activeStakers: 567,
  averageStakingPeriod: 32,
  totalRewardsDistributed: 12345,
  highestAPYCollection: "Sonic Llamas",
  highestAPYValue: 25,
  newStakers24h: 45,
  networkStatus: "Healthy",
  networkUptime: 99.9,
  gasPrice: 0.0002,
  communityMembers: 2345,
  platformVersion: "v1.2.3",
  lastUpdated: Date.now(),
}

export async function getStakingStats(): Promise<StakingStats> {
  // If Redis is not configured, return default stats
  if (!isRedisAvailable) {
    console.log("Redis not configured, using default stats")
    return defaultStats
  }

  try {
    // Only import and use kv if environment variables are available
    const { kv } = await import("@vercel/kv")

    // Try to get stats from Redis
    const stats = await kv.get<StakingStats>("staking:stats")

    // If stats exist in Redis, return them
    if (stats) {
      return stats
    }

    // If no stats in Redis, set the default stats and return them
    await kv.set("staking:stats", defaultStats)
    return defaultStats
  } catch (error) {
    console.error("Error fetching stats from Redis:", error)
    // Return default stats if Redis fails
    return defaultStats
  }
}

export async function updateStakingStats(stats: Partial<StakingStats>): Promise<StakingStats> {
  // If Redis is not configured, just return the updated stats without saving
  if (!isRedisAvailable) {
    console.log("Redis not configured, cannot update stats")
    return { ...defaultStats, ...stats, lastUpdated: Date.now() }
  }

  try {
    // Only import and use kv if environment variables are available
    const { kv } = await import("@vercel/kv")

    // Get current stats
    const currentStats = await getStakingStats()

    // Update with new stats
    const updatedStats: StakingStats = {
      ...currentStats,
      ...stats,
      lastUpdated: Date.now(),
    }

    // Save to Redis
    await kv.set("staking:stats", updatedStats)
    return updatedStats
  } catch (error) {
    console.error("Error updating stats in Redis:", error)
    throw error
  }
}
