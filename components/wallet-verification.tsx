"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@/context/wallet-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"

export function WalletVerification() {
  const { address, isConnected, chainId, balance, connectedWallets, activeWalletType, switchWallet } = useWallet()

  const [lastAction, setLastAction] = useState<string>("")
  const [actionLog, setActionLog] = useState<string[]>([])
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "error">("idle")
  const [verificationMessage, setVerificationMessage] = useState<string>("")

  // Log wallet state changes
  useEffect(() => {
    if (address) {
      const log = `Active wallet changed to: ${address.slice(0, 6)}...${address.slice(-4)}`
      setActionLog((prev) => [log, ...prev.slice(0, 9)])
      setLastAction(`Wallet switched to ${address.slice(0, 6)}...${address.slice(-4)}`)
    }
  }, [address])

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Get wallet type name
  const getWalletName = (type: string) => {
    const walletNames: Record<string, string> = {
      injected: "MetaMask",
      walletconnect: "WalletConnect",
      coinbase: "Coinbase Wallet",
      walletkit: "WalletKit",
    }
    return walletNames[type] || "Unknown Wallet"
  }

  // Get network name
  const getNetworkName = (chainId: number) => {
    const networks: Record<number, string> = {
      1: "Ethereum",
      146: "Sonic",
      137: "Polygon",
      42161: "Arbitrum",
      10: "Optimism",
      56: "BSC",
    }
    return networks[chainId] || `Unknown (${chainId})`
  }

  // Verify wallet switching
  const verifyWalletSwitching = () => {
    setVerificationStatus("idle")
    setVerificationMessage("")

    if (connectedWallets.length < 2) {
      setVerificationStatus("error")
      setVerificationMessage("Please connect at least 2 wallets to verify switching")
      return
    }

    // Find a wallet that's not the current one
    const otherWallet = connectedWallets.find((wallet) => wallet.address !== address)
    if (!otherWallet) {
      setVerificationStatus("error")
      setVerificationMessage("Could not find another wallet to switch to")
      return
    }

    // Log the action
    const log = `Switching from ${formatAddress(address!)} to ${formatAddress(otherWallet.address)}`
    setActionLog((prev) => [log, ...prev.slice(0, 9)])

    // Switch to the other wallet
    switchWallet(otherWallet.address)

    // Verify the switch was successful
    setTimeout(() => {
      if (address === otherWallet.address) {
        setVerificationStatus("success")
        setVerificationMessage(`Successfully switched to ${formatAddress(otherWallet.address)}`)
      } else {
        setVerificationStatus("error")
        setVerificationMessage("Wallet switch failed")
      }
    }, 500)
  }

  // Clear logs
  const clearLogs = () => {
    setActionLog([])
    setLastAction("")
    setVerificationStatus("idle")
    setVerificationMessage("")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Wallet Verification
          <Button variant="outline" size="sm" onClick={clearLogs}>
            Clear Logs
          </Button>
        </CardTitle>
        <CardDescription>Verify that connecting and switching between multiple wallets works correctly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Wallet Status */}
        <div className="rounded-md border p-4">
          <h3 className="text-sm font-medium mb-2">Current Wallet Status</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Connected:</div>
            <div>{isConnected ? "Yes" : "No"}</div>

            <div>Address:</div>
            <div>{address ? formatAddress(address) : "Not connected"}</div>

            <div>Wallet Type:</div>
            <div>{activeWalletType ? getWalletName(activeWalletType) : "N/A"}</div>

            <div>Network:</div>
            <div>{chainId ? getNetworkName(chainId) : "Unknown"}</div>

            <div>Balance:</div>
            <div>{balance ? `${balance} ETH` : "Unknown"}</div>

            <div>Connected Wallets:</div>
            <div>{connectedWallets.length}</div>
          </div>
        </div>

        {/* Connected Wallets */}
        <div className="rounded-md border p-4">
          <h3 className="text-sm font-medium mb-2">Connected Wallets ({connectedWallets.length})</h3>
          <div className="space-y-2">
            {connectedWallets.length === 0 ? (
              <div className="text-sm text-gray-500">No wallets connected</div>
            ) : (
              connectedWallets.map((wallet) => (
                <div
                  key={wallet.address}
                  className={`flex items-center justify-between rounded-md p-2 ${
                    wallet.address === address ? "bg-green-50 border border-green-200" : "bg-gray-50"
                  }`}
                >
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {formatAddress(wallet.address)}
                      {wallet.address === address && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getWalletName(wallet.type)} • {getNetworkName(wallet.chainId)}
                    </div>
                  </div>
                  {wallet.address !== address && (
                    <Button variant="outline" size="sm" onClick={() => switchWallet(wallet.address)}>
                      Switch
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Verification Controls */}
        <div className="rounded-md border p-4">
          <h3 className="text-sm font-medium mb-2">Verification</h3>
          <div className="space-y-4">
            <Button onClick={verifyWalletSwitching} disabled={connectedWallets.length < 2} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Test Wallet Switching
            </Button>

            {verificationStatus !== "idle" && (
              <Alert variant={verificationStatus === "success" ? "default" : "destructive"}>
                {verificationStatus === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>{verificationStatus === "success" ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{verificationMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Action Log */}
        <div className="rounded-md border p-4">
          <h3 className="text-sm font-medium mb-2">Action Log</h3>
          {lastAction && <div className="mb-2 text-sm font-medium text-blue-600">Last action: {lastAction}</div>}
          <div className="max-h-40 overflow-y-auto space-y-1">
            {actionLog.length === 0 ? (
              <div className="text-sm text-gray-500">No actions logged</div>
            ) : (
              actionLog.map((log, index) => (
                <div key={index} className="text-xs border-b pb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
