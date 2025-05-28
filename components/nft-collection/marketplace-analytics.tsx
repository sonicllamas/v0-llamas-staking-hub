"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, BarChart3, Activity, Calendar, Minus } from "lucide-react"
import {
  fetchMarketplaceDayData,
  processMarketplaceDayData,
  getMarketplaceTrends,
  formatVolume,
} from "@/lib/nft-service"
import { ScrollAnimation } from "@/components/scroll-animation"

interface MarketplaceAnalyticsProps {
  className?: string
}

export function MarketplaceAnalytics({ className = "" }: MarketplaceAnalyticsProps) {
  const [dayData, setDayData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDayData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchMarketplaceDayData()
        if (data) {
          setDayData(data)
        } else {
          setError("Failed to load marketplace analytics")
        }
      } catch (err) {
        console.error("Error loading marketplace day data:", err)
        setError("Failed to load marketplace analytics")
      } finally {
        setLoading(false)
      }
    }

    loadDayData()
  }, [])

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-[#0d2416] border-gray-700 animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-[#0d2416] border-gray-700 animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-700 rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !dayData) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="bg-[#0d2416] border-gray-700">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">{error || "Unable to load marketplace analytics"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { volumeData, tradesData } = processMarketplaceDayData(dayData)
  const trends = getMarketplaceTrends(dayData)

  const getTrendIcon = (change: number) => {
    if (change > 5) return <TrendingUp className="h-4 w-4 text-green-400" />
    if (change < -5) return <TrendingDown className="h-4 w-4 text-red-400" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getTrendColor = (change: number) => {
    if (change > 5) return "text-green-400"
    if (change < -5) return "text-red-400"
    return "text-gray-400"
  }

  const formatChange = (change: number) => {
    const sign = change > 0 ? "+" : ""
    return `${sign}${change.toFixed(1)}%`
  }

  // Calculate recent averages
  const recentVolumeAvg = volumeData.slice(-7).reduce((sum, day) => sum + day.volume, 0) / 7
  const recentTradesAvg = tradesData.slice(-7).reduce((sum, day) => sum + day.trades, 0) / 7

  return (
    <div className={`space-y-6 ${className}`}>
      <ScrollAnimation animation="fadeInUp" delay={0}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Marketplace Analytics</h2>
            <p className="text-gray-400">Historical performance and trends over the last 30 days</p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-400">Last 30 Days</span>
          </div>
        </div>
      </ScrollAnimation>

      {/* Trend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScrollAnimation animation="fadeInUp" delay={0.1}>
          <Card className="bg-[#0d2416] border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Today's Volume</p>
                  <p className="text-xl font-bold text-white">{formatVolume((trends.todayVolume * 1e18).toString())}</p>
                  <div className={`flex items-center space-x-1 ${getTrendColor(trends.volumeChange)}`}>
                    {getTrendIcon(trends.volumeChange)}
                    <span className="text-sm">{formatChange(trends.volumeChange)}</span>
                  </div>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </ScrollAnimation>

        <ScrollAnimation animation="fadeInUp" delay={0.2}>
          <Card className="bg-[#0d2416] border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Today's Trades</p>
                  <p className="text-xl font-bold text-white">{trends.todayTrades.toLocaleString()}</p>
                  <div className={`flex items-center space-x-1 ${getTrendColor(trends.tradesChange)}`}>
                    {getTrendIcon(trends.tradesChange)}
                    <span className="text-sm">{formatChange(trends.tradesChange)}</span>
                  </div>
                </div>
                <Activity className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </ScrollAnimation>

        <ScrollAnimation animation="fadeInUp" delay={0.3}>
          <Card className="bg-[#0d2416] border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">7-Day Avg Volume</p>
                  <p className="text-xl font-bold text-white">{formatVolume((recentVolumeAvg * 1e18).toString())}</p>
                  <p className="text-sm text-gray-400">Daily Average</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </ScrollAnimation>

        <ScrollAnimation animation="fadeInUp" delay={0.4}>
          <Card className="bg-[#0d2416] border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">7-Day Avg Trades</p>
                  <p className="text-xl font-bold text-white">{Math.round(recentTradesAvg).toLocaleString()}</p>
                  <p className="text-sm text-gray-400">Daily Average</p>
                </div>
                <Activity className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </ScrollAnimation>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScrollAnimation animation="fadeInUp" delay={0.5}>
          <Card className="bg-[#0d2416] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                <span>Daily Volume Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end space-x-1">
                {volumeData.map((day, index) => {
                  const maxVolume = Math.max(...volumeData.map((d) => d.volume))
                  const height = (day.volume / maxVolume) * 100
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-blue-400 rounded-t opacity-70 hover:opacity-100 transition-opacity relative group"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {day.date}
                        <br />
                        {formatVolume((day.volume * 1e18).toString())}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>{volumeData[0]?.date}</span>
                <span>{volumeData[volumeData.length - 1]?.date}</span>
              </div>
            </CardContent>
          </Card>
        </ScrollAnimation>

        <ScrollAnimation animation="fadeInUp" delay={0.6}>
          <Card className="bg-[#0d2416] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-400" />
                <span>Daily Trades Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end space-x-1">
                {tradesData.map((day, index) => {
                  const maxTrades = Math.max(...tradesData.map((d) => d.trades))
                  const height = (day.trades / maxTrades) * 100
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-green-400 rounded-t opacity-70 hover:opacity-100 transition-opacity relative group"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {day.date}
                        <br />
                        {day.trades.toLocaleString()} trades
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>{tradesData[0]?.date}</span>
                <span>{tradesData[tradesData.length - 1]?.date}</span>
              </div>
            </CardContent>
          </Card>
        </ScrollAnimation>
      </div>

      {/* Summary Stats */}
      <ScrollAnimation animation="fadeInUp" delay={0.7}>
        <Card className="bg-[#0d2416] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">30-Day Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {formatVolume((volumeData.reduce((sum, day) => sum + day.volume, 0) * 1e18).toString())}
                </p>
                <p className="text-sm text-gray-400">Total Volume</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {tradesData.reduce((sum, day) => sum + day.trades, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Total Trades</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">
                  {formatVolume(
                    ((volumeData.reduce((sum, day) => sum + day.volume, 0) / volumeData.length) * 1e18).toString(),
                  )}
                </p>
                <p className="text-sm text-gray-400">Avg Daily Volume</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollAnimation>
    </div>
  )
}
