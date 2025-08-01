import React from 'react';
import { WalletInfo } from './types';
import { MetaMaskIcon, CoinbaseIcon } from './components/Icons';

// --- Wallet Connectors ---
export const WALLETS: WalletInfo[] = [
  { name: 'MetaMask', icon: MetaMaskIcon, isEip1193: true },
  { name: 'Coinbase Wallet', icon: CoinbaseIcon, isEip1193: true },
];

// --- Network Configuration ---
export const SONIC_NETWORK = {
    chainId: "0x92", // 146 in hexadecimal
    chainName: "Sonic",
    nativeCurrency: {
        name: "Sonic",
        symbol: "S",
        decimals: 18,
    },
    rpcUrls: ["https://rpc.soniclabs.com"],
    blockExplorerUrls: ["https://sonicscan.org"],
};

// --- General App Configuration ---
// Fee Configuration
export const FEE_RECEIVER_ADDRESS = "0x253b69338a9f96d4fa5e63c12755f2f32896be3f";
export const TRANSACTION_FEE_PERCENTAGE = 1; // 1%

// Admin Address
export const ADMIN_WALLET_ADDRESS = "0x6790daed6e1891466fc814d34ecd9baacfa1175e";

// --- Token & NFT Addresses ---
// Main Staking Pair
export const NFT_CONTRACT_ADDRESS = "0x0DCBf9741BBC21B7696cA73f5f87731c9A3d303e";
export const NFT_NAME = "Sonic Llamas";
export const NFT_SYMBOL = "SLLAMA";

// Reward Token (SLL)
export const REWARD_TOKEN_ADDRESS = "0x3F78599a7C0fb772591540225d3C6a7831547a12";
export const REWARD_TOKEN_NAME = "Sonic Llamas";
export const REWARD_TOKEN_SYMBOL = "SLL";
export const REWARD_TOKEN_DECIMALS = 18;

// --- Marketplace Contract ---
export const NFT_MARKETPLACE_DEPLOYMENT_BLOCK = 5580529;

// --- ABIs (Non-DEX) ---
// Standard ERC20 ABI
export const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)"
];

// Standard ERC721 ABI
export const ERC721_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function setApprovalForAll(address operator, bool approved)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function totalSupply() view returns (uint256)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function burn(uint256 tokenId)"
];

// Minimal ERC721 Metadata ABI
export const ERC721_METADATA_ABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;


// --- Utility Functions ---
export const FALLBACK_IMAGE_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzNzQxNTEiLz48L3N2Zz4=';

export const resolveUrl = (uri: string, base?: string): string => {
    if (!uri) return '';
    
    // Absolute URLs
    if (uri.startsWith('https://') || uri.startsWith('http://') || uri.startsWith('data:')) {
        return uri;
    }
    
    const gateway = 'https://cf-ipfs.com/ipfs/';

    // Protocol-based URLs
    if (uri.startsWith('ipfs://')) {
        return `${gateway}${uri.substring(7)}`;
    }
    if (uri.startsWith('ar://')) {
        return `https://arweave.net/${uri.substring(5)}`;
    }

    // Handle relative paths using base URL
    if (base) {
        try {
            // The base could also be an ipfs:// URL, so resolve it first.
            const baseUrl = base.startsWith('ipfs://') ? `${gateway}${base.substring(7)}` : base;
            return new URL(uri, baseUrl).href;
        } catch (e) {
            // If base is invalid, we can't resolve, so we can't do anything.
            return uri; // return original uri
        }
    }
    
    // Assume it could be a CID
    if (/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(uri) || /^b[A-Za-z2-7]{58}$/.test(uri)) {
      return `${gateway}${uri}`;
    }

    return uri; // Return as-is if we can't resolve it.
};