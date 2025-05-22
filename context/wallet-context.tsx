"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAccount, useConnect, useDisconnect, useConfig } from "wagmi"
import { InjectedConnector } from "wagmi/connectors/injected"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet"
import { networks } from "@/config/networks"

interface WalletContextType {
  address: string | undefined
  isConnected: boolean
  isConnecting: boolean
  connect: (connector?: "injected" | "walletConnect" | "coinbaseWallet") => void
  disconnect: () => void
  chainId: number | undefined
  switchNetwork: (chainId: number) => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [chainId, setChainId] = useState<number | undefined>(undefined)
  const config = useConfig()

  const { address, isConnected, isConnecting } = useAccount()
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()

  // Update chainId when it changes in the wallet
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleChainChanged = (chainIdHex: string) => {
        setChainId(Number.parseInt(chainIdHex, 16))
      }

      window.ethereum.on("chainChanged", handleChainChanged)

      // Get initial chainId
      window.ethereum
        .request({ method: "eth_chainId" })
        .then((chainIdHex: string) => {
          setChainId(Number.parseInt(chainIdHex, 16))
        })
        .catch(console.error)

      return () => {
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [isConnected])

  const connect = async (connectorType: "injected" | "walletConnect" | "coinbaseWallet" = "injected") => {
    try {
      let connector

      switch (connectorType) {
        case "injected":
          connector = new InjectedConnector()
          break
        case "walletConnect":
          connector = new WalletConnectConnector({
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "default-project-id",
          })
          break
        case "coinbaseWallet":
          connector = new CoinbaseWalletConnector({
            appName: "Sonic Llamas Staking Hub",
          })
          break
        default:
          connector = new InjectedConnector()
      }

      await connectAsync({ connector })
    } catch (error) {
      console.error("Connection error:", error)
    }
  }

  const disconnect = async () => {
    try {
      await disconnectAsync()
    } catch (error) {
      console.error("Disconnection error:", error)
    }
  }

  const switchNetwork = async (newChainId: number) => {
    if (!window.ethereum) return

    const chainIdHex = `0x${newChainId.toString(16)}`

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      })
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        const network = networks.find((n) => n.id === newChainId)
        if (!network) return

        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chainIdHex,
                chainName: network.name,
                nativeCurrency: {
                  name: network.nativeCurrency,
                  symbol: network.nativeCurrency,
                  decimals: 18,
                },
                rpcUrls: [config.chains.find((c) => c.id === newChainId)?.rpcUrls.default.http[0] || ""],
                blockExplorerUrls: [config.chains.find((c) => c.id === newChainId)?.blockExplorers?.default.url || ""],
              },
            ],
          })
        } catch (addError) {
          console.error("Error adding chain:", addError)
        }
      } else {
        console.error("Error switching chain:", error)
      }
    }
  }

  const value = {
    address,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    chainId,
    switchNetwork,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
