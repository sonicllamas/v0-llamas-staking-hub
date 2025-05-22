import { Container } from "@/components/container"
import { NFTDetailPage } from "@/components/nft-collection/nft-detail-page"

interface NFTPageProps {
  params: {
    collectionAddress: string
    tokenId: string
  }
}

export default function NFTPage({ params }: NFTPageProps) {
  return (
    <div className="min-h-screen bg-[#1a472a] py-12">
      <Container>
        <div className="max-w-6xl mx-auto">
          <NFTDetailPage collectionAddress={params.collectionAddress} tokenId={params.tokenId} />
        </div>
      </Container>
    </div>
  )
}
