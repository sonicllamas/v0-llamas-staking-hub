"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import { TrendingUp, TrendingDown, DollarSign, Users, Target, BarChart3, Activity } from "lucide-react"
import { Card } from "@/components/ui/card"
import { StakingMetricsChart } from "./staking-metrics-chart"
import { RewardsDistributionChart } from "./rewards-distribution-chart"
import { TopPerformingContracts } from "./top-performing-contracts"
import { UserStakingOverview } from "./user-staking-overview"

interface AnalyticsData {
  totalValueLocked: string
  totalRewardsDistributed: string
  activeStakers: number
  totalContracts: number
  averageAPY: number
  volume24h: string
  trendsData: {
    tvlChange: number
    rewardsChange: number
    stakersChange: number
    contractsChange: number
  }
  contractPerformance: Array<{
    address: string
    name: string
    tvl: string
    apy: number
    stakers: number
    volume24h: string
  }>
  userMetrics?: {
    totalStaked: string
    totalRewards: string
    activeContracts: number
    averageAPY: number
  }
}

export function AnalyticsDashboard() {
  const { address } = useWallet()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d" | "all">("7d")

  useEffect(() => {
    fetchAnalyticsData()
  }, [address, timeframe])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // Simulate API call - in real app this would fetch from backend
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockData: AnalyticsData = {
        totalValueLocked: "2,847,392",
        totalRewardsDistributed: "184,529",
        activeStakers: 1247,
        totalContracts: 89,
        averageAPY: 45.7,
        volume24h: "89,247",
        trendsData: {
          tvlChange: 12.4,
          rewardsChange: 8.7,
          stakersChange: 15.2,
          contractsChange: 5.1,
        },
        contractPerformance: [
          {
            address: "0x1234...5678",
            name: "Sonic Llamas Staking",
            tvl: "486,392",
            apy: 67.2,
            stakers: 234,
            volume24h: "23,847",
          },
          {
            address: "0x2345...6789",
            name: "Alpha NFT Pool",
            tvl: "352,194",
            apy: 54.8,
            stakers: 189,
            volume24h: "18,293",
          },
          {
            address: "0x3456...7890",
            name: "Genesis Collection",
            tvl: "298,473",
            apy: 42.1,
            stakers: 156,
            volume24h: "15,724",
          },
        ],
      }

      // Add user-specific data if wallet is connected
      if (address) {
        mockData.userMetrics = {
          totalStaked: "18,749",
          totalRewards: "2,394",
          activeContracts: 3,
          averageAPY: 52.3,
        }
      }

      setData(mockData)
    } catch (error) {
      console.error("Failed to fetch analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: string) => `${value} S`
  const formatPercentage = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`
  const formatNumber = (value: number) => value.toLocaleString()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-[#0d2416] border-gray-700 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-[#143621] rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-[#143621] rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-[#143621] rounded w-1/3"></div>
              </div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#0d2416] border-gray-700 p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-[#143621] rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-[#143621] rounded"></div>
            </div>
          </Card>
          <Card className="bg-[#0d2416] border-gray-700 p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-[#143621] rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-[#143621] rounded"></div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Activity size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Failed to load analytics data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Monitor staking performance and platform metrics</p>
        </div>

        <div className="flex gap-2">
          {(["24h", "7d", "30d", "all"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeframe === period ? "bg-green-600 text-white" : "bg-[#143621] text-gray-300 hover:bg-[#1a472a]"
              }`}
            >
              {period.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* User Overview (if connected) */}
      {data.userMetrics && <UserStakingOverview metrics={data.userMetrics} />}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#0d2416] border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Value Locked</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(data.totalValueLocked)}</p>
              <div className="flex items-center mt-1">
                {data.trendsData.tvlChange > 0 ? (
                  <TrendingUp size={16} className="text-green-400 mr-1" />
                ) : (
                  <TrendingDown size={16} className="text-red-400 mr-1" />
                )}
                <span className={`text-sm ${data.trendsData.tvlChange > 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatPercentage(data.trendsData.tvlChange)}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-[#0d2416] border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Rewards</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(data.totalRewardsDistributed)}</p>
              <div className="flex items-center mt-1">
                {data.trendsData.rewardsChange > 0 ? (
                  <TrendingUp size={16} className="text-green-400 mr-1" />
                ) : (
                  <TrendingDown size={16} className="text-red-400 mr-1" />
                )}
                <span className={`text-sm ${data.trendsData.rewardsChange > 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatPercentage(data.trendsData.rewardsChange)}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Target size={24} className="text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-[#0d2416] border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Active Stakers</p>
              <p className="text-2xl font-bold text-white">{formatNumber(data.activeStakers)}</p>
              <div className="flex items-center mt-1">
                {data.trendsData.stakersChange > 0 ? (
                  <TrendingUp size={16} className="text-green-400 mr-1" />
                ) : (
                  <TrendingDown size={16} className="text-red-400 mr-1" />
                )}
                <span className={`text-sm ${data.trendsData.stakersChange > 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatPercentage(data.trendsData.stakersChange)}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-[#0d2416] border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Average APY</p>
              <p className="text-2xl font-bold text-white">{data.averageAPY}%</p>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-400">{data.totalContracts} contracts</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <BarChart3 size={24} className="text-yellow-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StakingMetricsChart timeframe={timeframe} />
        <RewardsDistributionChart />
      </div>

      {/* Top Performing Contracts */}
      <TopPerformingContracts contracts={data.contractPerformance} />
    </div>
  )
}
