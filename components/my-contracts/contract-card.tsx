"use client"

import { useState } from "react"
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import type { Contract } from "./my-contracts-list"
import Link from "next/link"

interface ContractCardProps {
  contract: Contract
}

export function ContractCard({ contract }: ContractCardProps) {
  const [expanded, setExpanded] = useState(false)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="bg-[#0d2416] rounded-xl overflow-hidden">
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-white text-xl font-bold">{contract.name}</h3>
            <p className="text-gray-400 text-sm">{contract.symbol}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/contracts/${contract.address}`}
              className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md text-sm transition-colors"
            >
              Manage
            </Link>
            <a
              href={`https://sonicscan.org/address/${contract.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-400 text-xs">Contract Address</p>
            <p className="text-white font-mono text-sm">{formatAddress(contract.address)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Staked NFTs</p>
            <p className="text-white text-sm">{contract.stakedCount}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Total Rewards</p>
            <p className="text-white text-sm">{contract.totalRewards}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Created</p>
            <p className="text-white text-sm">{formatDate(contract.createdAt)}</p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp size={16} />
              <span className="text-sm">Show Less</span>
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              <span className="text-sm">Show More</span>
            </>
          )}
        </button>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-xs">NFT Collection</p>
                <p className="text-white font-mono text-sm truncate">{formatAddress(contract.nftCollection)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Reward Token</p>
                <p className="text-white font-mono text-sm truncate">{formatAddress(contract.rewardToken)}</p>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="text-white bg-[#143621] hover:bg-[#1a472a] py-1 px-3 rounded-md text-sm transition-colors">
                Pause Contract
              </button>
              <button className="text-white bg-[#143621] hover:bg-[#1a472a] py-1 px-3 rounded-md text-sm transition-colors">
                Update Rewards
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
