"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronDown, Check, AlertCircle } from "lucide-react"
import { useWallet } from "@/context/wallet-context"
import { MAINNET_NETWORKS, TESTNET_NETWORKS, MAIN_NETWORK } from "@/config/networks"

export function NetworkSwitcher() {
  const { chainId, network, isConnected, isSwitchingNetwork, switchNetwork, error } = useWallet()
  const [isOpen, setIsOpen] = useState(false)
  const [showSwitchPrompt, setShowSwitchPrompt] = useState(false)

  useEffect(() => {
    // Check if user is on a different network than Sonic Mainnet
    if (isConnected && chainId && chainId !== 146) {
      setShowSwitchPrompt(true)
    } else {
      setShowSwitchPrompt(false)
    }
  }, [isConnected, chainId])

  if (!isConnected) {
    return null
  }

  const toggleDropdown = () => setIsOpen(!isOpen)
  const closeDropdown = () => setIsOpen(false)

  const handleNetworkSwitch = async (targetChainId: number) => {
    await switchNetwork(targetChainId)
    closeDropdown()
    if (targetChainId === 146) {
      setShowSwitchPrompt(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        disabled={isSwitchingNetwork}
        className={`flex items-center gap-2 bg-[#0d2416] px-3 py-2 rounded-lg hover:bg-[#143621] transition-colors ${
          isSwitchingNetwork ? "opacity-70 cursor-not-allowed" : ""
        } ${chainId === 146 ? "ring-2 ring-green-400" : ""}`}
      >
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
            <span className="text-white text-sm font-medium">{network.name}</span>
          </>
        ) : (
          <span className="text-white text-sm font-medium">Unknown Network</span>
        )}
        <ChevronDown size={16} className="text-white" />
      </button>

      {showSwitchPrompt && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-[#0d2416] rounded-lg shadow-xl z-50 p-3 border border-green-400">
          <div className="flex items-start gap-2 mb-3">
            <div className="w-5 h-5 relative mt-0.5">
              <Image
                src={MAIN_NETWORK.logoUrl || "/placeholder.svg"}
                alt={MAIN_NETWORK.name}
                width={20}
                height={20}
                className="rounded-full"
                unoptimized
              />
            </div>
            <div>
              <p className="text-white text-sm">Switch to Sonic Mainnet for the best experience</p>
              <p className="text-gray-400 text-xs mt-1">This app works best on Sonic Mainnet</p>
            </div>
          </div>
          <button
            onClick={() => handleNetworkSwitch(146)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors"
          >
            Switch to Sonic Mainnet
          </button>
        </div>
      )}

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-[#0d2416] rounded-lg shadow-xl z-50 py-2">
          <div className="px-3 py-2">
            <h4 className="text-white text-xs font-bold uppercase mb-1">Recommended</h4>
            <button
              onClick={() => handleNetworkSwitch(146)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm text-white hover:bg-[#143621] rounded-md transition-colors bg-gradient-to-r from-[#143621] to-[#0d2416]"
            >
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
                <span className="font-bold">{MAIN_NETWORK.name}</span>
              </div>
              {chainId === 146 && <Check size={16} className="text-green-400" />}
            </button>
          </div>

          <div className="border-t border-gray-700 my-1"></div>

          <div className="px-3 py-2">
            <h4 className="text-white text-xs font-bold uppercase mb-1">Other Networks</h4>
            <div className="space-y-1">
              {MAINNET_NETWORKS.filter((net) => net.chainId !== 146).map((net) => (
                <button
                  key={net.chainId}
                  onClick={() => handleNetworkSwitch(net.chainId)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-white hover:bg-[#143621] rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 relative">
                      <Image
                        src={net.logoUrl || "/placeholder.svg"}
                        alt={net.name}
                        width={20}
                        height={20}
                        className="rounded-full"
                        unoptimized
                      />
                    </div>
                    <span>{net.name}</span>
                  </div>
                  {chainId === net.chainId && <Check size={16} className="text-green-400" />}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-700 my-1"></div>

          <div className="px-3 py-2">
            <h4 className="text-white text-xs font-bold uppercase mb-1">Testnet</h4>
            <div className="space-y-1">
              {TESTNET_NETWORKS.map((net) => (
                <button
                  key={net.chainId}
                  onClick={() => handleNetworkSwitch(net.chainId)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-white hover:bg-[#143621] rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 relative">
                      <Image
                        src={net.logoUrl || "/placeholder.svg"}
                        alt={net.name}
                        width={20}
                        height={20}
                        className="rounded-full"
                        unoptimized
                      />
                    </div>
                    <span>{net.name}</span>
                  </div>
                  {chainId === net.chainId && <Check size={16} className="text-green-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && isConnected && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-red-900 text-white p-3 rounded-lg text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
