"use client"

import { Card } from "@/components/ui/card"
import { Crown, TrendingUp, Users, DollarSign, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Contract {
  address: string
  name: string
  tvl: string
  apy: number
  stakers: number
  volume24h: string
}

interface TopPerformingContractsProps {
  contracts: Contract[]
}

export function TopPerformingContracts({ contracts }: TopPerformingContractsProps) {
  const formatCurrency = (value: string) => `${value} S`
  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <Card className="bg-[#0d2416] border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Crown size={20} className="text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Top Performing Contracts</h3>
      </div>

      <div className="space-y-4">
        {contracts.map((contract, index) => (
          <div
            key={contract.address}
            className="flex items-center justify-between p-4 bg-[#143621] rounded-lg hover:bg-[#1a472a] transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-yellow-900/30 rounded-full">
                <span className="text-yellow-400 font-bold text-sm">#{index + 1}</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-white group-hover:text-green-400 transition-colors">
                    {contract.name}
                  </h4>
                  <Link
                    href={`/contracts/${contract.address}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink size={14} className="text-gray-400 hover:text-white" />
                  </Link>
                </div>
                <div className="text-sm text-gray-400 font-mono">{formatAddress(contract.address)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-right">
              <div>
                <div className="flex items-center justify-end gap-1 text-green-400 text-sm">
                  <DollarSign size={14} />
                  <span>TVL</span>
                </div>
                <div className="font-semibold text-white">{formatCurrency(contract.tvl)}</div>
              </div>

              <div>
                <div className="flex items-center justify-end gap-1 text-blue-400 text-sm">
                  <TrendingUp size={14} />
                  <span>APY</span>
                </div>
                <div className="font-semibold text-white">{contract.apy}%</div>
              </div>

              <div>
                <div className="flex items-center justify-end gap-1 text-purple-400 text-sm">
                  <Users size={14} />
                  <span>Stakers</span>
                </div>
                <div className="font-semibold text-white">{contract.stakers.toLocaleString()}</div>
              </div>

              <div>
                <div className="flex items-center justify-end gap-1 text-yellow-400 text-sm">
                  <DollarSign size={14} />
                  <span>24h Vol</span>
                </div>
                <div className="font-semibold text-white">{formatCurrency(contract.volume24h)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/contracts"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          View All Contracts
          <ExternalLink size={14} />
        </Link>
      </div>
    </Card>
  )
}
