"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle2, AlertTriangle, Wallet, ArrowRight, RefreshCw, ExternalLink } from "lucide-react"
import { useWallet } from "@/context/wallet-context"
import {
  getTokenBalances,
  getSwapQuote,
  approveToken,
  executeSwap,
  SONIC_TOKENS,
  SONIC_CHAIN_ID,
  type Token,
  type SwapQuote,
} from "@/lib/swap-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface TokenWithBalance extends Token {
  actualBalance: string
  balanceUSD: number
  hasBalance: boolean
}

export function RealBalanceTest() {
  const { toast } = useToast()
  const { address, isConnected, switchNetwork } = useWallet()

  const [tokensWithBalances, setTokensWithBalances] = useState<TokenWithBalance[]>([])
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)
  const [selectedFromToken, setSelectedFromToken] = useState<TokenWithBalance | null>(null)
  const [selectedToToken, setSelectedToToken] = useState<TokenWithBalance | null>(null)
  const [swapAmount, setSwapAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")

  // Swap state
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [isGettingQuote, setIsGettingQuote] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [swapProgress, setSwapProgress] = useState(0)
  const [txHash, setTxHash] = useState<string | null>(null)

  // Load actual token balances
  const loadRealBalances = async () => {
    if (!address || !isConnected) return

    setIsLoadingBalances(true)
    try {
      // Switch to Sonic network first
      try {
        await switchNetwork(146)
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait for network switch
      } catch (error) {
        console.warn("Network switch failed:", error)
      }

      const balances = await getTokenBalances(address, SONIC_CHAIN_ID)

      const tokensWithBalances: TokenWithBalance[] = SONIC_TOKENS.map((token) => {
        const balance = balances[token.address] || "0"
        const balanceNum = Number.parseFloat(balance)
        const balanceUSD = balanceNum * (token.price || 0)

        return {
          ...token,
          actualBalance: balance,
          balanceUSD,
          hasBalance: balanceNum > 0,
        }
      })

      setTokensWithBalances(tokensWithBalances)

      // Auto-select tokens with balances
      const tokensWithBalance = tokensWithBalances.filter((t) => t.hasBalance)
      if (tokensWithBalance.length >= 2) {
        setSelectedFromToken(tokensWithBalance[0])
        setSelectedToToken(tokensWithBalance[1])
      } else if (tokensWithBalance.length === 1) {
        setSelectedFromToken(tokensWithBalance[0])
        setSelectedToToken(
          tokensWithBalances.find((t) => !t.hasBalance && t.address !== tokensWithBalance[0].address) || null,
        )
      }

      toast({
        title: "Balances Loaded",
        description: `Found ${tokensWithBalance.length} tokens with balances`,
      })
    } catch (error) {
      console.error("Failed to load balances:", error)
      toast({
        title: "Failed to load balances",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsLoadingBalances(false)
    }
  }

  // Load balances on mount and when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      loadRealBalances()
    }
  }, [isConnected, address])

  // Update max amount when from token changes
  useEffect(() => {
    if (selectedFromToken) {
      const balance = Number.parseFloat(selectedFromToken.actualBalance)
      if (selectedFromToken.isNative) {
        // Reserve some for gas fees
        const maxSwap = Math.max(0, balance - 0.01)
        setMaxAmount(maxSwap.toFixed(6))
      } else {
        setMaxAmount(balance.toFixed(6))
      }
    }
  }, [selectedFromToken])

  // Get swap quote with real balances
  const getRealQuote = async () => {
    if (!selectedFromToken || !selectedToToken || !swapAmount || !address) return

    const amount = Number.parseFloat(swapAmount)
    const availableBalance = Number.parseFloat(selectedFromToken.actualBalance)

    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (amount > availableBalance) {
      toast({
        title: "Insufficient balance",
        description: `You only have ${availableBalance.toFixed(6)} ${selectedFromToken.symbol}`,
        variant: "destructive",
      })
      return
    }

    setIsGettingQuote(true)
    try {
      const quote = await getSwapQuote({
        fromTokenAddress: selectedFromToken.address,
        toTokenAddress: selectedToToken.address,
        amount: swapAmount,
        userWalletAddress: address,
        chainId: SONIC_CHAIN_ID,
      })

      setQuote(quote)
      toast({
        title: "Quote received",
        description: `${swapAmount} ${selectedFromToken.symbol} → ${quote?.toAmount} ${selectedToToken.symbol}`,
      })
    } catch (error) {
      console.error("Failed to get quote:", error)
      toast({
        title: "Failed to get quote",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsGettingQuote(false)
    }
  }

  // Execute real swap with actual tokens
  const executeRealSwap = async () => {
    if (!selectedFromToken || !selectedToToken || !quote || !address) return

    setSwapProgress(10)

    try {
      // Step 1: Approve token if needed (for ERC20 tokens)
      if (!selectedFromToken.isNative) {
        setIsApproving(true)
        setSwapProgress(30)

        const approvalTx = await approveToken(selectedFromToken.address, swapAmount, address, SONIC_CHAIN_ID)

        if (approvalTx) {
          toast({
            title: "Approval successful",
            description: `Approved ${selectedFromToken.symbol} spending`,
          })
        }
        setIsApproving(false)
        setSwapProgress(50)
      }

      // Step 2: Execute swap
      setIsSwapping(true)
      setSwapProgress(70)

      const swapTx = await executeSwap({
        fromTokenAddress: selectedFromToken.address,
        toTokenAddress: selectedToToken.address,
        amount: swapAmount,
        userWalletAddress: address,
        chainId: SONIC_CHAIN_ID,
      })

      setTxHash(swapTx)
      setSwapProgress(100)

      toast({
        title: "Swap successful!",
        description: `Swapped ${swapAmount} ${selectedFromToken.symbol} for ${selectedToToken.symbol}`,
      })

      // Refresh balances after swap
      setTimeout(() => {
        loadRealBalances()
        setQuote(null)
        setSwapAmount("")
        setSwapProgress(0)
      }, 3000)
    } catch (error) {
      console.error("Swap failed:", error)
      toast({
        title: "Swap failed",
        description: (error as Error).message,
        variant: "destructive",
      })
      setSwapProgress(0)
    } finally {
      setIsApproving(false)
      setIsSwapping(false)
    }
  }

  const setMaxAmountHandler = () => {
    if (maxAmount) {
      setSwapAmount(maxAmount)
    }
  }

  const hasTokensWithBalance = tokensWithBalances.some((t) => t.hasBalance)

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Your Token Balances
          </CardTitle>
          <CardDescription>Real token balances on Sonic network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {isConnected ? `Connected: ${address?.substring(0, 10)}...` : "Not connected"}
              </span>
              <Button
                onClick={loadRealBalances}
                disabled={!isConnected || isLoadingBalances}
                size="sm"
                variant="outline"
              >
                {isLoadingBalances ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
            </div>

            {!isConnected && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Wallet not connected</AlertTitle>
                <AlertDescription>Please connect your wallet to view token balances</AlertDescription>
              </Alert>
            )}

            {isConnected && tokensWithBalances.length > 0 && (
              <div className="grid gap-3">
                {tokensWithBalances.map((token) => (
                  <div key={token.address} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <img src={token.logo || "/placeholder.svg"} alt={token.symbol} className="w-8 h-8" />
                      <div>
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-sm text-muted-foreground">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{Number.parseFloat(token.actualBalance).toFixed(6)}</div>
                      <div className="text-sm text-muted-foreground">${token.balanceUSD.toFixed(2)}</div>
                      {token.hasBalance && (
                        <Badge variant="default" className="mt-1">
                          Available
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!hasTokensWithBalance && tokensWithBalances.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No token balances found</AlertTitle>
                <AlertDescription>
                  You need some tokens to test swaps. Consider getting some SONIC, USDC, or WETH on the Sonic network.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real Swap Interface */}
      {hasTokensWithBalance && (
        <Card>
          <CardHeader>
            <CardTitle>Test Real Swap</CardTitle>
            <CardDescription>Swap your actual tokens (start with small amounts)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* From Token */}
              <div className="space-y-2">
                <Label>From Token</Label>
                <Select
                  value={selectedFromToken?.address}
                  onValueChange={(value) => {
                    const token = tokensWithBalances.find((t) => t.address === value)
                    setSelectedFromToken(token || null)
                    setQuote(null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select token to swap from" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokensWithBalances
                      .filter((t) => t.hasBalance)
                      .map((token) => (
                        <SelectItem key={token.address} value={token.address}>
                          <div className="flex items-center gap-2">
                            <img src={token.logo || "/placeholder.svg"} alt={token.symbol} className="w-4 h-4" />
                            {token.symbol} ({Number.parseFloat(token.actualBalance).toFixed(4)})
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Amount</Label>
                  {selectedFromToken && (
                    <Button variant="ghost" size="sm" onClick={setMaxAmountHandler} className="h-auto p-0 text-xs">
                      Max: {maxAmount}
                    </Button>
                  )}
                </div>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={swapAmount}
                  onChange={(e) => {
                    setSwapAmount(e.target.value)
                    setQuote(null)
                  }}
                  step="0.000001"
                />
              </div>

              {/* To Token */}
              <div className="space-y-2">
                <Label>To Token</Label>
                <Select
                  value={selectedToToken?.address}
                  onValueChange={(value) => {
                    const token = tokensWithBalances.find((t) => t.address === value)
                    setSelectedToToken(token || null)
                    setQuote(null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select token to receive" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokensWithBalances
                      .filter((t) => t.address !== selectedFromToken?.address)
                      .map((token) => (
                        <SelectItem key={token.address} value={token.address}>
                          <div className="flex items-center gap-2">
                            <img src={token.logo || "/placeholder.svg"} alt={token.symbol} className="w-4 h-4" />
                            {token.symbol}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quote Display */}
              {quote && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Quote Ready</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>You pay:</span>
                      <span>
                        {swapAmount} {selectedFromToken?.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>You receive:</span>
                      <span>
                        {quote.toAmount} {selectedToToken?.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <span>
                        1 {selectedFromToken?.symbol} = {quote.exchangeRate} {selectedToToken?.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price impact:</span>
                      <span>{quote.priceImpact}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress */}
              {(isApproving || isSwapping) && (
                <div className="space-y-2">
                  <Progress value={swapProgress} />
                  <div className="text-sm text-center text-muted-foreground">
                    {isApproving && "Approving token..."}
                    {isSwapping && "Executing swap..."}
                  </div>
                </div>
              )}

              {/* Transaction Hash */}
              {txHash && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700">Swap Successful!</AlertTitle>
                  <AlertDescription className="text-green-600">
                    <div className="flex items-center gap-2 mt-2">
                      <span>Transaction:</span>
                      <a
                        href={`https://explorer.soniclabs.com/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-1"
                      >
                        {txHash.substring(0, 10)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {!quote && (
                  <Button
                    onClick={getRealQuote}
                    disabled={!selectedFromToken || !selectedToToken || !swapAmount || isGettingQuote}
                    className="w-full"
                  >
                    {isGettingQuote ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Getting Quote...
                      </>
                    ) : (
                      "Get Quote"
                    )}
                  </Button>
                )}

                {quote && !txHash && (
                  <Button onClick={executeRealSwap} disabled={isApproving || isSwapping} className="w-full">
                    {isApproving || isSwapping ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        {isApproving ? "Approving..." : "Swapping..."}
                      </>
                    ) : (
                      <>
                        Execute Swap
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}

                {txHash && (
                  <Button
                    onClick={() => {
                      setTxHash(null)
                      setQuote(null)
                      setSwapAmount("")
                      setSwapProgress(0)
                    }}
                    className="w-full"
                    variant="outline"
                  >
                    New Swap
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Test Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Need Test Tokens?</CardTitle>
          <CardDescription>Get tokens on Sonic network for testing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm">
              <p className="mb-2">To test swaps with real tokens, you'll need:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>SONIC tokens for gas fees</li>
                <li>USDC, WETH, or other tokens to swap</li>
                <li>Small amounts are sufficient for testing</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="https://bridge.soniclabs.com" target="_blank" rel="noopener noreferrer">
                  Bridge Tokens
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://explorer.soniclabs.com" target="_blank" rel="noopener noreferrer">
                  Sonic Explorer
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
