"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Shield,
  Wallet,
  Lock,
  Key,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Users,
  Globe,
} from "lucide-react"
import type { DEXProject } from "../dex-development-dashboard"

interface SecurityIntegrationStepProps {
  project: DEXProject
  onComplete: () => void
  onUpdate: (updates: Partial<DEXProject>) => void
}

const WALLET_PROVIDERS = [
  {
    id: "metamask",
    name: "MetaMask",
    description: "Most popular Ethereum wallet",
    integration: "Easy",
    userBase: "100M+",
    required: true,
    logo: "/wallets/metamask.png",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    description: "Connect to 300+ wallets",
    integration: "Easy",
    userBase: "50M+",
    required: true,
    logo: "/wallets/walletconnect.png",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    description: "Popular mobile wallet",
    integration: "Easy",
    userBase: "30M+",
    required: false,
    logo: "/wallets/coinbase.png",
  },
  {
    id: "ledger",
    name: "Ledger",
    description: "Hardware wallet support",
    integration: "Medium",
    userBase: "5M+",
    required: false,
    logo: "/wallets/ledger.png",
  },
  {
    id: "trezor",
    name: "Trezor",
    description: "Hardware wallet support",
    integration: "Medium",
    userBase: "3M+",
    required: false,
    logo: "/wallets/trezor.png",
  },
]

const SECURITY_MEASURES = [
  {
    id: "ssl",
    name: "SSL/TLS Encryption",
    description: "Secure data transmission",
    category: "Infrastructure",
    priority: "Critical",
    implemented: false,
  },
  {
    id: "rate-limiting",
    name: "Rate Limiting",
    description: "Prevent API abuse",
    category: "API Security",
    priority: "High",
    implemented: false,
  },
  {
    id: "input-validation",
    name: "Input Validation",
    description: "Sanitize all user inputs",
    category: "Frontend",
    priority: "Critical",
    implemented: false,
  },
  {
    id: "csp",
    name: "Content Security Policy",
    description: "Prevent XSS attacks",
    category: "Frontend",
    priority: "High",
    implemented: false,
  },
  {
    id: "cors",
    name: "CORS Configuration",
    description: "Proper cross-origin settings",
    category: "API Security",
    priority: "Medium",
    implemented: false,
  },
  {
    id: "monitoring",
    name: "Security Monitoring",
    description: "Real-time threat detection",
    category: "Infrastructure",
    priority: "High",
    implemented: false,
  },
  {
    id: "backup",
    name: "Data Backup",
    description: "Regular automated backups",
    category: "Infrastructure",
    priority: "Medium",
    implemented: false,
  },
  {
    id: "audit-logs",
    name: "Audit Logging",
    description: "Track all user actions",
    category: "Compliance",
    priority: "High",
    implemented: false,
  },
]

const AUDIT_PROVIDERS = [
  {
    id: "consensys",
    name: "ConsenSys Diligence",
    description: "Leading smart contract auditor",
    cost: "$50,000 - $150,000",
    timeline: "4-6 weeks",
    reputation: "Excellent",
  },
  {
    id: "openzeppelin",
    name: "OpenZeppelin",
    description: "Security-focused development",
    cost: "$40,000 - $120,000",
    timeline: "3-5 weeks",
    reputation: "Excellent",
  },
  {
    id: "trailofbits",
    name: "Trail of Bits",
    description: "Comprehensive security audits",
    cost: "$60,000 - $180,000",
    timeline: "5-7 weeks",
    reputation: "Excellent",
  },
  {
    id: "certik",
    name: "CertiK",
    description: "AI-powered security analysis",
    cost: "$30,000 - $100,000",
    timeline: "3-4 weeks",
    reputation: "Good",
  },
]

