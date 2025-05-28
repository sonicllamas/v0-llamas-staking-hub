"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { WalletModal } from "@/components/wallet-modal"
import { useWallet } from "@/context/wallet-context"
import { Wallet, ChevronDown, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function WalletButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { address, isConnected, isConnecting, disconnect } = useWallet()

  if (isConnecting) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-10 w-32 bg-gray-700 rounded-lg animate-pulse"></div>
        <div className="h-10 w-40 bg-gray-700 rounded-lg animate-pulse"></div>
      </div>
    )
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleAddWallet = () => {
    setIsModalOpen(true)
  }

  if (!isConnected) {
    return (
      <>
        <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
        <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span>{formatAddress(address!)}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="p-2">
            <div className="text-sm font-medium">{formatAddress(address!)}</div>
            <div className="text-xs text-gray-500">Connected</div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleAddWallet} className="text-blue-600">
            <Plus className="mr-2 h-4 w-4" />
            Connect Another Wallet
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect} className="text-red-600">
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
