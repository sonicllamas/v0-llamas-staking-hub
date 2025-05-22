export interface NFT {
  id: string
  tokenId: string
  address: string
  name: string
  description: string
  image: string
  thumbnail?: string
  owner: string
  creator: string
  collection: {
    address: string
    name: string
    isVerified: boolean
    isWhitelisted: boolean
  }
  attributes: NFTAttribute[]
  rarity?: {
    score: number
    rank: number
    total: number
    calculated_at: number
  } | null
  createdAt: string
  lastTransferAt: string
  isOnSale: boolean
  price: string
  isERC721: boolean
  mintOrder: string
  approvalState: string
  contentVerified: boolean
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
  totalVolume?: string
  owners?: number
  items?: number
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