export function SecurityIntegrationStep({ project, onComplete, onUpdate }: SecurityIntegrationStepProps) {
  const [selectedWallets, setSelectedWallets] = useState<string[]>(
    WALLET_PROVIDERS.filter((w) => w.required).map((w) => w.id),
  )
  const [securityMeasures, setSecurityMeasures] = useState(SECURITY_MEASURES)
  const [selectedAuditor, setSelectedAuditor] = useState("")
  const [apiKeys, setApiKeys] = useState({
    walletconnect: "",
    infura: "",
    alchemy: "",
  })
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [securityNotes, setSecurityNotes] = useState("")

  const toggleWallet = (walletId: string) => {
    const wallet = WALLET_PROVIDERS.find((w) => w.id === walletId)
    if (wallet?.required) return

    setSelectedWallets((prev) => (prev.includes(walletId) ? prev.filter((id) => id !== walletId) : [...prev, walletId]))
  }

  const toggleSecurityMeasure = (measureId: string) => {
    setSecurityMeasures((prev) =>
      prev.map((measure) => (measure.id === measureId ? { ...measure, implemented: !measure.implemented } : measure)),
    )
  }

  const calculateSecurityScore = () => {
    const implementedCount = securityMeasures.filter((m) => m.implemented).length
    return Math.round((implementedCount / securityMeasures.length) * 100)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const securityScore = calculateSecurityScore()
  const isComplete = selectedWallets.length >= 2 && securityScore >= 70 && selectedAuditor

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Security Integration</AlertTitle>
        <AlertDescription>
          Implement wallet connections and security measures to protect your users and their funds.
        </AlertDescription>
      </Alert>

      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Overall Security</span>
              <span>{securityScore}%</span>
            </div>
            <Progress value={securityScore} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-500">{selectedWallets.length}</div>
                <div className="text-sm text-muted-foreground">Wallet Integrations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {securityMeasures.filter((m) => m.implemented).length}
                </div>
                <div className="text-sm text-muted-foreground">Security Measures</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-500">{selectedAuditor ? "1" : "0"}</div>
                <div className="text-sm text-muted-foreground">Audit Scheduled</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="wallets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wallets">Wallet Integration</TabsTrigger>
          <TabsTrigger value="security">Security Measures</TabsTrigger>
          <TabsTrigger value="audit">Security Audit</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Provider Integration
              </CardTitle>
              <CardDescription>Select wallet providers to support in your DEX</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WALLET_PROVIDERS.map((wallet) => (
                  <Card
                    key={wallet.id}
                    className={`cursor-pointer transition-all ${
                      selectedWallets.includes(wallet.id)
                        ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "hover:shadow-md"
                    } ${wallet.required ? "border-green-200" : ""}`}
                    onClick={() => toggleWallet(wallet.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedWallets.includes(wallet.id)}
                          disabled={wallet.required}
                          className="mt-1"
                          readOnly
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{wallet.name}</h3>
                            {wallet.required && <Badge variant="secondary">Required</Badge>}
                            <Badge variant="outline">{wallet.integration}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{wallet.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Users: {wallet.userBase}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Users className="h-4 w-4" />
            <AlertTitle>Wallet Compatibility</AlertTitle>
            <AlertDescription>
              Supporting multiple wallet providers increases user adoption. MetaMask and WalletConnect cover 80%+ of
              DeFi users.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Measures Checklist
              </CardTitle>
              <CardDescription>Implement essential security measures for your DEX</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Critical", "High", "Medium"].map((priority) => (
                  <div key={priority}>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          priority === "Critical"
                            ? "bg-red-500"
                            : priority === "High"
                              ? "bg-orange-500"
                              : "bg-yellow-500"
                        }`}
                      />
                      {priority} Priority
                    </h4>
                    <div className="space-y-2 ml-5">
                      {securityMeasures
                        .filter((measure) => measure.priority === priority)
                        .map((measure) => (
                          <div key={measure.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <input
                              type="checkbox"
                              id={measure.id}
                              checked={measure.implemented}
                              onChange={() => toggleSecurityMeasure(measure.id)}
                              className="rounded"
                            />
                            <div className="flex-1">
                              <Label htmlFor={measure.id} className="font-medium">
                                {measure.name}
                              </Label>
                              <p className="text-sm text-muted-foreground">{measure.description}</p>
                            </div>
                            <Badge variant="outline">{measure.category}</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Security Audit Selection
              </CardTitle>
              <CardDescription>Choose a reputable auditing firm for your smart contracts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AUDIT_PROVIDERS.map((auditor) => (
                  <Card
                    key={auditor.id}
                    className={`cursor-pointer transition-all ${
                      selectedAuditor === auditor.id
                        ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedAuditor(auditor.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{auditor.name}</h3>
                          <Badge variant="outline">{auditor.reputation}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{auditor.description}</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Cost:</span>
                            <span className="font-medium">{auditor.cost}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Timeline:</span>
                            <span className="font-medium">{auditor.timeline}</span>
                          </div>
                        </div>
                        {selectedAuditor === auditor.id && (
                          <Badge variant="secondary" className="w-full justify-center">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Audit Importance</AlertTitle>
            <AlertDescription>
              A professional security audit is essential before mainnet deployment. It identifies vulnerabilities and
              builds user trust.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Configuration
              </CardTitle>
              <CardDescription>Configure API keys and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="walletconnect-key">WalletConnect Project ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="walletconnect-key"
                      type={showApiKeys ? "text" : "password"}
                      placeholder="Enter project ID..."
                      value={apiKeys.walletconnect}
                      onChange={(e) => setApiKeys({ ...apiKeys, walletconnect: e.target.value })}
                    />
                    <Button variant="outline" size="sm" onClick={() => setShowApiKeys(!showApiKeys)}>
                      {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="infura-key">Infura API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="infura-key"
                      type={showApiKeys ? "text" : "password"}
                      placeholder="Enter API key..."
                      value={apiKeys.infura}
                      onChange={(e) => setApiKeys({ ...apiKeys, infura: e.target.value })}
                    />
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(apiKeys.infura)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="alchemy-key">Alchemy API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="alchemy-key"
                      type={showApiKeys ? "text" : "password"}
                      placeholder="Enter API key..."
                      value={apiKeys.alchemy}
                      onChange={(e) => setApiKeys({ ...apiKeys, alchemy: e.target.value })}
                    />
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(apiKeys.alchemy)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="security-notes">Security Notes & Requirements</Label>
                <Textarea
                  id="security-notes"
                  placeholder="Document any specific security requirements, compliance needs, or additional measures..."
                  value={securityNotes}
                  onChange={(e) => setSecurityNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Globe className="mr-2 h-4 w-4" />
                  Security Documentation
                </Button>
                <Button variant="outline" className="flex-1">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Best Practices Guide
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Complete Step */}
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          )}
          <span className="text-sm">
            {isComplete
              ? "Security integration complete"
              : "Complete wallet integration, security measures (70%+), and audit selection"}
          </span>
        </div>
        <Button onClick={onComplete} disabled={!isComplete}>
          Complete Security Integration
        </Button>
      </div>
    </div>
  )
}
