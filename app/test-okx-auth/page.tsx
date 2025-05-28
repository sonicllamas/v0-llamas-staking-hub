"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, Key, Globe, Code } from "lucide-react"
import {
  testOKXAuthentication,
  testSignatureGeneration,
  testMultipleEndpoints,
  type AuthTestResult,
} from "@/lib/okx-auth-test"

export default function TestOKXAuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [authResult, setAuthResult] = useState<AuthTestResult | null>(null)
  const [signatureResult, setSignatureResult] = useState<AuthTestResult | null>(null)
  const [endpointResults, setEndpointResults] = useState<AuthTestResult[]>([])

  const handleTestAuth = async () => {
    setIsLoading(true)
    try {
      const result = await testOKXAuthentication()
      setAuthResult(result)
    } catch (error: any) {
      setAuthResult({
        success: false,
        message: "Test failed",
        error: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestSignature = () => {
    const result = testSignatureGeneration()
    setSignatureResult(result)
  }

  const handleTestEndpoints = async () => {
    setIsLoading(true)
    try {
      const results = await testMultipleEndpoints()
      setEndpointResults(results)
    } catch (error: any) {
      setEndpointResults([
        {
          success: false,
          message: "Endpoint tests failed",
          error: error.message,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const StatusIcon = ({ success }: { success: boolean }) =>
    success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">OKX Authentication Test</h1>
        <p className="text-muted-foreground">Test the new OKX Web3 API authentication method</p>
      </div>

      <Tabs defaultValue="auth" className="max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="auth" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Authentication
          </TabsTrigger>
          <TabsTrigger value="signature" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Signature
          </TabsTrigger>
          <TabsTrigger value="endpoints" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Endpoints
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live API Authentication Test</CardTitle>
              <CardDescription>Test OKX Web3 API authentication with a real DEX quote request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Test Endpoint</p>
                  <p className="text-sm text-muted-foreground">/api/v5/dex/aggregator/quote</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Test Pair</p>
                  <p className="text-sm text-muted-foreground">SONIC → USDC (1 SONIC)</p>
                </div>
              </div>

              <Button onClick={handleTestAuth} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Testing Authentication...
                  </>
                ) : (
                  "Test OKX API Authentication"
                )}
              </Button>

              {authResult && (
                <Card className={authResult.success ? "border-green-200" : "border-red-200"}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <StatusIcon success={authResult.success} />
                      {authResult.message}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {authResult.success && authResult.details && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Badge variant="default">Status: {authResult.details.status}</Badge>
                        </div>
                        <div>
                          <Badge variant="default">Code: {authResult.details.responseCode}</Badge>
                        </div>
                      </div>
                    )}

                    {authResult.error && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-red-800 text-sm font-medium">Error:</p>
                        <p className="text-red-700 text-sm">{authResult.error}</p>
                      </div>
                    )}

                    {authResult.details && (
                      <div>
                        <p className="text-sm font-medium mb-2">Response Details:</p>
                        <Textarea
                          value={JSON.stringify(authResult.details, null, 2)}
                          readOnly
                          className="min-h-[200px] font-mono text-xs"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signature" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Signature Generation Test</CardTitle>
              <CardDescription>Test the HMAC-SHA256 signature generation process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleTestSignature} className="w-full">
                Test Signature Generation
              </Button>

              {signatureResult && (
                <Card className={signatureResult.success ? "border-green-200" : "border-red-200"}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <StatusIcon success={signatureResult.success} />
                      {signatureResult.message}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {signatureResult.details && (
                      <Textarea
                        value={JSON.stringify(signatureResult.details, null, 2)}
                        readOnly
                        className="min-h-[300px] font-mono text-xs"
                      />
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Multiple Endpoints Test</CardTitle>
              <CardDescription>Test authentication across different OKX API endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleTestEndpoints} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Testing Endpoints...
                  </>
                ) : (
                  "Test Multiple Endpoints"
                )}
              </Button>

              {endpointResults.length > 0 && (
                <div className="space-y-3">
                  {endpointResults.map((result, index) => (
                    <Card key={index} className={result.success ? "border-green-200" : "border-red-200"}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <StatusIcon success={result.success} />
                            <span className="font-medium">{result.message}</span>
                          </div>
                          {result.details?.status && (
                            <Badge variant={result.success ? "default" : "destructive"}>{result.details.status}</Badge>
                          )}
                        </div>
                        {result.error && <p className="text-red-600 text-sm mt-2">{result.error}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
