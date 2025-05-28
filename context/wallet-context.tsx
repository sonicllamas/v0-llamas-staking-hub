"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface WalletContextType {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  chainId: number | null
  connect: (walletId?: string) => Promise<void>
  disconnect: () => void
  switchNetwork: (chainId: number) => Promise<void>
  checkNetwork: () => Promise<number | null>
  checkSonicNetwork: () => Promise<boolean>
  checkEthereumNetwork: () => Promise<boolean>
  refreshConnection: () => Promise<void>
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  chainId: null,
  connect: async () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
  checkNetwork: async () => null,
  checkSonicNetwork: async () => false,
  checkEthereumNetwork: async () => false,
  refreshConnection: async () => {},
})

export const useWallet = () => useContext(WalletContext)

interface WalletProviderProps {
  children: ReactNode
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  // Robust connection check function
  const checkConnection = useCallback(async (): Promise<{
    address: string | null
    chainId: number | null
    isConnected: boolean
  }> => {
    console.log("🔍 Checking wallet connection...")

    if (typeof window === "undefined") {
      console.log("❌ Window not available (SSR)")
      return { address: null, chainId: null, isConnected: false }
    }

    if (!window.ethereum) {
      console.log("❌ No ethereum provider found")
      return { address: null, chainId: null, isConnected: false }
    }

    try {
      // Get accounts and chain ID in parallel
      const [accounts, currentChainId] = await Promise.all([
        window.ethereum.request({ method: "eth_accounts" }) as Promise<string[]>,
        window.ethereum.request({ method: "eth_chainId" }) as Promise<string>,
      ])

      const walletAddress = accounts && accounts.length > 0 ? accounts[0] : null
      const parsedChainId = currentChainId ? Number.parseInt(currentChainId, 16) : null

      console.log("📱 Wallet check results:", {
        accounts,
        walletAddress,
        chainId: parsedChainId,
        isConnected: !!walletAddress,
      })

      return {
        address: walletAddress,
        chainId: parsedChainId,
        isConnected: !!walletAddress,
      }
    } catch (error) {
      console.error("❌ Failed to check wallet connection:", error)
      return { address: null, chainId: null, isConnected: false }
    }
  }, [])

  // Update wallet state
  const updateWalletState = useCallback((newAddress: string | null, newChainId: number | null, connected: boolean) => {
    console.log("🔄 Updating wallet state:", { newAddress, newChainId, connected })

    setAddress(newAddress)
    setChainId(newChainId)
    setIsConnected(connected)
    setError(null)

    // Clear any previous errors when successfully connected
    if (connected && newAddress) {
      setError(null)
    }
  }, [])

  // Refresh connection function
  const refreshConnection = useCallback(async () => {
    console.log("🔄 Refreshing wallet connection...")
    const result = await checkConnection()
    updateWalletState(result.address, result.chainId, result.isConnected)
  }, [checkConnection, updateWalletState])

  // Initialize wallet connection
  useEffect(() => {
    let mounted = true
    let retryCount = 0
    const maxRetries = 5

    const initializeWallet = async () => {
      console.log("🚀 Initializing wallet context...")

      // Wait for ethereum to be available
      while (retryCount < maxRetries && mounted) {
        if (typeof window !== "undefined" && window.ethereum) {
          console.log("🔗 Ethereum provider found, checking connection...")
          const result = await checkConnection()

          if (mounted) {
            updateWalletState(result.address, result.chainId, result.isConnected)
            setIsInitialized(true)
          }
          break
        } else {
          retryCount++
          console.log(`⏳ Waiting for ethereum provider... (${retryCount}/${maxRetries})`)
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }

      if (retryCount >= maxRetries && mounted) {
        console.log("❌ Ethereum provider not found after retries")
        setIsInitialized(true)
      }
    }

    initializeWallet()

    return () => {
      mounted = false
    }
  }, [checkConnection, updateWalletState])

  // Set up event listeners
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined" || !window.ethereum) {
      return
    }

    console.log("🎧 Setting up wallet event listeners...")

    const handleAccountsChanged = async (accounts: string[]) => {
      console.log("🔄 Accounts changed:", accounts)

      if (accounts.length === 0) {
        console.log("❌ User disconnected")
        updateWalletState(null, chainId, false)
      } else {
        console.log("✅ Account changed to:", accounts[0])
        // Get current chain ID when account changes
        try {
          const currentChainId = await window.ethereum.request({ method: "eth_chainId" })
          const parsedChainId = Number.parseInt(currentChainId, 16)
          updateWalletState(accounts[0], parsedChainId, true)
        } catch (error) {
          console.error("Failed to get chain ID on account change:", error)
          updateWalletState(accounts[0], chainId, true)
        }
      }
    }

    const handleChainChanged = (newChainId: string) => {
      console.log("🔄 Chain changed:", newChainId)
      const parsedChainId = Number.parseInt(newChainId, 16)
      setChainId(parsedChainId)

      // Refresh connection to ensure everything is in sync
      refreshConnection()
    }

