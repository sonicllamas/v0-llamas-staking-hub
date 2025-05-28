"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, BarChart3, Target, CheckCircle2, Search, ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { DEXProject } from "../dex-development-dashboard"

interface MarketResearchStepProps {
  project: DEXProject
  onComplete: () => void
  onUpdate: (updates: Partial<DEXProject>) => void
}

const COMPETITOR_ANALYSIS = [
  {
    name: "Uniswap",
    tvl: "$4.2B",
    dailyVolume: "$1.1B",
    fees: "0.3%",
    features: ["AMM", "V3 Concentrated Liquidity", "Governance", "Analytics"],
    strengths: ["First mover", "High liquidity", "Strong brand"],
    weaknesses: ["High gas fees", "Complex UI for beginners"],
  },
  {
    name: "SushiSwap",
    tvl: "$1.8B",
    dailyVolume: "$180M",
    fees: "0.25%",
    features: ["AMM", "Yield Farming", "Lending", "Cross-chain"],
    strengths: ["Multi-chain", "Innovative features", "Community driven"],
    weaknesses: ["Lower liquidity", "Complex tokenomics"],
  },
  {
    name: "PancakeSwap",
    tvl: "$2.1B",
    dailyVolume: "$320M",
    fees: "0.25%",
    features: ["AMM", "Farms", "Pools", "Lottery", "NFTs"],
    strengths: ["Low fees", "Gamification", "BSC ecosystem"],
    weaknesses: ["Centralized chain", "Limited innovation"],
  },
]

const MARKET_OPPORTUNITIES = [
  {
    title: "Cross-Chain Trading",
    description: "Seamless trading across multiple blockchains",
    potential: "High",
    difficulty: "Hard",
  },
  {
    title: "Advanced Order Types",
    description: "Limit orders, stop-loss, and conditional orders",
    potential: "Medium",
    difficulty: "Medium",
  },
  {
    title: "Institutional Features",
    description: "OTC trading, custody solutions, compliance tools",
    potential: "High",
    difficulty: "Expert",
  },
  {
    title: "Social Trading",
    description: "Copy trading, social features, and community insights",
    potential: "Medium",
    difficulty: "Medium",
  },
  {
    title: "AI-Powered Analytics",
    description: "Smart routing, predictive analytics, and automated strategies",
    potential: "High",
    difficulty: "Expert",
  },
]

