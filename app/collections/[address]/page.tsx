"use client"

import { CollectionError } from "@/components/nft-collection/collection-error-handler"
import { useCollection } from "@/hooks/use-collection"
import { useParams } from "next/navigation"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/container"
import { BackButton } from "@/components/back-button"
import { CollectionNFTDisplay } from "@/components/nft-collection/collection-nft-display"

export default function CollectionPage() {
  const params = useParams()
  const address = params.address as string

  const { data: collection, isLoading, error } = useCollection(address)

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading collection...</p>
          </div>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <CollectionError error={error} />
      </Container>
    )
  }

  if (!collection) {
    return (
      <Container>
        <CollectionError error={new Error("Collection not found")} />
      </Container>
    )
  }

  return (
    <Container>
      <div className="space-y-6">
        <BackButton />

        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              {collection.image && (
                <img
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{collection.name}</CardTitle>
                <p className="text-gray-600 mb-4">{collection.description}</p>
                <div className="flex gap-4 flex-wrap">
                  {collection.totalSupply && (
                    <Badge variant="secondary">Supply: {collection.totalSupply.toLocaleString()}</Badge>
                  )}
                  {collection.floorPrice && <Badge variant="secondary">Floor: {collection.floorPrice}</Badge>}
                  {collection.volume24h && <Badge variant="secondary">24h Volume: {collection.volume24h}</Badge>}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Contract: {collection.contractAddress}</p>
          </CardContent>
        </Card>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading NFTs...</p>
              </div>
            </div>
          }
        >
          <CollectionNFTDisplay contractAddress={address} />
        </Suspense>
      </div>
    </Container>
  )
}
