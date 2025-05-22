"use client"

import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { useWallet } from "@/context/wallet-context"

export function WalletInfo() {
  const { isConnected, address, balance, chainId, network } = useWallet()

  if (!isConnected || !address) {
    return null
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isSonicNetwork = chainId === 146

  return (
    <div className={`bg-[#0d2416] rounded-xl p-6 shadow-lg ${isSonicNetwork ? "border border-green-400" : ""}`}>
      <h3 className="text-white text-xl font-bold mb-4">Wallet Connected</h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Address:</span>
          <div className="flex items-center gap-2">
            <span className="text-white font-mono">{formatAddress(address)}</span>
            {network && (
              <a
                href={`${network.blockExplorer}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Balance:</span>
          <div className="flex items-center gap-2">
            <span className="text-white">
              {balance ? `${Number.parseFloat(balance).toFixed(4)} ${network?.symbol || "ETH"}` : "Loading..."}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Network:</span>
          <div className="flex items-center gap-2">
            {network ? (
              <>
                <div className="w-5 h-5 relative">
                  <Image
                    src={network.logoUrl || "/placeholder.svg"}
                    alt={network.name}
                    width={20}
                    height={20}
                    className="rounded-full"
                    unoptimized
                  />
                </div>
                <span className={`text-white ${isSonicNetwork ? "font-bold" : ""}`}>{network.name}</span>
                {isSonicNetwork && (
                  <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">Main</span>
                )}
                {network.isTestnet && (
                  <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded-full">Testnet</span>
                )}
              </>
            ) : (
              <span className="text-white">Unknown Network</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
