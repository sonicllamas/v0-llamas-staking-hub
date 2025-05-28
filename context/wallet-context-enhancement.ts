import { getDynamicNetworkById } from "@/lib/network-manager"

// Add these functions to your WalletProvider component

const getReliableNetworkConfig = async (chainId: number) => {
  // First try to get from static networks
  const networks: Record<number, any> = {
    146: {
      chainId: 146,
      chainName: "Sonic",
      nativeCurrency: {
        name: "Sonic",
        symbol: "S",
        decimals: 18,
      },
      rpcUrls: ["https://rpc.soniclabs.com", "https://sonic.alt-rpc.com"],
      blockExplorerUrls: ["https://sonicscan.org"],
    },
    1: {
      chainId: 1,
      chainName: "Ethereum Mainnet",
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: ["https://eth-mainnet.g.alchemy.com/v2/demo", "https://rpc.ankr.com/eth", "https://eth.llamarpc.com"],
      blockExplorerUrls: ["https://etherscan.io"],
    },
    // Default networks as fallback...
  }

  // Check if we have this network in our static config
  if (networks[chainId]) {
    return networks[chainId]
  }

  // If not found in static config, try to fetch from chainlist
  try {
    const dynamicNetwork = await getDynamicNetworkById(chainId)

    if (dynamicNetwork) {
      // Format for wallet provider
      return {
        chainId: dynamicNetwork.chainId,
        chainName: dynamicNetwork.name,
        nativeCurrency: dynamicNetwork.nativeCurrency || {
          name: dynamicNetwork.symbol,
          symbol: dynamicNetwork.symbol,
          decimals: dynamicNetwork.decimals,
        },
        rpcUrls: dynamicNetwork.rpcUrls || [dynamicNetwork.rpcUrl],
        blockExplorerUrls: [dynamicNetwork.blockExplorer],
      }
    }
  } catch (err) {
    console.error("Failed to get dynamic network config:", err)
  }

  // Return undefined if no config is found
  return undefined
}

const switchNetwork = async (
  targetChainId: number,
  isConnected: boolean,
  setError: (error: string | null) => void,
  setIsSwitchingNetwork: (isSwitching: boolean) => void,
  walletKit: any,
  setChainId: (chainId: number) => void,
  address: string | undefined,
  setConnectedWallets: (wallets: any[]) => void,
) => {
  if (!isConnected) {
    setError("Please connect your wallet first")
    return
  }

  setIsSwitchingNetwork(true)
  setError(null)

  // Try WalletKit first
  if (walletKit) {
    try {
      // Try different methods to switch chain
      if (typeof walletKit.switchChain === "function") {
        await walletKit.switchChain(targetChainId)
        setChainId(targetChainId)

        // Update connected wallets
        if (address) {
          setConnectedWallets((prev) =>
            prev.map((wallet) => (wallet.address === address ? { ...wallet, chainId: targetChainId } : wallet)),
          )
        }

        setIsSwitchingNetwork(false)
        return
      } else if (typeof walletKit.switchNetwork === "function") {
        await walletKit.switchNetwork(targetChainId)
        setChainId(targetChainId)

        // Update connected wallets
        if (address) {
          setConnectedWallets((prev) =>
            prev.map((wallet) => (wallet.address === address ? { ...wallet, chainId: targetChainId } : wallet)),
          )
        }

        setIsSwitchingNetwork(false)
        return
      }
    } catch (err: any) {
      console.error("Failed to switch network with WalletKit:", err)
      // Try to add the network if it doesn't exist
      try {
        const networkConfig = await getReliableNetworkConfig(targetChainId)
        if (networkConfig && typeof walletKit.addChain === "function") {
          await walletKit.addChain(networkConfig)

          if (typeof walletKit.switchChain === "function") {
            await walletKit.switchChain(targetChainId)
          } else if (typeof walletKit.switchNetwork === "function") {
            await walletKit.switchNetwork(targetChainId)
          }

          setChainId(targetChainId)

          // Update connected wallets
          if (address) {
            setConnectedWallets((prev) =>
              prev.map((wallet) => (wallet.address === address ? { ...wallet, chainId: targetChainId } : wallet)),
            )
          }

          setIsSwitchingNetwork(false)
          return
        }
      } catch (addError: any) {
        console.error("Failed to add network with WalletKit:", addError)
        // Continue to fallback
      }
    }
  }

  // Fallback to window.ethereum
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
      setChainId(targetChainId)

      // Update connected wallets
      if (address) {
        setConnectedWallets((prev) =>
          prev.map((wallet) => (wallet.address === address ? { ...wallet, chainId: targetChainId } : wallet)),
        )
      }
    } catch (err: any) {
      if (err.code === 4902) {
        // Chain not added to MetaMask
        try {
          const networkConfig = await getReliableNetworkConfig(targetChainId)
          if (networkConfig) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${targetChainId.toString(16)}`,
                  chainName: networkConfig.chainName,
                  nativeCurrency: networkConfig.nativeCurrency,
                  rpcUrls: networkConfig.rpcUrls,
                  blockExplorerUrls: networkConfig.blockExplorerUrls,
                },
              ],
            })

            // Try switching again
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${targetChainId.toString(16)}` }],
            })

            setChainId(targetChainId)

            // Update connected wallets
            if (address) {
              setConnectedWallets((prev) =>
                prev.map((wallet) => (wallet.address === address ? { ...wallet, chainId: targetChainId } : wallet)),
              )
            }
          }
        } catch (addError: any) {
          console.error("Failed to add network with Ethereum:", addError)
          setError(addError.message || "Failed to add network")
        }
      } else {
        console.error("Failed to switch network with Ethereum:", err)
        setError(err.message || "Failed to switch network")
      }
    }
  } else {
    setError("No wallet detected. Please install MetaMask or another wallet.")
  }

  setIsSwitchingNetwork(false)
}
