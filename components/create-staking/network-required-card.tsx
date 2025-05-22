"use client"

import { useWallet } from "@/context/wallet-context"
import { Network } from "lucide-react"
import Image from "next/image"

export function NetworkRequiredCard() {
  const { switchNetwork } = useWallet()

  return (
    <div className="bg-[#0d2416] rounded-xl p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-[#143621] rounded-full flex items-center justify-center">
          <Network size={32} className="text-green-400" />
        </div>
      </div>
      <h2 className="text-white text-2xl font-bold mb-4">Switch to Sonic Mainnet</h2>
      <p className="text-green-100 mb-6">Staking contracts can only be deployed on Sonic Mainnet.</p>
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2 bg-[#143621] px-4 py-2 rounded-lg">
          <div className="w-6 h-6 relative">
            <Image
              src="/networks/sonic.svg"
              alt="Sonic Network"
              width={24}
              height={24}
              className="rounded-full"
              unoptimized
            />
          </div>
          <span className="text-white font-medium">Sonic Mainnet</span>
        </div>
      </div>
      <button
        onClick={() => switchNetwork(146)}
        className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-full font-bold transition-colors"
      >
        Switch Network
      </button>
    </div>
  )
}
