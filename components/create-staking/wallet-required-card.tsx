"use client"

import { Wallet, ArrowUp } from "lucide-react"

export function WalletRequiredCard() {
  return (
    <div className="bg-[#0d2416] rounded-xl p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-[#143621] rounded-full flex items-center justify-center">
          <Wallet size={32} className="text-green-400" />
        </div>
      </div>
      <h2 className="text-white text-2xl font-bold mb-4">Connect Your Wallet</h2>
      <p className="text-green-100 mb-6">You need to connect your wallet to create a staking contract.</p>
      <div className="flex justify-center items-center text-green-400">
        <ArrowUp className="animate-bounce mr-2" size={20} />
        <span>Use the Connect Wallet button in the header</span>
      </div>
    </div>
  )
}
