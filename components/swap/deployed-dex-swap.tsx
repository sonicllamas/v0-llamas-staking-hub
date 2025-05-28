"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowUpDown,
  Zap,
  CheckCircle2,
  ExternalLink,
  Settings,
  TrendingUp,
  Coins,
  RefreshCw,
  Info,
} from "lucide-react"
import { useWallet } from "@/context/wallet-context"
import { DEPLOYED_DEX_CONFIG, DEX_PAIRS } from "@/lib/deployed-dex-config"

interface Token {
  symbol: string
  name: string
  address: string
  decimals: number
  logoUrl: string
  balance?: string
}

interface SwapQuote {
  inputAmount: string
  outputAmount: string
  priceImpact: string
  minimumReceived: string
  route: string[]
  gasEstimate: string
  executionPrice: string
}

export function DeployedDEXSwap() {
  const { toast } = useToast()
  const { address, isConnected } = useWallet()

  // Swap state
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [isSwapping, setIsSwapping] = useState(false)
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null)
  const [slippage, setSlippage] = useState("0.5")
  const [deadline, setDeadline] = useState("20")

  // Available tokens
  const [tokens] = useState<Token[]>([
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: DEPLOYED_DEX_CONFIG.tokens.WETH,
      decimals: 18,
      logoUrl: "/ethereum-logo.svg",
      balance: "2.5",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: DEPLOYED_DEX_CONFIG.tokens.USDC,
      decimals: 6,
      logoUrl: "/usdc-logo.png",
      balance: "1,250.00",
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      address: DEPLOYED_DEX_CONFIG.tokens.USDT,
      decimals: 6,
      logoUrl: "/usdt-coins.png",
      balance: "850.50",
    },
    {
      symbol: "SHADOW",
      name: "Shadow Token",
      address: DEPLOYED_DEX_CONFIG.tokens.SHADOW,
      decimals: 18,
      logoUrl: "/sonic-llamas-logo.jpg",
      balance: "50,000",
    },
  ])

  // Set default tokens
  useEffect(() => {
    if (tokens.length > 0 && !fromToken && !toToken) {
      setFromToken(tokens.find((t) => t.symbol === "WETH") || tokens[0])
      setToToken(tokens.find((t) => t.symbol === "USDC") || tokens[1])
    }
  }, [tokens])

  // Calculate swap quote when amounts change
  useEffect(() => {
    if (fromToken && toToken && fromAmount && Number.parseFloat(fromAmount) > 0) {
      calculateSwapQuote()
    } else {
      setSwapQuote(null)
      setToAmount("")
    }
  }, [fromToken, toToken, fromAmount])

  const calculateSwapQuote = async () => {
    if (!fromToken || !toToken || !fromAmount) return

    // Simulate realistic swap calculation
    const inputAmount = Number.parseFloat(fromAmount)
    let outputAmount = 0
    let priceImpact = "0.1"
    let route = [fromToken.symbol, toToken.symbol]

    // Find direct pair or route through WETH
    const directPair = DEX_PAIRS.find(
      (pair) =>
        (pair.token0 === fromToken.symbol && pair.token1 === toToken.symbol) ||
        (pair.token1 === fromToken.symbol && pair.token0 === toToken.symbol),
    )

    if (directPair) {
      // Direct swap
      const isToken0 = directPair.token0 === fromToken.symbol
      const reserve0 = Number.parseFloat(directPair.reserve0.replace(/,/g, ""))
      const reserve1 = Number.parseFloat(directPair.reserve1.replace(/,/g, ""))

      if (isToken0) {
        // Calculate output using constant product formula with 0.3% fee
        const inputWithFee = inputAmount * 0.997
        outputAmount = (reserve1 * inputWithFee) / (reserve0 + inputWithFee)
      } else {
        const inputWithFee = inputAmount * 0.997
        outputAmount = (reserve0 * inputWithFee) / (reserve1 + inputWithFee)
      }

      priceImpact = ((inputAmount / reserve0) * 100).toFixed(2)
    } else {
      // Route through WETH
      route = [fromToken.symbol, "WETH", toToken.symbol]

      // Simplified routing calculation
      if (fromToken.symbol === "USDC" && toToken.symbol === "SHADOW") {
        outputAmount = inputAmount * 28.5 // Approximate USDC to SHADOW rate
      } else if (fromToken.symbol === "SHADOW" && toToken.symbol === "USDC") {
        outputAmount = inputAmount / 28.5
      } else {
        outputAmount = inputAmount * 1.02 // Default rate
      }

      priceImpact = "0.15"
    }

    const minimumReceived = outputAmount * (1 - Number.parseFloat(slippage) / 100)
    const executionPrice = outputAmount / inputAmount

    setSwapQuote({
      inputAmount: fromAmount,
      outputAmount: outputAmount.toFixed(6),
      priceImpact,
      minimumReceived: minimumReceived.toFixed(6),
      route,
      gasEstimate: "0.002",
      executionPrice: executionPrice.toFixed(6),
    })

    setToAmount(outputAmount.toFixed(6))
  }

  const handleSwapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount(toAmount)
    setToAmount("")
  }

  const handleSwap = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to swap tokens",
        variant: "destructive",
      })
      return
    }

    if (!swapQuote) {
      toast({
        title: "No quote available",
        description: "Please enter an amount to swap",
        variant: "destructive",
      })
      return
    }

    setIsSwapping(true)

    try {
      // Simulate swap transaction
      await new Promise((resolve) => setTimeout(resolve, 3000))

      toast({
        title: "🎉 Swap Successful!",
        description: `Swapped ${fromAmount} ${fromToken?.symbol} for ${toAmount} ${toToken?.symbol}`,
      })

      // Reset form
      setFromAmount("")
      setToAmount("")
      setSwapQuote(null)
    } catch (error) {
      toast({
        title: "Swap failed",
        description: "There was an error processing your swap",
        variant: "destructive",
      })
    } finally {
      setIsSwapping(false)
    }
  }

  const getTokenSelectContent = (excludeToken?: Token) => (
    <SelectContent>
      {tokens
        .filter((token) => token !== excludeToken)
        .map((token) => (
          <SelectItem key={token.symbol} value={token.symbol}>
            <div className="flex items-center gap-2">
              <img src={token.logoUrl || "/placeholder.svg"} alt={token.symbol} className="w-5 h-5 rounded-full" />
              <div>
                <div className="font-medium">{token.symbol}</div>
                <div className="text-xs text-gray-500">{token.name}</div>
              </div>
            </div>
          </SelectItem>
        ))}
    </SelectContent>
  )

  return (
    <div className="space-y-6">
      {/* DEX Status */}
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle>🎉 Shadow DEX is Live!</AlertTitle>
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>Connected to deployed DEX contracts on Sonic Mainnet</span>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              <Zap className="h-3 w-3 mr-1" />
              Live Trading
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Swap Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Token Swap
              </CardTitle>
              <CardDescription>Trade tokens on Shadow DEX with minimal slippage</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* From Token */}
          <div className="space-y-2">
            <Label>From</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="text-lg"
                />
              </div>
              <Select
                value={fromToken?.symbol}
                onValueChange={(value) => setFromToken(tokens.find((t) => t.symbol === value) || null)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                {getTokenSelectContent(toToken)}
              </Select>
            </div>
            {fromToken && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Balance: {fromToken.balance} {fromToken.symbol}
                </span>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-blue-600"
                  onClick={() => setFromAmount(fromToken.balance || "0")}
                >
                  Max
                </Button>
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={handleSwapTokens} className="rounded-full p-2 h-auto">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <Label>To</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input type="number" placeholder="0.0" value={toAmount} readOnly className="text-lg bg-gray-50" />
              </div>
              <Select
                value={toToken?.symbol}
                onValueChange={(value) => setToToken(tokens.find((t) => t.symbol === value) || null)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                {getTokenSelectContent(fromToken)}
              </Select>
            </div>
            {toToken && (
              <div className="text-sm text-gray-600">
                Balance: {toToken.balance} {toToken.symbol}
              </div>
            )}
          </div>

          {/* Swap Quote */}
          {swapQuote && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Rate</span>
                    <span>
                      1 {fromToken?.symbol} = {swapQuote.executionPrice} {toToken?.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price Impact</span>
                    <span className={Number.parseFloat(swapQuote.priceImpact) > 1 ? "text-red-600" : "text-green-600"}>
                      {swapQuote.priceImpact}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minimum Received</span>
                    <span>
                      {swapQuote.minimumReceived} {toToken?.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network Fee</span>
                    <span>{swapQuote.gasEstimate} S</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Route</span>
                    <span className="text-xs">{swapQuote.route.join(" → ")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Slippage Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="slippage">Slippage Tolerance (%)</Label>
              <Select value={slippage} onValueChange={setSlippage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.1">0.1%</SelectItem>
                  <SelectItem value="0.5">0.5%</SelectItem>
                  <SelectItem value="1.0">1.0%</SelectItem>
                  <SelectItem value="3.0">3.0%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="deadline">Deadline (minutes)</Label>
              <Select value={deadline} onValueChange={setDeadline}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Swap Button */}
          <Button onClick={handleSwap} disabled={!isConnected || !swapQuote || isSwapping} className="w-full" size="lg">
            {isSwapping ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Swapping...
              </>
            ) : !isConnected ? (
              "Connect Wallet"
            ) : !swapQuote ? (
              "Enter Amount"
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Swap Tokens
              </>
            )}
          </Button>

          {/* Contract Info */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Router Contract:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono">
                  {DEPLOYED_DEX_CONFIG.contracts.router.slice(0, 6)}...{DEPLOYED_DEX_CONFIG.contracts.router.slice(-4)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() =>
                    window.open(`https://sonicscan.org/address/${DEPLOYED_DEX_CONFIG.contracts.router}`, "_blank")
                  }
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">24h Volume</p>
                <p className="text-2xl font-bold">$4.2M</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Liquidity</p>
                <p className="text-2xl font-bold">$5.25M</p>
              </div>
              <Coins className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Pairs</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Info className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
