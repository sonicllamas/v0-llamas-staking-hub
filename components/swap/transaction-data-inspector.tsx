"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  Search,
  Copy,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Database,
  Code,
  FileText,
  Zap,
  BarChart3,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { sonicAPI, type SonicTransactionData } from "@/lib/sonic-api-service"

export function TransactionDataInspector() {
  const { toast } = useToast()
  const [txHash, setTxHash] = useState("")
  const [rawApiResponse, setRawApiResponse] = useState<any>(null)
  const [processedData, setProcessedData] = useState<SonicTransactionData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiCalls, setApiCalls] = useState<any[]>([])

  // Sample transaction hashes for testing
  const sampleHashes = [
    {
      hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      description: "Sample Transaction (for testing format)",
      type: "sample",
    },
    {
      hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      description: "Another Sample (66 characters)",
      type: "sample",
    },
  ]

  const inspectTransaction = async () => {
    const trimmedHash = txHash.trim()

    if (!trimmedHash || trimmedHash.length !== 66 || !trimmedHash.startsWith("0x")) {
      setError("Please enter a valid 66-character transaction hash")
      return
    }

    setIsLoading(true)
    setError(null)
    setRawApiResponse(null)
    setProcessedData(null)
    setApiCalls([])

    try {
      // Track API calls
      const calls: any[] = []

      // Override fetch to capture API calls
      const originalFetch = window.fetch
      window.fetch = async (url: any, options: any) => {
        const startTime = Date.now()
        const response = await originalFetch(url, options)
        const endTime = Date.now()

        if (typeof url === "string" && url.includes("rpc.soniclabs.com")) {
          const requestBody = JSON.parse(options?.body || "{}")
          const responseClone = response.clone()
          const responseData = await responseClone.json()

          calls.push({
            method: requestBody.method,
            params: requestBody.params,
            response: responseData,
            duration: endTime - startTime,
            timestamp: new Date().toISOString(),
          })
        }

        return response
      }

      // Make the API call
      const txData = await sonicAPI.getTransactionByHash(trimmedHash)

      // Restore original fetch
      window.fetch = originalFetch

      setApiCalls(calls)
      setProcessedData(txData)

      // Create a comprehensive raw response object
      setRawApiResponse({
        transactionData: txData,
        apiCalls: calls,
        metadata: {
          totalCalls: calls.length,
          totalDuration: calls.reduce((sum, call) => sum + call.duration, 0),
          timestamp: new Date().toISOString(),
        },
      })

      if (txData) {
        toast({
          title: "Transaction data retrieved!",
          description: `Found ${calls.length} API calls with detailed data`,
        })
      } else {
        setError("Transaction not found on Sonic network")
      }
    } catch (error: any) {
      setError(error.message || "Failed to retrieve transaction data")
      toast({
        title: "API Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Data copied to clipboard",
    })
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Transaction Data Inspector
          </CardTitle>
          <CardDescription>
            Inspect detailed API responses and transaction data from the Sonic blockchain
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
                onChange={(e) => setTxHash(e.target.value)}
                className="font-mono text-sm"
              />
              <Button onClick={inspectTransaction} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Inspect
              </Button>
            </div>
            <div className="text-xs text-gray-500">Length: {txHash.length}/66 characters</div>
          </div>

          {/* Sample Hashes */}
          <div className="space-y-2">
            <Label>Sample Hashes for Testing:</Label>
            <div className="grid gap-2">
              {sampleHashes.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setTxHash(sample.hash)}
                  className="justify-start text-left h-auto p-3"
                >
                  <div>
                    <div className="font-mono text-xs text-blue-600">{sample.hash}</div>
                    <div className="text-xs text-gray-500">{sample.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {rawApiResponse && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="raw-data">Raw Data</TabsTrigger>
                <TabsTrigger value="api-calls">API Calls</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="json">Full JSON</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {processedData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(processedData.status)}
                        Transaction Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{processedData.confirmations}</div>
                          <div className="text-xs text-gray-600">Confirmations</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{processedData.value}</div>
                          <div className="text-xs text-gray-600">Value (S)</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">{processedData.gasPrice}</div>
                          <div className="text-xs text-gray-600">Gas Price (Gwei)</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{processedData.blockNumber}</div>
                          <div className="text-xs text-gray-600">Block Number</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">Status:</span>
                          <Badge variant={processedData.status === "success" ? "default" : "destructive"}>
                            {processedData.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">From:</span>
                          <span className="font-mono text-xs">{processedData.from.substring(0, 20)}...</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">To:</span>
                          <span className="font-mono text-xs">{processedData.to.substring(0, 20)}...</span>
                        </div>
                        {processedData.timestamp && (
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium">Timestamp:</span>
                            <span className="text-xs">{sonicAPI.formatTimestamp(processedData.timestamp)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="raw-data" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Raw Transaction Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {processedData && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Processed Transaction Object</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(JSON.stringify(processedData, null, 2))}
                            >
                              <Copy className="h-3 w-3 mr-2" />
                              Copy
                            </Button>
                          </div>
                          <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                            {JSON.stringify(processedData, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api-calls" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      API Call Details
                    </CardTitle>
                    <CardDescription>{apiCalls.length} API calls made to Sonic RPC</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {apiCalls.map((call, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-sm">{call.method}</CardTitle>
                              <Badge variant="outline">{call.duration}ms</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div>
                              <h5 className="text-xs font-medium text-gray-600 mb-1">Parameters:</h5>
                              <pre className="bg-gray-100 p-2 rounded text-xs">
                                {JSON.stringify(call.params, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <h5 className="text-xs font-medium text-gray-600">Response:</h5>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(JSON.stringify(call.response, null, 2))}
                                  className="h-6 text-xs"
                                >
                                  Copy
                                </Button>
                              </div>
                              <pre className="bg-gray-100 p-2 rounded text-xs max-h-32 overflow-auto">
                                {JSON.stringify(call.response, null, 2)}
                              </pre>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Data Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-800">API Performance</h4>
                          <div className="mt-2 space-y-1">
                            <div className="text-sm">Total Calls: {apiCalls.length}</div>
                            <div className="text-sm">
                              Total Time: {apiCalls.reduce((sum, call) => sum + call.duration, 0)}ms
                            </div>
                            <div className="text-sm">
                              Avg Response:{" "}
                              {apiCalls.length > 0
                                ? Math.round(apiCalls.reduce((sum, call) => sum + call.duration, 0) / apiCalls.length)
                                : 0}
                              ms
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-800">Data Quality</h4>
                          <div className="mt-2 space-y-1">
                            <div className="text-sm">
                              Response Size: {formatBytes(JSON.stringify(rawApiResponse).length)}
                            </div>
                            <div className="text-sm">
                              Fields Retrieved: {processedData ? Object.keys(processedData).length : 0}
                            </div>
                            <div className="text-sm">Status: {processedData ? "✅ Complete" : "❌ Incomplete"}</div>
                          </div>
                        </div>
                      </div>

                      {processedData && (
                        <div className="space-y-3">
                          <h4 className="font-medium">Field Analysis:</h4>
                          <div className="grid gap-2 text-sm">
                            {Object.entries(processedData).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="font-medium">{key}:</span>
                                <span className="text-gray-600">
                                  {typeof value} {Array.isArray(value) ? `(${value.length} items)` : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="json" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Complete JSON Response
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(JSON.stringify(rawApiResponse, null, 2))}
                      >
                        <Copy className="h-3 w-3 mr-2" />
                        Copy All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(rawApiResponse, null, 2)], { type: "application/json" })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement("a")
                          a.href = url
                          a.download = `sonic-tx-${txHash.substring(0, 10)}.json`
                          a.click()
                        }}
                      >
                        Download JSON
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(rawApiResponse, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
