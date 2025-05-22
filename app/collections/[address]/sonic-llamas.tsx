"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { BackButton } from "@/components/back-button"
import { CollectionInfoCard } from "@/components/nft-collection/collection-info-card"
import { NFTCollectionDisplay } from "@/components/nft-collection/nft-collection-display"
import { Loading } from "@/components/loading"
import { fetchNFTCollection } from "@/lib/nft-service"
import type { NFTCollection } from "@/types/nft"

export default function SonicLlamasPage() {
  const params = useParams()
  const [collection, setCollection] = useState<NFTCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const collectionAddress = "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e"

  useEffect(() => {
    const loadCollection = async () => {
      setLoading(true)
      try {
        const collectionData = await fetchNFTCollection(collectionAddress)
        setCollection(collectionData)
      } catch (error) {
        console.error("Failed to load collection:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCollection()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Loading />
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <BackButton href="/collections" label="Back to Collections" />
        </div>
        <div className="bg-[#0d2416] rounded-xl p-8 text-center">
          <h2 className="text-white text-2xl font-bold mb-4">Collection Not Found</h2>
          <p className="text-green-100">The requested collection could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <BackButton href="/collections" label="Back to Collections" />
      </div>

      <CollectionInfoCard collectionAddress={collectionAddress} collectionName={collection.name} />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Browse Collection</h2>
        <NFTCollectionDisplay collectionAddress={collectionAddress} />
      </div>
    </div>
  )
}
