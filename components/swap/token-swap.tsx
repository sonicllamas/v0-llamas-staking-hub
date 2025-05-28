"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ArrowDownIcon, RefreshCw, AlertCircle, CheckCircle2, Settings } from "lucide-react"
import { useWallet } from "@/context/wallet-context"
import {
  ETHEREUM_TOKENS,
  SONIC_TOKENS,
  getSwapQuote,
  approveToken,
  executeSwap,
  getTokenBalances,
  checkNetwork,
  getProvider,
  type SwapQuote,
  type Token,
  ETHEREUM_CHAIN_ID,
  SONIC_CHAIN_ID,
  SONIC_CHAIN_ID_NUMBER,
} from "@/lib/swap-service"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function TokenSwap() {
  const { toast } = useToast()
  const { address, isConnected, switchNetwork, checkSonicNetwork, checkEthereumNetwork } = useWallet()

  // State for network selection
  const [selectedNetwork, setSelectedNetwork] = useState<string>(SONIC_CHAIN_ID)
  const [availableTokens, setAvailableTokens] = useState<Token[]>(SONIC_TOKENS)

  // Token selection state
  const [fromToken, setFromToken] = useState<Token>(availableTokens[0])
  const [toToken, setToToken] = useState<Token>(availableTokens[1])
  const [amount, setAmount] = useState<string>("100") // Default to 100 for USDC example

  // Slippage state
  const [slippage, setSlippage] = useState<number>(0.5) // Default 0.5%
  const [customSlippage, setCustomSlippage] = useState<string>("")
  const [isSlippageDialogOpen, setIsSlippageDialogOpen] = useState<boolean>(false)

  // Swap quote state
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [isLoadingQuote, setIsLoadingQuote] = useState<boolean>(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)

  // Transaction state
  const [isApproving, setIsApproving] = useState<boolean>(false)
  const [isSwapping, setIsSwapping] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [txStatus, setTxStatus] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)

  // Token balances
  const [balances, setBalances] = useState<Record<string, string>>({})
  const [isLoadingBalances, setIsLoadingBalances] = useState<boolean>(false)

  // Slippage preset options
  const slippagePresets = [0.1, 0.5, 1.0, 3.0]

  // Update available tokens when network changes
  useEffect(() => {
    if (selectedNetwork === ETHEREUM_CHAIN_ID) {
      setAvailableTokens(ETHEREUM_TOKENS)
      setFromToken(ETHEREUM_TOKENS[0])
      setToToken(ETHEREUM_TOKENS[1])
    } else {
      setAvailableTokens(SONIC_TOKENS)
      setFromToken(SONIC_TOKENS[0])
      setToToken(SONIC_TOKENS[1])
    }
    // Reset quote and transaction state
    setQuote(null)
    setQuoteError(null)
    setTxHash(null)
    setTxStatus(null)
    setProgress(0)
    // Reset balances
    setBalances({})
  }, [selectedNetwork])

  // Load token balances when address or network changes
  useEffect(() => {
    if (isConnected && address) {
      loadBalances()
    }
  }, [isConnected, address, selectedNetwork])

  // Refresh quote when slippage changes
  useEffect(() => {
    if (quote && fromToken && toToken && amount) {
      getQuote()
    }
  }, [slippage])

  // Load token balances
  const loadBalances = async () => {
    if (!address) return

    setIsLoadingBalances(true)
    try {
      const balances = await getTokenBalances(address, selectedNetwork)
      setBalances(balances)
    } catch (error) {
      console.error("Failed to load balances:", error)
      toast({
        title: "Failed to load some token balances",
        description: "Using default values for missing balances",
        variant: "warning",
      })
    } finally {
      setIsLoadingBalances(false)
    }
  }

  // Validate network before operations using ethers.js
  const validateNetworkWithEthers = async (): Promise<boolean> => {
    try {
      const provider = getProvider()
      await checkNetwork(provider)
      return true
    } catch (error) {
      toast({
        title: "Network Error",
        description: (error as Error).message,
        variant: "destructive",
      })
      return false
    }
  }

  // Get swap quote with slippage
  const getQuote = useCallback(async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to get a quote",
        variant: "destructive",
      })
      return
    }

    // Validate network first
    const isValidNetwork = await validateNetworkWithEthers()
    if (!isValidNetwork) {
      return
    }

    if (!fromToken || !toToken) {
      toast({
        title: "Invalid tokens",
        description: "Please select valid tokens",
        variant: "destructive",
      })
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    setIsLoadingQuote(true)
    setQuoteError(null)
    setQuote(null)

    try {
      const quote = await getSwapQuote({
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: amount,
        userWalletAddress: address,
        chainId: selectedNetwork,
        slippage: slippage, // Include slippage in quote request
      })

      setQuote(quote)
    } catch (error) {
      console.error("Failed to get quote:", error)
      setQuoteError((error as Error).message)
      toast({
        title: "Failed to get quote",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsLoadingQuote(false)
    }
  }, [fromToken, toToken, amount, address, isConnected, toast, selectedNetwork, slippage])

  // Handle slippage preset selection
  const handleSlippagePreset = (preset: number) => {
    setSlippage(preset)
    setCustomSlippage("")
  }

  // Handle custom slippage input
  const handleCustomSlippage = (value: string) => {
    setCustomSlippage(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0.01 && numValue <= 50) {
      setSlippage(numValue)
    }
  }

  // Get slippage warning
  const getSlippageWarning = () => {
    if (slippage < 0.1) {
      return { type: "warning", message: "Your transaction may fail due to low slippage tolerance" }
    }
    if (slippage > 5) {
      return { type: "error", message: "High slippage tolerance may result in unfavorable trades" }
    }
    return null
  }

  // Calculate minimum received with slippage
  const getMinimumReceived = () => {
    if (!quote || !quote.toAmount) return "0"
    const minReceived = Number.parseFloat(quote.toAmount) * (1 - slippage / 100)
    return minReceived.toFixed(6)
  }

  // Approve token using ethers.js
  const handleApprove = async () => {
    if (!isConnected || !address || !fromToken || !quote) return

    // Validate network first
    const isValidNetwork = await validateNetworkWithEthers()
    if (!isValidNetwork) {
      return
    }

    setIsApproving(true)
    setProgress(10)

    try {
      const txHash = await approveToken(fromToken.address, amount, address, selectedNetwork)
      setProgress(100)

      if (txHash) {
        toast({
          title: "Approval successful",
          description: `Transaction hash: ${txHash.substring(0, 10)}...`,
        })
      } else {
        toast({
          title: "Approval not needed",
          description: "You already have sufficient allowance",
        })
      }

      // Refresh quote after approval
      await getQuote()
    } catch (error) {
      console.error("Failed to approve token:", error)
      toast({
        title: "Failed to approve token",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
      setProgress(0)
    }
  }

  // Execute swap using ethers.js
  const handleSwap = async () => {
    if (!isConnected || !address || !fromToken || !toToken || !quote) return

    // Validate network first
    const isValidNetwork = await validateNetworkWithEthers()
    if (!isValidNetwork) {
      return
    }

    setIsSwapping(true)
    setTxStatus("pending")
    setProgress(10)

    try {
      const txHash = await executeSwap({
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: amount,
        userWalletAddress: address,
        chainId: selectedNetwork,
        slippage: slippage, // Include slippage in swap execution
      })

      setTxHash(txHash)
      setTxStatus("success")
      setProgress(100)

      toast({
        title: "Swap successful",
        description: `Transaction hash: ${txHash?.substring(0, 10)}...`,
      })

      // Refresh balances after swap
      await loadBalances()
    } catch (error) {
      console.error("Failed to execute swap:", error)
      setTxStatus("failed")
      toast({
        title: "Failed to execute swap",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsSwapping(false)
    }
  }

  // Swap tokens
  const swapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setQuote(null)
    setQuoteError(null)
  }

  // Switch to Sonic network
  const switchToSonic = async () => {
    try {
      await switchNetwork(SONIC_CHAIN_ID_NUMBER)
      setSelectedNetwork(SONIC_CHAIN_ID)
      toast({
        title: "Network switched",
        description: "Now using Sonic network",
      })
    } catch (error) {
      console.error("Failed to switch network:", error)
      toast({
        title: "Failed to switch network",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  // Switch to Ethereum network
  const switchToEthereum = async () => {
    try {
      await switchNetwork(1) // Ethereum chain ID
      setSelectedNetwork(ETHEREUM_CHAIN_ID)
      toast({
        title: "Network switched",
        description: "Now using Ethereum network",
      })
    } catch (error) {
      console.error("Failed to switch network:", error)
      toast({
        title: "Failed to switch network",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  // Helper function to safely get token balance
  const getTokenBalance = (token: Token): string => {
    if (!balances || !token || !token.address) return "0"
    return balances[token.address] || "0"
  }

  const slippageWarning = getSlippageWarning()

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Llamas Swap</span>
          <div className="flex items-center space-x-2">
            {/* Slippage Settings Button */}
            <Dialog open={isSlippageDialogOpen} onOpenChange={setIsSlippageDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Slippage Settings</DialogTitle>
                  <DialogDescription>Set your maximum slippage tolerance for this swap</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Current Slippage Display */}
                  <div className="text-center">
                    <div className="text-2xl font-bold">{slippage}%</div>
                    <div className="text-sm text-muted-foreground">Current Slippage</div>
                  </div>

                  {/* Preset Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {slippagePresets.map((preset) => (
                      <Button
                        key={preset}
                        variant={slippage === preset ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSlippagePreset(preset)}
                      >
                        {preset}%
                      </Button>
                    ))}
                  </div>

                  {/* Custom Slippage Input */}
                  <div className="space-y-2">
                    <Label htmlFor="custom-slippage">Custom Slippage (%)</Label>
                    <Input
                      id="custom-slippage"
                      type="number"
                      placeholder="Enter custom slippage"
                      value={customSlippage}
                      onChange={(e) => handleCustomSlippage(e.target.value)}
                      min="0.01"
                      max="50"
                      step="0.01"
                    />
                  </div>

                  {/* Slippage Warning */}
                  {slippageWarning && (
                    <Alert variant={slippageWarning.type === "error" ? "destructive" : "default"}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{slippageWarning.message}</AlertDescription>
                    </Alert>
                  )}

                  {/* Info */}
                  <div className="text-xs text-muted-foreground">
                    <p>• Low slippage may cause transaction failures</p>
                    <p>• High slippage may result in unfavorable trades</p>
                    <p>• Recommended: 0.1% - 1.0% for most trades</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Network Buttons */}
            <Button
              variant={selectedNetwork === ETHEREUM_CHAIN_ID ? "default" : "outline"}
              size="sm"
              onClick={switchToEthereum}
            >
              Ethereum
            </Button>
            <Button
              variant={selectedNetwork === SONIC_CHAIN_ID ? "default" : "outline"}
              size="sm"
              onClick={switchToSonic}
            >
              Sonic
            </Button>
          </div>
        </CardTitle>
        <CardDescription>Swap tokens across networks with real-time quotes • Slippage: {slippage}%</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* From Token */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="from-token">From</Label>
              {isConnected && (
                <span className="text-sm text-muted-foreground">
                  Balance:{" "}
                  {isLoadingBalances ? (
                    <Skeleton className="h-4 w-16 inline-block" />
                  ) : (
                    Number.parseFloat(getTokenBalance(fromToken)).toFixed(6)
                  )}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <Select
                value={fromToken?.address}
                onValueChange={(value) => {
                  const token = availableTokens.find((t) => t.address === value)
                  if (token) {
                    setFromToken(token)
                    if (token.address === toToken.address) {
                      // Avoid same token selection
                      const otherToken = availableTokens.find((t) => t.address !== value)
                      if (otherToken) setToToken(otherToken)
                    }
                    setQuote(null)
                    setQuoteError(null)
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {availableTokens.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      <div className="flex items-center">
                        <img src={token.logo || "/placeholder.svg"} alt={token.symbol} className="w-5 h-5 mr-2" />
                        {token.symbol}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="from-amount"
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setQuote(null)
                  setQuoteError(null)
                }}
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={swapTokens}
              disabled={isLoadingQuote || isApproving || isSwapping}
            >
              <ArrowDownIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="to-token">To</Label>
              {isConnected && (
                <span className="text-sm text-muted-foreground">
                  Balance:{" "}
                  {isLoadingBalances ? (
                    <Skeleton className="h-4 w-16 inline-block" />
                  ) : (
                    Number.parseFloat(getTokenBalance(toToken)).toFixed(6)
                  )}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <Select
                value={toToken?.address}
                onValueChange={(value) => {
                  const token = availableTokens.find((t) => t.address === value)
                  if (token) {
                    setToToken(token)
                    if (token.address === fromToken.address) {
                      // Avoid same token selection
                      const otherToken = availableTokens.find((t) => t.address !== value)
                      if (otherToken) setFromToken(otherToken)
                    }
                    setQuote(null)
                    setQuoteError(null)
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {availableTokens.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      <div className="flex items-center">
                        <img src={token.logo || "/placeholder.svg"} alt={token.symbol} className="w-5 h-5 mr-2" />
                        {token.symbol}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="to-amount"
                type="number"
                placeholder="0.0"
                value={quote?.toAmount || ""}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          {/* Quote Information */}
          {isLoadingQuote && (
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                <span>Getting best quote...</span>
              </div>
            </div>
          )}

          {quoteError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{quoteError}</AlertDescription>
            </Alert>
          )}

          {quote && !isLoadingQuote && !quoteError && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span>
                  1 {fromToken.symbol} = {quote.exchangeRate} {toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minimum received</span>
                <span>
                  {getMinimumReceived()} {toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slippage tolerance</span>
                <span
                  className={
                    slippageWarning?.type === "error"
                      ? "text-red-500"
                      : slippageWarning?.type === "warning"
                        ? "text-yellow-500"
                        : ""
                  }
                >
                  {slippage}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price impact</span>
                <span>{quote.priceImpact}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network fee</span>
                <span>
                  {quote.gasEstimate} {selectedNetwork === ETHEREUM_CHAIN_ID ? "ETH" : "SONIC"}
                </span>
              </div>

              {/* Add payment fee information */}
              {quote.paymentFee && quote.paymentFee.enabled && (
                <>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform fee ({quote.paymentFee.feePercentage}%)</span>
                      <span className="text-orange-600 font-medium">
                        {quote.paymentFee.feeAmount} {fromToken.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Fee receiver</span>
                      <span className="text-muted-foreground font-mono">
                        {quote.paymentFee.receiverAddress.slice(0, 6)}...{quote.paymentFee.receiverAddress.slice(-4)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Transaction Status */}
          {(isApproving || isSwapping || txStatus) && (
            <div className="space-y-2">
              {(isApproving || isSwapping) && <Progress value={progress} className="h-2" />}

              {txStatus === "pending" && (
                <Alert>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <AlertTitle>Transaction Pending</AlertTitle>
                  <AlertDescription>Your transaction is being processed. Please wait...</AlertDescription>
                </Alert>
              )}

              {txStatus === "success" && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700">Transaction Successful</AlertTitle>
                  <AlertDescription className="text-green-600">
                    Your swap has been completed successfully!
                    {txHash && (
                      <div className="mt-2">
                        <a
                          href={`https://sonicscan.org/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          View on Explorer
                        </a>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {txStatus === "failed" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Transaction Failed</AlertTitle>
                  <AlertDescription>Your transaction has failed. Please try again.</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {!isConnected ? (
          <Button className="w-full" disabled={isConnected} onClick={() => {}}>
            Connect Wallet
          </Button>
        ) : (
          <>
            {quote && quote.paymentFee && quote.paymentFee.enabled && (
              <Alert className="bg-orange-50 border-orange-200">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <AlertTitle className="text-orange-700">Platform Fee Notice</AlertTitle>
                <AlertDescription className="text-orange-600">
                  A {quote.paymentFee.feePercentage}% platform fee ({quote.paymentFee.feeAmount} {fromToken.symbol})
                  will be collected to support the platform.
                </AlertDescription>
              </Alert>
            )}

            {!quote && !isLoadingQuote && (
              <Button
                className="w-full"
                onClick={getQuote}
                disabled={!fromToken || !toToken || !amount || Number.parseFloat(amount) <= 0 || isLoadingQuote}
              >
                Get Quote
              </Button>
            )}

            {quote && !isApproving && !isSwapping && !txStatus && !fromToken.isNative && (
              <Button className="w-full" onClick={handleApprove} disabled={isApproving}>
                Approve {fromToken.symbol}
              </Button>
            )}

            {quote && !isSwapping && !txStatus && (fromToken.isNative || isApproving === false) && (
              <Button className="w-full" onClick={handleSwap} disabled={isSwapping}>
                Swap
              </Button>
            )}

            {(txStatus === "success" || txStatus === "failed") && (
              <Button
                className="w-full"
                onClick={() => {
                  setTxStatus(null)
                  setTxHash(null)
                  setQuote(null)
                  setQuoteError(null)
                  setProgress(0)
                }}
              >
                New Swap
              </Button>
            )}
          </>
        )}

        <div className="text-xs text-center text-muted-foreground">Powered by OKX DEX API</div>
      </CardFooter>
    </Card>
  )
}
