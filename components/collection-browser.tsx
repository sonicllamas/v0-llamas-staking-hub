"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { fetchCollectionNFTs } from "@/lib/nft-service"
import type { NFT } from "@/types/nft"
import { NFTFilters } from "./nft-collection/nft-filters"
import { Loading } from "./loading"

export function CollectionBrowser() {
  const params = useParams()
  const collectionAddress = params.address as string

  const [nfts, setNfts] = useState<NFT[]>([])
  const [filteredNfts, setFilteredNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCollectionNFTs() {
      if (!collectionAddress) return

      setLoading(true)
      setError(null)

      try {
        const collectionNfts = await fetchCollectionNFTs(collectionAddress)
        setNfts(collectionNfts)
        setFilteredNfts(collectionNfts)
      } catch (err) {
        console.error("Error loading collection NFTs:", err)
        setError("Failed to load collection NFTs. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadCollectionNFTs()
  }, [collectionAddress])

  const handleFilterChange = (filtered: NFT[]) => {
    setFilteredNfts(filtered)
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      
        
          {error}
        
      
    )
  }

  return (
    
      
        <NFTFilters nfts={nfts} onFilterChange={handleFilterChange} />
      
      \
        <NFTGrid nfts=filteredNfts/>
      
    
  )
