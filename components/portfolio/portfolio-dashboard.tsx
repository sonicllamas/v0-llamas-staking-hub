"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/context/wallet-context"
import { TrendingUp, Trophy, Zap } from "lucide-react"
import { PortfolioStats } from "./portfolio-stats"
import { ActiveStakes } from "./active-stakes"
import { RewardsTracker } from "./rewards-tracker"
import { StakingHistory } from "./staking-history"
import { QuickActions } from "./quick-actions"
import { PerformanceChart } from "./performance-chart"
import { WalletRequiredCard } from "@/components/create-staking/wallet-required-card"
import { NetworkRequiredCard } from "@/components/create-staking/network-required-card"
import { Container } from "@/components/container"
import { BackButton } from "@/components/back-button"

interface PortfolioData {
  totalStaked: string
  totalRewards: string
  activeContracts: number
  averageApy: number
  totalValue: string
  pendingRewards: string
  stakingPower: number
  rank: number
  achievements: string[]
  performance: {
    daily: number
    weekly: number
    monthly: number
  }
}

export function PortfolioDashboard() {
  const { address, isConnected, chainId } = useWallet()
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (isConnected && address) {
      fetchPortfolioData()
    } else {
      setIsLoading(false)
    }
  }, [isConnected, address])

  const fetchPortfolioData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setPortfolioData({
        totalStaked: "12,450.75",
        totalRewards: "1,847.32",
        activeContracts: 8,
        averageApy: 24.5,
        totalValue: "14,298.07",
        pendingRewards: "127.45",
        stakingPower: 85,
        rank: 247,
        achievements: ["Early Adopter", "High Roller", "Consistent Staker"],
        performance: {
          daily: 2.3,
          weekly: 8.7,
          monthly: 18.4,
        },
      })
    } catch (error) {
      console.error("Error fetching portfolio data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Show wallet connection requirement
  if (!isConnected) {
    return (
      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          <BackButton href="/" />
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Portfolio Dashboard</h1>
            <p className="text-muted-foreground">Track your staking performance, rewards, and manage your NFT stakes</p>
          </div>
          <WalletRequiredCard
            title="Connect Wallet to View Portfolio"
            description="Connect your wallet to view your staking portfolio, track rewards, and manage your stakes."
          />
        </div>
      </Container>
    )
  }

  // Show network requirement
  if (chainId !== 146) {
    return (
      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          <BackButton href="/" />
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Portfolio Dashboard</h1>
            <p className="text-muted-foreground">Track your staking performance, rewards, and manage your NFT stakes</p>
          </div>
          <NetworkRequiredCard />
        </div>
      </Container>
    )
  }

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="max-w-6xl mx-auto">
          <BackButton href="/" />
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Portfolio Dashboard</h1>
            <p className="text-muted-foreground">Loading your portfolio...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-8 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    )
  }

  if (!portfolioData) {
    return (
      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          <BackButton href="/" />
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Portfolio Dashboard</h1>
            <p className="text-muted-foreground">Unable to load portfolio data. Please try again.</p>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Failed to load portfolio data</p>
              <Button onClick={fetchPortfolioData}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-8">
      <div className="max-w-6xl mx-auto">
        <BackButton href="/" />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Portfolio Dashboard</h1>
              <p className="text-muted-foreground">Track your staking performance and manage your NFT stakes</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Rank #{portfolioData.rank}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {portfolioData.stakingPower}% Power
              </Badge>
            </div>
          </div>
        </div>

        {/* Portfolio Stats */}
        <PortfolioStats data={portfolioData} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stakes">Active Stakes</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Overview
                  </CardTitle>
                  <CardDescription>Your staking performance across different timeframes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Daily Return</span>
                      <span
                        className={`text-sm font-bold ${portfolioData.performance.daily >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {portfolioData.performance.daily >= 0 ? "+" : ""}
                        {portfolioData.performance.daily}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Weekly Return</span>
                      <span
                        className={`text-sm font-bold ${portfolioData.performance.weekly >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {portfolioData.performance.weekly >= 0 ? "+" : ""}
                        {portfolioData.performance.weekly}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Monthly Return</span>
                      <span
                        className={`text-sm font-bold ${portfolioData.performance.monthly >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {portfolioData.performance.monthly >= 0 ? "+" : ""}
                        {portfolioData.performance.monthly}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                  <CardDescription>Your staking milestones and badges</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {portfolioData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stakes" className="mt-6">
            <ActiveStakes />
          </TabsContent>

          <TabsContent value="rewards" className="mt-6">
            <RewardsTracker />
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <PerformanceChart />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <StakingHistory />
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  )
}
