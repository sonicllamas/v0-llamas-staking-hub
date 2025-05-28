"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Activity, ShoppingCart, Clock, BarChart3, Users } from "lucide-react"
import { ScrollAnimation } from "@/components/scroll-animation"

interface MarketplaceStatsData {
  volume: string
  stats: {
    numTradesLast7Days: string
    numTradesLast24Hours: string
    totalVolumeTraded: string
    volumeLast24Hours: string
    volumeLast7Days: string
    activeSales: string
    activeSalesNonAuction: string
    totalTrades: string
    timestampLastSale: string
    timestampLastTrim: string
  }
  version: number
}

interface MarketplaceStatsProps {
  className?: string
}

export function MarketplaceStats({ className = "" }: MarketplaceStatsProps) {
  const [stats, setStats] = useState<MarketplaceStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchMarketplaceStats = async () => {
    try {
      const response = await fetch("https://api.paintswap.finance/sales/stats")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setStats(data)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      console.error("Failed to fetch marketplace stats:", err)
      setError("Failed to load marketplace statistics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketplaceStats()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMarketplaceStats, 30000)

    return () => clearInterval(interval)
  }, [])

  const formatVolume = (weiValue: string): string => {
    try {
      const value = Number.parseFloat(weiValue) / 1e18
      if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B S`
      if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M S`
      if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K S`
      return `${value.toFixed(2)} S`
    } catch {
      return "N/A"
    }
  }

  const formatTradeCount = (count: string): string => {
    try {
      const value = Number.parseInt(count)
      if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
      if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
      return value.toLocaleString()
    } catch {
      return "N/A"
    }
  }

  if (loading) {
    return (
      <div className={`bg-[#0d2416] rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Marketplace Overview</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Loading...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#143621] rounded-lg p-4">
              <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-6 bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-[#0d2416] rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchMarketplaceStats}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const statsCards = [
    {
      title: "Total Volume",
      value: formatVolume(stats.stats.totalVolumeTraded),
      icon: TrendingUp,
      color: "text-green-400",
    },
    {
      title: "24h Volume",
      value: formatVolume(stats.stats.volumeLast24Hours),
      icon: BarChart3,
      color: "text-blue-400",
    },
    {
      title: "7d Volume",
      value: formatVolume(stats.stats.volumeLast7Days),
      icon: Activity,
      color: "text-purple-400",
    },
    {
      title: "Active Sales",
      value: formatTradeCount(stats.stats.activeSales),
      icon: ShoppingCart,
      color: "text-orange-400",
    },
    {
      title: "24h Trades",
      value: formatTradeCount(stats.stats.numTradesLast24Hours),
      icon: Clock,
      color: "text-cyan-400",
    },
    {
      title: "Total Trades",
      value: formatTradeCount(stats.stats.totalTrades),
      icon: Users,
      color: "text-pink-400",
    },
  ]

  return (
    <ScrollAnimation animation="fadeInUp" delay={0}>
      <div className={`bg-[#0d2416] rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Marketplace Overview</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">
              Live {lastUpdated && `• Updated ${lastUpdated.toLocaleTimeString()}`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statsCards.map((stat, index) => (
            <ScrollAnimation key={stat.title} animation="fadeInUp" delay={0.1 + index * 0.05}>
              <div className="bg-[#143621] rounded-lg p-4 hover:bg-[#1a4228] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                <p className="text-white text-lg font-bold">{stat.value}</p>
              </div>
            </ScrollAnimation>
          ))}
        </div>

        {/* Additional insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-[#143621] rounded-lg p-3">
            <p className="text-gray-400">Auction Sales</p>
            <p className="text-white font-medium">
              {formatTradeCount(
                (
                  Number.parseInt(stats.stats.activeSales) - Number.parseInt(stats.stats.activeSalesNonAuction)
                ).toString(),
              )}{" "}
              active
            </p>
          </div>
          <div className="bg-[#143621] rounded-lg p-3">
            <p className="text-gray-400">7-Day Activity</p>
            <p className="text-white font-medium">{formatTradeCount(stats.stats.numTradesLast7Days)} trades</p>
          </div>
        </div>
      </div>
    </ScrollAnimation>
  )
}
