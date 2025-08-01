// Marketplace Types

export interface Listing {
  tokenId: bigint;
  assetContract: string;
  pricePerToken: bigint;
  listingCreator: string;
  metadata?: {
    name: string;
    image: string;
  };
  quantity: bigint;
  currency: string;
  tokenType: number;
  status: number;
}

export interface CollectionInfo {
  collectionAddress: string;
  name: string;
  symbol: string;
  imageUri: string;
}