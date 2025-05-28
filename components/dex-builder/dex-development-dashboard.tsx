"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle2,
  Circle,
  Clock,
  Rocket,
  TrendingUp,
  Users,
  Shield,
  Code,
  Palette,
  TestTube,
  Globe,
  RefreshCw,
  Lightbulb,
  Target,
  Zap,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MarketResearchStep } from "./steps/market-research-step"
import { StrategicPlanningStep } from "./steps/strategic-planning-step"
import { BlockchainSelectionStep } from "./steps/blockchain-selection-step"
import { ArchitectureDesignStep } from "./steps/architecture-design-step"
import { SmartContractStep } from "./steps/smart-contract-step"
import { UIDesignStep } from "./steps/ui-design-step"
import { SecurityIntegrationStep } from "./steps/security-integration-step"
import { TestingAuditStep } from "./steps/testing-audit-step"
import { LaunchStep } from "./steps/launch-step"
import { MarketingStep } from "./steps/marketing-step"
import { MaintenanceStep } from "./steps/maintenance-step"

export interface DEXProject {
  id: string
  name: string
  description: string
  blockchain: string
  status: "planning" | "development" | "testing" | "launched" | "maintained"
  currentStep: number
  completedSteps: number[]
  createdAt: Date
  estimatedLaunch?: Date
  teamSize: number
  budget: number
  features: string[]
}

const DEX_DEVELOPMENT_STEPS = [
  {
    id: 1,
    title: "Market Research",
    description: "Analyze competitors and identify market opportunities",
    icon: TrendingUp,
    estimatedDays: 7,
    difficulty: "Easy",
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Strategic Planning",
    description: "Define tokenomics, governance, and business model",
    icon: Target,
    estimatedDays: 5,
    difficulty: "Medium",
    color: "bg-purple-500",
  },
  {
    id: 3,
    title: "Choose Blockchain",
    description: "Select optimal blockchain and protocol model",
    icon: Zap,
    estimatedDays: 3,
    difficulty: "Medium",
    color: "bg-yellow-500",
  },
  {
    id: 4,
    title: "Design Architecture",
    description: "Plan DEX structure and core features",
    icon: Code,
    estimatedDays: 10,
    difficulty: "Hard",
    color: "bg-green-500",
  },
  {
    id: 5,
    title: "Develop Smart Contracts",
    description: "Create and test core DEX contracts",
    icon: Shield,
    estimatedDays: 21,
    difficulty: "Expert",
    color: "bg-red-500",
  },
  {
    id: 6,
    title: "Design UI/UX",
    description: "Build user-friendly interface",
    icon: Palette,
    estimatedDays: 14,
    difficulty: "Medium",
    color: "bg-pink-500",
  },
  {
    id: 7,
    title: "Integrate Security",
    description: "Implement wallet connections and security",
    icon: Shield,
    estimatedDays: 7,
    difficulty: "Hard",
    color: "bg-orange-500",
  },
  {
    id: 8,
    title: "Testing & Auditing",
    description: "Comprehensive testing and security audits",
    icon: TestTube,
    estimatedDays: 14,
    difficulty: "Expert",
    color: "bg-indigo-500",
  },
  {
    id: 9,
    title: "Launch DEX",
    description: "Deploy to mainnet and go live",
    icon: Rocket,
    estimatedDays: 3,
    difficulty: "Hard",
    color: "bg-cyan-500",
  },
  {
    id: 10,
    title: "Go-to-Market",
    description: "Marketing and liquidity mining programs",
    icon: Users,
    estimatedDays: 30,
    difficulty: "Medium",
    color: "bg-teal-500",
  },
  {
    id: 11,
    title: "Iterate & Maintain",
    description: "Continuous improvement and updates",
    icon: RefreshCw,
    estimatedDays: 365,
    difficulty: "Ongoing",
    color: "bg-gray-500",
  },
]

