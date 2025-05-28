"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Wallet, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  getPaymentConfig,
  getActivePaymentReceiver,
  calculateTransactionFee,
  FeeType,
  getSupportedPaymentNetworks,
} from "@/config/payment-config"
import { useState } from "react"

interface PaymentInfoCardProps {
  chainId?: string
  className?: string
}

export function PaymentInfoCard({ chainId = "146", className }: PaymentInfoCardProps) {
  const { toast } = useToast()
  const [showDetails, setShowDetails] = useState(false)

  const config = getPaymentConfig(chainId)
  const receiverAddress = getActivePaymentReceiver(chainId)
  const supportedNetworks = getSupportedPaymentNetworks()

  // Example fee calculations
  const swapFee = calculateTransactionFee("100", chainId, FeeType.SWAP)
  const stakeFee = calculateTransactionFee("1", chainId, FeeType.STAKE)

  const copyAddress = () => {
    navigator.clipboard.writeText(receiverAddress)
    toast({
      title: "Address copied",
      description: "Payment receiver address copied to clipboard",
    })
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Payment Configuration
        </CardTitle>
        <CardDescription>Transaction fees are collected to support platform development</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Receiver */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Payment Receiver</span>
            <Badge variant="secondary">Active</Badge>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <code className="text-sm flex-1">{formatAddress(receiverAddress)}</code>
            <Button variant="ghost" size="sm" onClick={copyAddress} className="h-8 w-8 p-0">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Fee Structure */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Fee Structure</span>
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)} className="h-8 px-2">
              <Info className="h-4 w-4 mr-1" />
              {showDetails ? "Hide" : "Show"} Details
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 bg-muted rounded">
              <div className="font-medium">Swap Fee</div>
              <div className="text-muted-foreground">{swapFee.feePercentage}%</div>
            </div>
            <div className="p-2 bg-muted rounded">
              <div className="font-medium">Stake Fee</div>
              <div className="text-muted-foreground">{stakeFee.feePercentage}%</div>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        {showDetails && (
          <div className="space-y-3 pt-2 border-t">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Network Configuration</h4>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Network:</span>
                  <span>{config.description}</span>
                </div>
                <div className="flex justify-between">
                  <span>Min Fee:</span>
                  <span>{config.minFeeAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Fee:</span>
                  <span>{config.maxFeeAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={config.enabled ? "default" : "secondary"} className="h-4 text-xs">
                    {config.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Supported Networks</h4>
              <div className="flex flex-wrap gap-1">
                {supportedNetworks.map((network) => (
                  <Badge key={network} variant="outline" className="text-xs">
                    Chain {network}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Full Address</h4>
              <div className="p-2 bg-muted rounded text-xs font-mono break-all">{receiverAddress}</div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Payment system active and configured
        </div>
      </CardContent>
    </Card>
  )
}
