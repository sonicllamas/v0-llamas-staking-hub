"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { testOKXWithEnvVars } from "@/lib/okx-api-test"

export default function TestOKXAPIPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTestAPI = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await testOKXWithEnvVars()
      setResult(response)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">OKX API Test</h1>
        <p className="text-muted-foreground">Test OKX Web3 API authentication with proper signature generation</p>
      </div>

      <div className="grid gap-6 max-w-4xl mx-auto">
        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>API Test Configuration</CardTitle>
            <CardDescription>
              Testing OKX DEX API with the authentication method from your Node.js example
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Base URL</Label>
                <Input value="https://web3.okx.com" readOnly />
              </div>
              <div>
                <Label>Endpoint</Label>
                <Input value="/api/v5/dex/aggregator/quote" readOnly />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Chain ID</Label>
                <Input value="146 (Sonic)" readOnly />
              </div>
              <div>
                <Label>From Token</Label>
                <Input value="SONIC (Native)" readOnly />
              </div>
              <div>
                <Label>To Token</Label>
                <Input value="USDC" readOnly />
              </div>
            </div>

            <Button onClick={handleTestAPI} disabled={isLoading} className="w-full">
              {isLoading ? "Testing API..." : "Test OKX API Authentication"}
            </Button>
          </CardContent>
        </Card>

        {/* Environment Variables Status */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Check if OKX API credentials are properly configured</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <Label>OKX_API_KEY</Label>
                <Badge variant={process.env.OKX_API_KEY ? "default" : "destructive"}>
                  {process.env.OKX_API_KEY ? "Set" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <Label>OKX_SECRET_KEY</Label>
                <Badge variant={process.env.OKX_SECRET_KEY ? "default" : "destructive"}>
                  {process.env.OKX_SECRET_KEY ? "Set" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <Label>OKX_API_PASSPHRASE</Label>
                <Badge variant={process.env.OKX_API_PASSPHRASE ? "default" : "destructive"}>
                  {process.env.OKX_API_PASSPHRASE ? "Set" : "Missing"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">✅ API Test Successful</CardTitle>
              <CardDescription>OKX API authentication is working correctly</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={JSON.stringify(result, null, 2)} readOnly className="min-h-[300px] font-mono text-sm" />
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">❌ API Test Failed</CardTitle>
              <CardDescription>There was an error testing the OKX API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-red-800 font-mono text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
