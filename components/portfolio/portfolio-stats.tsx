"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, Target, Clock } from "lucide-react"

interface PortfolioStatsProps {
  data: {
    totalStaked: string
    totalRewards: string
    activeContracts: number
    averageApy: number
    totalValue: string
    pendingRewards: string
    stakingPower: number
  }
}

export function PortfolioStats({ data }: PortfolioStatsProps) {
  const stats = [
    {
      title: "Total Value",
      value: `${data.totalValue} S`,
      icon: DollarSign,
      trend: "+12.5%",
      trendUp: true,
      description: "Total portfolio value",
    },
    {
      title: "Total Staked",
      value: `${data.totalStaked} S`,
      icon: Target,
      trend: "+8.2%",
      trendUp: true,
      description: "Currently staked amount",
    },
    {
      title: "Total Rewards",
      value: `${data.totalRewards} S`,
      icon: TrendingUp,
      trend: "+24.1%",
      trendUp: true,
      description: "Lifetime rewards earned",
    },
    {
      title: "Pending Rewards",
      value: `${data.pendingRewards} S`,
      icon: Clock,
      trend: "Ready to claim",
      trendUp: true,
      description: "Available for claiming",
    },
  ]

  const metrics = [
    {
      title: "Active Contracts",
      value: data.activeContracts,
      max: 20,
      description: "Staking pools you're active in",
    },
    {
      title: "Average APY",
      value: data.averageApy,
      max: 100,
      description: "Weighted average across all stakes",
      suffix: "%",
    },
    {
      title: "Staking Power",
      value: data.stakingPower,
      max: 100,
      description: "Your influence in governance",
      suffix: "%",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${stat.trendUp ? "text-green-600" : "text-red-600"}`}
                  >
                    {stat.trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {stat.trend}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Progress Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{metric.title}</h4>
                <span className="text-2xl font-bold">
                  {metric.value}
                  {metric.suffix || ""}
                </span>
              </div>
              <Progress value={(metric.value / metric.max) * 100} className="mb-2" />
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
