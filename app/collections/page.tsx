import { CollectionList } from "@/components/nft-collection/collection-list"
import { BackButton } from "@/components/back-button"

export default async function CollectionsPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <BackButton href="/" label="Back to Home" />
      </div>

      <h1 className="text-3xl font-bold mb-8">NFT Collections</h1>

      <CollectionList />
    </div>
  )
}
