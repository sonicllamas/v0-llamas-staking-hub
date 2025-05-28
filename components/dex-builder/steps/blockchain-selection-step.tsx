"use client"

import { Label } from "@/components/ui/label"

import { Checkbox } from "@/components/ui/checkbox"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, DollarSign, Users, Shield, Code, TrendingUp, CheckCircle2, ArrowRight, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { DEXProject } from "../dex-development-dashboard"

interface BlockchainSelectionStepProps {
  project: DEXProject
  onComplete: () => void
  onUpdate: (updates: Partial<DEXProject>) => void
}

const BLOCKCHAIN_OPTIONS = [
  {
    id: "sonic",
    name: "Sonic Mainnet",
    symbol: "S",
    type: "Layer 1",
    gasPrice: "$0.001",
    tps: "10,000+",
    tvl: "$50M",
    ecosystem: "Growing",
    devTools: "Good",
    pros: ["Ultra-low gas fees", "High throughput", "EVM compatible", "Growing ecosystem", "Fast finality"],
    cons: ["Newer network", "Smaller ecosystem", "Limited DeFi protocols"],
    score: 85,
    recommended: true,
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    type: "Layer 1",
    gasPrice: "$15-50",
    tps: "15",
    tvl: "$25B",
    ecosystem: "Mature",
    devTools: "Excellent",
    pros: ["Largest ecosystem", "Most liquidity", "Battle-tested", "Best dev tools", "Network effects"],
    cons: ["High gas fees", "Low throughput", "Congestion issues"],
    score: 75,
    recommended: false,
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    type: "Layer 2",
    gasPrice: "$0.01",
    tps: "7,000",
    tvl: "$1.2B",
    ecosystem: "Mature",
    devTools: "Excellent",
    pros: ["Low gas fees", "Ethereum compatibility", "Strong ecosystem", "Good liquidity", "Proven scaling"],
    cons: ["Centralization concerns", "Bridge dependencies", "Less innovation"],
    score: 80,
    recommended: false,
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    symbol: "ARB",
    type: "Layer 2",
    gasPrice: "$0.50",
    tps: "4,000",
    tvl: "$2.8B",
    ecosystem: "Growing",
    devTools: "Excellent",
    pros: ["True Ethereum L2", "Growing ecosystem", "Lower fees than ETH", "Optimistic rollups", "Strong security"],
    cons: ["Still expensive", "Withdrawal delays", "Complexity"],
    score: 78,
    recommended: false,
  },
  {
    id: "bsc",
    name: "BNB Chain",
    symbol: "BNB",
    type: "Layer 1",
    gasPrice: "$0.20",
    tps: "2,000",
    tvl: "$3.5B",
    ecosystem: "Mature",
    devTools: "Good",
    pros: ["Low fees", "Fast transactions", "Large user base", "Binance backing", "DeFi ecosystem"],
    cons: ["Centralized", "Less innovation", "Regulatory risks"],
    score: 70,
    recommended: false,
  },
]

const PROTOCOL_MODELS = [
  {
    id: "uniswap-v2",
    name: "Uniswap V2 Fork",
    description: "Classic AMM with constant product formula",
    complexity: "Low",
    features: ["Basic AMM", "Liquidity Pools", "Simple Swaps"],
    pros: ["Battle-tested", "Simple to implement", "Well documented"],
    cons: ["Capital inefficient", "Impermanent loss", "Limited features"],
    developmentTime: "2-4 weeks",
    recommended: true,
  },
  {
    id: "uniswap-v3",
    name: "Uniswap V3 Fork",
    description: "Concentrated liquidity AMM",
    complexity: "High",
    features: ["Concentrated Liquidity", "Multiple Fee Tiers", "Range Orders"],
    pros: ["Capital efficient", "Lower slippage", "Advanced features"],
    cons: ["Complex implementation", "Higher gas costs", "LP complexity"],
    developmentTime: "8-12 weeks",
    recommended: false,
  },
  {
    id: "curve",
    name: "Curve-style AMM",
    description: "Optimized for stablecoins and similar assets",
    complexity: "Medium",
    features: ["Stable Swaps", "Low Slippage", "Yield Optimization"],
    pros: ["Great for stables", "Low slippage", "Yield features"],
    cons: ["Limited to similar assets", "Complex math", "Niche market"],
    developmentTime: "4-6 weeks",
    recommended: false,
  },
  {
    id: "balancer",
    name: "Balancer-style AMM",
    description: "Multi-token pools with custom weights",
    complexity: "High",
    features: ["Multi-token Pools", "Custom Weights", "Portfolio Management"],
    pros: ["Flexible pools", "Portfolio rebalancing", "Unique features"],
    cons: ["Complex implementation", "Higher gas", "Limited adoption"],
    developmentTime: "6-10 weeks",
    recommended: false,
  },
  {
    id: "orderbook",
    name: "Order Book DEX",
    description: "Traditional order book with on-chain settlement",
    complexity: "Expert",
    features: ["Limit Orders", "Market Orders", "Advanced Trading"],
    pros: ["Familiar UX", "Price discovery", "Advanced orders"],
    cons: ["High gas costs", "Complex implementation", "Liquidity challenges"],
    developmentTime: "12-16 weeks",
    recommended: false,
  },
]