export function DEXDevelopmentDashboard() {
  const [currentProject, setCurrentProject] = useState<DEXProject | null>(null)
  const [activeStep, setActiveStep] = useState(1)
  const [projects, setProjects] = useState<DEXProject[]>([])

  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem("dex-projects")
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }, [])

  // Save projects to localStorage
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("dex-projects", JSON.stringify(projects))
    }
  }, [projects])

  const createNewProject = () => {
    const newProject: DEXProject = {
      id: `dex-${Date.now()}`,
      name: "My DEX Project",
      description: "A new decentralized exchange on Sonic",
      blockchain: "sonic",
      status: "planning",
      currentStep: 1,
      completedSteps: [],
      createdAt: new Date(),
      teamSize: 1,
      budget: 50000,
      features: ["Spot Trading", "Liquidity Pools", "Yield Farming"],
    }
    setProjects([...projects, newProject])
    setCurrentProject(newProject)
    setActiveStep(1)
  }

  const completeStep = (stepId: number) => {
    if (!currentProject) return

    const updatedProject = {
      ...currentProject,
      completedSteps: [...currentProject.completedSteps, stepId],
      currentStep: Math.min(stepId + 1, 11),
    }

    setCurrentProject(updatedProject)
    setProjects(projects.map((p) => (p.id === currentProject.id ? updatedProject : p)))

    // Auto-advance to next step
    if (stepId < 11) {
      setActiveStep(stepId + 1)
    }
  }

  const getStepStatus = (stepId: number) => {
    if (!currentProject) return "pending"
    if (currentProject.completedSteps.includes(stepId)) return "completed"
    if (currentProject.currentStep === stepId) return "active"
    return "pending"
  }

  const calculateProgress = () => {
    if (!currentProject) return 0
    return (currentProject.completedSteps.length / DEX_DEVELOPMENT_STEPS.length) * 100
  }

  const getTotalEstimatedDays = () => {
    return DEX_DEVELOPMENT_STEPS.reduce((total, step) => total + step.estimatedDays, 0)
  }

  const renderStepContent = () => {
    const step = DEX_DEVELOPMENT_STEPS.find((s) => s.id === activeStep)
    if (!step || !currentProject) return null

    const stepProps = {
      project: currentProject,
      onComplete: () => completeStep(activeStep),
      onUpdate: (updates: Partial<DEXProject>) => {
        const updatedProject = { ...currentProject, ...updates }
        setCurrentProject(updatedProject)
        setProjects(projects.map((p) => (p.id === currentProject.id ? updatedProject : p)))
      },
    }

    switch (activeStep) {
      case 1:
        return <MarketResearchStep {...stepProps} />
      case 2:
        return <StrategicPlanningStep {...stepProps} />
      case 3:
        return <BlockchainSelectionStep {...stepProps} />
      case 4:
        return <ArchitectureDesignStep {...stepProps} />
      case 5:
        return <SmartContractStep {...stepProps} />
      case 6:
        return <UIDesignStep {...stepProps} />
      case 7:
        return <SecurityIntegrationStep {...stepProps} />
      case 8:
        return <TestingAuditStep {...stepProps} />
      case 9:
        return <LaunchStep {...stepProps} />
      case 10:
        return <MarketingStep {...stepProps} />
      case 11:
        return <MaintenanceStep {...stepProps} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <img
            src="/dex-development-cycle.jpg"
            alt="DEX Development Cycle"
            className="max-w-md w-full h-auto rounded-lg shadow-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold">DEX Development Suite</h1>
          <p className="text-muted-foreground mt-2">
            Build your own decentralized exchange following industry best practices
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Steps</p>
                <p className="text-2xl font-bold">11</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Est. Timeline</p>
                <p className="text-2xl font-bold">{getTotalEstimatedDays()}d</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Development Process Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                DEX Development Process
              </CardTitle>
              <CardDescription>
                Follow our proven 11-step methodology to build a successful decentralized exchange
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DEX_DEVELOPMENT_STEPS.map((step, index) => (
                  <Card key={step.id} className="relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 ${step.color}`} />
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${step.color} text-white`}>
                          <step.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{step.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {step.estimatedDays}d
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                          <Badge variant="secondary" className="text-xs">
                            {step.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle>Ready to Build Your DEX?</CardTitle>
              <CardDescription>
                Start your decentralized exchange development journey with our guided process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Rocket className="h-4 w-4" />
                <AlertTitle>What You'll Build</AlertTitle>
                <AlertDescription>
                  A fully functional DEX with spot trading, liquidity pools, yield farming, governance tokens, and
                  advanced features like limit orders and analytics.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button onClick={createNewProject} className="flex-1">
                  <Rocket className="mr-2 h-4 w-4" />
                  Start New DEX Project
                </Button>
                <Button variant="outline" className="flex-1">
                  <Globe className="mr-2 h-4 w-4" />
                  View Examples
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="development" className="space-y-6">
          {!currentProject ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Project</h3>
                <p className="text-muted-foreground mb-4">Create a new DEX project to start development</p>
                <Button onClick={createNewProject}>
                  <Rocket className="mr-2 h-4 w-4" />
                  Create New Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Project Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{currentProject.name}</CardTitle>
                      <CardDescription>{currentProject.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {currentProject.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{currentProject.completedSteps.length}/11 steps completed</span>
                    </div>
                    <Progress value={calculateProgress()} className="h-2" />
                  </div>
                </CardHeader>
              </Card>

              {/* Step Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle>Development Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {DEX_DEVELOPMENT_STEPS.map((step) => {
                      const status = getStepStatus(step.id)
                      return (
                        <Button
                          key={step.id}
                          variant={activeStep === step.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveStep(step.id)}
                          className="justify-start h-auto p-3"
                        >
                          <div className="flex items-center gap-2 w-full">
                            {status === "completed" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : status === "active" ? (
                              <Clock className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div className="text-left">
                              <div className="font-medium text-sm">{step.title}</div>
                              <div className="text-xs text-muted-foreground">{step.estimatedDays} days</div>
                            </div>
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Current Step Content */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-500 text-white">
                      {React.createElement(DEX_DEVELOPMENT_STEPS.find((s) => s.id === activeStep)?.icon || Circle, {
                        className: "h-4 w-4",
                      })}
                    </div>
                    <div>
                      <CardTitle>
                        Step {activeStep}: {DEX_DEVELOPMENT_STEPS.find((s) => s.id === activeStep)?.title}
                      </CardTitle>
                      <CardDescription>
                        {DEX_DEVELOPMENT_STEPS.find((s) => s.id === activeStep)?.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>{renderStepContent()}</CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {/* Projects List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your DEX Projects</CardTitle>
                  <CardDescription>Manage and track your decentralized exchange projects</CardDescription>
                </div>
                <Button onClick={createNewProject}>
                  <Rocket className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first DEX project to get started</p>
                  <Button onClick={createNewProject}>
                    <Rocket className="mr-2 h-4 w-4" />
                    Create First Project
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <Card
                      key={project.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        currentProject?.id === project.id ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => setCurrentProject(project)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{project.name}</h3>
                            <Badge variant="outline" className="capitalize text-xs">
                              {project.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{project.completedSteps.length}/11</span>
                            </div>
                            <Progress value={(project.completedSteps.length / 11) * 100} className="h-1" />
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Created {project.createdAt.toLocaleDateString()}</span>
                            <span>{project.blockchain.toUpperCase()}</span>
                          </div>
                        </div>
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
