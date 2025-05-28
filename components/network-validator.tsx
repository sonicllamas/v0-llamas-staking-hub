"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { useWallet } from "@/context/wallet-context"
import { useToast } from "@/components/ui/use-toast"

interface NetworkValidatorProps {
  requiredChainId: number
  requiredNetworkName: string
  children: React.ReactNode
}

export function NetworkValidator({ requiredChainId, requiredNetworkName, children }: NetworkValidatorProps) {
  const { isConnected, switchNetwork, checkNetwork } = useWallet()
  const { toast } = useToast()
  const [currentChainId, setCurrentChainId] = useState<number | null>(null)
  const [isValidNetwork, setIsValidNetwork] = useState<boolean>(false)
  const [isChecking, setIsChecking] = useState<boolean>(true)

  // Check network on mount and when connection changes
  useEffect(() => {
    const checkCurrentNetwork = async () => {
      if (!isConnected) {
        setIsChecking(false)
        return
      }

      setIsChecking(true)
      try {
        const chainId = await checkNetwork()
        setCurrentChainId(chainId)
        setIsValidNetwork(chainId === requiredChainId)
      } catch (error) {
        console.error("Failed to check network:", error)
        setIsValidNetwork(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkCurrentNetwork()

    // Listen for network changes
    if (typeof window !== "undefined" && window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        const newChainId = Number.parseInt(chainId, 16)
        setCurrentChainId(newChainId)
        setIsValidNetwork(newChainId === requiredChainId)
      }

      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [isConnected, requiredChainId, checkNetwork])

  const handleSwitchNetwork = async () => {
    try {
      await switchNetwork(requiredChainId)
      toast({
        title: "Network switched",
        description: `Successfully switched to ${requiredNetworkName}`,
      })
    } catch (error) {
      console.error("Failed to switch network:", error)
      toast({
        title: "Failed to switch network",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  if (!isConnected) {
    return <>{children}</>
  }

  if (isChecking) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Checking Network</AlertTitle>
        <AlertDescription>Verifying your current network...</AlertDescription>
      </Alert>
    )
  }

  if (!isValidNetwork) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Wrong Network</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            You're currently on {currentChainId ? `Chain ID ${currentChainId}` : "an unsupported network"}. Please
            switch to {requiredNetworkName} (Chain ID: {requiredChainId}) to continue.
          </p>
          <Button onClick={handleSwitchNetwork} size="sm">
            Switch to {requiredNetworkName}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-green-700">Connected to {requiredNetworkName}</AlertTitle>
        <AlertDescription className="text-green-600">
          You're on the correct network for this operation.
        </AlertDescription>
      </Alert>
      {children}
    </div>
  )
}
