"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/context/wallet-context"
import { getNetworkById, MAINNET_NETWORKS, TESTNET_NETWORKS, isMainNetwork } from "@/config/networks"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Loader2, AlertCircle, Wifi, WifiOff } from "lucide-react"
import { NetworkIcon } from "./network-icon"

export function MinimalNetworkSwitcher() {
  const { chainId, switchNetwork, isSwitchingNetwork, error, isConnected } = useWallet()
  const [open, setOpen] = useState(false)
  const [showTestnets, setShowTestnets] = useState(false)

  const currentNetwork = chainId ? getNetworkById(chainId) : null
  const isSonic = chainId ? isMainNetwork(chainId) : false

  const handleSwitchNetwork = async (newChainId: number) => {
    try {
      await switchNetwork(newChainId)
      setOpen(false)
    } catch (err) {
      console.error("Failed to switch network:", err)
    }
  }

  if (!chainId || !isConnected) return null

  return (
    <div className="relative">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isSonic ? "default" : "outline"}
            size="sm"
            disabled={isSwitchingNetwork}
            className={`flex items-center gap-2 px-3 transition-all duration-200 ${
              isSonic
                ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-500"
                : "border-gray-600 hover:border-gray-500 bg-[#0d2416] hover:bg-[#143621] text-white"
            } ${isSwitchingNetwork ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isSwitchingNetwork ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : currentNetwork ? (
              <NetworkIcon src={currentNetwork.logoUrl} alt={currentNetwork.name} size={16} />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400" />
            )}
            <span className="text-xs font-medium">
              {isSwitchingNetwork ? "Switching..." : currentNetwork ? currentNetwork.name : "Unknown"}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[240px] bg-[#0d2416] border-gray-700">
          <DropdownMenuLabel className="text-gray-300 text-xs font-semibold uppercase tracking-wide">
            Select Network
          </DropdownMenuLabel>

          {/* Sonic Network - Featured */}
          <div className="p-1">
            <DropdownMenuItem
              onClick={() => handleSwitchNetwork(146)}
              disabled={isSwitchingNetwork}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                146 === chainId
                  ? "bg-gradient-to-r from-green-600/20 to-green-700/20 border border-green-500/30"
                  : "hover:bg-[#143621]"
              } ${isSwitchingNetwork ? "opacity-50 cursor-not-allowed" : ""} text-white`}
            >
              <NetworkIcon src="/networks/sonic.svg" alt="Sonic" size={20} />
              <div className="flex-1">
                <div className="font-medium">Sonic Mainnet</div>
                <div className="text-xs text-gray-400">Recommended</div>
              </div>
              {146 === chainId && (
                <div className="flex items-center gap-1">
                  <Wifi className="h-3 w-3 text-green-400" />
                  <span className="text-xs px-1.5 py-0.5 rounded bg-green-600/20 text-green-400 border border-green-500/30">
                    Connected
                  </span>
                </div>
              )}
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator className="bg-gray-700" />

          {/* Other Mainnet Networks */}
          <DropdownMenuLabel className="text-gray-400 text-xs font-medium">Other Networks</DropdownMenuLabel>
          <div className="p-1 space-y-1">
            {MAINNET_NETWORKS.filter((network) => network.chainId !== 146).map((network) => (
              <DropdownMenuItem
                key={network.chainId}
                onClick={() => handleSwitchNetwork(network.chainId)}
                disabled={isSwitchingNetwork}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer transition-colors ${
                  network.chainId === chainId ? "bg-gray-700/50" : "hover:bg-[#143621]"
                } ${isSwitchingNetwork ? "opacity-50 cursor-not-allowed" : ""} text-white`}
              >
                <NetworkIcon src={network.logoUrl} alt={network.name} size={18} />
                <span className="flex-1">{network.name}</span>
                {network.chainId === chainId && <Wifi className="h-3 w-3 text-green-400" />}
              </DropdownMenuItem>
            ))}
          </div>

          {/* Testnet Networks - Collapsible */}
          {TESTNET_NETWORKS.length > 0 && (
            <>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                onClick={() => setShowTestnets(!showTestnets)}
                className="flex items-center justify-between px-3 py-2 text-xs text-gray-400 hover:bg-[#143621] cursor-pointer"
              >
                <span>Testnets</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showTestnets ? "rotate-180" : ""}`} />
              </DropdownMenuItem>

              {showTestnets && (
                <div className="p-1 space-y-1">
                  {TESTNET_NETWORKS.map((network) => (
                    <DropdownMenuItem
                      key={network.chainId}
                      onClick={() => handleSwitchNetwork(network.chainId)}
                      disabled={isSwitchingNetwork}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer transition-colors ${
                        network.chainId === chainId ? "bg-gray-700/50" : "hover:bg-[#143621]"
                      } ${isSwitchingNetwork ? "opacity-50 cursor-not-allowed" : ""} text-white`}
                    >
                      <NetworkIcon src={network.logoUrl} alt={network.name} size={18} />
                      <div className="flex-1">
                        <div className="text-sm">{network.name}</div>
                        <div className="text-xs text-yellow-400">Testnet</div>
                      </div>
                      {network.chainId === chainId && <Wifi className="h-3 w-3 text-green-400" />}
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Error Display */}
      {error && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-red-900/90 backdrop-blur-sm text-white p-3 rounded-lg text-sm z-50 border border-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 text-red-400 flex-shrink-0" />
            <div>
              <div className="font-medium text-red-200">Network Switch Failed</div>
              <div className="text-xs text-red-300 mt-1">{error}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
