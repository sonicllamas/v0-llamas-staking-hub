"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, DollarSign, Users, Activity, Coins, ExternalLink, RefreshCw } from "lucide-react"
import { DEPLOYED_DEX_CONFIG, DEX_PAIRS, DEX_STATS } from "@/lib/deployed-dex-config"

export function DEXDashboard() {
  const [timeframe, setTimeframe] = useState("24h")

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value Locked</p>
                <p className="text-2xl font-bold">${DEX_STATS.totalValueLocked}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from yesterday
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">24h Volume</p>
                <p className="text-2xl font-bold">${DEX_STATS.volume24h}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.2% from yesterday
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">24h Fees</p>
                <p className="text-2xl font-bold">${DEX_STATS.fees24h}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15.3% from yesterday
                </p>
              </div>
              <Coins className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold">{DEX_STATS.uniqueUsers}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.7% from yesterday
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trading Pairs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Trading Pairs</CardTitle>
              <CardDescription>Most active pairs on Shadow DEX</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DEX_PAIRS.map((pair, index) => (
              <div
                key={pair.address}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="text-lg font-medium">#{index + 1}</div>
                  <div>
                    <div className="font-medium">
                      {pair.token0}/{pair.token1}
                    </div>
                    <div className="text-sm text-gray-600 font-mono">
                      {pair.address.slice(0, 6)}...{pair.address.slice(-4)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-8 text-right">
                  <div>
                    <div className="text-sm text-gray-600">Liquidity</div>
                    <div className="font-medium">
                      {pair.reserve0} {pair.token0}
                    </div>
                    <div className="text-sm text-gray-500">
                      {pair.reserve1} {pair.token1}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">24h Volume</div>
                    <div className="font-medium">${pair.volume24h}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">24h Fees</div>
                    <div className="font-medium text-green-600">${pair.fees24h}</div>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://sonicscan.org/address/${pair.address}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Governance Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Governance Overview</CardTitle>
          <CardDescription>Shadow Token governance statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Total Supply</div>
                <div className="text-2xl font-bold">{DEX_STATS.governance.totalSupply}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Circulating Supply</div>
                <div className="text-xl font-medium">{DEX_STATS.governance.circulatingSupply}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Token Holders</div>
                <div className="text-2xl font-bold">{DEX_STATS.governance.holders}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Proposals</div>
                <div className="text-xl font-medium">{DEX_STATS.governance.proposals}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Active Proposals</div>
                <div className="text-2xl font-bold text-blue-600">{DEX_STATS.governance.activeProposals}</div>
              </div>
              <Button className="w-full">View Governance</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Information */}
      <Card>
        <CardHeader>
          <CardTitle>Deployed Contracts</CardTitle>
          <CardDescription>Shadow DEX smart contract addresses on Sonic Mainnet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(DEPLOYED_DEX_CONFIG.contracts).map(([name, address]) => (
              <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium capitalize">{name} Contract</div>
                  <div className="text-sm text-gray-600 font-mono">{address}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Verified
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://sonicscan.org/address/${address}`, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
