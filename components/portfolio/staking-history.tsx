"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExternalLink, Search, Download, Calendar, TrendingUp, TrendingDown, Zap } from "lucide-react"
import Link from "next/link"

interface HistoryItem {
  id: string
  date: string
  type: "stake" | "unstake" | "claim" | "compound"
  contractName: string
  contractAddress: string
  nftCollection: string
  amount: string
  token: string
  nftCount?: number
  txHash: string
  status: "completed" | "pending" | "failed"
  gasUsed?: string
  value?: string
}

export function StakingHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchHistory()
  }, [])

  useEffect(() => {
    filterHistory()
  }, [history, searchTerm, typeFilter, statusFilter])

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setHistory([
        {
          id: "1",
          date: "2024-01-08T14:30:00Z",
          type: "claim",
          contractName: "Sonic Llamas Premium Pool",
          contractAddress: "0x1234...5678",
          nftCollection: "Sonic Llamas",
          amount: "23.45",
          token: "S",
          txHash: "0x1234567890abcdef1234567890abcdef12345678",
          status: "completed",
          gasUsed: "0.0012",
          value: "23.45",
        },
        {
          id: "2",
          date: "2024-01-07T09:15:00Z",
          type: "stake",
          contractName: "High Yield NFT Staking",
          contractAddress: "0x2345...6789",
          nftCollection: "Cosmic Creatures",
          amount: "2",
          token: "NFT",
          nftCount: 2,
          txHash: "0x2345678901bcdef12345678901bcdef123456789",
          status: "completed",
          gasUsed: "0.0018",
          value: "1,890.50",
        },
        {
          id: "3",
          date: "2024-01-06T16:45:00Z",
          type: "unstake",
          contractName: "Flexible Staking Pool",
          contractAddress: "0x3456...7890",
          nftCollection: "Digital Art Collection",
          amount: "1",
          token: "NFT",
          nftCount: 1,
          txHash: "0x3456789012cdef123456789012cdef1234567890",
          status: "completed",
          gasUsed: "0.0015",
          value: "450.25",
        },
        {
          id: "4",
          date: "2024-01-05T11:20:00Z",
          type: "claim",
          contractName: "Sonic Llamas Premium Pool",
          contractAddress: "0x1234...5678",
          nftCollection: "Sonic Llamas",
          amount: "34.21",
          token: "S",
          txHash: "0x4567890123def1234567890123def12345678901",
          status: "completed",
          gasUsed: "0.0011",
          value: "34.21",
        },
        {
          id: "5",
          date: "2024-01-04T13:30:00Z",
          type: "compound",
          contractName: "High Yield NFT Staking",
          contractAddress: "0x2345...6789",
          nftCollection: "Cosmic Creatures",
          amount: "12.89",
          token: "SLL",
          txHash: "0x5678901234ef12345678901234ef123456789012",
          status: "completed",
          gasUsed: "0.0014",
          value: "12.89",
        },
        {
          id: "6",
          date: "2024-01-03T08:45:00Z",
          type: "stake",
          contractName: "Flexible Staking Pool",
          contractAddress: "0x3456...7890",
          nftCollection: "Digital Art Collection",
          amount: "3",
          token: "NFT",
          nftCount: 3,
          txHash: "0x6789012345f123456789012345f1234567890123",
          status: "completed",
          gasUsed: "0.0022",
          value: "1,350.75",
        },
        {
          id: "7",
          date: "2024-01-02T15:10:00Z",
          type: "claim",
          contractName: "Legacy Pool V1",
          contractAddress: "0x4567...8901",
          nftCollection: "Retro NFTs",
          amount: "8.45",
          token: "USDC",
          txHash: "0x7890123456123456789012345612345678901234",
          status: "failed",
          gasUsed: "0.0008",
          value: "8.45",
        },
        {
          id: "8",
          date: "2024-01-01T12:00:00Z",
          type: "stake",
          contractName: "Sonic Llamas Premium Pool",
          contractAddress: "0x1234...5678",
          nftCollection: "Sonic Llamas",
          amount: "5",
          token: "NFT",
          nftCount: 5,
          txHash: "0x8901234567234567890123456723456789012345",
          status: "completed",
          gasUsed: "0.0025",
          value: "2,450.00",
        },
      ])
    } catch (error) {
      console.error("Error fetching history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterHistory = () => {
    let filtered = history

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.contractName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.nftCollection.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.txHash.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.type === typeFilter)
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    setFilteredHistory(filtered)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "stake":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "unstake":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "claim":
        return <Zap className="h-4 w-4 text-blue-600" />
      case "compound":
        return <TrendingUp className="h-4 w-4 text-purple-600" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "stake":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200">
            Stake
          </Badge>
        )
      case "unstake":
        return (
          <Badge variant="outline" className="text-red-600 border-red-200">
            Unstake
          </Badge>
        )
      case "claim":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            Claim
          </Badge>
        )
      case "compound":
        return (
          <Badge variant="outline" className="text-purple-600 border-purple-200">
            Compound
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200">
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-200">
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="text-red-600 border-red-200">
            Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const exportHistory = () => {
    const csvContent = [
      ["Date", "Type", "Contract", "Collection", "Amount", "Token", "Status", "Tx Hash"].join(","),
      ...filteredHistory.map((item) =>
        [
          formatDate(item.date),
          item.type,
          item.contractName,
          item.nftCollection,
          item.amount,
          item.token,
          item.status,
          item.txHash,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "staking-history.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Complete history of your staking activities</CardDescription>
            </div>
            <Button onClick={exportHistory} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by contract, collection, or transaction hash..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="stake">Stake</SelectItem>
                <SelectItem value="unstake">Unstake</SelectItem>
                <SelectItem value="claim">Claim</SelectItem>
                <SelectItem value="compound">Compound</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTypeIcon(item.type)}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{item.contractName}</span>
                      {getTypeBadge(item.type)}
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.nftCollection} • {formatDate(item.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {item.amount} {item.token}
                    {item.nftCount && ` (${item.nftCount} NFTs)`}
                  </p>
                  {item.value && <p className="text-sm text-muted-foreground">Value: {item.value} S</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Contract:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="font-mono">{item.contractAddress}</span>
                    <Link href={`/contracts/${item.contractAddress}`} className="text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Transaction:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="font-mono">
                      {item.txHash.substring(0, 10)}...{item.txHash.substring(item.txHash.length - 8)}
                    </span>
                    <a
                      href={`https://sonicscan.org/tx/${item.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                {item.gasUsed && (
                  <div>
                    <span className="text-muted-foreground">Gas Used:</span>
                    <p className="mt-1">{item.gasUsed} S</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No History Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                ? "No transactions match your current filters."
                : "You haven't made any staking transactions yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
