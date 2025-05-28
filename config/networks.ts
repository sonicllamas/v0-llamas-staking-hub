export interface NetworkConfig {
  chainId: number
  name: string
  symbol: string
  decimals: number
  rpcUrl: string
  blockExplorer: string
  logoUrl: string
  isTestnet?: boolean
  isMain?: boolean
}

export const NETWORKS: Record<number, NetworkConfig> = {
  146: {
    chainId: 146,
    name: "Sonic Mainnet",
    symbol: "S",
    decimals: 18,
    rpcUrl: "https://rpc.soniclabs.com",
    blockExplorer: "https://sonicscan.org",
    logoUrl: "/networks/sonic.svg",
    isMain: true,
  },
  1: {
    chainId: 1,
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    rpcUrl: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    blockExplorer: "https://etherscan.io",
    logoUrl: "/networks/ethereum.svg",
  },
  137: {
    chainId: 137,
    name: "Polygon",
    symbol: "MATIC",
    decimals: 18,
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
    logoUrl: "/networks/polygon.svg",
  },
  42161: {
    chainId: 42161,
    name: "Arbitrum",
    symbol: "ETH",
    decimals: 18,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    blockExplorer: "https://arbiscan.io",
    logoUrl: "/networks/arbitrum.svg",
  },
  10: {
    chainId: 10,
    name: "Optimism",
    symbol: "ETH",
    decimals: 18,
    rpcUrl: "https://mainnet.optimism.io",
    blockExplorer: "https://optimistic.etherscan.io",
    logoUrl: "/networks/optimism.svg",
  },
  56: {
    chainId: 56,
    name: "BNB Chain",
    symbol: "BNB",
    decimals: 18,
    rpcUrl: "https://bsc-dataseed.binance.org",
    blockExplorer: "https://bscscan.com",
    logoUrl: "/networks/bnb.svg",
  },
  // Testnets
  5: {
    chainId: 5,
    name: "Goerli",
    symbol: "ETH",
    decimals: 18,
    rpcUrl: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    blockExplorer: "https://goerli.etherscan.io",
    logoUrl: "/networks/ethereum.svg",
    isTestnet: true,
  },
  80001: {
    chainId: 80001,
    name: "Mumbai",
    symbol: "MATIC",
    decimals: 18,
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    blockExplorer: "https://mumbai.polygonscan.com",
    logoUrl: "/networks/polygon.svg",
    isTestnet: true,
  },
  11155111: {
    chainId: 11155111,
    name: "Sepolia",
    symbol: "ETH",
    decimals: 18,
    rpcUrl: "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    blockExplorer: "https://sepolia.etherscan.io",
    logoUrl: "/networks/ethereum.svg",
    isTestnet: true,
  },
}

export const getNetworkById = (chainId: number | null): NetworkConfig | undefined => {
  if (!chainId) return undefined
  return NETWORKS[chainId]
}

// Export the main network (Sonic)
export const MAIN_NETWORK = NETWORKS[146]

// Export network arrays
export const SUPPORTED_NETWORKS = Object.values(NETWORKS)
export const MAINNET_NETWORKS = SUPPORTED_NETWORKS.filter((network) => !network.isTestnet)
export const TESTNET_NETWORKS = SUPPORTED_NETWORKS.filter((network) => network.isTestnet)

// Export network utilities
export const getNetworkName = (chainId: number): string => {
  const network = getNetworkById(chainId)
  return network?.name || "Unknown Network"
}

export const getNetworkSymbol = (chainId: number): string => {
  const network = getNetworkById(chainId)
  return network?.symbol || "ETH"
}

export const isMainNetwork = (chainId: number): boolean => {
  return chainId === MAIN_NETWORK.chainId
}

export const isSupportedNetwork = (chainId: number): boolean => {
  return chainId in NETWORKS
}

// Export for compatibility with existing code
export const networks = Object.values(NETWORKS).map((network) => ({
  id: network.chainId,
  name: network.name,
  icon: network.logoUrl,
  nativeCurrency: network.symbol,
}))
