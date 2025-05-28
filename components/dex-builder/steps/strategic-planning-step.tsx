"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Target, DollarSign, Coins, Vote, TrendingUp, Shield, ArrowRight, Calculator } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { DEXProject } from "../dex-development-dashboard"

interface StrategicPlanningStepProps {
  project: DEXProject
  onComplete: () => void
  onUpdate: (updates: Partial<DEXProject>) => void
}

const REVENUE_MODELS = [
  {
    id: "trading-fees",
    name: "Trading Fees",
    description: "Charge a percentage fee on each trade",
    typical: "0.1% - 0.3%",
    pros: ["Predictable revenue", "Scales with volume"],
    cons: ["May deter high-frequency traders"],
  },
  {
    id: "listing-fees",
    name: "Listing Fees",
    description: "Charge projects to list their tokens",
    typical: "$5K - $50K",
    pros: ["Upfront revenue", "Quality control"],
    cons: ["May limit token diversity"],
  },
  {
    id: "premium-features",
    name: "Premium Features",
    description: "Subscription for advanced tools and analytics",
    typical: "$10 - $100/month",
    pros: ["Recurring revenue", "User stickiness"],
    cons: ["Requires valuable features"],
  },
  {
    id: "yield-farming",
    name: "Yield Farming Fees",
    description: "Take a cut from yield farming rewards",
    typical: "5% - 15%",
    pros: ["Incentivizes liquidity", "High margins"],
    cons: ["Complex to implement"],
  },
]

const GOVERNANCE_MODELS = [
  {
    id: "token-voting",
    name: "Token-Based Voting",
    description: "Governance token holders vote on proposals",
    complexity: "Medium",
    decentralization: "High",
  },
  {
    id: "delegated",
    name: "Delegated Governance",
    description: "Users delegate voting power to representatives",
    complexity: "High",
    decentralization: "Medium",
  },
  {
    id: "council",
    name: "Council Governance",
    description: "Elected council makes decisions",
    complexity: "Low",
    decentralization: "Low",
  },
  {
    id: "hybrid",
    name: "Hybrid Model",
    description: "Combination of token voting and council",
    complexity: "High",
    decentralization: "Medium",
  },
]

