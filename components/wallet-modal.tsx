"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/context/wallet-context"
import { Wallet, AlertCircle } from "lucide-react"
import Image from "next/image"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, isConnecting, error } = useWallet()
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  const wallets = [
    {
      id: "injected",
      name: "MetaMask",
      description: "Connect using MetaMask or other injected wallets",
      icon: "/wallets/metamask.png",
      available: typeof window !== "undefined" && window.ethereum,
    },
  ]

  const handleConnect = async (walletId: string) => {
    setSelectedWallet(walletId)
    try {
      await connect(walletId)
      onClose()
    } catch (err) {
      console.error("Connection failed:", err)
    }
    setSelectedWallet(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="wallet-modal-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription id="wallet-modal-description">
            Choose a wallet to connect to the Llamas Staking Hub. Make sure you have a compatible wallet installed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            {wallets.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                className="w-full h-16 flex items-center justify-start gap-4 p-4"
                onClick={() => handleConnect(wallet.id)}
                disabled={!wallet.available || isConnecting || selectedWallet === wallet.id}
              >
                <div className="relative w-8 h-8">
                  <Image src={wallet.icon || "/placeholder.svg"} alt={wallet.name} fill className="object-contain" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{wallet.name}</div>
                  <div className="text-sm text-gray-500">
                    {!wallet.available ? "Not installed" : wallet.description}
                  </div>
                </div>
                {isConnecting && selectedWallet === wallet.id && (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                )}
              </Button>
            ))}
          </div>

          {!wallets.some((w) => w.available) && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">No compatible wallets detected</p>
              <p className="text-xs text-gray-500">Please install MetaMask or another compatible wallet to continue</p>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By connecting a wallet, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
