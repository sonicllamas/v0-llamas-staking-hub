import { CollectionStaking } from "@/components/nft-collection/collection-staking"
import { fetchNFTCollection } from "@/lib/nft-service"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface CollectionStakingPageProps {
  params: {
    address: string
  }
}

export default async function CollectionStakingPage({ params }: CollectionStakingPageProps) {
  const { address } = params
  const collection = await fetchNFTCollection(address)

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link href={`/collections/${address}`} className="text-[#0d2416] hover:underline flex items-center gap-1">
          <ArrowLeft size={16} />
          <span>Back to Collection</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{collection?.name || "Collection"} Staking</h1>
        <p className="text-gray-600">
          Stake your NFTs from this collection to earn rewards. Select the NFTs you want to stake below.
        </p>
      </div>

      <CollectionStaking collectionAddress={address} />
    </div>
  )
}
