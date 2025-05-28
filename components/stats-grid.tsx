import { GridLayout } from "./grid-layout"
import { BridgeButton } from "./bridge-button"

// Since Redis environment variables are not available, we'll use static data
const defaultStats = {
  totalStakedNFTs: 12345,
  totalValueLocked: 987654,
  activeCollections: 42,
  activeStakers: 1234,
  averageStakingPeriod: 14,
  totalRewardsDistributed: 56789,
  highestAPYCollection: "Sonic Llamas",
  highestAPYValue: 24.5,
  newStakers24h: 123,
  networkStatus: "Operational",
  networkUptime: 99.98,
  gasPrice: 0.0001,
  communityMembers: 5678,
  platformVersion: "v1.2.3",
  lastUpdated: Date.now(),
}

export function StatsGrid() {
  // Use static data since Redis is not configured
  const stats = defaultStats

  return <GridLayout initialStats={stats} bridgeButton={<BridgeButton />} />
}
