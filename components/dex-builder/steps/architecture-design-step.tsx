"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Code, Globe, TrendingUp, Settings, CheckCircle2, AlertTriangle, Layers, Network, Server } from "lucide-react"
import type { DEXProject } from "../dex-development-dashboard"

interface ArchitectureDesignStepProps {
  project: DEXProject
  onComplete: () => void
  onUpdate: (updates: Partial<DEXProject>) => void
}

const CORE_CONTRACTS = [
  {
    id: "factory",
    name: "Factory Contract",
    description: "Creates and manages trading pairs",
    complexity: "Medium",
    estimatedLines: 200,
    dependencies: [],
    required: true,
  },
  {
    id: "router",
    name: "Router Contract",
    description: "Handles swaps and liquidity operations",
    complexity: "High",
    estimatedLines: 400,
    dependencies: ["factory"],
    required: true,
  },
  {
    id: "pair",
    name: "Pair Contract",
    description: "Individual trading pair logic",
    complexity: "High",
    estimatedLines: 350,
    dependencies: ["factory"],
    required: true,
  },
  {
    id: "governance",
    name: "Governance Contract",
    description: "Token voting and proposals",
    complexity: "Medium",
    estimatedLines: 250,
    dependencies: ["token"],
    required: false,
  },
  {
    id: "token",
    name: "Governance Token",
    description: "DEX native token with voting rights",
    complexity: "Low",
    estimatedLines: 150,
    dependencies: [],
    required: false,
  },
  {
    id: "staking",
    name: "Staking Contract",
    description: "Stake tokens for rewards",
    complexity: "Medium",
    estimatedLines: 300,
    dependencies: ["token"],
    required: false,
  },
  {
    id: "farming",
    name: "Yield Farming",
    description: "Liquidity mining rewards",
    complexity: "High",
    estimatedLines: 450,
    dependencies: ["pair", "token"],
    required: false,
  },
  {
    id: "multicall",
    name: "Multicall Contract",
    description: "Batch multiple operations",
    complexity: "Low",
    estimatedLines: 100,
    dependencies: [],
    required: false,
  },
]

const FRONTEND_COMPONENTS = [
  {
    id: "swap",
    name: "Swap Interface",
    description: "Token swapping UI",
    complexity: "Medium",
    estimatedHours: 40,
    required: true,
  },
  {
    id: "liquidity",
    name: "Liquidity Management",
    description: "Add/remove liquidity UI",
    complexity: "Medium",
    estimatedHours: 35,
    required: true,
  },
  {
    id: "pools",
    name: "Pools Explorer",
    description: "Browse and analyze pools",
    complexity: "Medium",
    estimatedHours: 30,
    required: true,
  },
  {
    id: "analytics",
    name: "Analytics Dashboard",
    description: "Trading metrics and charts",
    complexity: "High",
    estimatedHours: 60,
    required: false,
  },
  {
    id: "governance",
    name: "Governance Portal",
    description: "Voting and proposals UI",
    complexity: "High",
    estimatedHours: 50,
    required: false,
  },
  {
    id: "farming",
    name: "Farming Interface",
    description: "Yield farming UI",
    complexity: "Medium",
    estimatedHours: 45,
    required: false,
  },
  {
    id: "portfolio",
    name: "Portfolio Tracker",
    description: "User portfolio overview",
    complexity: "Medium",
    estimatedHours: 35,
    required: false,
  },
  {
    id: "bridge",
    name: "Cross-chain Bridge",
    description: "Asset bridging interface",
    complexity: "High",
    estimatedHours: 70,
    required: false,
  },
]

