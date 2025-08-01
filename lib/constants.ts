// Constants for the NFT Marketplace

export const SONIC_NETWORK = {
  chainId: 146,
  name: "Sonic Mainnet",
  nativeCurrency: {
    name: "Sonic",
    symbol: "S",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.soniclabs.com"],
  blockExplorerUrls: ["https://sonicscan.org"],
};

export const TRANSACTION_FEE_PERCENTAGE = 2.5; // 2.5% marketplace fee

export const NFT_MARKETPLACE_DEPLOYMENT_BLOCK = 1000000; // Replace with actual deployment block

// ERC721 ABI (minimal)
export const ERC721_ABI = [
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function approve(address to, uint256 tokenId)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function burn(uint256 tokenId)",
];

// ERC20 ABI (minimal)
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

// URL resolver function
export const resolveUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${url.slice(7)}`;
  }
  return url;
};