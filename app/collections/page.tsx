import { CollectionList } from "@/components/nft-collection/collection-list"
import { BackButton } from "@/components/back-button"
import { MarketplaceTab } from "@/components/nft-collection/marketplace-tab"
import { MarketplaceStats } from "@/components/nft-collection/marketplace-stats"
import { MarketplaceAnalytics } from "@/components/nft-collection/marketplace-analytics"

export default async function CollectionsPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <BackButton href="/" label="Back to Home" />
      </div>

      <h1 className="text-3xl font-bold mb-8">NFT Collections</h1>

      {/* Real-time marketplace stats */}
      <MarketplaceStats className="mb-8" />

      {/* Historical analytics and trends */}
      <MarketplaceAnalytics className="mb-8" />

      <div className="space-y-8">
        <CollectionList />

        <div className="border-t border-gray-700 pt-8">
          <h2 className="text-2xl font-bold mb-6">Marketplace Activity</h2>
          <MarketplaceTab />
        </div>
      </div>
    </div>
  )
}
