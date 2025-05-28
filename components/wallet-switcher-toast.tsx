"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/context/wallet-context"

export function WalletSwitcherToast() {
  const { toast } = useToast()
  const { address, connectedWallets } = useWallet()

  // Track address changes to show toast when switching wallets
  useEffect(() => {
    if (address && connectedWallets.length > 1) {
      const currentWallet = connectedWallets.find((wallet) => wallet.address === address)
      if (currentWallet) {
        toast({
          title: "Wallet Switched",
          description: `Now using wallet ${address.slice(0, 6)}...${address.slice(-4)}`,
          duration: 3000,
        })
      }
    }
  }, [address, connectedWallets, toast])

  return null
}
