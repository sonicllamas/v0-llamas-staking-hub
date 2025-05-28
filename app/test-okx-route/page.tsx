"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, RefreshCw, Activity, Zap, Globe } from "lucide-react"

interface OKXAPIResponse {
  success: boolean
  message: string
  data?: any
  error?: string
  credentials?: {
    configured: boolean
    apiKey: boolean
    secretKey: boolean
    passphrase: boolean
    projectId: boolean
  }
}

export default function TestOKXRoutePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<{ [key: string]: OKXAPIResponse }>({})
  const [activeTest, setActiveTest] = useState<string>("")

  const runTest = async (action: string, params?: any) => {
    setIsLoading(true)
    setActiveTest(action)

    try {
      let url = `/api/okx?action=${action}`
      let options: RequestInit = { method: "GET" }

      if (params) {
        if (action === "quote" && params.chainId) {
          // Use GET with query params for simple quote
          const queryParams = new URLSearchParams(params).toString()
          url = `/api/okx?action=${action}&${queryParams}`
        } else {
          // Use POST for complex requests
          options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, params }),
          }
        }
      }

      const response = await fetch(url, options)
      const result = await response.json()

      setResults((prev) => ({
        ...prev,
        [action]: result,
      }))
    } catch (error: any) {
      setResults((prev) => ({
        ...prev,
        [action]: {
          success: false,
          message: "Request failed",
          error: error.message,
        },
      }))
    } finally {
      setIsLoading(false)
      setActiveTest("")
    }
  }

  const getStatusColor = (success: boolean) => {
    return success ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">OKX API Route Testing</h1>
        <p className="text-muted-foreground">Test your OKX API integration with real endpoints</p>
      </div>

      {/* Test Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button
          onClick={() => runTest("test")}
          disabled={isLoading}
          variant={results.test?.success ? "default" : "outline"}
        >
          {isLoading && activeTest === "test" ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Activity className="mr-2 h-4 w-4" />
              Test Connection
            </>
          )}
        </Button>

        <Button
          onClick={() => runTest("chains")}
          disabled={isLoading}
          variant={results.chains?.success ? "default" : "outline"}
        >
          {isLoading && activeTest === "chains" ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Globe className="mr-2 h-4 w-4" />
              Get Chains
            </>
          )}
        </Button>

        <Button
          onClick={() =>
            runTest("quote", {
              chainId: "146",
              fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
              toToken: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
              amount: "1000000000000000000",
            })
          }
          disabled={isLoading}
          variant={results.quote?.success ? "default" : "outline"}
        >
          {isLoading && activeTest === "quote" ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Getting Quote...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Test Quote
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {Object.keys(results).length > 0 && (
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="test" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="test">Connection Test</TabsTrigger>
              <TabsTrigger value="chains">Supported Chains</TabsTrigger>
              <TabsTrigger value="quote">Quote Test</TabsTrigger>
            </TabsList>

            {Object.entries(results).map(([action, result]) => (
              <TabsContent key={action} value={action} className="space-y-4">
                <Card className={getStatusColor(result.success)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(result.success)}
                      {result.message}
                    </CardTitle>
                    <CardDescription>
                      Action: {action} | Status: {result.success ? "Success" : "Failed"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Credentials Status */}
                    {result.credentials && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium mb-2">Credentials Status</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">API Key</span>
                            <Badge variant={result.credentials.apiKey ? "default" : "destructive"}>
                              {result.credentials.apiKey ? "✅" : "❌"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Secret Key</span>
                            <Badge variant={result.credentials.secretKey ? "default" : "destructive"}>
                              {result.credentials.secretKey ? "✅" : "❌"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Passphrase</span>
                            <Badge variant={result.credentials.passphrase ? "default" : "destructive"}>
                              {result.credentials.passphrase ? "✅" : "❌"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Project ID</span>
                            <Badge variant={result.credentials.projectId ? "default" : "destructive"}>
                              {result.credentials.projectId ? "✅" : "❌"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {result.error && (
                      <Alert variant="destructive" className="mb-4">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{result.error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Success Data */}
                    {result.success && result.data && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Response Data:</h4>
                        <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      {/* Instructions */}
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>How to Use This Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">1. Test Connection</h4>
              <p className="text-sm text-muted-foreground">
                Tests basic API authentication and connectivity to OKX servers.
              </p>
            </div>
            <div>
              <h4 className="font-medium">2. Get Chains</h4>
              <p className="text-sm text-muted-foreground">
                Retrieves list of supported blockchain networks for DEX aggregation.
              </p>
            </div>
            <div>
              <h4 className="font-medium">3. Test Quote</h4>
              <p className="text-sm text-muted-foreground">
                Gets a real swap quote for SONIC → USDC on Sonic network (Chain ID 146).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
