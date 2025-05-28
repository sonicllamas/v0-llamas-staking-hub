"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Settings, Network, DollarSign, Copy, Check, AlertCircle, Info } from "lucide-react"
import { PaymentInfoCard } from "@/components/payment/payment-info-card"
import {
  PAYMENT_CONFIG,
  DEFAULT_PAYMENT_RECEIVER,
  getPaymentConfig,
  calculateTransactionFee,
  FeeType,
  getSupportedPaymentNetworks,
  ADMIN_PAYMENT_RECEIVER,
} from "@/config/payment-config"
import { Container } from "@/components/container"
import { BackButton } from "@/components/back-button"

export default function PaymentSettingsPage() {
  const { toast } = useToast()
  const [selectedNetwork, setSelectedNetwork] = useState("146")
  const [testAmount, setTestAmount] = useState("100")

  const supportedNetworks = getSupportedPaymentNetworks()
  const currentConfig = getPaymentConfig(selectedNetwork)

  const copyAddress = () => {
    navigator.clipboard.writeText(DEFAULT_PAYMENT_RECEIVER)
    toast({
      title: "Address copied",
      description: "Payment receiver address copied to clipboard",
    })
  }

  const testFeeCalculation = () => {
    if (!testAmount || Number.parseFloat(testAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid test amount",
        variant: "destructive",
      })
      return
    }

    const swapFee = calculateTransactionFee(testAmount, selectedNetwork, FeeType.SWAP)
    const stakeFee = calculateTransactionFee(testAmount, selectedNetwork, FeeType.STAKE)

    toast({
      title: "Fee calculation complete",
      description: `Swap: ${swapFee.feeAmount} | Stake: ${stakeFee.feeAmount}`,
    })
  }

  const networkNames: Record<string, string> = {
    "1": "Ethereum",
    "146": "Sonic",
    "137": "Polygon",
    "42161": "Arbitrum",
  }

  return (
    <Container className="py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold">Payment Settings</h1>
            <p className="text-muted-foreground">Configure payment receiver and fee structure for transactions</p>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="networks">Networks</TabsTrigger>
            <TabsTrigger value="fees">Fee Calculator</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <PaymentInfoCard chainId={selectedNetwork} />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Payment Receiver
                  </CardTitle>
                  <CardDescription>All transaction fees are sent to this wallet address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Wallet Address</Label>
                    <div className="flex items-center gap-2">
                      <Input value={DEFAULT_PAYMENT_RECEIVER} readOnly className="font-mono text-sm" />
                      <Button variant="outline" size="icon" onClick={copyAddress}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="gap-1">
                        <Check className="h-3 w-3" />
                        Active
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Receiving payments on {supportedNetworks.length} networks
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-700 dark:text-blue-300">Payment Configuration</p>
                        <p className="text-blue-600 dark:text-blue-400">
                          This wallet is configured to receive all transaction fees across supported networks.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Networks Tab */}
          <TabsContent value="networks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network Configuration
                </CardTitle>
                <CardDescription>Payment settings for each supported network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportedNetworks.map((chainId) => {
                    const config = PAYMENT_CONFIG[chainId]
                    const networkName = networkNames[chainId] || `Chain ${chainId}`

                    return (
                      <div key={chainId} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{chainId}</Badge>
                            <h3 className="font-medium">{networkName}</h3>
                          </div>
                          <Badge variant={config.enabled ? "default" : "secondary"}>
                            {config.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Fee Rate</span>
                            <p className="font-medium">{config.feePercentage}%</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Min Fee</span>
                            <p className="font-medium">{config.minFeeAmount}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Max Fee</span>
                            <p className="font-medium">{config.maxFeeAmount}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Receiver</span>
                            <p className="font-mono text-xs">
                              {config.receiverAddress.slice(0, 6)}...{config.receiverAddress.slice(-4)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fee Calculator Tab */}
          <TabsContent value="fees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Fee Calculator
                </CardTitle>
                <CardDescription>Test fee calculations for different transaction types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Network</Label>
                    <select
                      value={selectedNetwork}
                      onChange={(e) => setSelectedNetwork(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      {supportedNetworks.map((chainId) => (
                        <option key={chainId} value={chainId}>
                          {networkNames[chainId] || `Chain ${chainId}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Test Amount</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={testAmount}
                        onChange={(e) => setTestAmount(e.target.value)}
                        placeholder="Enter amount"
                      />
                      <Button onClick={testFeeCalculation}>Calculate</Button>
                    </div>
                  </div>
                </div>

                {testAmount && Number.parseFloat(testAmount) > 0 && (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {Object.values(FeeType).map((feeType) => {
                      const fee = calculateTransactionFee(testAmount, selectedNetwork, feeType)
                      return (
                        <div key={feeType} className="p-3 border rounded-lg">
                          <h4 className="font-medium capitalize">{feeType.replace("_", " ")}</h4>
                          <p className="text-2xl font-bold">{fee.feeAmount}</p>
                          <p className="text-sm text-muted-foreground">
                            {fee.feePercentage}% of {testAmount}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Advanced Settings
                </CardTitle>
                <CardDescription>Advanced payment configuration options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-700 dark:text-yellow-300">Configuration Notice</p>
                      <p className="text-yellow-600 dark:text-yellow-400">
                        Payment receiver is currently hardcoded to: <br />
                        <code className="text-xs">{DEFAULT_PAYMENT_RECEIVER}</code>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Current Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Payment Receiver (Default):</span>
                      <code className="text-xs">{DEFAULT_PAYMENT_RECEIVER}</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Receiver (Active):</span>
                      <code className="text-xs">{ADMIN_PAYMENT_RECEIVER}</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Environment Override:</span>
                      <Badge variant={process.env.PAYMENT_RECEIVER_ADDRESS ? "default" : "secondary"}>
                        {process.env.PAYMENT_RECEIVER_ADDRESS ? "Active" : "Not Set"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Supported Networks:</span>
                      <span>{supportedNetworks.length} networks</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  )
}
