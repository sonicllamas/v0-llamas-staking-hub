export interface NFT {
  id: string
  name: string
  image: string
  tokenId: string
  contractAddress: string
  rarity?:
    | string
    | {
        score: number
        rank: number
        total: number
        calculated_at: number
      }
    | null
  attributes?: Array<{
    trait_type: string
    value: string
    display_type?: string
    frequency?: number
    average?: string
    count?: number
  }>
  owner: string
  isStaked?: boolean
  stakingRewards?: string
  isOnSale?: boolean
  price?: string
  verified?: boolean
  whitelisted?: boolean
  createdAt?: string
  lastTransferAt?: string
  // Additional fields from PaintSwap API
  mintOrder?: string
  approvalState?: string
  contentVerified?: boolean
  isERC721?: boolean
  isTransferable?: boolean
  creator?: string
  locked?: string
  isNSFW?: boolean
  isTracked?: boolean
  address?: string
  collection?: {
    address: string
    name: string
    isVerified: boolean
    isWhitelisted: boolean
  }
  thumbnail?: string
}

export interface NFTAttribute {
  trait_type: string
  value: string | number
  display_type?: string
  frequency?: number
  average?: string
  count?: number
}

export interface NFTCollection {
  address: string
  name: string
  description: string
  totalSupply: string
  verified?: boolean
  isWhitelisted?: boolean
  banner?: string
  image?: string
  website?: string
  twitter?: string
  discord?: string
  telegram?: string
  floorPrice?: string
  volume24h?: string
  volumeWeek?: string
  totalVolume?: string
  sales24h?: string
  salesWeek?: string
  totalSales?: string
  averagePrice?: string
  marketCap?: string
  owners?: number
  items?: number
  traitTypes?: number
  traits?: Record<string, Record<string, number>>
  createdAt?: string
  updatedAt?: string
}

export interface NFTCollectionResponse {
  collections: NFTCollection[]
  total: number
}

export interface UserNFTsResponse {
  nfts: any[]
  total: number
}

export interface NFTItem extends NFT {
  collectionAddress: string
}

export interface TraitFilter {
  type: string
  value: string | number
}
