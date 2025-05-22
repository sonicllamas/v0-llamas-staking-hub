import type { Chain } from "wagmi"

// Define Sonic chain if not already in wagmi
export const sonic: Chain = {
  id: 146,
  name: "Sonic",
  network: "sonic",
  nativeCurrency: {
    decimals: 18,
    name: "Sonic",
    symbol: "SONIC",
  },
  rpcUrls: {
    default: { http: ["https://rpc.sonic.fantom.network"] },
    public: { http: ["https://rpc.sonic.fantom.network"] },
  },
  blockExplorers: {
    default: { name: "SonicScan", url: "https://explorer.sonic.fantom.network" },
  },
  testnet: false,
}

// Export all networks for use in the app
export const networks = [
  {
    id: 1,
    name: "Ethereum",
    icon: "/networks/ethereum.svg",
    nativeCurrency: "ETH",
  },
  {
    id: 137,
    name: "Polygon",
    icon: "/networks/polygon.svg",
    nativeCurrency: "MATIC",
  },
  {
    id: 42161,
    name: "Arbitrum",
    icon: "/networks/arbitrum.svg",
    nativeCurrency: "ETH",
  },
  {
    id: 10,
    name: "Optimism",
    icon: "/networks/optimism.svg",
    nativeCurrency: "ETH",
  },
  {
    id: 56,
    name: "BNB Chain",
    icon: "/networks/bnb.svg",
    nativeCurrency: "BNB",
  },
  {
    id: 146,
    name: "Sonic",
    icon: "/networks/sonic.svg",
    nativeCurrency: "SONIC",
  },
]
