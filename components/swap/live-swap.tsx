"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownIcon, RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const LiveSwap: React.FC = () => {
  const [fromToken, setFromToken] = useState("SONIC")
  const [toToken, setToToken] = useState("USDC")
  const [fromAmount, setFromAmount] = useState("1")
  const [toAmount, setToAmount] = useState("0.95")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const tokens = [
    { symbol: "SONIC", name: "Sonic", balance: "100.00" },
    { symbol: "USDC", name: "USD Coin", balance: "500.00" },
    { symbol: "USDT", name: "Tether", balance: "500.00" },
    { symbol: "ETH", name: "Ethereum", balance: "0.5" },
    { symbol: "WBTC", name: "Wrapped Bitcoin", balance: "0.01" },
  ]

  const handleSwap = async () => {
    setIsLoading(true)
    setError(null)
    setTxHash(null)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 80% chance of success for demo purposes
      if (Math.random() > 0.2) {
        setTxHash(
          "0x" +
            Array(64)
              .fill(0)
              .map(() => Math.floor(Math.random() * 16).toString(16))
              .join(""),
        )
      } else {
        throw new Error("Insufficient liquidity for this trade")
      }
    } catch (err: any) {
      setError(err.message || "Failed to execute swap")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    // Simple mock calculation for demo
    const numValue = Number.parseFloat(value) || 0
    setToAmount((numValue * 0.95).toFixed(6))
  }

  const swapTokens = () => {
    const tempFromToken = fromToken
    const tempToToken = toToken
    const tempFromAmount = fromAmount
    const tempToAmount = toAmount

    setFromToken(tempToToken)
    setToToken(tempFromToken)
    setFromAmount(tempToAmount)
    setToAmount(tempFromAmount)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Swap Tokens</CardTitle>
        <CardDescription>Exchange tokens at the best rates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* From Token */}
          <div className="space-y-2">
            <label className="text-sm font-medium">From</label>
            <div className="flex space-x-2">
              <Select value={fromToken} onValueChange={setFromToken}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      {token.symbol} - {token.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                className="flex-1"
                placeholder="0.0"
              />
            </div>
            <div className="text-xs text-right text-gray-500">
              Balance: {tokens.find((t) => t.symbol === fromToken)?.balance || "0"} {fromToken}
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button variant="outline" size="icon" className="rounded-full" onClick={swapTokens}>
              <ArrowDownIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <div className="flex space-x-2">
              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      {token.symbol} - {token.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="number" value={toAmount} readOnly className="flex-1 bg-gray-50" placeholder="0.0" />
            </div>
            <div className="text-xs text-right text-gray-500">
              Balance: {tokens.find((t) => t.symbol === toToken)?.balance || "0"} {toToken}
            </div>
          </div>

          {/* Price Info */}
          <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded-md">
            <div className="flex justify-between">
              <span>Rate</span>
              <span>
                1 {fromToken} ≈ {(Number.parseFloat(toAmount) / Number.parseFloat(fromAmount)).toFixed(6)} {toToken}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Fee</span>
              <span>0.3%</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Transaction Hash */}
          {txHash && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="break-all">
                Transaction submitted:{" "}
                <a
                  href={`https://sonicscan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600"
                >
                  {txHash}
                </a>
              </AlertDescription>
            </Alert>
          )}

          {/* Swap Button */}
          <Button className="w-full" onClick={handleSwap} disabled={isLoading || !fromAmount || fromAmount === "0"}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Swapping...
              </>
            ) : (
              "Swap"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default LiveSwap
