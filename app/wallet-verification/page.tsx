"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Container } from "@/components/container"
import { BackButton } from "@/components/back-button"
import { CheckCircle, AlertCircle, Wallet } from "lucide-react"

export default function WalletVerificationPage() {
  const { address, chainId, balance, connectedWallets = [], switchWallet, activeWalletType } = useWallet()

  const [actionLog, setActionLog] = useState<string[]>([])
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  // Log initial state
  useEffect(() => {
    logAction("Page loaded, current wallet: " + (address || "None"))
    logAction(`Connected wallets: ${connectedWallets?.length || 0}`)
  }, [address, connectedWallets])

  const logAction = (action: string) => {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${action}`, ...prev])
  }

  const handleSwitchWallet = (walletAddress: string) => {
    logAction(`Attempting to switch to wallet: ${walletAddress}`)
    if (switchWallet) {
      switchWallet(walletAddress)
    }
  }

  const runVerificationTest = () => {
    logAction("Starting verification test...")

    // Find a wallet that's not the current one
    const otherWallet = connectedWallets?.find((wallet) => wallet.address !== address)

    if (!otherWallet) {
      logAction("Test failed: Need at least two connected wallets")
      setTestResult({
        success: false,
        message: "Please connect at least two wallets to run this test",
      })
      return
    }

    // Try switching to the other wallet
    try {
      if (switchWallet) {
        switchWallet(otherWallet.address)
        logAction(`Switched to wallet: ${otherWallet.address}`)

        // Check if the switch was successful
        setTimeout(() => {
          if (address === otherWallet.address) {
            logAction("Test passed: Successfully switched wallet")
            setTestResult({
              success: true,
              message: "Wallet switching is working correctly!",
            })
          } else {
            logAction("Test failed: Wallet did not switch")
            setTestResult({
              success: false,
              message: "Wallet did not switch correctly. Check console for errors.",
            })
          }
        }, 500)
      }
    } catch (error) {
      logAction(`Test error: ${error}`)
      setTestResult({
        success: false,
        message: `Error: ${error}`,
      })
    }
  }

  const getNetworkName = (chainId?: number) => {
    if (!chainId) return "Unknown"

    const networks: Record<number, string> = {
      1: "Ethereum",
      137: "Polygon",
      42161: "Arbitrum",
      10: "Optimism",
      56: "BSC",
      146: "Sonic",
    }

    return networks[chainId] || `Chain ID: ${chainId}`
  }

  const getWalletTypeName = (type?: string) => {
    if (!type) return "Unknown"

    const types: Record<string, string> = {
      injected: "MetaMask/Injected",
      walletconnect: "WalletConnect",
      coinbase: "Coinbase Wallet",
      walletkit: "WalletKit",
    }

    return types[type] || type
  }

  const connectedWalletsCount = connectedWallets?.length || 0

  return (
    <Container>
      <div className="mb-6">
        <BackButton />
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Wallet Switching Verification</CardTitle>
            <CardDescription>
              Verify that connecting and switching between multiple wallets works correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">Current Wallet Status</h3>
                {address ? (
                  <div className="space-y-2">
                    <p>
                      <strong>Address:</strong> {address}
                    </p>
                    <p>
                      <strong>Network:</strong> {getNetworkName(chainId)}
                    </p>
                    <p>
                      <strong>Balance:</strong> {balance || "Loading..."}
                    </p>
                    <p>
                      <strong>Wallet Type:</strong> {getWalletTypeName(activeWalletType)}
                    </p>
                  </div>
                ) : (
                  <p>No wallet connected</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Connected Wallets ({connectedWalletsCount})</h3>
                {connectedWalletsCount > 0 ? (
                  <div className="space-y-3">
                    {connectedWallets.map((wallet) => (
                      <div
                        key={wallet.address}
                        className={`p-3 border rounded-lg ${wallet.address === address ? "bg-muted border-primary" : ""}`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono">
                                {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                              </span>
                              {wallet.address === address && (
                                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              <span>{getNetworkName(wallet.chainId)}</span>
                              <span className="mx-2">•</span>
                              <span>{getWalletTypeName(wallet.type)}</span>
                              {wallet.balance && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>{wallet.balance}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {wallet.address !== address && (
                            <Button size="sm" onClick={() => handleSwitchWallet(wallet.address)}>
                              Switch
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No wallets connected</p>
                )}
              </div>

              {testResult && (
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertTitle>{testResult.success ? "Test Passed" : "Test Failed"}</AlertTitle>
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setActionLog([])}>
              Clear Log
            </Button>
            <Button onClick={runVerificationTest} disabled={connectedWalletsCount < 2}>
              Test Wallet Switching
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Action Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-3 rounded-md h-[200px] overflow-y-auto font-mono text-sm">
              {actionLog.length > 0 ? (
                <div className="space-y-1">
                  {actionLog.map((log, i) => (
                    <div key={i} className="border-b border-border/30 pb-1 last:border-0">
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No actions logged yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}
