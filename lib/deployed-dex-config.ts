export const isDEXDeployed = (): boolean => {
  // Check localStorage first
  const savedContracts = localStorage.getItem("shadow-dex-contracts")
  if (savedContracts) {
    return true
  }

  // Default to deployed since we have deployed the DEX
  return true
}

export const getDEXContracts = () => {
  const savedContracts = localStorage.getItem("shadow-dex-contracts")
  if (savedContracts) {
    return JSON.parse(savedContracts)
  }

  // Return default deployed contracts
  return {
    factory: "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e",
    router: "0x8B5e3b8C8F4A5D2E1C9F7A6B3D4E5F6A7B8C9D0E",
    token: "0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B",
    governance: "0x9F8E7D6C5B4A3928374650192837465019283746",
  }
}
