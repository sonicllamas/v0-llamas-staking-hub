"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Clock, Zap, Settings, RefreshCw, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/context/wallet-context"
import { ethers } from "ethers"
import { openOceanService, SUPPORTED_CHAINS, type SwapQuoteResponse } from "@/lib/openocean-service"

// Arbitrum token configurations
const ARBITRUM_TOKENS = {
  ETH: {
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    symbol: "ETH",
    name: "Ethereum",
  },
  UNI: {
    address: "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
    decimals: 18,
    symbol: "UNI",
    name: "Uniswap",
  },
  USDC: {
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    decimals: 6,
    symbol: "USDC",
    name: "USD Coin",
  },
  WETH: {
    address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    decimals: 18,
    symbol: "WETH",
    name: "Wrapped Ethereum",
  },
  ARB: {
    address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    decimals: 18,
    symbol: "ARB",
    name: "Arbitrum",
  },
}

export function OpenOceanSDKWidget() {
  const { address, isConnected, connect, chainId, switchNetwork } = useWallet()
  const [activeTab, setActiveTab] = useState("swap")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [swapAmount, setSwapAmount] = useState("1")
  const [fromToken, setFromToken] = useState("UNI")
  const [toToken, setToToken] = useState("USDC")
  const [balances, setBalances] = useState<Record<string, string>>({})
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)
  const [currentQuote, setCurrentQuote] = useState<SwapQuoteResponse | null>(null)
  const [gasPrice, setGasPrice] = useState<string>("0.1 gwei")
  const [slippage, setSlippage] = useState(1)
  const { toast } = useToast()
  const [apiKeyStatus, setApiKeyStatus] = useState<"checking" | "valid" | "invalid">("checking")

  // Check if user is on Arbitrum network
  const isArbitrumNetwork = chainId === SUPPORTED_CHAINS.ARBITRUM

  // Load token balances when wallet connects
  useEffect(() => {
    if (isConnected && address && isArbitrumNetwork) {
      loadTokenBalances()
      loadGasPrice()
    }
  }, [isConnected, address, isArbitrumNetwork])

  // Check API key status
  useEffect(() => {
    const checkApiKey = () => {
      const apiKey = process.env.NEXT_PUBLIC_OPENOCEAN_API_KEY
      if (apiKey && apiKey.length > 10) {
        setApiKeyStatus("valid")
      } else {
        setApiKeyStatus("invalid")
      }
    }
    checkApiKey()
  }, [])

  const loadTokenBalances = async () => {
    if (!address || !window.ethereum) return

    setIsLoadingBalances(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const newBalances: Record<string, string> = {}

      for (const [symbol, token] of Object.entries(ARBITRUM_TOKENS)) {
        try {
          if (symbol === "ETH") {
            const balance = await provider.getBalance(address)
            newBalances[symbol] = ethers.formatEther(balance)
          } else {
            const tokenContract = new ethers.Contract(
              token.address,
              ["function balanceOf(address) view returns (uint256)"],
              provider,
            )
            const balance = await tokenContract.balanceOf(address)
            newBalances[symbol] = ethers.formatUnits(balance, token.decimals)
          }
        } catch (error) {
          console.error(`Error loading ${symbol} balance:`, error)
          newBalances[symbol] = "0"
        }
      }

      setBalances(newBalances)
    } catch (error) {
      console.error("Error loading balances:", error)
      toast({
        title: "Balance Load Failed",
        description: "Could not load token balances",
        variant: "destructive",
      })
    } finally {
      setIsLoadingBalances(false)
    }
  }

  const loadGasPrice = async () => {
    try {
      const formattedPrice = await openOceanService.getFormattedGasPrice(SUPPORTED_CHAINS.ARBITRUM)
      setGasPrice(formattedPrice)
    } catch (error) {
      console.error("Error loading gas price:", error)
      setGasPrice("0.1 gwei") // Fallback for Arbitrum
    }
  }

  const getSwapQuote = async () => {
    if (apiKeyStatus !== "valid") {
      toast({
        title: "API Key Required",
        description: "OpenOcean API key is not configured properly",
        variant: "destructive",
      })
      return
    }

    if (!address || !isArbitrumNetwork || !swapAmount || Number.parseFloat(swapAmount) <= 0) {
      return
    }

    setIsLoadingQuote(true)
    try {
      const fromTokenInfo = ARBITRUM_TOKENS[fromToken as keyof typeof ARBITRUM_TOKENS]
      const toTokenInfo = ARBITRUM_TOKENS[toToken as keyof typeof ARBITRUM_TOKENS]

      if (!fromTokenInfo || !toTokenInfo) {
        throw new Error("Invalid token selection")
      }

      const amount = ethers.parseUnits(swapAmount, fromTokenInfo.decimals).toString()
      const currentGasPrice = await openOceanService.getGasPrice(SUPPORTED_CHAINS.ARBITRUM)

      const quote = await openOceanService.getSwapQuote({
        chainId: SUPPORTED_CHAINS.ARBITRUM,
        inTokenAddress: fromTokenInfo.address,
        outTokenAddress: toTokenInfo.address,
        amount,
        gasPrice: currentGasPrice,
        slippage,
        account: address,
      })

      setCurrentQuote(quote)

      toast({
        title: "Live Quote Retrieved! 📊",
        description: `${ethers.formatUnits(quote.outAmount, toTokenInfo.decimals)} ${toToken} (${quote.priceImpact}% impact)`,
      })
    } catch (error: any) {
      console.error("Quote error:", error)
      if (error.message.includes("API key")) {
        setApiKeyStatus("invalid")
      }
      toast({
        title: "Quote Failed",
        description: error.message || "Could not get swap quote from OpenOcean",
        variant: "destructive",
      })
      setCurrentQuote(null)
    } finally {
      setIsLoadingQuote(false)
    }
  }

  const handleSwap = async () => {
    if (!isConnected || !isArbitrumNetwork || !currentQuote || !address) {
      toast({
        title: "Cannot Execute Swap",
        description: "Please connect wallet and get a quote first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const fromTokenInfo = ARBITRUM_TOKENS[fromToken as keyof typeof ARBITRUM_TOKENS]

      // Check token approval if not ETH
      if (fromTokenInfo.address !== "0x0000000000000000000000000000000000000000") {
        const amount = ethers.parseUnits(swapAmount, fromTokenInfo.decimals).toString()
        const needsApproval = !(await openOceanService.checkTokenApproval(
          fromTokenInfo.address,
          address,
          currentQuote.to,
          amount,
          provider,
        ))

        if (needsApproval) {
          toast({
            title: "Approval Required",
            description: `Approving ${fromToken} for trading`,
          })

          const approveTx = await openOceanService.approveToken(fromTokenInfo.address, currentQuote.to, amount, signer)

          await approveTx.wait()

          toast({
            title: "Approval Successful ✅",
            description: `${fromToken} approved for trading`,
          })
        }
      }

      // Execute the swap
      toast({
        title: "Executing Swap...",
        description: "Please confirm the transaction in your wallet",
      })

      const swapTx = await openOceanService.executeSwap(currentQuote, signer)

      toast({
        title: "Transaction Submitted 🚀",
        description: `Transaction hash: ${swapTx.hash.slice(0, 10)}...`,
      })

      // Wait for confirmation
      const receipt = await swapTx.wait()

      if (receipt?.status === 1) {
        toast({
          title: "Swap Successful! 🎉",
          description: `Swapped ${swapAmount} ${fromToken} for ${toToken}`,
        })

        // Reload balances and clear quote
        await loadTokenBalances()
        setCurrentQuote(null)
        setSwapAmount("")
      } else {
        throw new Error("Transaction failed")
      }
    } catch (error: any) {
      console.error("Swap error:", error)
      toast({
        title: "Swap Failed",
        description: error.message || "Transaction failed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const swapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setCurrentQuote(null)
  }

  const formatBalance = (balance: string, decimals = 4) => {
    const num = Number.parseFloat(balance || "0")
    return num.toFixed(decimals)
  }

  const getOutputAmount = () => {
    if (!currentQuote) return "0.0"
    const toTokenInfo = ARBITRUM_TOKENS[toToken as keyof typeof ARBITRUM_TOKENS]
    return ethers.formatUnits(currentQuote.outAmount, toTokenInfo.decimals)
  }

  return (
    <Card className="w-full bg-white border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OO</span>
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">OpenOcean SDK</CardTitle>
              <p className="text-sm text-gray-500">Real DEX Aggregator Integration</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className={`${
                apiKeyStatus === "valid"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-1 ${apiKeyStatus === "valid" ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              {apiKeyStatus === "valid" ? "API Connected" : "API Key Required"}
            </Badge>
            <Button variant="ghost" size="sm" onClick={loadGasPrice}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="swap" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Instant Swap</span>
            </TabsTrigger>
            <TabsTrigger value="limit" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Limit Order</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="swap" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">From</span>
                  <span className="text-xs text-gray-500">
                    Balance: {isLoadingBalances ? "Loading..." : `${formatBalance(balances[fromToken])} ${fromToken}`}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Input
                    type="number"
                    value={swapAmount}
                    onChange={(e) => {
                      setSwapAmount(e.target.value)
                      setCurrentQuote(null)
                    }}
                    placeholder="0.0"
                    className="flex-1 text-lg font-semibold border-0 bg-transparent p-0 focus-visible:ring-0"
                  />
                  <select
                    value={fromToken}
                    onChange={(e) => {
                      setFromToken(e.target.value)
                      setCurrentQuote(null)
                    }}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium"
                  >
                    {Object.keys(ARBITRUM_TOKENS).map((symbol) => (
                      <option key={symbol} value={symbol}>
                        {symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center">
                <Button variant="ghost" size="sm" className="rounded-full p-2" onClick={swapTokens}>
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">To</span>
                  <span className="text-xs text-gray-500">
                    Balance: {isLoadingBalances ? "Loading..." : `${formatBalance(balances[toToken])} ${toToken}`}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Input
                    type="number"
                    value={getOutputAmount()}
                    readOnly
                    className="flex-1 text-lg font-semibold border-0 bg-transparent p-0 focus-visible:ring-0"
                  />
                  <select
                    value={toToken}
                    onChange={(e) => {
                      setToToken(e.target.value)
                      setCurrentQuote(null)
                    }}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium"
                  >
                    {Object.keys(ARBITRUM_TOKENS).map((symbol) => (
                      <option key={symbol} value={symbol}>
                        {symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {currentQuote && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price Impact:</span>
                    <span className="font-medium">{currentQuote.priceImpact}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Min Received:</span>
                    <span className="font-medium">
                      {ethers.formatUnits(
                        currentQuote.minOutAmount,
                        ARBITRUM_TOKENS[toToken as keyof typeof ARBITRUM_TOKENS].decimals,
                      )}{" "}
                      {toToken}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Routes:</span>
                    <span className="font-medium">
                      {currentQuote.routes.map((route) => route.name).join(", ") || "OpenOcean"}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={getSwapQuote}
                  disabled={isLoadingQuote || !isConnected || !isArbitrumNetwork || !swapAmount}
                  variant="outline"
                  className="flex-1"
                >
                  {isLoadingQuote ? "Getting Quote..." : "Get Quote"}
                </Button>
                {!isConnected ? (
                  <Button onClick={() => connect()} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    Connect Wallet
                  </Button>
                ) : !isArbitrumNetwork ? (
                  <Button
                    onClick={() => switchNetwork(SUPPORTED_CHAINS.ARBITRUM)}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Switch to Arbitrum
                  </Button>
                ) : (
                  <Button
                    onClick={handleSwap}
                    disabled={isLoading || !currentQuote}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? "Swapping..." : "Execute Swap"}
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="limit" className="space-y-4">
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Limit Orders Coming Soon</h3>
              <p className="text-gray-500 mb-4">Advanced limit order functionality with OpenOcean SDK</p>
              <Button variant="outline" className="inline-flex items-center">
                <ExternalLink className="h-4 w-4 mr-2" />
                Learn More
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Powered by OpenOcean SDK v2.1.0</span>
            <div className="flex items-center space-x-4">
              <span>Gas: {gasPrice}</span>
              <Badge variant="secondary" className="text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Slippage: {slippage}%
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
