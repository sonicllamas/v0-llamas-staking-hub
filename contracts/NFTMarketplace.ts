// NFT Marketplace Contract Configuration

export const NFT_MARKETPLACE_CONTRACT_ADDRESS = "0x2345678901234567890123456789012345678901"; // Replace with actual address

export const NFT_MARKETPLACE_ABI = [
  "function listNFT(address nftContract, uint256 tokenId, uint256 price, address paymentToken, uint256 quantity, uint8 listingType)",
  "function buyItem(address nftContract, uint256 tokenId, uint256 quantity) payable",
  "function cancelListing(address nftContract, uint256 tokenId)",
  "function updateListingPrice(address nftContract, uint256 tokenId, uint256 newPrice)",
  "function listings(address nftContract, uint256 tokenId) view returns (tuple(uint256 price, address seller, address paymentToken, uint256 quantity, bool isListed))",
  "function bulkListNFTs(address[] nftContracts, uint256[] tokenIds, uint256 price, address paymentToken, uint8 listingType)",
  "function bulkSendNFTs(address[] nftContracts, uint256[] tokenIds, address[] receivers, uint256[] quantities, uint8[] types)",
  "function bulkBurnNFTs(address[] nftContracts, uint256[] tokenIds, uint256[] quantities, uint8[] types)",
  "function owner() view returns (address)",
  "function paused() view returns (bool)",
  "function pausedCollections(address collection) view returns (bool)",
  "function pause()",
  "function unpause()",
  "function pauseCollection(address collection)",
  "function unpauseCollection(address collection)",
  "event NFTListed(address indexed nftContract, uint256 indexed tokenId, uint256 price, address indexed seller, address paymentToken, uint256 quantity, uint8 listingType)",
  "event NFTSold(address indexed nftContract, uint256 indexed tokenId, uint256 pricePaid, address indexed buyer, address seller)",
  "event ListingCancelled(address indexed nftContract, uint256 indexed tokenId, address indexed seller)",
];