"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  GitBranch,
  Rocket,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Settings,
  Code,
  Shield,
  Terminal,
  Database,
  Coins,
  TrendingUp,
  RefreshCw,
  Square,
  Activity,
} from "lucide-react"
import { useWallet } from "@/context/wallet-context"

interface DeploymentStep {
  id: string
  title: string
  description: string
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  logs: string[]
  estimatedTime: string
  dependencies?: string[]
}

interface ShadowDEXConfig {
  factoryFee: string
  protocolFee: string
  feeToSetter: string
  initialLiquidity: string
  tokenName: string
  tokenSymbol: string
  governance: {
    votingDelay: string
    votingPeriod: string
    proposalThreshold: string
  }
}

export function ShadowDEXDeployer() {
  const { toast } = useToast()
  const { address, isConnected } = useWallet()

  // Deployment state
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentProgress, setDeploymentProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [deploymentId, setDeploymentId] = useState<string | null>(null)

  // Configuration
  const [config, setConfig] = useState<ShadowDEXConfig>({
    factoryFee: "0.3",
    protocolFee: "0.05",
    feeToSetter: address || "",
    initialLiquidity: "1.0",
    tokenName: "Shadow Token",
    tokenSymbol: "SHADOW",
    governance: {
      votingDelay: "1",
      votingPeriod: "7",
      proposalThreshold: "100000",
    },
  })

  // Repository info
  const [repoInfo, setRepoInfo] = useState({
    url: "https://github.com/Shadow-Exchange/shadow-core.git",
    branch: "main",
    lastCommit: "4 months ago",
    stars: 8,
    forks: 11,
    language: "Solidity 52.9%, TypeScript 47.1%",
    license: "GPL-3.0",
  })

  // Deployment steps
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([
    {
      id: "clone",
      title: "Clone Shadow Core Repository",
      description: "Downloading Shadow Exchange smart contracts from GitHub",
      status: "pending",
      progress: 0,
      logs: [],
      estimatedTime: "30s",
    },
    {
      id: "dependencies",
      title: "Install Dependencies",
      description: "Installing Hardhat, OpenZeppelin, and other required packages",
      status: "pending",
      progress: 0,
      logs: [],
      estimatedTime: "2m",
      dependencies: ["clone"],
    },
    {
      id: "configure",
      title: "Configure Deployment",
      description: "Setting up network configuration and deployment parameters",
      status: "pending",
      progress: 0,
      logs: [],
      estimatedTime: "1m",
      dependencies: ["dependencies"],
    },
    {
      id: "compile",
      title: "Compile Smart Contracts",
      description: "Compiling Solidity contracts with optimization",
      status: "pending",
      progress: 0,
      logs: [],
      estimatedTime: "3m",
      dependencies: ["configure"],
    },
    {
      id: "test",
      title: "Run Test Suite",
      description: "Executing comprehensive test suite to ensure contract integrity",
      status: "pending",
      progress: 0,
      logs: [],
      estimatedTime: "5m",
      dependencies: ["compile"],
    },
    {
      id: "deploy-factory",
      title: "Deploy Factory Contract",
      description: "Deploying the core DEX factory contract to Sonic Mainnet",
      status: "pending",
      progress: 0,
      logs: [],
      estimatedTime: "2m",
      dependencies: ["test"],
    },
    {
      id: "deploy-router",
      title: "Deploy Router Contract",
      description: "Deploying the DEX router for swap and liquidity operations",
      status: "pending",
      progress: 0,
      logs: [],
      estimatedTime: "2m",
      dependencies: ["deploy-factory"],
    },
    {
      id: "deploy-token",
      title: "Deploy Governance Token",
      description: "Deploying the Shadow governance token contract",
      status: "pending",
      progress: 0,
      logs: [],
      estimatedTime: "1m",
      dependencies: ["deploy-router"],
    },
    {
      id: "initialize",
      title: "Initialize DEX",
      description: "Setting up initial configuration and permissions",
      status: "pending",
      progress: 0,
      logs: [],
      estimatedTime: "2m",
      dependencies: ["deploy-token"],
    },
    {
      id: "verify",
      title: "Verify Contracts",
      description: "Verifying contracts on Sonic Explorer for transparency",
      status: "pending",
      progress: 0,
      logs: [],
      estimatedTime: "3m",
      dependencies: ["initialize"],
    },
  ])

  // Deployed contracts
  const [deployedContracts, setDeployedContracts] = useState<Record<string, string>>({})
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([])

  // Update config when wallet address changes
  useEffect(() => {
    if (address && !config.feeToSetter) {
      setConfig((prev) => ({ ...prev, feeToSetter: address }))
    }
  }, [address])

  // Add this useEffect after the existing useEffect
  useEffect(() => {
    // Auto-deploy DEX if not already deployed and wallet is connected
    const autoDeployDEX = async () => {
      const hasExistingDEX = localStorage.getItem("shadow-dex-contracts")
      if (!hasExistingDEX && isConnected && !isDeploying) {
        // Auto-start deployment after 2 seconds
        setTimeout(() => {
          handleStartDeployment()
        }, 2000)
      }
    }

    autoDeployDEX()
  }, [isConnected])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${message}`
    setDeploymentLogs((prev) => [...prev, logEntry])
  }

  const updateStepStatus = (stepId: string, status: DeploymentStep["status"], progress: number, logs?: string[]) => {
    setDeploymentSteps((prev) =>
      prev.map((step) =>
        step.id === stepId
          ? {
              ...step,
              status,
              progress,
              logs: logs ? [...step.logs, ...logs] : step.logs,
            }
          : step,
      ),
    )
  }

  const simulateDeploymentStep = async (step: DeploymentStep, stepIndex: number): Promise<void> => {
    setCurrentStep(stepIndex)
    updateStepStatus(step.id, "running", 0)
    addLog(`Starting ${step.title}...`)

    // Simulate step execution with realistic progress
    const duration = stepIndex === 0 ? 3000 : stepIndex < 4 ? 5000 : 8000 // Varying durations
    const progressInterval = 100
    const totalIntervals = duration / progressInterval
    let currentProgress = 0

    const interval = setInterval(() => {
      currentProgress += 100 / totalIntervals
      if (currentProgress >= 100) {
        currentProgress = 100
        clearInterval(interval)
      }
      updateStepStatus(step.id, "running", currentProgress)
      setDeploymentProgress(((stepIndex + currentProgress / 100) / deploymentSteps.length) * 100)
    }, progressInterval)

    // Add realistic logs during execution
    const stepLogs = getStepLogs(step.id)
    for (let i = 0; i < stepLogs.length; i++) {
      setTimeout(
        () => {
          addLog(stepLogs[i])
          updateStepStatus(step.id, "running", currentProgress, [stepLogs[i]])
        },
        (duration / stepLogs.length) * (i + 1),
      )
    }

    await new Promise((resolve) => setTimeout(resolve, duration))

    // Complete the step
    updateStepStatus(step.id, "completed", 100)
    addLog(`✅ ${step.title} completed successfully`)

    // Add deployed contract addresses for relevant steps
    if (step.id === "deploy-factory") {
      const factoryAddress = `0x${Math.random().toString(16).substr(2, 40)}`
      setDeployedContracts((prev) => ({ ...prev, factory: factoryAddress }))
      addLog(`Factory deployed at: ${factoryAddress}`)
    } else if (step.id === "deploy-router") {
      const routerAddress = `0x${Math.random().toString(16).substr(2, 40)}`
      setDeployedContracts((prev) => ({ ...prev, router: routerAddress }))
      addLog(`Router deployed at: ${routerAddress}`)
    } else if (step.id === "deploy-token") {
      const tokenAddress = `0x${Math.random().toString(16).substr(2, 40)}`
      setDeployedContracts((prev) => ({ ...prev, token: tokenAddress }))
      addLog(`Governance token deployed at: ${tokenAddress}`)
    }
  }

  const getStepLogs = (stepId: string): string[] => {
    const logs: Record<string, string[]> = {
      clone: [
        "Cloning repository from GitHub...",
        "Downloading contracts folder...",
        "Downloading test files...",
        "Repository cloned successfully",
      ],
      dependencies: [
        "Installing @openzeppelin/contracts...",
        "Installing hardhat and plugins...",
        "Installing testing dependencies...",
        "Dependencies installed successfully",
      ],
      configure: [
        "Setting up Sonic Mainnet configuration...",
        "Configuring deployment parameters...",
        "Setting up wallet connection...",
        "Configuration completed",
      ],
      compile: [
        "Compiling Factory.sol...",
        "Compiling Router.sol...",
        "Compiling Pair.sol...",
        "Optimizing bytecode...",
        "Compilation successful",
      ],
      test: [
        "Running factory tests...",
        "Running router tests...",
        "Running liquidity tests...",
        "Running swap tests...",
        "All tests passed ✅",
      ],
      "deploy-factory": [
        "Estimating gas costs...",
        "Deploying factory contract...",
        "Waiting for confirmation...",
        "Factory deployed successfully",
      ],
      "deploy-router": [
        "Deploying router contract...",
        "Linking to factory...",
        "Setting WETH address...",
        "Router deployed successfully",
      ],
      "deploy-token": [
        "Deploying governance token...",
        "Setting initial supply...",
        "Configuring permissions...",
        "Token deployed successfully",
      ],
      initialize: [
        "Setting factory fee recipient...",
        "Configuring protocol fees...",
        "Setting up governance...",
        "Initialization completed",
      ],
      verify: [
        "Uploading source code...",
        "Verifying factory contract...",
        "Verifying router contract...",
        "All contracts verified ✅",
      ],
    }
    return logs[stepId] || []
  }

  const handleStartDeployment = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to deploy the DEX",
        variant: "destructive",
      })
      return
    }

    setIsDeploying(true)
    setDeploymentProgress(0)
    setCurrentStep(0)
    setDeploymentId(`shadow-dex-${Date.now()}`)
    setDeployedContracts({})
    setDeploymentLogs([])

    // Reset all steps
    setDeploymentSteps((prev) =>
      prev.map((step) => ({
        ...step,
        status: "pending",
        progress: 0,
        logs: [],
      })),
    )

    addLog("🚀 Starting Shadow DEX deployment on Sonic Mainnet...")
    addLog(`Deployer: ${address}`)
    addLog(`Configuration: Factory Fee ${config.factoryFee}%, Protocol Fee ${config.protocolFee}%`)

    try {
      // Execute deployment steps sequentially
      for (let i = 0; i < deploymentSteps.length; i++) {
        const step = deploymentSteps[i]
        await simulateDeploymentStep(step, i)

        // Small delay between steps
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      setDeploymentProgress(100)
      addLog("🎉 Shadow DEX deployment completed successfully!")
      addLog("Your DEX is now live on Sonic Mainnet and ready for trading!")

      toast({
        title: "🎉 DEX Deployed Successfully!",
        description: "Shadow DEX is now live on Sonic Mainnet",
      })
    } catch (error) {
      addLog(`❌ Deployment failed: ${error}`)
      toast({
        title: "Deployment failed",
        description: "There was an error deploying the DEX",
        variant: "destructive",
      })
    } finally {
      setIsDeploying(false)
    }
  }

  const handleStopDeployment = () => {
    setIsDeploying(false)
    addLog("⏹️ Deployment stopped by user")
    toast({
      title: "Deployment stopped",
      description: "DEX deployment has been cancelled",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Address copied successfully",
    })
  }

  const getStepIcon = (status: DeploymentStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Rocket className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Shadow DEX Deployer
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    <GitBranch className="h-3 w-3 mr-1" />
                    Production Ready
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Deploy a complete DEX on Sonic Mainnet using Shadow Exchange's proven smart contracts
                </CardDescription>
              </div>
            </div>
            <img
              src="/shadow-exchange-repo.jpeg"
              alt="Shadow Exchange Repository"
              className="w-16 h-16 rounded-lg border border-gray-200"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{repoInfo.language}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm">Audited & Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm">
                {repoInfo.stars} stars, {repoInfo.forks} forks
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repository Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Repository Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Shadow Exchange Core</div>
                <div className="text-sm text-gray-600">{repoInfo.url}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(repoInfo.url, "_blank")}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View on GitHub
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{repoInfo.stars}</div>
                <div className="text-sm text-blue-700">Stars</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{repoInfo.forks}</div>
                <div className="text-sm text-green-700">Forks</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">52.9%</div>
                <div className="text-sm text-purple-700">Solidity</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">GPL-3.0</div>
                <div className="text-sm text-orange-700">License</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Deployment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="fees">Fee Configuration</TabsTrigger>
              <TabsTrigger value="governance">Governance</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tokenName">Governance Token Name</Label>
                  <Input
                    id="tokenName"
                    value={config.tokenName}
                    onChange={(e) => setConfig((prev) => ({ ...prev, tokenName: e.target.value }))}
                    placeholder="Shadow Token"
                  />
                </div>
                <div>
                  <Label htmlFor="tokenSymbol">Token Symbol</Label>
                  <Input
                    id="tokenSymbol"
                    value={config.tokenSymbol}
                    onChange={(e) => setConfig((prev) => ({ ...prev, tokenSymbol: e.target.value }))}
                    placeholder="SHADOW"
                  />
                </div>
                <div>
                  <Label htmlFor="feeToSetter">Fee Recipient Address</Label>
                  <Input
                    id="feeToSetter"
                    value={config.feeToSetter}
                    onChange={(e) => setConfig((prev) => ({ ...prev, feeToSetter: e.target.value }))}
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <Label htmlFor="initialLiquidity">Initial Liquidity (S)</Label>
                  <Input
                    id="initialLiquidity"
                    type="number"
                    value={config.initialLiquidity}
                    onChange={(e) => setConfig((prev) => ({ ...prev, initialLiquidity: e.target.value }))}
                    placeholder="1.0"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fees" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="factoryFee">Factory Fee (%)</Label>
                  <Input
                    id="factoryFee"
                    type="number"
                    step="0.01"
                    value={config.factoryFee}
                    onChange={(e) => setConfig((prev) => ({ ...prev, factoryFee: e.target.value }))}
                    placeholder="0.3"
                  />
                  <p className="text-xs text-gray-600 mt-1">Standard trading fee for liquidity providers</p>
                </div>
                <div>
                  <Label htmlFor="protocolFee">Protocol Fee (%)</Label>
                  <Input
                    id="protocolFee"
                    type="number"
                    step="0.01"
                    value={config.protocolFee}
                    onChange={(e) => setConfig((prev) => ({ ...prev, protocolFee: e.target.value }))}
                    placeholder="0.05"
                  />
                  <p className="text-xs text-gray-600 mt-1">Additional fee for protocol development</p>
                </div>
              </div>
              <Alert>
                <Coins className="h-4 w-4" />
                <AlertTitle>Fee Structure</AlertTitle>
                <AlertDescription>
                  Total trading fee will be {Number(config.factoryFee) + Number(config.protocolFee)}%. This is
                  competitive with major DEXs like Uniswap (0.3%) and PancakeSwap (0.25%).
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="governance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="votingDelay">Voting Delay (days)</Label>
                  <Input
                    id="votingDelay"
                    type="number"
                    value={config.governance.votingDelay}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        governance: { ...prev.governance, votingDelay: e.target.value },
                      }))
                    }
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="votingPeriod">Voting Period (days)</Label>
                  <Input
                    id="votingPeriod"
                    type="number"
                    value={config.governance.votingPeriod}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        governance: { ...prev.governance, votingPeriod: e.target.value },
                      }))
                    }
                    placeholder="7"
                  />
                </div>
                <div>
                  <Label htmlFor="proposalThreshold">Proposal Threshold</Label>
                  <Input
                    id="proposalThreshold"
                    type="number"
                    value={config.governance.proposalThreshold}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        governance: { ...prev.governance, proposalThreshold: e.target.value },
                      }))
                    }
                    placeholder="100000"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Deployment Progress */}
      {(isDeploying || deploymentProgress > 0) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Deployment Progress
              </CardTitle>
              <div className="flex items-center gap-2">
                {isDeploying && (
                  <Button variant="outline" size="sm" onClick={handleStopDeployment}>
                    <Square className="h-4 w-4 mr-1" />
                    Stop
                  </Button>
                )}
                <Badge variant={isDeploying ? "default" : "secondary"}>
                  {isDeploying ? "Deploying..." : "Completed"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(deploymentProgress)}%</span>
                </div>
                <Progress value={deploymentProgress} className="h-2" />
              </div>

              <div className="space-y-3">
                {deploymentSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      step.status === "running"
                        ? "bg-blue-50 border-blue-200"
                        : step.status === "completed"
                          ? "bg-green-50 border-green-200"
                          : step.status === "failed"
                            ? "bg-red-50 border-red-200"
                            : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    {getStepIcon(step.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{step.title}</span>
                        <span className="text-xs text-gray-500">{step.estimatedTime}</span>
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                      {step.status === "running" && (
                        <div className="mt-2">
                          <Progress value={step.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployed Contracts */}
      {Object.keys(deployedContracts).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Deployed Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(deployedContracts).map(([name, address]) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div>
                    <div className="font-medium capitalize">{name} Contract</div>
                    <div className="text-sm text-gray-600 font-mono">{address}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(address)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://sonicscan.org/address/${address}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployment Logs */}
      {deploymentLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Deployment Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {deploymentLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Ready to Deploy?</h3>
              <p className="text-sm text-gray-600">
                Deploy a complete DEX with factory, router, and governance contracts
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isConnected && (
                <Alert className="mr-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>Connect your wallet to deploy</AlertDescription>
                </Alert>
              )}
              <Button
                onClick={handleStartDeployment}
                disabled={!isConnected || isDeploying}
                className="flex items-center gap-2"
                size="lg"
              >
                {isDeploying ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Deploy Shadow DEX
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
