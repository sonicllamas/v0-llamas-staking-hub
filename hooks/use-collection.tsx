"use client"

import { useState, useEffect } from "react"

interface Collection {
  name: string
  description: string
  contractAddress: string
  image?: string
  totalSupply?: number
  floorPrice?: string
  volume24h?: string
}

interface UseCollectionReturn {
  data: Collection | null
  isLoading: boolean
  error: Error | null
}

export function useCollection(address: string): UseCollectionReturn {
  const [data, setData] = useState<Collection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!address) {
      setError(new Error("No contract address provided"))
      setIsLoading(false)
      return
    }

    const fetchCollection = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Mock collection data based on known Sonic collections
        const mockCollections: Record<string, Collection> = {
          "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e": {
            name: "Sonic Llamas",
            description:
              "The original Sonic Llamas NFT collection on Sonic blockchain. A collection of 10,000 unique llamas with various traits and rarities.",
            contractAddress: address,
            image: "/sonic-llamas-logo.jpg",
            totalSupply: 10000,
            floorPrice: "0.5 S",
            volume24h: "125.7 S",
          },
          "0x1234567890abcdef1234567890abcdef12345678": {
            name: "Sonic Punks",
            description: "Punk-style avatars on the Sonic blockchain.",
            contractAddress: address,
            totalSupply: 5000,
            floorPrice: "0.3 S",
            volume24h: "89.2 S",
          },
          "0x2345678901bcdef12345678901bcdef123456789": {
            name: "Sonic Apes",
            description: "Ape-themed NFTs with unique traits.",
            contractAddress: address,
            totalSupply: 8000,
            floorPrice: "0.7 S",
            volume24h: "156.3 S",
          },
        }

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const collection = mockCollections[address.toLowerCase()]

        if (!collection) {
          throw new Error(`Collection not found for address: ${address}`)
        }

        setData(collection)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch collection"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollection()
  }, [address])

  return { data, isLoading, error }
}
