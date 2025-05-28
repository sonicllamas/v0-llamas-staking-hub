"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Clock, Key, Shield, Activity, RefreshCw, Eye, EyeOff } from "lucide-react"

export interface APIValidationResult {
  isValid: boolean
  status: "valid" | "invalid" | "error" | "unconfigured"
  message: string
  details: {
    hasCredentials: boolean
    apiKeyFormat: boolean
    secretKeyFormat: boolean
    passphraseFormat: boolean
    projectIdFormat: boolean
    authenticationTest: boolean
    permissionsTest: boolean
    rateLimitStatus: string
    responseTime: number
    lastChecked: string
    environmentStatus?: {
      apiKey: boolean
      secretKey: boolean
      passphrase: boolean
      projectId: boolean
    }
  }
  errors: string[]
  warnings: string[]
  recommendations: string[]
}

export default function ValidateOKXAPIPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [validationResult, setValidationResult] = useState<APIValidationResult | null>(null)
  const [showCredentials, setShowCredentials] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFullValidation = async () => {
    setIsLoading(true)
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/validate-okx?type=full")
      const result = await response.json()

      clearInterval(progressInterval)
      setProgress(100)
      setValidationResult(result)
    } catch (error: any) {
      setValidationResult({
        isValid: false,
        status: "error",
        message: "Validation failed",
        details: {
          hasCredentials: false,
          apiKeyFormat: false,
          secretKeyFormat: false,
          passphraseFormat: false,
          projectIdFormat: false,
          authenticationTest: false,
          permissionsTest: false,
          rateLimitStatus: "Error",
          responseTime: 0,
          lastChecked: new Date().toISOString(),
        },
        errors: [error.message],
        warnings: [],
        recommendations: [],
      })
    } finally {
      setIsLoading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const handleQuickValidation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/validate-okx?type=quick")
      const result = await response.json()

      // Convert quick result to full result format for display
      setValidationResult({
        isValid: result.isValid,
        status: result.isValid ? "valid" : "invalid",
        message: result.message,
        details: {
          hasCredentials: true,
          apiKeyFormat: true,
          secretKeyFormat: true,
          passphraseFormat: true,
          projectIdFormat: true,
          authenticationTest: result.isValid,
          permissionsTest: result.isValid,
          rateLimitStatus: "Quick check - not tested",
          responseTime: 0,
          lastChecked: new Date().toISOString(),
        },
        errors: result.isValid ? [] : [result.message],
        warnings: [],
        recommendations: result.isValid ? [] : ["Run full validation for detailed analysis"],
      })
    } catch (error: any) {
      setValidationResult({
        isValid: false,
        status: "error",
        message: "Quick validation failed",
        details: {
          hasCredentials: false,
          apiKeyFormat: false,
          secretKeyFormat: false,
          passphraseFormat: false,
          projectIdFormat: false,
          authenticationTest: false,
          permissionsTest: false,
          rateLimitStatus: "Error",
          responseTime: 0,
          lastChecked: new Date().toISOString(),
        },
        errors: [error.message],
        warnings: [],
        recommendations: [],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "text-green-600 border-green-200 bg-green-50"
      case "invalid":
        return "text-red-600 border-red-200 bg-red-50"
      case "error":
        return "text-orange-600 border-orange-200 bg-orange-50"
      case "unconfigured":
        return "text-gray-600 border-gray-200 bg-gray-50"
      default:
        return "text-gray-600 border-gray-200 bg-gray-50"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "invalid":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "unconfigured":
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const maskCredential = (credential: string) => {
    if (!credential || credential.length < 8) return "Not configured"
    return credential.substring(0, 4) + "..." + credential.substring(credential.length - 4)
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">OKX API Validation</h1>
        <p className="text-muted-foreground">Check if your OKX API keys are valid and active</p>
      </div>

      {/* Progress Bar */}
      {isLoading && progress > 0 && (
        <div className="max-w-2xl mx-auto">
          <Progress value={progress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground mt-2">Validating API credentials... {progress}%</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button onClick={handleQuickValidation} disabled={isLoading} variant="outline">
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Activity className="mr-2 h-4 w-4" />
              Quick Check
            </>
          )}
        </Button>

        <Button onClick={handleFullValidation} disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Full Validation
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {validationResult && (
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card className={getStatusColor(validationResult.status)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(validationResult.status)}
                    {validationResult.message}
                  </CardTitle>
                  <CardDescription>
                    Last checked: {new Date(validationResult.details.lastChecked).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {validationResult.details.authenticationTest ? "✅" : "❌"}
                      </div>
                      <div className="text-sm text-muted-foreground">Authentication</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{validationResult.details.permissionsTest ? "✅" : "❌"}</div>
                      <div className="text-sm text-muted-foreground">Permissions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{validationResult.details.responseTime}ms</div>
                      <div className="text-sm text-muted-foreground">Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{validationResult.errors.length}</div>
                      <div className="text-sm text-muted-foreground">Errors</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Errors */}
              {validationResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Errors Found</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Warnings */}
              {validationResult.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warnings</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Recommendations */}
              {validationResult.recommendations.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Recommendations</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="credentials" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      API Credentials Status
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setShowCredentials(!showCredentials)}>
                      {showCredentials ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <span>API Key Format</span>
                      <Badge variant={validationResult.details.apiKeyFormat ? "default" : "destructive"}>
                        {validationResult.details.apiKeyFormat ? "Valid" : "Invalid"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Secret Key Format</span>
                      <Badge variant={validationResult.details.secretKeyFormat ? "default" : "destructive"}>
                        {validationResult.details.secretKeyFormat ? "Valid" : "Invalid"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Passphrase Format</span>
                      <Badge variant={validationResult.details.passphraseFormat ? "default" : "destructive"}>
                        {validationResult.details.passphraseFormat ? "Valid" : "Invalid"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Project ID Format</span>
                      <Badge variant={validationResult.details.projectIdFormat ? "default" : "secondary"}>
                        {validationResult.details.projectIdFormat ? "Valid" : "Warning"}
                      </Badge>
                    </div>
                  </div>

                  {/* Environment Variables Status */}
                  {validationResult.details.environmentStatus && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-3">Environment Variables Status</h4>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">OKX_API_KEY</span>
                          <Badge
                            variant={validationResult.details.environmentStatus.apiKey ? "default" : "destructive"}
                          >
                            {validationResult.details.environmentStatus.apiKey ? "✅ Configured" : "❌ Missing"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">OKX_SECRET_KEY</span>
                          <Badge
                            variant={validationResult.details.environmentStatus.secretKey ? "default" : "destructive"}
                          >
                            {validationResult.details.environmentStatus.secretKey ? "✅ Configured" : "❌ Missing"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">OKX_API_PASSPHRASE</span>
                          <Badge
                            variant={validationResult.details.environmentStatus.passphrase ? "default" : "destructive"}
                          >
                            {validationResult.details.environmentStatus.passphrase ? "✅ Configured" : "❌ Missing"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">OKX_PROJECT_ID</span>
                          <Badge
                            variant={validationResult.details.environmentStatus.projectId ? "default" : "destructive"}
                          >
                            {validationResult.details.environmentStatus.projectId ? "✅ Configured" : "❌ Missing"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {showCredentials && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-2">
                      <div className="text-sm">
                        <strong>Note:</strong> Credentials are securely stored on the server and cannot be displayed for
                        security reasons.
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Permissions Test</CardTitle>
                  <CardDescription>Testing access to different OKX API endpoints</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>DEX Aggregator Access</span>
                      <Badge variant={validationResult.details.permissionsTest ? "default" : "destructive"}>
                        {validationResult.details.permissionsTest ? "Granted" : "Denied"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Quote Generation</span>
                      <Badge variant={validationResult.details.authenticationTest ? "default" : "destructive"}>
                        {validationResult.details.authenticationTest ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rate Limit Status</span>
                      <span className="text-sm text-muted-foreground">{validationResult.details.rateLimitStatus}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="diagnostics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Diagnostic Information</CardTitle>
                  <CardDescription>Technical details about the validation process</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium">Response Time</div>
                        <div className="text-2xl font-bold">{validationResult.details.responseTime}ms</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Status</div>
                        <div className="text-2xl font-bold capitalize">{validationResult.status}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Validation Checklist</div>
                      <div className="space-y-1">
                        {[
                          { name: "Credentials Configured", status: validationResult.details.hasCredentials },
                          { name: "API Key Format", status: validationResult.details.apiKeyFormat },
                          { name: "Secret Key Format", status: validationResult.details.secretKeyFormat },
                          { name: "Passphrase Format", status: validationResult.details.passphraseFormat },
                          { name: "Authentication Test", status: validationResult.details.authenticationTest },
                          { name: "Permissions Test", status: validationResult.details.permissionsTest },
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {item.status ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
