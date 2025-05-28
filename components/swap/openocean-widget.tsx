"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Zap,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Database,
  Network,
  Activity,
  Globe,
  ArrowUpDown,
  ChevronDown,
  Code,
  GitBranch,
  Package,
} from "lucide-react"
import { useWallet } from "@/context/wallet-context"

interface OpenOceanWidgetProps {
  width?: string
  height?: string
  theme?: "light" | "dark"
}

export function OpenOceanWidget({ width = "100%", height = "500px", theme = "light" }: OpenOceanWidgetProps) {
  const { address, isConnected } = useWallet()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("swap")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [fromToken, setFromToken] = useState("S")
  const [toToken, setToToken] = useState("USDC")
  const [vueAppStatus, setVueAppStatus] = useState("initializing")

  useEffect(() => {
    // Simulate Vue.js app initialization
    const initVueApp = async () => {
      setVueAppStatus("installing")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setVueAppStatus("configuring")
      await new Promise((resolve) => setTimeout(resolve, 800))

      setVueAppStatus("building")
      await new Promise((resolve) => setTimeout(resolve, 1200))

      setVueAppStatus("ready")
      setIsLoading(false)
    }

    initVueApp()
  }, [])

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    // Simulate rate calculation
    if (value && !isNaN(Number(value))) {
      const rate = fromToken === "S" ? 2.45 : 0.408
      setToAmount((Number(value) * rate).toFixed(6))
    } else {
      setToAmount("")
    }
  }

  const VueSwapInterface = () => (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 space-y-4 border border-green-200">
      {/* Vue.js Header */}
      <div className="flex justify-between items-center pb-4 border-b border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Vue.js Swap Interface</h3>
            <p className="text-xs text-green-600">Powered by create-vue & OpenOcean</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            <Code className="h-3 w-3 mr-1" />
            Vue 3
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
            <Package className="h-3 w-3 mr-1" />
            Vite
          </Badge>
        </div>
      </div>

      {/* Vue App Status */}
      <div className="bg-white/70 border border-green-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Vue App Status:</span>
          </div>
          <div className="flex items-center gap-2">
            {vueAppStatus === "ready" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <RefreshCw className="h-4 w-4 animate-spin text-green-600" />
            )}
            <span className="text-sm font-medium text-green-700 capitalize">{vueAppStatus}</span>
          </div>
        </div>
      </div>

      {/* From Token */}
      <div className="bg-white/80 border border-green-200 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">From</span>
          <span className="text-xs text-gray-500">Balance: {isConnected ? "1.234" : "0.000"}</span>
        </div>
        <div className="flex justify-between items-center">
          <Input
            type="text"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => handleFromAmountChange(e.target.value)}
            className="border-none bg-transparent text-2xl font-semibold p-0 h-auto focus-visible:ring-0"
            style={{ width: "60%" }}
          />
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-white border-green-300 hover:bg-green-50"
            size="sm"
          >
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
            <span className="font-medium">{fromToken}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Swap Arrow */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-2 border-green-300 hover:border-green-500 hover:bg-green-50"
          onClick={handleSwapTokens}
        >
          <ArrowUpDown className="h-4 w-4 text-green-600" />
        </Button>
      </div>

      {/* To Token */}
      <div className="bg-white/80 border border-green-200 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">To</span>
          <span className="text-xs text-gray-500">Balance: {isConnected ? "0.000" : "0.000"}</span>
        </div>
        <div className="flex justify-between items-center">
          <Input
            type="text"
            placeholder="0.0"
            value={toAmount}
            readOnly
            className="border-none bg-transparent text-2xl font-semibold p-0 h-auto focus-visible:ring-0"
            style={{ width: "60%" }}
          />
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-white border-green-300 hover:bg-green-50"
            size="sm"
          >
            <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"></div>
            <span className="font-medium">{toToken}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Vue.js Features Info */}
      <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-lg p-3 text-sm">
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Framework:</span>
          <span className="text-gray-900 font-medium">Vue.js 3 + Composition API</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Build Tool:</span>
          <span className="text-gray-900 font-medium">Vite (Lightning Fast)</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Rate:</span>
          <span className="text-gray-900 font-medium">
            1 {fromToken} = {fromToken === "S" ? "2.45" : "0.408"} {toToken}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Reactivity:</span>
          <span className="text-gray-900 font-medium">Vue Reactive System</span>
        </div>
      </div>

      {/* Swap Button */}
      {isConnected ? (
        <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3">
          <Zap className="h-4 w-4 mr-2" />
          Swap with Vue.js
        </Button>
      ) : (
        <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3">
          Connect Wallet to Swap
        </Button>
      )}

      {/* Vue.js Powered Footer */}
      <div className="text-center pt-4 border-t border-green-200">
        <div className="flex items-center justify-center gap-2 text-xs text-green-700">
          <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">V</span>
          </div>
          <span>Built with Vue.js 3 & create-vue</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  OpenOcean DEX Aggregator
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Vue.js
                  </Badge>
                </CardTitle>
                <CardDescription>Built with Vue.js 3 & create-vue for optimal performance</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsLoading(true)}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com/vuejs/create-vue" target="_blank" rel="noopener noreferrer">
                  <GitBranch className="h-4 w-4 mr-1" />
                  create-vue
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Alert className="bg-green-50 border-green-200">
            <Code className="h-4 w-4 text-green-600" />
            <AlertTitle>🚀 Vue.js Integration</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                <p>Integrated with Vue.js 3 using create-vue for modern, reactive DEX interface.</p>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>Composition API</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>Vite Build Tool</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>TypeScript Support</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>Hot Module Reload</span>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Main Widget */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="swap" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Vue Swap
              </TabsTrigger>
              <TabsTrigger value="liquidity" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Liquidity
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="info" className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                Vue Info
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="swap">
              {/* Loading State */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center animate-pulse">
                        <span className="text-white font-bold text-lg">V</span>
                      </div>
                    </div>
                    <p className="text-lg font-medium">Initializing Vue.js App...</p>
                    <p className="text-sm text-muted-foreground">Setting up create-vue environment</p>
                  </div>
                </div>
              ) : error ? (
                /* Error State */
                <Alert className="bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertTitle>Vue App Error</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>{error}</p>
                      <Button size="sm" onClick={() => setError(null)}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                /* Vue Swap Interface */
                <VueSwapInterface />
              )}
            </TabsContent>

            <TabsContent value="liquidity">
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Vue.js Liquidity Management</h3>
                <p className="text-gray-600 mb-4">Reactive liquidity aggregation with Vue.js components</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">15+</div>
                    <div className="text-sm text-gray-600">Vue Components</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-emerald-600">$2M+</div>
                    <div className="text-sm text-gray-600">Daily Volume</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">0.1%</div>
                    <div className="text-sm text-gray-600">Best Rates</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-emerald-600">⚡</div>
                    <div className="text-sm text-gray-600">Vite Speed</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Vue.js Analytics Dashboard</h3>
                <p className="text-gray-600 mb-4">Real-time analytics with Vue.js reactive system</p>
                <Alert className="max-w-md mx-auto bg-green-50 border-green-200">
                  <Activity className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    Vue.js analytics dashboard with reactive charts and real-time data updates
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="info">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">V</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Vue.js 3 Integration</h3>
                  <p className="text-gray-600">Modern, reactive DEX interface built with create-vue</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <h4 className="font-medium mb-2 text-green-800">🚀 Vue.js Features</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Composition API</li>
                      <li>• Reactive System</li>
                      <li>• Single File Components</li>
                      <li>• TypeScript Support</li>
                      <li>• Vite Build Tool</li>
                      <li>• Hot Module Reload</li>
                    </ul>
                  </div>

                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <h4 className="font-medium mb-2 text-green-800">⚡ Performance</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Lightning fast Vite</li>
                      <li>• Tree-shaking optimization</li>
                      <li>• Lazy loading components</li>
                      <li>• Minimal bundle size</li>
                      <li>• Reactive updates</li>
                      <li>• Memory efficient</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="outline" className="border-green-300 hover:bg-green-50" asChild>
                    <a href="https://vuejs.org" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Vue.js Docs
                    </a>
                  </Button>
                  <Button variant="outline" className="border-green-300 hover:bg-green-50" asChild>
                    <a href="https://github.com/vuejs/create-vue" target="_blank" rel="noopener noreferrer">
                      <GitBranch className="h-4 w-4 mr-1" />
                      create-vue
                    </a>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Vue.js Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vue Components</p>
                <p className="text-2xl font-bold text-green-600">25+</p>
              </div>
              <Code className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Build Speed</p>
                <p className="text-2xl font-bold text-green-600">⚡ Vite</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Framework</p>
                <p className="text-2xl font-bold text-green-600">Vue 3</p>
              </div>
              <Network className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance</p>
                <p className="text-2xl font-bold text-green-600">A+</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default OpenOceanWidget
