import { Container } from "@/components/container"
import EnhancedUserNFTs from "@/components/nft-collection/enhanced-user-nfts"

export default function EnhancedNFTMarketplacePage() {
  return (
    <Container className="py-8">
      <EnhancedUserNFTs />
    </Container>
  )
}