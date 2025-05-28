"use client"

import { Card } from "@/components/ui/card"
import { User, TrendingUp, Target, BarChart3, Award } from "lucide-react"

interface UserMetrics {
  totalStaked: string
  totalRewards: string
  activeContracts: number
  averageAPY: number
}

interface UserStakingOverviewProps {
  metrics: UserMetrics
}

export function UserStakingOverview({ metrics }: UserStakingOverviewProps) {
  const formatCurrency = (value: string) => `${value} S`

  return (
    <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-600/30 p-6">
      <div className="flex items-center gap-2 mb-4">
        <User size={20} className="text-green-400" />
        <h3 className="text-lg font-semibold text-white">Your Staking Overview</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-[#0d2416]/50 rounded-lg">
          <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Target size={20} className="text-green-400" />
          </div>
          <p className="text-gray-400 text-sm">Total Staked</p>
          <p className="text-xl font-bold text-white">{formatCurrency(metrics.totalStaked)}</p>
        </div>

        <div className="text-center p-4 bg-[#0d2416]/50 rounded-lg">
          <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Award size={20} className="text-blue-400" />
          </div>
          <p className="text-gray-400 text-sm">Total Rewards</p>
          <p className="text-xl font-bold text-white">{formatCurrency(metrics.totalRewards)}</p>
        </div>

        <div className="text-center p-4 bg-[#0d2416]/50 rounded-lg">
          <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
            <BarChart3 size={20} className="text-purple-400" />
          </div>
          <p className="text-gray-400 text-sm">Active Contracts</p>
          <p className="text-xl font-bold text-white">{metrics.activeContracts}</p>
        </div>

        <div className="text-center p-4 bg-[#0d2416]/50 rounded-lg">
          <div className="w-10 h-10 bg-yellow-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
            <TrendingUp size={20} className="text-yellow-400" />
          </div>
          <p className="text-gray-400 text-sm">Average APY</p>
          <p className="text-xl font-bold text-white">{metrics.averageAPY}%</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-green-900/10 border border-green-600/20 rounded-lg">
        <p className="text-green-300 text-sm">
          💡 <strong>Tip:</strong> Consider diversifying across multiple staking pools to optimize your returns and
          reduce risk.
        </p>
      </div>
    </Card>
  )
}
