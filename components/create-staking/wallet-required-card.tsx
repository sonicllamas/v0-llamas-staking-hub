"use client"

import { useWallet } from "@/context/wallet-context"
import { Wallet } from "lucide-react"

export function WalletRequiredCard() {
  const { connectWallet } = useWallet()

  return (
    <div className="bg-[#0d2416] rounded-xl p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-[#143621] rounded-full flex items-center justify-center">
          <Wallet size={32} className="text-green-400" />
        </div>
      </div>
      <h2 className="text-white text-2xl font-bold mb-4">Connect Your Wallet</h2>
      <p className="text-green-100 mb-6">You need to connect your wallet to create a staking contract.</p>
      <button
        onClick={() => connectWallet("metamask")}
        className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-full font-bold transition-colors"
      >
        Connect Wallet
      </button>
    </div>
  )
}
