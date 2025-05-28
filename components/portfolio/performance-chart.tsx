"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"

interface ChartData {
  date: string
  value: number
  rewards: number
  apy: number
}

export function PerformanceChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d" | "1y">("30d")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [timeframe])

  const fetchChartData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate mock data based on timeframe
      const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : timeframe === "90d" ? 90 : 365
      const data: ChartData[] = []

      for (let i = days; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)

        const baseValue = 10000
        const growth = (days - i) * 50 + Math.random() * 200 - 100
        const value = baseValue + growth

        data.push({
          date: date.toISOString().split("T")[0],
          value: Math.max(0, value),
          rewards: Math.random() * 100 + 20,
          apy: Math.random() * 10 + 15,
        })
      }

      setChartData(data)
    } catch (error) {
      console.error("Error fetching chart data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentValue = chartData[chartData.length - 1]?.value || 0
  const previousValue = chartData[chartData.length - 2]?.value || 0
  const change = currentValue - previousValue
  const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0

  const totalRewards = chartData.reduce((sum, data) => sum + data.rewards, 0)
  const averageApy = chartData.length > 0 ? chartData.reduce((sum, data) => sum + data.apy, 0) / chartData.length : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div className={`flex items-center gap-1 text-sm ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {changePercent.toFixed(1)}%
              </div>
            </div>
            <h3 className="text-2xl font-bold">${currentValue.toLocaleString()}</h3>
            <p className="text-sm text-muted-foreground">Portfolio Value</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-green-600">+{totalRewards.toFixed(0)}</span>
            </div>
            <h3 className="text-2xl font-bold">${totalRewards.toLocaleString()}</h3>
            <p className="text-sm text-muted-foreground">Total Rewards</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-blue-600">{averageApy.toFixed(1)}%</span>
            </div>
            <h3 className="text-2xl font-bold">{averageApy.toFixed(1)}%</h3>
            <p className="text-sm text-muted-foreground">Average APY</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-purple-600">ROI</span>
            </div>
            <h3 className="text-2xl font-bold">+{(((currentValue - 10000) / 10000) * 100).toFixed(1)}%</h3>
            <p className="text-sm text-muted-foreground">Total Return</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>Track your staking portfolio value over time</CardDescription>
            </div>
            <div className="flex gap-2">
              {(["7d", "30d", "90d", "1y"] as const).map((period) => (
                <Button
                  key={period}
                  variant={timeframe === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe(period)}
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Interactive chart showing portfolio performance over {timeframe}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Chart visualization would be implemented with a charting library like Recharts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Breakdown */}
      <Tabs defaultValue="value" className="w-full">
        <TabsList>
          <TabsTrigger value="value">Portfolio Value</TabsTrigger>
          <TabsTrigger value="rewards">Rewards Earned</TabsTrigger>
          <TabsTrigger value="apy">APY Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="value" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Value Breakdown</CardTitle>
              <CardDescription>Detailed view of your portfolio value changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.slice(-7).map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">{data.date}</span>
                    <span className="text-lg font-bold">${data.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Rewards</CardTitle>
              <CardDescription>Your daily reward earnings over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.slice(-7).map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">{data.date}</span>
                    <span className="text-lg font-bold text-green-600">+${data.rewards.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>APY Trends</CardTitle>
              <CardDescription>How your average APY has changed over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.slice(-7).map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">{data.date}</span>
                    <span className="text-lg font-bold text-blue-600">{data.apy.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
