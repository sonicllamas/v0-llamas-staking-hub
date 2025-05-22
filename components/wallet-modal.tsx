"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { useWallet } from "@/context/wallet-context"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connectWallet, isConnecting, error } = useWallet()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!isOpen) return null

  const handleConnect = async (walletType: string) => {
    await connectWallet(walletType)
    if (!error) {
      onClose()
    }
  }

  const wallets = [
    {
      id: "metamask",
      name: "MetaMask",
      icon: "/wallets/metamask.png",
      description: "Connect to your MetaMask Wallet",
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      icon: "/wallets/walletconnect.png",
      description: "Scan with WalletConnect to connect",
      disabled: true,
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      icon: "/wallets/coinbase.png",
      description: "Connect to your Coinbase Wallet",
      disabled: true,
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#0d2416] rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-xl font-bold">Connect Wallet</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {error && <div className="bg-red-900 text-white p-3 rounded-lg mb-4">{error}</div>}

        <div className="space-y-4">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleConnect(wallet.id)}
              disabled={isConnecting || wallet.disabled}
              className={`w-full flex items-center p-4 rounded-lg border border-gray-700 hover:bg-[#143621] transition-colors ${
                wallet.disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <div className="w-10 h-10 relative mr-4 bg-white rounded-full p-1">
                <Image
                  src={wallet.icon || "/placeholder.svg"}
                  alt={wallet.name}
                  width={40}
                  height={40}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="text-left">
                <div className="text-white font-bold">{wallet.name}</div>
                <div className="text-gray-400 text-sm">{wallet.description}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          By connecting your wallet, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  )
}