export function MarketResearchStep({ project, onComplete, onUpdate }: MarketResearchStepProps) {
  const [researchData, setResearchData] = useState({
    targetMarket: "",
    uniqueValue: "",
    competitorAnalysis: "",
    marketSize: "",
    userPersonas: "",
    painPoints: "",
    opportunities: [] as string[],
    completed: false,
  })

  const [completedTasks, setCompletedTasks] = useState<string[]>([])

  const researchTasks = [
    "Analyze top 5 DEX competitors",
    "Identify target user personas",
    "Research market size and trends",
    "Define unique value proposition",
    "Identify market gaps and opportunities",
    "Survey potential users",
    "Analyze fee structures",
    "Study tokenomics models",
  ]

  const handleTaskComplete = (task: string) => {
    if (completedTasks.includes(task)) {
      setCompletedTasks(completedTasks.filter((t) => t !== task))
    } else {
      setCompletedTasks([...completedTasks, task])
    }
  }

  const handleOpportunityToggle = (opportunity: string) => {
    const current = researchData.opportunities
    if (current.includes(opportunity)) {
      setResearchData({
        ...researchData,
        opportunities: current.filter((o) => o !== opportunity),
      })
    } else {
      setResearchData({
        ...researchData,
        opportunities: [...current, opportunity],
      })
    }
  }

  const getProgress = () => {
    return (completedTasks.length / researchTasks.length) * 100
  }

  const canComplete = () => {
    return (
      completedTasks.length >= 6 &&
      researchData.targetMarket &&
      researchData.uniqueValue &&
      researchData.opportunities.length > 0
    )
  }

  const handleComplete = () => {
    onUpdate({
      ...project,
      description: researchData.uniqueValue || project.description,
    })
    onComplete()
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-500" />
            Market Research Progress
          </CardTitle>
          <CardDescription>Complete market analysis to understand your competitive landscape</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Research Tasks Completed</span>
              <span>
                {completedTasks.length}/{researchTasks.length}
              </span>
            </div>
            <Progress value={getProgress()} className="h-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {researchTasks.map((task) => (
                <div key={task} className="flex items-center space-x-2">
                  <Checkbox
                    id={task}
                    checked={completedTasks.includes(task)}
                    onCheckedChange={() => handleTaskComplete(task)}
                  />
                  <label htmlFor={task} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                    {task}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitor Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-500" />
            Competitor Analysis
          </CardTitle>
          <CardDescription>Study leading DEXs to understand the competitive landscape</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {COMPETITOR_ANALYSIS.map((competitor) => (
              <Card key={competitor.name} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{competitor.name}</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">TVL: {competitor.tvl}</Badge>
                      <Badge variant="outline">Vol: {competitor.dailyVolume}</Badge>
                      <Badge variant="outline">Fee: {competitor.fees}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-green-600 mb-1">Strengths</p>
                      <ul className="space-y-1">
                        {competitor.strengths.map((strength) => (
                          <li key={strength} className="text-muted-foreground">
                            • {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-red-600 mb-1">Weaknesses</p>
                      <ul className="space-y-1">
                        {competitor.weaknesses.map((weakness) => (
                          <li key={weakness} className="text-muted-foreground">
                            • {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-blue-600 mb-1">Features</p>
                      <div className="flex flex-wrap gap-1">
                        {competitor.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Market Opportunities
          </CardTitle>
          <CardDescription>Identify gaps in the market that your DEX can address</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MARKET_OPPORTUNITIES.map((opportunity) => (
              <Card
                key={opportunity.title}
                className={`p-4 cursor-pointer transition-all ${
                  researchData.opportunities.includes(opportunity.title)
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:shadow-md"
                }`}
                onClick={() => handleOpportunityToggle(opportunity.title)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{opportunity.title}</h3>
                    <div className="flex gap-1">
                      <Badge variant={opportunity.potential === "High" ? "default" : "secondary"} className="text-xs">
                        {opportunity.potential}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {opportunity.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                  {researchData.opportunities.includes(opportunity.title) && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Selected for development</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Research Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Market Research Summary
          </CardTitle>
          <CardDescription>Document your findings and define your strategy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-market">Target Market</Label>
              <Textarea
                id="target-market"
                placeholder="Describe your target users (e.g., DeFi power users, institutional traders, retail investors)"
                value={researchData.targetMarket}
                onChange={(e) => setResearchData({ ...researchData, targetMarket: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unique-value">Unique Value Proposition</Label>
              <Textarea
                id="unique-value"
                placeholder="What makes your DEX different and better than competitors?"
                value={researchData.uniqueValue}
                onChange={(e) => setResearchData({ ...researchData, uniqueValue: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pain-points">User Pain Points</Label>
            <Textarea
              id="pain-points"
              placeholder="What problems do current DEX users face that your platform will solve?"
              value={researchData.painPoints}
              onChange={(e) => setResearchData({ ...researchData, painPoints: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="market-size">Market Size Estimate</Label>
            <Input
              id="market-size"
              placeholder="e.g., $50B TAM, targeting 1% market share"
              value={researchData.marketSize}
              onChange={(e) => setResearchData({ ...researchData, marketSize: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Completion */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Ready to proceed to Strategic Planning?</h3>
              <p className="text-sm text-muted-foreground">Complete your market research to move to the next step</p>
            </div>
            <Button onClick={handleComplete} disabled={!canComplete()}>
              Complete Research
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          {!canComplete() && (
            <Alert className="mt-4">
              <Target className="h-4 w-4" />
              <AlertTitle>Complete Required Tasks</AlertTitle>
              <AlertDescription>
                Finish at least 6 research tasks, define your target market, unique value proposition, and select market
                opportunities to proceed.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
