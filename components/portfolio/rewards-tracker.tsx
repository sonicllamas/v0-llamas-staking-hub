"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Zap, TrendingUp, Clock, DollarSign, Gift, Target } from "lucide-react"

interface RewardToken {
  symbol: string
  name: string
  balance: string
  pendingBalance: string
  totalEarned: string
  usdValue: string
  apy: number
  icon: string
}

interface RewardHistory {
  id: string
  date: string
  amount: string
  token: string
  contractName: string
  type: "claimed" | "earned" | "bonus"
  txHash?: string
}

export function RewardsTracker() {
  const [rewardTokens, setRewardTokens] = useState<RewardToken[]>([])
  const [rewardHistory, setRewardHistory] = useState<RewardHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [claimingAll, setClaimingAll] = useState(false)

  useEffect(() => {
    fetchRewardsData()
  }, [])

  const fetchRewardsData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setRewardTokens([
        {
          symbol: "S",
          name: "Sonic",
          balance: "1,247.82",
          pendingBalance: "89.45",
          totalEarned: "1,847.32",
          usdValue: "2,456.78",
          apy: 24.5,
          icon: "/sonic-llamas-logo.jpg",
        },
        {
          symbol: "SLL",
          name: "Sonic Llama Token",
          balance: "5,678.90",
          pendingBalance: "234.56",
          totalEarned: "8,234.12",
          usdValue: "1,234.56",
          apy: 18.7,
          icon: "/sll-logo.jpg",
        },
        {
          symbol: "USDC",
          name: "USD Coin",
          balance: "456.78",
          pendingBalance: "12.34",
          totalEarned: "678.90",
          usdValue: "456.78",
          apy: 8.2,
          icon: "/usdc-logo.png",
        },
      ])

      setRewardHistory([
        {
          id: "1",
          date: "2024-01-08",
          amount: "23.45",
          token: "S",
          contractName: "Sonic Llamas Premium Pool",
          type: "claimed",
          txHash: "0x1234...5678",
        },
        {
          id: "2",
          date: "2024-01-07",
          amount: "18.92",
          token: "SLL",
          contractName: "High Yield NFT Staking",
          type: "earned",
        },
        {
          id: "3",
          date: "2024-01-06",
          amount: "5.67",
          token: "USDC",
          contractName: "Flexible Staking Pool",
          type: "bonus",
        },
        {
          id: "4",
          date: "2024-01-05",
          amount: "34.21",
          token: "S",
          contractName: "Sonic Llamas Premium Pool",
          type: "claimed",
          txHash: "0x2345...6789",
        },
        {
          id: "5",
          date: "2024-01-04",
          amount: "12.89",
          token: "SLL",
          contractName: "High Yield NFT Staking",
          type: "earned",
        },
      ])
    } catch (error) {
      console.error("Error fetching rewards data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClaimAll = async () => {
    setClaimingAll(true)
    try {
      // Simulate claiming all rewards
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update balances after claiming
      setRewardTokens((prev) =>
        prev.map((token) => ({
          ...token,
          balance: (
            Number.parseFloat(token.balance.replace(",", "")) + Number.parseFloat(token.pendingBalance.replace(",", ""))
          ).toLocaleString(),
          pendingBalance: "0.00",
        })),
      )
    } catch (error) {
      console.error("Error claiming rewards:", error)
    } finally {
      setClaimingAll(false)
    }
  }

  const totalPendingValue = rewardTokens.reduce(
    (sum, token) =>
      sum +
      Number.parseFloat(token.pendingBalance.replace(",", "")) *
        (Number.parseFloat(token.usdValue.replace(",", "")) / Number.parseFloat(token.balance.replace(",", ""))),
    0,
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "claimed":
        return <Zap className="h-4 w-4 text-green-600" />
      case "earned":
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      case "bonus":
        return <Gift className="h-4 w-4 text-purple-600" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "claimed":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200">
            Claimed
          </Badge>
        )
      case "earned":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            Earned
          </Badge>
        )
      case "bonus":
        return (
          <Badge variant="outline" className="text-purple-600 border-purple-200">
            Bonus
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-4"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <Badge variant="outline" className="text-green-600">
                Ready
              </Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">${totalPendingValue.toFixed(2)}</h3>
            <p className="text-sm text-muted-foreground">Total Pending Rewards</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <Badge variant="outline" className="text-blue-600">
                24h
              </Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">+$47.82</h3>
            <p className="text-sm text-muted-foreground">Daily Rewards Earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <Badge variant="outline" className="text-purple-600">
                APY
              </Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">22.8%</h3>
            <p className="text-sm text-muted-foreground">Weighted Average APY</p>
          </CardContent>
        </Card>
      </div>

      {/* Claim All Button */}
      {totalPendingValue > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800 mb-1">Ready to Claim</h3>
                <p className="text-sm text-green-600">
                  You have ${totalPendingValue.toFixed(2)} in pending rewards across all tokens
                </p>
              </div>
              <Button onClick={handleClaimAll} disabled={claimingAll} className="bg-green-600 hover:bg-green-700">
                {claimingAll ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Claim All Rewards
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reward Tokens */}
      <Tabs defaultValue="tokens" className="w-full">
        <TabsList>
          <TabsTrigger value="tokens">Reward Tokens</TabsTrigger>
          <TabsTrigger value="history">Reward History</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewardTokens.map((token, index) => (
              <Card key={index}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <img src={token.icon || "/placeholder.svg"} alt={token.symbol} className="w-10 h-10 rounded-full" />
                    <div>
                      <CardTitle className="text-lg">{token.symbol}</CardTitle>
                      <CardDescription>{token.name}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">Balance</span>
                        <span className="font-semibold">
                          {token.balance} {token.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">Pending</span>
                        <span className="font-semibold text-orange-600">
                          {token.pendingBalance} {token.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">USD Value</span>
                        <span className="font-semibold">${token.usdValue}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">APY</span>
                        <span className="text-sm font-bold text-green-600">{token.apy}%</span>
                      </div>
                      <Progress value={token.apy} className="h-2" />
                    </div>

                    {Number.parseFloat(token.pendingBalance.replace(",", "")) > 0 && (
                      <Button className="w-full" size="sm">
                        <Zap className="h-4 w-4 mr-2" />
                        Claim {token.pendingBalance} {token.symbol}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reward Activity</CardTitle>
              <CardDescription>Your reward earning and claiming history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rewardHistory.map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getTypeIcon(reward.type)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {reward.amount} {reward.token}
                          </span>
                          {getTypeBadge(reward.type)}
                        </div>
                        <p className="text-sm text-muted-foreground">{reward.contractName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{reward.date}</p>
                      {reward.txHash && <p className="text-xs text-muted-foreground">Tx: {reward.txHash}</p>}
                    </div>
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