    const handleConnect = (connectInfo: any) => {
      console.log("🔗 Wallet connected:", connectInfo)
      refreshConnection()
    }

    const handleDisconnect = (error: any) => {
      console.log("❌ Wallet disconnected:", error)
      updateWalletState(null, null, false)
    }

    // Add event listeners
    window.ethereum.on("accountsChanged", handleAccountsChanged)
    window.ethereum.on("chainChanged", handleChainChanged)
    window.ethereum.on("connect", handleConnect)
    window.ethereum.on("disconnect", handleDisconnect)

    return () => {
      // Clean up event listeners
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
        window.ethereum.removeListener("connect", handleConnect)
        window.ethereum.removeListener("disconnect", handleDisconnect)
      }
    }
  }, [isInitialized, chainId, refreshConnection, updateWalletState])

  // Debug logging
  useEffect(() => {
    console.log("🔧 Wallet State:", {
      address,
      isConnected,
      isConnecting,
      chainId,
      isInitialized,
      error,
      hasEthereum: typeof window !== "undefined" && !!window.ethereum,
    })
  }, [address, isConnected, isConnecting, chainId, isInitialized, error])

  // Check if user is on the correct network
  const checkNetwork = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const currentChainId = await window.ethereum.request({ method: "eth_chainId" })
        return Number.parseInt(currentChainId, 16)
      } catch (error) {
        console.error("Failed to get network:", error)
        return null
      }
    }
    return null
  }, [])

  // Check if user is on Sonic network
  const checkSonicNetwork = useCallback(async (): Promise<boolean> => {
    const currentChainId = await checkNetwork()
    return currentChainId === 146
  }, [checkNetwork])

  // Check if user is on Ethereum network
  const checkEthereumNetwork = useCallback(async (): Promise<boolean> => {
    const currentChainId = await checkNetwork()
    return currentChainId === 1
  }, [checkNetwork])

  // Connect wallet
  const connect = useCallback(
    async (walletId?: string) => {
      console.log("🔗 Attempting to connect wallet...")
      setIsConnecting(true)
      setError(null)

      try {
        if (typeof window !== "undefined" && window.ethereum) {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          })

          if (accounts && accounts.length > 0) {
            console.log("✅ Wallet connection successful:", accounts[0])

            // Get chain ID after successful connection
            const currentChainId = await window.ethereum.request({ method: "eth_chainId" })
            const parsedChainId = Number.parseInt(currentChainId, 16)

            updateWalletState(accounts[0], parsedChainId, true)
          } else {
            throw new Error("No accounts returned from wallet")
          }
        } else {
          throw new Error("No Ethereum wallet found")
        }
      } catch (error) {
        console.error("❌ Failed to connect wallet:", error)
        const errorMessage = (error as Error).message
        setError(errorMessage)

        // Don't update connection state on user rejection
        if (!errorMessage.includes("User rejected")) {
          updateWalletState(null, null, false)
        }
      } finally {
        setIsConnecting(false)
      }
    },
    [updateWalletState],
  )

  // Disconnect wallet
  const disconnect = useCallback(() => {
    console.log("❌ Disconnecting wallet...")
    updateWalletState(null, null, false)
  }, [updateWalletState])

  // Switch network
  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("No Ethereum wallet found")
    }

    try {
      console.log(`🔄 Switching to chain ID: ${targetChainId}`)

      // Try to switch to the network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })

      // Update chain ID after successful switch
      setChainId(targetChainId)
    } catch (switchError: any) {
      console.error("Switch network error:", switchError)

      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          let params

          // Add the network if it doesn't exist
          if (targetChainId === 146) {
            // Sonic network
            params = {
              chainId: "0x92", // 146 in hex
              chainName: "Sonic Mainnet",
              nativeCurrency: {
                name: "Sonic",
                symbol: "S",
                decimals: 18,
              },
              rpcUrls: ["https://rpc.soniclabs.com"],
              blockExplorerUrls: ["https://sonicscan.org"],
            }
          } else if (targetChainId === 1) {
            // Ethereum Mainnet
            params = {
              chainId: "0x1",
              chainName: "Ethereum Mainnet",
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://mainnet.infura.io/v3/"],
              blockExplorerUrls: ["https://etherscan.io"],
            }
          } else {
            throw new Error(`Unsupported chain ID: ${targetChainId}`)
          }

          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [params],
          })

          // Update chain ID after successful add
          setChainId(targetChainId)
        } catch (addError) {
          throw new Error(`Failed to add network: ${(addError as Error).message}`)
        }
      } else {
        throw new Error(`Failed to switch network: ${switchError.message}`)
      }
    }
  }, [])

  const contextValue = {
    address,
    isConnected,
    isConnecting,
    error,
    chainId,
    connect,
    disconnect,
    switchNetwork,
    checkNetwork,
    checkSonicNetwork,
    checkEthereumNetwork,
    refreshConnection,
  }

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>
}
