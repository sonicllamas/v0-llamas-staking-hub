"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Clock, Zap, Target, Plus, Minus } from "lucide-react"
import Link from "next/link"

interface StakePosition {
  id: string
  contractName: string
  contractAddress: string
  nftCollection: string
  stakedNfts: number
  totalValue: string
  currentApy: number
  rewardsEarned: string
  pendingRewards: string
  stakingDuration: string
  status: "active" | "paused" | "ended"
  lockPeriod?: string
  nextRewardDate?: string
}

export function ActiveStakes() {
  const [stakes, setStakes] = useState<StakePosition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "ended">("all")

  useEffect(() => {
    fetchActiveStakes()
  }, [])

  const fetchActiveStakes = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStakes([
        {
          id: "1",
          contractName: "Sonic Llamas Premium Pool",
          contractAddress: "0x1234...5678",
          nftCollection: "Sonic Llamas",
          stakedNfts: 5,
          totalValue: "2,450.00",
          currentApy: 28.5,
          rewardsEarned: "347.82",
          pendingRewards: "23.45",
          stakingDuration: "45 days",
          status: "active",
          lockPeriod: "30 days",
          nextRewardDate: "2024-01-15",
        },
        {
          id: "2",
          contractName: "High Yield NFT Staking",
          contractAddress: "0x2345...6789",
          nftCollection: "Cosmic Creatures",
          stakedNfts: 3,
          totalValue: "1,890.50",
          currentApy: 35.2,
          rewardsEarned: "289.15",
          pendingRewards: "18.92",
          stakingDuration: "32 days",
          status: "active",
          lockPeriod: "60 days",
          nextRewardDate: "2024-01-12",
        },
        {
          id: "3",
          contractName: "Flexible Staking Pool",
          contractAddress: "0x3456...7890",
          nftCollection: "Digital Art Collection",
          stakedNfts: 8,
          totalValue: "3,200.75",
          currentApy: 18.7,
          rewardsEarned: "156.43",
          pendingRewards: "12.67",
          stakingDuration: "23 days",
          status: "active",
          nextRewardDate: "2024-01-10",
        },
        {
          id: "4",
          contractName: "Legacy Pool V1",
          contractAddress: "0x4567...8901",
          nftCollection: "Retro NFTs",
          stakedNfts: 2,
          totalValue: "890.25",
          currentApy: 0,
          rewardsEarned: "45.67",
          pendingRewards: "0.00",
          stakingDuration: "120 days",
          status: "ended",
        },
      ])
    } catch (error) {
      console.error("Error fetching active stakes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStakes = stakes.filter((stake) => filter === "all" || stake.status === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "ended":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded mb-4"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-16 bg-muted rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
        <TabsList>
          <TabsTrigger value="all">All Stakes ({stakes.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({stakes.filter((s) => s.status === "active").length})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({stakes.filter((s) => s.status === "paused").length})</TabsTrigger>
          <TabsTrigger value="ended">Ended ({stakes.filter((s) => s.status === "ended").length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stakes List */}
      <div className="space-y-4">
        {filteredStakes.map((stake) => (
          <Card key={stake.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{stake.contractName}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <span>{stake.nftCollection}</span>
                    <span>•</span>
                    <span>{stake.contractAddress}</span>
                    <Link
                      href={`/contracts/${stake.contractAddress}`}
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(stake.status)}>
                  {stake.status.charAt(0).toUpperCase() + stake.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Staked NFTs</p>
                  <p className="text-lg font-semibold">{stake.stakedNfts}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-lg font-semibold">{stake.totalValue} S</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current APY</p>
                  <p className="text-lg font-semibold text-green-600">{stake.currentApy}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rewards Earned</p>
                  <p className="text-lg font-semibold">{stake.rewardsEarned} S</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-lg font-semibold text-orange-600">{stake.pendingRewards} S</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg font-semibold">{stake.stakingDuration}</p>
                </div>
              </div>

              {stake.lockPeriod && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Lock Period Progress</span>
                    <span>{stake.lockPeriod}</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {stake.nextRewardDate && (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>Next reward: {stake.nextRewardDate}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {stake.status === "active" && (
                    <>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add NFTs
                      </Button>
                      <Button variant="outline" size="sm">
                        <Minus className="h-4 w-4 mr-1" />
                        Unstake
                      </Button>
                      {Number.parseFloat(stake.pendingRewards) > 0 && (
                        <Button size="sm">
                          <Zap className="h-4 w-4 mr-1" />
                          Claim {stake.pendingRewards} S
                        </Button>
                      )}
                    </>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/contracts/${stake.contractAddress}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStakes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Stakes Found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === "all" ? "You don't have any active stakes yet." : `No ${filter} stakes found.`}
            </p>
            <Button asChild>
              <Link href="/collections">Start Staking NFTs</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
