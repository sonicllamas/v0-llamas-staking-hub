"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, BarChart3 } from "lucide-react"

interface StakingMetricsChartProps {
  timeframe: "24h" | "7d" | "30d" | "all"
}

interface ChartData {
  date: string
  tvl: number
  volume: number
  stakers: number
}

export function StakingMetricsChart({ timeframe }: StakingMetricsChartProps) {
  const [data, setData] = useState<ChartData[]>([])
  const [activeMetric, setActiveMetric] = useState<"tvl" | "volume" | "stakers">("tvl")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [timeframe])

  const fetchChartData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Generate mock data based on timeframe
      const days = timeframe === "24h" ? 1 : timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90
      const mockData: ChartData[] = []

      for (let i = days; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)

        mockData.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          tvl: 2000000 + Math.random() * 1000000 + i * 10000,
          volume: 50000 + Math.random() * 100000,
          stakers: 1000 + Math.random() * 500 + i * 5,
        })
      }

      setData(mockData)
    } catch (error) {
      console.error("Failed to fetch chart data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMetricValue = (item: ChartData) => {
    switch (activeMetric) {
      case "tvl":
        return item.tvl
      case "volume":
        return item.volume
      case "stakers":
        return item.stakers
      default:
        return item.tvl
    }
  }

  const formatValue = (value: number) => {
    if (activeMetric === "stakers") {
      return value.toFixed(0)
    }
    return (value / 1000000).toFixed(1) + "M"
  }

  const getMetricColor = () => {
    switch (activeMetric) {
      case "tvl":
        return "text-green-400"
      case "volume":
        return "text-blue-400"
      case "stakers":
        return "text-purple-400"
      default:
        return "text-green-400"
    }
  }

  const maxValue = Math.max(...data.map(getMetricValue))

  if (loading) {
    return (
      <Card className="bg-[#0d2416] border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-[#143621] rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-[#143621] rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-[#0d2416] border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-green-400" />
          <h3 className="text-lg font-semibold text-white">Staking Metrics</h3>
        </div>

        <div className="flex gap-2">
          {[
            { key: "tvl", label: "TVL", color: "text-green-400" },
            { key: "volume", label: "Volume", color: "text-blue-400" },
            { key: "stakers", label: "Stakers", color: "text-purple-400" },
          ].map((metric) => (
            <button
              key={metric.key}
              onClick={() => setActiveMetric(metric.key as any)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeMetric === metric.key ? "bg-[#143621] text-white" : `${metric.color} hover:bg-[#143621]/50`
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 flex items-end justify-between gap-1">
        {data.map((item, index) => {
          const value = getMetricValue(item)
          const height = (value / maxValue) * 100

          return (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="w-full relative">
                <div
                  className={`w-full ${getMetricColor()} bg-current opacity-20 hover:opacity-40 transition-opacity rounded-t-sm`}
                  style={{ height: `${height * 2}px` }}
                />
                <div className="absolute top-0 left-0 w-full bg-transparent group-hover:bg-[#143621] transition-colors p-1 rounded">
                  <div className="text-xs text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatValue(value)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2 rotate-45 origin-top-left whitespace-nowrap">{item.date}</div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <TrendingUp size={16} className={getMetricColor()} />
        <span className="text-sm text-gray-400">
          {timeframe.toUpperCase()} {activeMetric.toUpperCase()} Trend
        </span>
      </div>
    </Card>
  )
}