const BACKEND_SERVICES = [
  {
    id: "indexer",
    name: "Blockchain Indexer",
    description: "Index and cache blockchain data",
    complexity: "High",
    estimatedHours: 80,
    required: true,
  },
  {
    id: "api",
    name: "REST API",
    description: "Backend API for frontend",
    complexity: "Medium",
    estimatedHours: 60,
    required: true,
  },
  {
    id: "websocket",
    name: "WebSocket Service",
    description: "Real-time price updates",
    complexity: "Medium",
    estimatedHours: 40,
    required: false,
  },
  {
    id: "analytics",
    name: "Analytics Engine",
    description: "Process trading data",
    complexity: "High",
    estimatedHours: 70,
    required: false,
  },
  {
    id: "notifications",
    name: "Notification Service",
    description: "Email/push notifications",
    complexity: "Low",
    estimatedHours: 25,
    required: false,
  },
  {
    id: "monitoring",
    name: "Monitoring System",
    description: "System health monitoring",
    complexity: "Medium",
    estimatedHours: 45,
    required: true,
  },
]

export function ArchitectureDesignStep({ project, onComplete, onUpdate }: ArchitectureDesignStepProps) {
  const [selectedContracts, setSelectedContracts] = useState<string[]>(
    CORE_CONTRACTS.filter((c) => c.required).map((c) => c.id),
  )
  const [selectedFrontend, setSelectedFrontend] = useState<string[]>(
    FRONTEND_COMPONENTS.filter((c) => c.required).map((c) => c.id),
  )
  const [selectedBackend, setSelectedBackend] = useState<string[]>(
    BACKEND_SERVICES.filter((c) => c.required).map((c) => c.id),
  )
  const [customRequirements, setCustomRequirements] = useState("")
  const [scalabilityPlan, setScalabilityPlan] = useState("")

  const toggleContract = (contractId: string) => {
    const contract = CORE_CONTRACTS.find((c) => c.id === contractId)
    if (contract?.required) return // Can't deselect required contracts

    setSelectedContracts((prev) =>
      prev.includes(contractId) ? prev.filter((id) => id !== contractId) : [...prev, contractId],
    )
  }

  const toggleFrontend = (componentId: string) => {
    const component = FRONTEND_COMPONENTS.find((c) => c.id === componentId)
    if (component?.required) return

    setSelectedFrontend((prev) =>
      prev.includes(componentId) ? prev.filter((id) => id !== componentId) : [...prev, componentId],
    )
  }

  const toggleBackend = (serviceId: string) => {
    const service = BACKEND_SERVICES.find((s) => s.id === serviceId)
    if (service?.required) return

    setSelectedBackend((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    )
  }

  const calculateEstimates = () => {
    const contractLines = CORE_CONTRACTS.filter((c) => selectedContracts.includes(c.id)).reduce(
      (total, c) => total + c.estimatedLines,
      0,
    )

    const frontendHours = FRONTEND_COMPONENTS.filter((c) => selectedFrontend.includes(c.id)).reduce(
      (total, c) => total + c.estimatedHours,
      0,
    )

    const backendHours = BACKEND_SERVICES.filter((s) => selectedBackend.includes(s.id)).reduce(
      (total, s) => total + s.estimatedHours,
      0,
    )

    return {
      contractLines,
      frontendHours,
      backendHours,
      totalHours: frontendHours + backendHours,
      estimatedWeeks: Math.ceil((frontendHours + backendHours) / 40),
    }
  }

  const estimates = calculateEstimates()

  const handleComplete = () => {
    onUpdate({
      features: [
        ...selectedContracts.map((id) => CORE_CONTRACTS.find((c) => c.id === id)?.name || id),
        ...selectedFrontend.map((id) => FRONTEND_COMPONENTS.find((c) => c.id === id)?.name || id),
        ...selectedBackend.map((id) => BACKEND_SERVICES.find((s) => s.id === id)?.name || id),
      ],
    })
    onComplete()
  }

  const isComplete = selectedContracts.length >= 3 && selectedFrontend.length >= 3 && selectedBackend.length >= 2

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Alert>
        <Layers className="h-4 w-4" />
        <AlertTitle>Architecture Design</AlertTitle>
        <AlertDescription>
          Design your DEX architecture by selecting smart contracts, frontend components, and backend services. This
          will determine your development scope and timeline.
        </AlertDescription>
      </Alert>

      {/* Estimates Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Development Estimates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{estimates.contractLines}</div>
              <div className="text-sm text-muted-foreground">Contract Lines</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{estimates.frontendHours}h</div>
              <div className="text-sm text-muted-foreground">Frontend Dev</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{estimates.backendHours}h</div>
              <div className="text-sm text-muted-foreground">Backend Dev</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{estimates.estimatedWeeks}w</div>
              <div className="text-sm text-muted-foreground">Est. Timeline</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="contracts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
          <TabsTrigger value="frontend">Frontend</TabsTrigger>
          <TabsTrigger value="backend">Backend</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Smart Contract Architecture
              </CardTitle>
              <CardDescription>Select the smart contracts your DEX will need</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CORE_CONTRACTS.map((contract) => (
                  <Card
                    key={contract.id}
                    className={`cursor-pointer transition-all ${
                      selectedContracts.includes(contract.id)
                        ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "hover:shadow-md"
                    } ${contract.required ? "border-green-200" : ""}`}
                    onClick={() => toggleContract(contract.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedContracts.includes(contract.id)}
                          disabled={contract.required}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{contract.name}</h3>
                            {contract.required && <Badge variant="secondary">Required</Badge>}
                            <Badge variant="outline">{contract.complexity}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{contract.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>~{contract.estimatedLines} lines</span>
                            {contract.dependencies.length > 0 && (
                              <span>Depends on: {contract.dependencies.join(", ")}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frontend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Frontend Components
              </CardTitle>
              <CardDescription>Choose the user interface components for your DEX</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FRONTEND_COMPONENTS.map((component) => (
                  <Card
                    key={component.id}
                    className={`cursor-pointer transition-all ${
                      selectedFrontend.includes(component.id)
                        ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "hover:shadow-md"
                    } ${component.required ? "border-green-200" : ""}`}
                    onClick={() => toggleFrontend(component.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedFrontend.includes(component.id)}
                          disabled={component.required}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{component.name}</h3>
                            {component.required && <Badge variant="secondary">Required</Badge>}
                            <Badge variant="outline">{component.complexity}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{component.description}</p>
                          <div className="text-xs text-muted-foreground">~{component.estimatedHours} hours</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Backend Services
              </CardTitle>
              <CardDescription>Select the backend infrastructure for your DEX</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BACKEND_SERVICES.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all ${
                      selectedBackend.includes(service.id)
                        ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "hover:shadow-md"
                    } ${service.required ? "border-green-200" : ""}`}
                    onClick={() => toggleBackend(service.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedBackend.includes(service.id)}
                          disabled={service.required}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{service.name}</h3>
                            {service.required && <Badge variant="secondary">Required</Badge>}
                            <Badge variant="outline">{service.complexity}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                          <div className="text-xs text-muted-foreground">~{service.estimatedHours} hours</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Additional Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="custom-requirements">Custom Features & Requirements</Label>
            <Textarea
              id="custom-requirements"
              placeholder="Describe any custom features, integrations, or specific requirements..."
              value={customRequirements}
              onChange={(e) => setCustomRequirements(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="scalability-plan">Scalability Considerations</Label>
            <Textarea
              id="scalability-plan"
              placeholder="How will your DEX handle growth? Layer 2 integration, sharding, etc..."
              value={scalabilityPlan}
              onChange={(e) => setScalabilityPlan(e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Architecture Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Architecture Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">Smart Contracts ({selectedContracts.length})</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {selectedContracts.map((id) => (
                  <li key={id}>• {CORE_CONTRACTS.find((c) => c.id === id)?.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Frontend ({selectedFrontend.length})</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {selectedFrontend.map((id) => (
                  <li key={id}>• {FRONTEND_COMPONENTS.find((c) => c.id === id)?.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Backend ({selectedBackend.length})</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {selectedBackend.map((id) => (
                  <li key={id}>• {BACKEND_SERVICES.find((s) => s.id === id)?.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Step */}
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          )}
          <span className="text-sm">
            {isComplete ? "Architecture design complete" : "Select minimum required components to continue"}
          </span>
        </div>
        <Button onClick={handleComplete} disabled={!isComplete}>
          Complete Architecture Design
        </Button>
      </div>
    </div>
  )
}