export function BlockchainSelectionStep({ project, onComplete, onUpdate }: BlockchainSelectionStepProps) {
  const [selectedBlockchain, setSelectedBlockchain] = useState("sonic")
  const [selectedProtocol, setSelectedProtocol] = useState("uniswap-v2")
  const [analysisComplete, setAnalysisComplete] = useState(false)

  const getBlockchainById = (id: string) => {
    return BLOCKCHAIN_OPTIONS.find((b) => b.id === id)
  }

  const getProtocolById = (id: string) => {
    return PROTOCOL_MODELS.find((p) => p.id === id)
  }

  const selectedBlockchainData = getBlockchainById(selectedBlockchain)
  const selectedProtocolData = getProtocolById(selectedProtocol)

  const calculateCompatibilityScore = () => {
    let score = 0

    // Blockchain scoring
    if (selectedBlockchain === "sonic")
      score += 30 // Best for new DEX
    else if (selectedBlockchain === "polygon") score += 25
    else if (selectedBlockchain === "arbitrum") score += 20
    else if (selectedBlockchain === "ethereum") score += 15
    else score += 10

    // Protocol scoring
    if (selectedProtocol === "uniswap-v2")
      score += 25 // Easiest to implement
    else if (selectedProtocol === "curve") score += 20
    else if (selectedProtocol === "balancer") score += 15
    else if (selectedProtocol === "uniswap-v3") score += 10
    else score += 5

    // Bonus for recommended combinations
    if (selectedBlockchain === "sonic" && selectedProtocol === "uniswap-v2") score += 15

    return Math.min(score, 100)
  }

  const getEstimatedCosts = () => {
    const blockchain = getBlockchainById(selectedBlockchain)
    const protocol = getProtocolById(selectedProtocol)

    if (!blockchain || !protocol) return { deployment: 0, monthly: 0 }

    let deploymentCost = 500 // Base cost
    let monthlyCost = 100 // Base monthly

    // Blockchain cost factors
    if (selectedBlockchain === "ethereum") {
      deploymentCost += 2000
      monthlyCost += 500
    } else if (selectedBlockchain === "arbitrum") {
      deploymentCost += 800
      monthlyCost += 200
    } else if (selectedBlockchain === "polygon") {
      deploymentCost += 300
      monthlyCost += 100
    } else if (selectedBlockchain === "sonic") {
      deploymentCost += 100
      monthlyCost += 50
    }

    // Protocol complexity factors
    if (selectedProtocol === "uniswap-v3" || selectedProtocol === "orderbook") {
      deploymentCost += 1000
      monthlyCost += 200
    } else if (selectedProtocol === "balancer" || selectedProtocol === "curve") {
      deploymentCost += 500
      monthlyCost += 100
    }

    return { deployment: deploymentCost, monthly: monthlyCost }
  }

  const canComplete = () => {
    return selectedBlockchain && selectedProtocol && analysisComplete
  }

  const handleComplete = () => {
    const blockchain = getBlockchainById(selectedBlockchain)
    const protocol = getProtocolById(selectedProtocol)

    onUpdate({
      ...project,
      blockchain: selectedBlockchain,
      features: [
        ...project.features.filter((f) => !f.includes("AMM") && !f.includes("Order")),
        ...(protocol?.features || []),
      ],
    })
    onComplete()
  }

  const costs = getEstimatedCosts()
  const compatibilityScore = calculateCompatibilityScore()

  return (
    <div className="space-y-6">
      {/* Selection Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Blockchain & Protocol Selection
          </CardTitle>
          <CardDescription>Choose the optimal blockchain and protocol model for your DEX</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium">Compatibility Score</span>
              </div>
              <div className="text-2xl font-bold">{compatibilityScore}/100</div>
              <Progress value={compatibilityScore} className="mt-2" />
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Deployment Cost</span>
              </div>
              <div className="text-2xl font-bold">${costs.deployment}</div>
              <div className="text-sm text-muted-foreground">One-time</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Monthly Costs</span>
              </div>
              <div className="text-2xl font-bold">${costs.monthly}</div>
              <div className="text-sm text-muted-foreground">Ongoing</div>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="blockchain" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="blockchain">Choose Blockchain</TabsTrigger>
          <TabsTrigger value="protocol">Select Protocol</TabsTrigger>
        </TabsList>

        <TabsContent value="blockchain" className="space-y-6">
          {/* Blockchain Options */}
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Comparison</CardTitle>
              <CardDescription>Compare different blockchains based on fees, performance, and ecosystem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {BLOCKCHAIN_OPTIONS.map((blockchain) => (
                  <Card
                    key={blockchain.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedBlockchain === blockchain.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedBlockchain(blockchain.id)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{blockchain.name}</h3>
                          {blockchain.recommended && <Badge className="bg-green-500">Recommended</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{blockchain.type}</Badge>
                          <div className="text-right">
                            <div className="text-sm font-medium">{blockchain.score}/100</div>
                            <Progress value={blockchain.score} className="w-16 h-1" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Gas:</span>
                          <div className="font-medium">{blockchain.gasPrice}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">TPS:</span>
                          <div className="font-medium">{blockchain.tps}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">TVL:</span>
                          <div className="font-medium">{blockchain.tvl}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Ecosystem:</span>
                          <div className="font-medium">{blockchain.ecosystem}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-medium text-green-600 mb-1">Pros:</p>
                          <ul className="space-y-1">
                            {blockchain.pros.slice(0, 3).map((pro) => (
                              <li key={pro} className="text-muted-foreground">
                                • {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-red-600 mb-1">Cons:</p>
                          <ul className="space-y-1">
                            {blockchain.cons.slice(0, 3).map((con) => (
                              <li key={con} className="text-muted-foreground">
                                • {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {selectedBlockchain === blockchain.id && (
                        <div className="flex items-center gap-1 text-blue-600 pt-2 border-t">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm font-medium">Selected for deployment</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Details */}
          {selectedBlockchainData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Selected: {selectedBlockchainData.name}
                </CardTitle>
                <CardDescription>Detailed analysis of your chosen blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <Zap className="h-4 w-4" />
                  <AlertTitle>Why {selectedBlockchainData.name}?</AlertTitle>
                  <AlertDescription>
                    {selectedBlockchainData.id === "sonic" &&
                      "Sonic offers the perfect balance of low fees, high performance, and EVM compatibility for new DEX projects."}
                    {selectedBlockchainData.id === "ethereum" &&
                      "Ethereum provides the largest ecosystem and most liquidity, but comes with higher costs."}
                    {selectedBlockchainData.id === "polygon" &&
                      "Polygon offers Ethereum compatibility with significantly lower fees and good ecosystem support."}
                    {selectedBlockchainData.id === "arbitrum" &&
                      "Arbitrum provides true Ethereum L2 scaling with growing ecosystem and strong security."}
                    {selectedBlockchainData.id === "bsc" &&
                      "BNB Chain offers low fees and fast transactions with a large existing user base."}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Technical Specifications</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Average Gas Price:</span>
                        <span className="font-medium">{selectedBlockchainData.gasPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transactions per Second:</span>
                        <span className="font-medium">{selectedBlockchainData.tps}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Value Locked:</span>
                        <span className="font-medium">{selectedBlockchainData.tvl}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Developer Tools:</span>
                        <span className="font-medium">{selectedBlockchainData.devTools}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Ecosystem Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Ecosystem Maturity:</span>
                        <span className="font-medium">{selectedBlockchainData.ecosystem}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Network Type:</span>
                        <span className="font-medium">{selectedBlockchainData.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compatibility Score:</span>
                        <span className="font-medium">{selectedBlockchainData.score}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="protocol" className="space-y-6">
          {/* Protocol Models */}
          <Card>
            <CardHeader>
              <CardTitle>Protocol Model Selection</CardTitle>
              <CardDescription>Choose the trading mechanism that best fits your DEX strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {PROTOCOL_MODELS.map((protocol) => (
                  <Card
                    key={protocol.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedProtocol === protocol.id ? "ring-2 ring-purple-500 bg-purple-50" : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedProtocol(protocol.id)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{protocol.name}</h3>
                          {protocol.recommended && <Badge className="bg-green-500">Recommended</Badge>}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{protocol.complexity}</Badge>
                          <Badge variant="secondary">{protocol.developmentTime}</Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">{protocol.description}</p>

                      <div className="flex flex-wrap gap-1">
                        {protocol.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-medium text-green-600 mb-1">Pros:</p>
                          <ul className="space-y-1">
                            {protocol.pros.map((pro) => (
                              <li key={pro} className="text-muted-foreground">
                                • {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-red-600 mb-1">Cons:</p>
                          <ul className="space-y-1">
                            {protocol.cons.map((con) => (
                              <li key={con} className="text-muted-foreground">
                                • {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {selectedProtocol === protocol.id && (
                        <div className="flex items-center gap-1 text-purple-600 pt-2 border-t">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm font-medium">Selected protocol model</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Protocol Details */}
          {selectedProtocolData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-purple-500" />
                  Protocol: {selectedProtocolData.name}
                </CardTitle>
                <CardDescription>Implementation details and considerations</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <Code className="h-4 w-4" />
                  <AlertTitle>Implementation Overview</AlertTitle>
                  <AlertDescription>
                    {selectedProtocolData.description} - Estimated development time:{" "}
                    {selectedProtocolData.developmentTime}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Core Features</h4>
                    <div className="space-y-2">
                      {selectedProtocolData.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Development Complexity</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Complexity Level:</span>
                        <Badge
                          variant={
                            selectedProtocolData.complexity === "Low"
                              ? "default"
                              : selectedProtocolData.complexity === "Medium"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {selectedProtocolData.complexity}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Development Time:</span>
                        <span className="font-medium">{selectedProtocolData.developmentTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Smart Contracts:</span>
                        <span className="font-medium">
                          {selectedProtocolData.id === "uniswap-v2"
                            ? "3-5"
                            : selectedProtocolData.id === "uniswap-v3"
                              ? "8-12"
                              : selectedProtocolData.id === "curve"
                                ? "5-8"
                                : selectedProtocolData.id === "balancer"
                                  ? "6-10"
                                  : "10-15"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Final Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            Selection Analysis
          </CardTitle>
          <CardDescription>Review your blockchain and protocol combination</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Selected Configuration</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Blockchain:</span>
                  <span className="font-medium">{selectedBlockchainData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Protocol:</span>
                  <span className="font-medium">{selectedProtocolData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Compatibility Score:</span>
                  <span className="font-medium">{compatibilityScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Development Time:</span>
                  <span className="font-medium">{selectedProtocolData?.developmentTime}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Cost Estimation</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Deployment Cost:</span>
                  <span className="font-medium">${costs.deployment}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Operations:</span>
                  <span className="font-medium">${costs.monthly}</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual Estimate:</span>
                  <span className="font-medium">${costs.deployment + costs.monthly * 12}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="analysis-complete"
              checked={analysisComplete}
              onCheckedChange={(checked) => setAnalysisComplete(checked as boolean)}
            />
            <Label htmlFor="analysis-complete">
              I have reviewed the blockchain and protocol selection and understand the implications
            </Label>
          </div>

          {compatibilityScore < 60 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Low Compatibility Score</AlertTitle>
              <AlertDescription>
                Your current selection has a low compatibility score. Consider choosing Sonic + Uniswap V2 for optimal
                results.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Completion */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Blockchain & Protocol Selected</h3>
              <p className="text-sm text-muted-foreground">Ready to proceed to architecture design phase</p>
            </div>
            <Button onClick={handleComplete} disabled={!canComplete()}>
              Confirm Selection
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          {!canComplete() && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Complete Selection Process</AlertTitle>
              <AlertDescription>
                Choose both blockchain and protocol, then confirm you've reviewed the analysis to proceed.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
