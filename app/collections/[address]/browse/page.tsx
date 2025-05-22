import { fetchNFTCollection } from "@/lib/nft-service"
import { CollectionBrowser } from "@/components/nft-collection/collection-browser"

interface BrowsePageProps {
  params: {
    address: string
  }
}

export default async function BrowsePage({ params }: BrowsePageProps) {
  const { address } = params
  const collection = await fetchNFTCollection(address)

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <CollectionBrowser collectionAddress={address} initialSearch={collection?.name || "NFT Collection"} />
    </div>
  )
}
