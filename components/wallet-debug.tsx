"use client"

import { useWallet } from "@/context/wallet-context"
import { useEffect, useState } from "react"

export function WalletDebug() {
  const { address, isConnected, isConnecting, error } = useWallet()
  const [ethereumAvailable, setEthereumAvailable] = useState(false)
  const [accounts, setAccounts] = useState<string[]>([])
  const [chainId, setChainId] = useState<string | null>(null)
  const [isMetaMask, setIsMetaMask] = useState(false)

  useEffect(() => {
    const checkEthereum = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        setEthereumAvailable(true)
        setIsMetaMask(!!window.ethereum.isMetaMask)

        try {
          const accs = await window.ethereum.request({ method: "eth_accounts" })
          setAccounts(accs)

          const chain = await window.ethereum.request({ method: "eth_chainId" })
          setChainId(chain)
        } catch (err) {
          console.error("Failed to get wallet info:", err)
        }
      }
    }

    checkEthereum()

    // Refresh every 2 seconds
    const interval = setInterval(checkEthereum, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50 border border-gray-600">
      <h3 className="font-bold mb-2 text-yellow-400">🔧 Wallet Debug Info</h3>
      <div className="space-y-1">
        <div>Ethereum Available: {ethereumAvailable ? "✅" : "❌"}</div>
        <div>Is MetaMask: {isMetaMask ? "✅" : "❌"}</div>
        <div>Context Connected: {isConnected ? "✅" : "❌"}</div>
        <div>Context Address: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "none"}</div>
        <div>Is Connecting: {isConnecting ? "✅" : "❌"}</div>
        <div>Error: {error || "none"}</div>
        <div>
          Raw Accounts: {accounts.length > 0 ? `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}` : "none"}
        </div>
        <div>Chain ID: {chainId ? `${Number.parseInt(chainId, 16)} (${chainId})` : "none"}</div>
        <div className="pt-2 border-t border-gray-600">
          <div>Accounts Match: {accounts.length > 0 && address === accounts[0] ? "✅" : "❌"}</div>
        </div>
      </div>
    </div>
  )
}
