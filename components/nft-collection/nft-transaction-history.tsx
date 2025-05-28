"use client"

import { useState, useEffect } from "react"
import { ScrollAnimation } from "@/components/scroll-animation"

interface Transaction {
  id: string
  type: "mint" | "transfer" | "sale" | "stake" | "unstake"
  from: string
  to: string
  price?: string
  timestamp: string
  txHash: string
}

interface NFTTransactionHistoryProps {
  collectionAddress: string
  tokenId: string
  onHistoryError?: (isError: boolean) => void
}

export function NFTTransactionHistory({ collectionAddress, tokenId, onHistoryError }: NFTTransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading transaction history
    const loadTransactions = async () => {
      setLoading(true)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock transaction data
      const mockTransactions: Transaction[] = [
        {
          id: "1",
          type: "mint",
          from: "0x0000000000000000000000000000000000000000",
          to: "0x1234567890123456789012345678901234567890",
          timestamp: "2024-01-15T10:30:00Z",
          txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        },
        {
          id: "2",
          type: "transfer",
          from: "0x1234567890123456789012345678901234567890",
          to: "0x9876543210987654321098765432109876543210",
          timestamp: "2024-01-20T14:45:00Z",
          txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        },
        {
          id: "3",
          type: "sale",
          from: "0x9876543210987654321098765432109876543210",
          to: "0x5555555555555555555555555555555555555555",
          price: "2.5 ETH",
          timestamp: "2024-01-25T09:15:00Z",
          txHash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
        },
      ]

      setTransactions(mockTransactions)
      setLoading(false)
      onHistoryError?.(true) // Indicate this is mock data
    }

    loadTransactions()
  }, [collectionAddress, tokenId, onHistoryError])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "mint":
        return "text-green-400"
      case "transfer":
        return "text-blue-400"
      case "sale":
        return "text-purple-400"
      case "stake":
        return "text-yellow-400"
      case "unstake":
        return "text-orange-400"
      default:
        return "text-gray-400"
    }
  }

  if (loading) {
    return (
      <ScrollAnimation animation="fadeInUp" delay={0.1}>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#0d2416] p-4 rounded-lg animate-pulse">
              <div className="h-4 bg-[#143621] rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-[#143621] rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-[#143621] rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </ScrollAnimation>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction, index) => (
        <ScrollAnimation key={transaction.id} animation="fadeInUp" delay={0.1 + index * 0.1}>
          <div className="bg-[#0d2416] p-4 rounded-lg border border-[#143621] hover:border-[#1a4a2a] transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className={`font-medium capitalize ${getTransactionTypeColor(transaction.type)}`}>
                {transaction.type}
              </span>
              <span className="text-xs text-gray-400">{formatDate(transaction.timestamp)}</span>
            </div>

            <div className="text-sm text-gray-300 space-y-1">
              <div>
                <span className="text-gray-400">From:</span> {formatAddress(transaction.from)}
              </div>
              <div>
                <span className="text-gray-400">To:</span> {formatAddress(transaction.to)}
              </div>
              {transaction.price && (
                <div>
                  <span className="text-gray-400">Price:</span>
                  <span className="text-green-400 font-medium ml-1">{transaction.price}</span>
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-[#143621]">
              <a
                href={`https://etherscan.io/tx/${transaction.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                View on Etherscan →
              </a>
            </div>
          </div>
        </ScrollAnimation>
      ))}
    </div>
  )
}
