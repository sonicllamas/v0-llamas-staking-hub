"use client"

import { useState } from "react"
import { useWallet } from "@/context/wallet-context"
import { WalletModal } from "./wallet-modal"
import { NetworkSwitcher } from "./network-switcher"

export function WalletButton() {
  const { isConnected, address, balance, disconnectWallet } = useWallet()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <>
      {isConnected && address ? (
        <div className="flex items-center gap-3">
          <NetworkSwitcher />
          <div className="hidden md:block">
            <div className="text-green-300 text-sm">
              {balance ? `${Number.parseFloat(balance).toFixed(4)} ETH` : "Loading..."}
            </div>
            <div className="text-white font-bold">{formatAddress(address)}</div>
          </div>
          <button
            onClick={disconnectWallet}
            className="bg-white text-[#1a472a] px-4 py-2 rounded-full font-bold hover:bg-green-100 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={openModal}
          className="bg-white text-[#1a472a] px-4 py-2 rounded-full font-bold hover:bg-green-100 transition-colors"
        >
          Connect Wallet
        </button>
      )}

      <WalletModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  )
}
