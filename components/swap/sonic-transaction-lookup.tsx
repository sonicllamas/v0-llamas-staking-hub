"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  ExternalLink,
  Search,
  Copy,
  RefreshCw,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Eye,
  Calendar,
  Fuel,
  Hash,
  User,
  ArrowRight,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { sonicAPI, type SonicTransactionData } from "@/lib/sonic-api-service"

export function SonicTransactionLookup() {
  const { toast } = useToast()
  const [txHash, setTxHash] = useState("")
  const [transaction, setTransaction] = useState<SonicTransactionData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hashError, setHashError] = useState<string | null>(null)
  const [latestTxs, setLatestTxs] = useState<SonicTransactionData[]>([])
  const [loadingLatest, setLoadingLatest] = useState(false)

  // Load latest transactions on component mount
  useEffect(() => {
    loadLatestTransactions()
  }, [])

  const loadLatestTransactions = async () => {
    setLoadingLatest(true)
    try {
      const latest = await sonicAPI.getLatestTransactions(5)
      setLatestTxs(latest)
    } catch (error) {
      console.error("Failed to load latest transactions:", error)
    } finally {
      setLoadingLatest(false)
    }
  }

  const lookupTransaction = async () => {
    const trimmedHash = txHash.trim()

    // Validation
    if (!trimmedHash) {
      setError("Please enter a transaction hash")
      toast({
        title: "Empty hash",
        description: "Please enter a transaction hash",
        variant: "destructive",
      })
      return
    }

    if (!trimmedHash.startsWith("0x") || trimmedHash.length !== 66) {
      setError("Invalid transaction hash format")
      toast({
        title: "Invalid format",
        description: "Transaction hash must be 66 characters starting with 0x",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setTransaction(null)

    try {
      const txData = await sonicAPI.getTransactionByHash(trimmedHash)

      if (!txData) {
        setError("Transaction not found on Sonic network")
        toast({
          title: "Not found",
          description: "Transaction not found on Sonic network",
          variant: "destructive",
        })
      } else {
        setTransaction(txData)
        toast({
          title: "Transaction found!",
          description: `Status: ${txData.status} | ${txData.confirmations} confirmations`,
        })
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to lookup transaction"
      setError(errorMessage)
      toast({
        title: "Lookup failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const validateHashInput = (input: string) => {
    if (!input) {
      setHashError(null)
      return
    }

    if (!input.startsWith("0x")) {
      setHashError("Must start with '0x'")
      return
    }

    if (input.length > 66) {
      setHashError("Too long (max 66 characters)")
      return
    }

    if (input.length < 66 && input.length > 2) {
      setHashError(`Need ${66 - input.length} more characters`)
      return
    }

    const hexPattern = /^0x[0-9a-fA-F]*$/
    if (!hexPattern.test(input)) {
      setHashError("Invalid hex characters")
      return
    }

    setHashError(null)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Copied to clipboard",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      success: "default",
      failed: "destructive",
      pending: "secondary",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Sonic Transaction Lookup
          </CardTitle>
          <CardDescription>
            Look up real transactions on the Sonic blockchain using the official RPC API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tx-hash">Transaction Hash</Label>
            <div className="flex gap-2">
              <Input
                id="tx-hash"
                placeholder="0x..."
                value={txHash}
                onChange={(e) => {
                  setTxHash(e.target.value)
                  validateHashInput(e.target.value)
                }}
                className={`font-mono text-sm ${
                  hashError ? "border-red-500" : txHash.length === 66 ? "border-green-500" : ""
                }`}
              />
              <Button onClick={lookupTransaction} disabled={isLoading || !!hashError}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            {hashError && <p className="text-sm text-red-500">{hashError}</p>}
            <div className="text-xs text-gray-500">
              <p>📏 Length: {txHash.length}/66 characters</p>
              {txHash.length === 66 && !hashError && <p className="text-green-600">✅ Valid format</p>}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lookup Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {transaction && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(transaction.status)}
                    Transaction Details
                  </CardTitle>
                  {getStatusBadge(transaction.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      Hash:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{transaction.hash.substring(0, 20)}...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.hash)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Block:</span>
                    <span>{transaction.blockNumber.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confirmations:</span>
                    <span className="font-medium">{transaction.confirmations}</span>
                  </div>

                  {transaction.timestamp && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Time:
                      </span>
                      <span>{sonicAPI.formatTimestamp(transaction.timestamp)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      From:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{transaction.from.substring(0, 10)}...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.from)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />
                      To:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{transaction.to.substring(0, 10)}...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.to)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Value:</span>
                    <span>{transaction.value} S</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Fuel className="h-3 w-3" />
                      Gas Price:
                    </span>
                    <span>{transaction.gasPrice} Gwei</span>
                  </div>

                  {transaction.gasUsed && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gas Used:</span>
                      <span>{Number(transaction.gasUsed).toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nonce:</span>
                    <span>{transaction.nonce}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <a href={sonicAPI.getExplorerUrl(transaction.hash)} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-3 w-3 mr-2" />
                      View on Explorer
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(transaction, null, 2))}
                  >
                    Copy JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Latest Transactions Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Sonic Transactions</CardTitle>
                <Button variant="outline" size="sm" onClick={loadLatestTransactions} disabled={loadingLatest}>
                  {loadingLatest ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {latestTxs.length > 0 ? (
                <div className="space-y-2">
                  {latestTxs.map((tx) => (
                    <div
                      key={tx.hash}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => setTxHash(tx.hash)}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(tx.status)}
                        <div>
                          <div className="font-mono text-xs text-blue-600">{tx.hash.substring(0, 20)}...</div>
                          <div className="text-xs text-gray-500">Block {tx.blockNumber.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{tx.value} S</div>
                        <div className="text-xs text-gray-500">{tx.confirmations} confirmations</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  {loadingLatest ? "Loading recent transactions..." : "No recent transactions available"}
                </p>
              )}
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>How to get transaction hashes</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>• Check your wallet's transaction history</p>
              <p>• Copy from SonicScan after making a transaction</p>
              <p>• Click on any recent transaction above</p>
              <p>• Use the transaction hash returned from successful swaps</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
