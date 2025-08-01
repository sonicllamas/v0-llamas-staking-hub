// Collection Registry Contract Configuration

export const COLLECTION_REGISTRY_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Replace with actual address

export const COLLECTION_REGISTRY_ABI = [
  "function getCollections() view returns (tuple(address collectionAddress, string name, string symbol, string imageUri)[])",
  "function addCollection(address collectionAddress, string name, string symbol, string imageUri)",
  "function removeCollection(address collectionAddress)",
  "function isRegistered(address collectionAddress) view returns (bool)",
];