export function StrategicPlanningStep({ project, onComplete, onUpdate }: StrategicPlanningStepProps) {
  const [strategy, setStrategy] = useState({
    businessModel: "",
    revenueStreams: [] as string[],
    governanceModel: "",
    tokenomics: {
      hasToken: false,
      tokenName: "",
      tokenSymbol: "",
      totalSupply: 1000000000,
      distribution: {
        team: 20,
        community: 40,
        treasury: 25,
        liquidity: 15,
      },
    },
    liquidityStrategy: "",
    competitiveAdvantage: "",
    riskMitigation: "",
    timeline: {
      mvp: 3,
      beta: 6,
      mainnet: 9,
    },
    budget: {
      development: 200000,
      marketing: 100000,
      operations: 50000,
      audits: 75000,
    },
  })

  const handleRevenueStreamToggle = (stream: string) => {
    const current = strategy.revenueStreams
    if (current.includes(stream)) {
      setStrategy({
        ...strategy,
        revenueStreams: current.filter((s) => s !== stream),
      })
    } else {
      setStrategy({
        ...strategy,
        revenueStreams: [...current, stream],
      })
    }
  }

  const updateTokenDistribution = (key: string, value: number) => {
    const newDistribution = { ...strategy.tokenomics.distribution, [key]: value }
    const total = Object.values(newDistribution).reduce((sum, val) => sum + val, 0)

    if (total <= 100) {
      setStrategy({
        ...strategy,
        tokenomics: {
          ...strategy.tokenomics,
          distribution: newDistribution,
        },
      })
    }
  }

  const getTotalDistribution = () => {
    return Object.values(strategy.tokenomics.distribution).reduce((sum, val) => sum + val, 0)
  }

  const getTotalBudget = () => {
    return Object.values(strategy.budget).reduce((sum, val) => sum + val, 0)
  }

  const canComplete = () => {
    return (
      strategy.businessModel &&
      strategy.revenueStreams.length > 0 &&
      strategy.governanceModel &&
      strategy.liquidityStrategy &&
      strategy.competitiveAdvantage &&
      (!strategy.tokenomics.hasToken || (strategy.tokenomics.tokenName && strategy.tokenomics.tokenSymbol))
    )
  }

  const handleComplete = () => {
    onUpdate({
      ...project,
      budget: getTotalBudget(),
      features: [
        ...project.features,
        ...(strategy.tokenomics.hasToken ? ["Governance Token"] : []),
        ...(strategy.revenueStreams.includes("yield-farming") ? ["Yield Farming"] : []),
        ...(strategy.revenueStreams.includes("premium-features") ? ["Premium Features"] : []),
      ],
    })
    onComplete()
  }

  return (
    <div className="space-y-6">
      {/* Business Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Business Model & Strategy
          </CardTitle>
          <CardDescription>Define your DEX's core business model and competitive strategy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-model">Business Model</Label>
            <Select
              value={strategy.businessModel}
              onValueChange={(value) => setStrategy({ ...strategy, businessModel: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your business model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amm">Automated Market Maker (AMM)</SelectItem>
                <SelectItem value="orderbook">Order Book DEX</SelectItem>
                <SelectItem value="hybrid">Hybrid AMM + Order Book</SelectItem>
                <SelectItem value="aggregator">DEX Aggregator</SelectItem>
                <SelectItem value="specialized">Specialized Trading (Options, Futures)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Competitive Advantage</Label>
            <Textarea
              placeholder="What makes your DEX unique? (e.g., lower fees, better UX, cross-chain, advanced features)"
              value={strategy.competitiveAdvantage}
              onChange={(e) => setStrategy({ ...strategy, competitiveAdvantage: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Revenue Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Revenue Strategy
          </CardTitle>
          <CardDescription>Choose how your DEX will generate revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REVENUE_MODELS.map((model) => (
              <Card
                key={model.id}
                className={`p-4 cursor-pointer transition-all ${
                  strategy.revenueStreams.includes(model.id) ? "ring-2 ring-green-500 bg-green-50" : "hover:shadow-md"
                }`}
                onClick={() => handleRevenueStreamToggle(model.id)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{model.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {model.typical}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{model.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="font-medium text-green-600">Pros:</p>
                      <ul className="space-y-1">
                        {model.pros.map((pro) => (
                          <li key={pro}>• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-red-600">Cons:</p>
                      <ul className="space-y-1">
                        {model.cons.map((con) => (
                          <li key={con}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tokenomics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Tokenomics Design
          </CardTitle>
          <CardDescription>Design your governance token and distribution model</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-token"
              checked={strategy.tokenomics.hasToken}
              onCheckedChange={(checked) =>
                setStrategy({
                  ...strategy,
                  tokenomics: { ...strategy.tokenomics, hasToken: checked as boolean },
                })
              }
            />
            <Label htmlFor="has-token">Issue a governance token</Label>
          </div>

          {strategy.tokenomics.hasToken && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="token-name">Token Name</Label>
                  <Input
                    id="token-name"
                    placeholder="e.g., LlamaSwap Token"
                    value={strategy.tokenomics.tokenName}
                    onChange={(e) =>
                      setStrategy({
                        ...strategy,
                        tokenomics: { ...strategy.tokenomics, tokenName: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token-symbol">Token Symbol</Label>
                  <Input
                    id="token-symbol"
                    placeholder="e.g., LST"
                    value={strategy.tokenomics.tokenSymbol}
                    onChange={(e) =>
                      setStrategy({
                        ...strategy,
                        tokenomics: { ...strategy.tokenomics, tokenSymbol: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total-supply">Total Supply</Label>
                  <Input
                    id="total-supply"
                    type="number"
                    value={strategy.tokenomics.totalSupply}
                    onChange={(e) =>
                      setStrategy({
                        ...strategy,
                        tokenomics: { ...strategy.tokenomics, totalSupply: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Token Distribution</Label>
                  <Badge variant={getTotalDistribution() === 100 ? "default" : "destructive"}>
                    {getTotalDistribution()}% allocated
                  </Badge>
                </div>

                {Object.entries(strategy.tokenomics.distribution).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="capitalize">{key}</Label>
                      <span className="text-sm font-medium">{value}%</span>
                    </div>
                    <Slider
                      value={[value]}
                      onValueChange={(newValue) => updateTokenDistribution(key, newValue[0])}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Governance Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5 text-purple-500" />
            Governance Model
          </CardTitle>
          <CardDescription>Choose how decisions will be made in your DEX</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GOVERNANCE_MODELS.map((model) => (
              <Card
                key={model.id}
                className={`p-4 cursor-pointer transition-all ${
                  strategy.governanceModel === model.id ? "ring-2 ring-purple-500 bg-purple-50" : "hover:shadow-md"
                }`}
                onClick={() => setStrategy({ ...strategy, governanceModel: model.id })}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{model.name}</h3>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {model.complexity}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {model.decentralization}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{model.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liquidity Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Liquidity Strategy
          </CardTitle>
          <CardDescription>Plan how you'll bootstrap and maintain liquidity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Liquidity Bootstrapping Plan</Label>
            <Textarea
              placeholder="How will you attract initial liquidity? (e.g., liquidity mining, partnerships, seed funding)"
              value={strategy.liquidityStrategy}
              onChange={(e) => setStrategy({ ...strategy, liquidityStrategy: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Timeline & Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-red-500" />
            Timeline & Budget Planning
          </CardTitle>
          <CardDescription>Set realistic timelines and budget allocations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Development Timeline (months)</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mvp-timeline">MVP Launch</Label>
                <Input
                  id="mvp-timeline"
                  type="number"
                  value={strategy.timeline.mvp}
                  onChange={(e) =>
                    setStrategy({
                      ...strategy,
                      timeline: { ...strategy.timeline, mvp: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="beta-timeline">Beta Release</Label>
                <Input
                  id="beta-timeline"
                  type="number"
                  value={strategy.timeline.beta}
                  onChange={(e) =>
                    setStrategy({
                      ...strategy,
                      timeline: { ...strategy.timeline, beta: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mainnet-timeline">Mainnet Launch</Label>
                <Input
                  id="mainnet-timeline"
                  type="number"
                  value={strategy.timeline.mainnet}
                  onChange={(e) =>
                    setStrategy({
                      ...strategy,
                      timeline: { ...strategy.timeline, mainnet: Number(e.target.value) },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Budget Allocation</Label>
              <Badge variant="outline">${getTotalBudget().toLocaleString()} total</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(strategy.budget).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`budget-${key}`} className="capitalize">
                    {key}
                  </Label>
                  <Input
                    id={`budget-${key}`}
                    type="number"
                    value={value}
                    onChange={(e) =>
                      setStrategy({
                        ...strategy,
                        budget: { ...strategy.budget, [key]: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Mitigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            Risk Mitigation
          </CardTitle>
          <CardDescription>Identify and plan for potential risks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Risk Assessment & Mitigation Plan</Label>
            <Textarea
              placeholder="What are the main risks (technical, regulatory, competitive) and how will you address them?"
              value={strategy.riskMitigation}
              onChange={(e) => setStrategy({ ...strategy, riskMitigation: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Completion */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Strategic Planning Complete</h3>
              <p className="text-sm text-muted-foreground">
                Your business strategy is ready. Proceed to blockchain selection.
              </p>
            </div>
            <Button onClick={handleComplete} disabled={!canComplete()}>
              Complete Strategy
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          {!canComplete() && (
            <Alert className="mt-4">
              <Target className="h-4 w-4" />
              <AlertTitle>Complete Required Fields</AlertTitle>
              <AlertDescription>
                Fill in business model, revenue streams, governance model, liquidity strategy, and competitive advantage
                to proceed.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
