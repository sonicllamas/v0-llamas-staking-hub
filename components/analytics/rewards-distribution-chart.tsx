"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { PieChart, Award } from "lucide-react"

interface RewardToken {
  symbol: string
  amount: string
  percentage: number
  color: string
}

export function RewardsDistributionChart() {
  const [rewardTokens, setRewardTokens] = useState<RewardToken[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRewardsData()
  }, [])

  const fetchRewardsData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 600))

      const mockData: RewardToken[] = [
        { symbol: "SLL", amount: "89,234", percentage: 45, color: "bg-green-500" },
        { symbol: "USDC", amount: "34,892", percentage: 25, color: "bg-blue-500" },
        { symbol: "SONIC", amount: "28,456", percentage: 20, color: "bg-purple-500" },
        { symbol: "ETH", amount: "12,847", percentage: 10, color: "bg-yellow-500" },
      ]

      setRewardTokens(mockData)
    } catch (error) {
      console.error("Failed to fetch rewards data:", error)
    } finally {
      setLoading(false)
    }
  }

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
      <div className="flex items-center gap-2 mb-6">
        <Award size={20} className="text-green-400" />
        <h3 className="text-lg font-semibold text-white">Rewards Distribution</h3>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Pie Chart Visualization */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {
                rewardTokens.reduce(
                  (acc, token, index) => {
                    const radius = 40
                    const circumference = 2 * Math.PI * radius
                    const strokeLength = (token.percentage / 100) * circumference
                    const strokeOffset = acc.offset

                    acc.offset += strokeLength
                    acc.elements.push(
                      <circle
                        key={token.symbol}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={token.color.replace("bg-", "#")}
                        strokeWidth="8"
                        strokeDasharray={`${strokeLength} ${circumference}`}
                        strokeDashoffset={-strokeOffset}
                        className="transition-all duration-300 hover:stroke-width-10"
                      />,
                    )

                    return acc
                  },
                  { offset: 0, elements: [] as React.ReactNode[] },
                ).elements
              }
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <PieChart size={24} className="text-green-400 mx-auto mb-1" />
                <div className="text-sm text-gray-400">Total</div>
                <div className="text-lg font-bold text-white">
                  {rewardTokens
                    .reduce((sum, token) => sum + Number.parseFloat(token.amount.replace(",", "")), 0)
                    .toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {rewardTokens.map((token) => (
            <div
              key={token.symbol}
              className="flex items-center justify-between p-3 bg-[#143621] rounded-lg hover:bg-[#1a472a] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 ${token.color} rounded-full`} />
                <div>
                  <div className="font-medium text-white">{token.symbol}</div>
                  <div className="text-sm text-gray-400">{token.percentage}% of total</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">{token.amount}</div>
                <div className="text-sm text-gray-400">tokens</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-[#143621] rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total Rewards Distributed</span>
          <span className="text-green-400 font-semibold">
            {rewardTokens
              .reduce((sum, token) => sum + Number.parseFloat(token.amount.replace(",", "")), 0)
              .toLocaleString()}{" "}
            tokens
          </span>
        </div>
      </div>
    </Card>
  )
}
