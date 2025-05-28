"use client"

import { useWallet } from "@/context/wallet-context"
import { MAIN_NETWORK } from "@/config/networks"
import { Container } from "./container"
import Image from "next/image"

export function NetworkBanner() {
  const { isConnected, chainId, switchNetwork } = useWallet()

  if (!isConnected || chainId === 146) {
    return null
  }

  return (
    <div className="bg-[#0d2416] py-2 border-b border-green-800 sonic-theme:bg-sonic-background sonic-theme:border-sonic-light">
      <Container>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 relative">
              <Image
                src={MAIN_NETWORK.logoUrl || "/placeholder.svg"}
                alt={MAIN_NETWORK.name}
                width={20}
                height={20}
                className="rounded-full"
                unoptimized
              />
            </div>
            <span className="text-white text-sm sonic-theme:text-sonic-text">
              This app works best on <span className="font-bold">Sonic Mainnet</span>
            </span>
          </div>
          <button
            onClick={() => switchNetwork(146)}
            className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded-md transition-colors sonic-theme:bg-sonic sonic-theme:hover:bg-sonic-dark"
          >
            Switch Network
          </button>
        </div>
      </Container>
    </div>
  )
}
