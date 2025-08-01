import { Container } from "@/components/container"
import { LlamasMarketplace } from "@/components/nft-marketplace/llamas-marketplace"
import { useState, useEffect } from "react"
import { CollectionInfo } from "@/types/marketplace"

export default function NFTMarketplacePage() {
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);

  useEffect(() => {
    // Mock collections data
    const mockCollections: CollectionInfo[] = [
      {
        collectionAddress: "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e",
        name: "Sonic Llamas",
        symbol: "SLLAMA",
        imageUri: "/sonic-llamas-logo.jpg"
      },
      {
        collectionAddress: "0x1234567890123456789012345678901234567890",
        name: "Sonic Creatures",
        symbol: "SCREATURE",
        imageUri: "/sonic-llamas-logo.jpg"
      },
      {
        collectionAddress: "0x2345678901234567890123456789012345678901",
        name: "Digital Art",
        symbol: "DART",
        imageUri: "/sonic-llamas-logo.jpg"
      }
    ];

    setTimeout(() => {
      setCollections(mockCollections);
      setIsLoadingCollections(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-[#1a472a] py-8">
      <Container>
        <LlamasMarketplace 
          collections={collections}
          isLoadingCollections={isLoadingCollections}
        />
      </Container>
    </div>
  )
}