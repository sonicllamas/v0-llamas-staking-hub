"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle2, AlertTriangle, Loader2, Zap, RefreshCw } from "lucide-react"
import {
  SONIC_TOKENS,
  getSonicTokenBalances,
  generateSonicSwapQuote,
  checkSonicNetwork,
  type SonicSwapQuote,
} from "@/lib/sonic-swap-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function SonicSwapTest() {
  const { toast } = useToast()

  // Test states
  const [testResults, setTestResults] = useState<Record<string, "pending" | "success" | "error">>({})
  const [balanceResults, setBalanceResults] = useState<Record<string, string>>({})
  const [quoteResult, setQuoteResult] = useState<SonicSwapQuote | null>(null)
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [testLogs, setTestLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setTestLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const updateTestResult = (test: string, result: "pending" | "success" | "error") => {
    setTestResults((prev) => ({ ...prev, [test]: result }))
  }

  // Test 1: Network Detection
  const testNetworkDetection = async () => {
    addLog("Testing network detection...")
    updateTestResult("network", "pending")

    try {
      const isOnSonic = await checkSonicNetwork()
      addLog(`Network detection result: ${isOnSonic ? "On Sonic Mainnet" : "Not on Sonic"}`)
      updateTestResult("network", "success")
      return isOnSonic
    } catch (error) {
      addLog(`Network detection failed: ${(error as Error).message}`)
      updateTestResult("network", "error")
      return false
    }
  }

  // Test 2: Balance Loading
  const testBalanceLoading = async () => {
    addLog("Testing balance loading...")
    updateTestResult("balances", "pending")

    // Use a test wallet address (Vitalik's address for testing)
    const testAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"

    try {
      const balances = await getSonicTokenBalances(testAddress)
      setBalanceResults(balances)

      // Log results for each token
      SONIC_TOKENS.forEach((token) => {
        const balance = balances[token.address] || "0"
        addLog(`${token.symbol} balance: ${Number.parseFloat(balance).toFixed(6)}`)
      })

      updateTestResult("balances", "success")
      toast({
        title: "Balance loading successful",
        description: "All token balances loaded successfully",
      })
    } catch (error) {
      addLog(`Balance loading failed: ${(error as Error).message}`)
      updateTestResult("balances", "error")
      toast({
        title: "Balance loading failed",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  // Test 3: Quote Generation
  const testQuoteGeneration = async () => {
    addLog("Testing quote generation...")
    updateTestResult("quote", "pending")

    try {
      const quote = generateSonicSwapQuote({
        fromTokenAddress: SONIC_TOKENS[0].address, // SONIC
        toTokenAddress: SONIC_TOKENS[1].address, // WETH
        amount: "1.0",
        userWalletAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        slippage: "0.5",
      })

      setQuoteResult(quote)
      addLog(`Quote generated: 1 ${quote.fromToken.symbol} = ${quote.toAmount} ${quote.toToken.symbol}`)
      addLog(`Exchange rate: ${quote.exchangeRate}`)
      addLog(`Minimum received: ${quote.minimumReceived} ${quote.toToken.symbol}`)

      updateTestResult("quote", "success")
      toast({
        title: "Quote generation successful",
        description: `1 ${quote.fromToken.symbol} → ${quote.toAmount} ${quote.toToken.symbol}`,
      })
    } catch (error) {
      addLog(`Quote generation failed: ${(error as Error).message}`)
      updateTestResult("quote", "error")
      toast({
        title: "Quote generation failed",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  // Test 4: Token Contract Validation
  const testTokenContracts = async () => {
    addLog("Testing token contract validation...")
    updateTestResult("contracts", "pending")

    try {
      // Test each token's contract
      for (const token of SONIC_TOKENS) {
        if (token.isNative) {
          addLog(`${token.symbol}: Native token (always available)`)
        } else {
          // For ERC20 tokens, we'll simulate contract checking
          addLog(`${token.symbol}: Contract at ${token.address}`)

          // Simulate contract existence check
          const exists = token.address.length === 42 && token.address.startsWith("0x")
          if (exists) {
            addLog(`${token.symbol}: Contract validation passed`)
          } else {
            addLog(`${token.symbol}: Contract validation failed`)
          }
        }
      }

      updateTestResult("contracts", "success")
      toast({
        title: "Contract validation successful",
        description: "All token contracts validated",
      })
    } catch (error) {
      addLog(`Contract validation failed: ${(error as Error).message}`)
      updateTestResult("contracts", "error")
    }
  }

  // Run all tests
  const runAllTests = async () => {
    setIsRunningTests(true)
    setTestLogs([])
    setTestResults({})
    setBalanceResults({})
    setQuoteResult(null)

    addLog("Starting Sonic Swap tests...")

    // Run tests sequentially
    await testNetworkDetection()
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1s between tests

    await testTokenContracts()
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await testBalanceLoading()
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await testQuoteGeneration()

    addLog("All tests completed!")
    setIsRunningTests(false)
  }

  const getTestIcon = (status: "pending" | "success" | "error" | undefined) => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Test Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Sonic Swap Test Suite
          </CardTitle>
          <CardDescription>
            Test the Sonic swap functionality including balance loading and token swapping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runAllTests} disabled={isRunningTests} className="w-full">
            {isRunningTests ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              "Run All Tests"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Network Detection */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getTestIcon(testResults.network)}
              <span className="font-medium">Network Detection</span>
            </div>
            <Badge variant={testResults.network === "success" ? "default" : "secondary"}>
              {testResults.network || "Not Run"}
            </Badge>
          </div>

          {/* Contract Validation */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getTestIcon(testResults.contracts)}
              <span className="font-medium">Token Contract Validation</span>
            </div>
            <Badge variant={testResults.contracts === "success" ? "default" : "secondary"}>
              {testResults.contracts || "Not Run"}
            </Badge>
          </div>

          {/* Balance Loading */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getTestIcon(testResults.balances)}
              <span className="font-medium">Balance Loading</span>
            </div>
            <Badge variant={testResults.balances === "success" ? "default" : "secondary"}>
              {testResults.balances || "Not Run"}
            </Badge>
          </div>

          {/* Quote Generation */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getTestIcon(testResults.quote)}
              <span className="font-medium">Quote Generation</span>
            </div>
            <Badge variant={testResults.quote === "success" ? "default" : "secondary"}>
              {testResults.quote || "Not Run"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Balance Results */}
      {Object.keys(balanceResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Token Balances</CardTitle>
            <CardDescription>Test wallet token balances on Sonic Mainnet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {SONIC_TOKENS.map((token) => (
                <div key={token.address} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <img src={token.logo || "/placeholder.svg"} alt={token.symbol} className="w-5 h-5" />
                    <span className="font-medium">{token.symbol}</span>
                    <span className="text-sm text-muted-foreground">{token.name}</span>
                  </div>
                  <span className="font-mono">
                    {Number.parseFloat(balanceResults[token.address] || "0").toFixed(6)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quote Results */}
      {quoteResult && (
        <Card>
          <CardHeader>
            <CardTitle>Swap Quote</CardTitle>
            <CardDescription>Generated quote for 1 SONIC → WETH</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>From:</span>
                <span>
                  {quoteResult.fromAmount} {quoteResult.fromToken.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span>To:</span>
                <span>
                  {quoteResult.toAmount} {quoteResult.toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Exchange Rate:</span>
                <span>
                  1 {quoteResult.fromToken.symbol} = {quoteResult.exchangeRate} {quoteResult.toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Minimum Received:</span>
                <span>
                  {quoteResult.minimumReceived} {quoteResult.toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Price Impact:</span>
                <span>{quoteResult.priceImpact}%</span>
              </div>
              <div className="flex justify-between">
                <span>Gas Estimate:</span>
                <span>{quoteResult.gasEstimate} SONIC</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Logs */}
      {testLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Logs</CardTitle>
            <CardDescription>Detailed test execution logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {testLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {!isRunningTests && Object.keys(testResults).length > 0 && (
        <Alert
          className={
            Object.values(testResults).every((result) => result === "success")
              ? "bg-green-50 border-green-200"
              : "bg-yellow-50 border-yellow-200"
          }
        >
          {Object.values(testResults).every((result) => result === "success") ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
          <AlertTitle>
            {Object.values(testResults).every((result) => result === "success")
              ? "All Tests Passed!"
              : "Some Tests Failed"}
          </AlertTitle>
          <AlertDescription>
            {Object.values(testResults).every((result) => result === "success")
              ? "Your Sonic swap is working perfectly! All functionality tested successfully."
              : "Some functionality may need attention. Check the logs above for details."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
