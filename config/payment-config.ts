// Payment Configuration for Llamas Staking Hub
// This file manages payment receiver addresses and fee structures

export interface PaymentConfig {
  receiverAddress: string
  feePercentage: number
  minFeeAmount: string
  maxFeeAmount: string
  enabled: boolean
  description: string
}

export interface NetworkPaymentConfig {
  [chainId: string]: PaymentConfig
}

// Default payment receiver wallet
export const DEFAULT_PAYMENT_RECEIVER = "0x1E9f317cB3A0c3B23c9D82DAec5A18d7895639F0"

// Payment configuration for different networks
export const PAYMENT_CONFIG: NetworkPaymentConfig = {
  // Ethereum Mainnet
  "1": {
    receiverAddress: DEFAULT_PAYMENT_RECEIVER,
    feePercentage: 0.3, // 0.3% fee
    minFeeAmount: "0.001", // Minimum 0.001 ETH
    maxFeeAmount: "0.1", // Maximum 0.1 ETH
    enabled: true,
    description: "Ethereum mainnet transaction fees",
  },

  // Sonic Mainnet
  "146": {
    receiverAddress: DEFAULT_PAYMENT_RECEIVER,
    feePercentage: 0.25, // 0.25% fee (lower for Sonic)
    minFeeAmount: "0.01", // Minimum 0.01 SONIC
    maxFeeAmount: "10", // Maximum 10 SONIC
    enabled: true,
    description: "Sonic mainnet transaction fees",
  },

  // Polygon
  "137": {
    receiverAddress: DEFAULT_PAYMENT_RECEIVER,
    feePercentage: 0.3, // 0.3% fee
    minFeeAmount: "0.01", // Minimum 0.01 MATIC
    maxFeeAmount: "10", // Maximum 10 MATIC
    enabled: true,
    description: "Polygon mainnet transaction fees",
  },

  // Arbitrum
  "42161": {
    receiverAddress: DEFAULT_PAYMENT_RECEIVER,
    feePercentage: 0.3, // 0.3% fee
    minFeeAmount: "0.001", // Minimum 0.001 ETH
    maxFeeAmount: "0.1", // Maximum 0.1 ETH
    enabled: true,
    description: "Arbitrum mainnet transaction fees",
  },
}

// Fee types for different transaction types
export enum FeeType {
  SWAP = "swap",
  STAKE = "stake",
  UNSTAKE = "unstake",
  CLAIM = "claim",
  BRIDGE = "bridge",
  NFT_TRANSFER = "nft_transfer",
}

// Fee configuration for different transaction types
export const FEE_CONFIG = {
  [FeeType.SWAP]: {
    percentage: 0.3,
    description: "Token swap transaction fee",
  },
  [FeeType.STAKE]: {
    percentage: 0.2,
    description: "NFT staking transaction fee",
  },
  [FeeType.UNSTAKE]: {
    percentage: 0.1,
    description: "NFT unstaking transaction fee",
  },
  [FeeType.CLAIM]: {
    percentage: 0.1,
    description: "Rewards claim transaction fee",
  },
  [FeeType.BRIDGE]: {
    percentage: 0.5,
    description: "Cross-chain bridge transaction fee",
  },
  [FeeType.NFT_TRANSFER]: {
    percentage: 0.2,
    description: "NFT transfer transaction fee",
  },
}

/**
 * Get payment configuration for a specific network
 * @param chainId - Network chain ID
 * @returns Payment configuration or default
 */
export function getPaymentConfig(chainId: string): PaymentConfig {
  return (
    PAYMENT_CONFIG[chainId] || {
      receiverAddress: DEFAULT_PAYMENT_RECEIVER,
      feePercentage: 0.3,
      minFeeAmount: "0.001",
      maxFeeAmount: "0.1",
      enabled: true,
      description: "Default transaction fees",
    }
  )
}

/**
 * Get payment receiver address for a specific network
 * @param chainId - Network chain ID
 * @returns Payment receiver address
 */
export function getPaymentReceiver(chainId: string): string {
  const config = getPaymentConfig(chainId)
  return config.receiverAddress
}

/**
 * Calculate transaction fee amount
 * @param amount - Transaction amount (in token units)
 * @param chainId - Network chain ID
 * @param feeType - Type of transaction
 * @returns Fee amount and details
 */
export function calculateTransactionFee(
  amount: string,
  chainId: string,
  feeType: FeeType = FeeType.SWAP,
): {
  feeAmount: string
  feePercentage: number
  receiverAddress: string
  minFee: string
  maxFee: string
} {
  const config = getPaymentConfig(chainId)
  const feeConfig = FEE_CONFIG[feeType]

  const amountNum = Number.parseFloat(amount)
  const feePercentage = feeConfig?.percentage || config.feePercentage
  const feeAmount = ((amountNum * feePercentage) / 100).toString()

  // Apply min/max limits
  const minFee = Number.parseFloat(config.minFeeAmount)
  const maxFee = Number.parseFloat(config.maxFeeAmount)
  const calculatedFee = Math.max(minFee, Math.min(maxFee, Number.parseFloat(feeAmount)))

  return {
    feeAmount: calculatedFee.toString(),
    feePercentage,
    receiverAddress: config.receiverAddress,
    minFee: config.minFeeAmount,
    maxFee: config.maxFeeAmount,
  }
}

/**
 * Check if payments are enabled for a network
 * @param chainId - Network chain ID
 * @returns Whether payments are enabled
 */
export function isPaymentEnabled(chainId: string): boolean {
  const config = getPaymentConfig(chainId)
  return config.enabled
}

/**
 * Get all supported payment networks
 * @returns Array of supported chain IDs
 */
export function getSupportedPaymentNetworks(): string[] {
  return Object.keys(PAYMENT_CONFIG).filter((chainId) => PAYMENT_CONFIG[chainId].enabled)
}

/**
 * Validate payment receiver address
 * @param address - Address to validate
 * @returns Whether address is valid
 */
export function isValidPaymentAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// Environment variable override (for admin configuration)
export const ADMIN_PAYMENT_RECEIVER = process.env.PAYMENT_RECEIVER_ADDRESS || DEFAULT_PAYMENT_RECEIVER

/**
 * Get the active payment receiver (with environment override)
 * @param chainId - Network chain ID
 * @returns Active payment receiver address
 */
export function getActivePaymentReceiver(chainId: string): string {
  // Use environment variable if set, otherwise use network config
  if (process.env.PAYMENT_RECEIVER_ADDRESS) {
    return process.env.PAYMENT_RECEIVER_ADDRESS
  }
  return getPaymentReceiver(chainId)
}
