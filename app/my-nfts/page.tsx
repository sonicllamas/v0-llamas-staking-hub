import { Container } from "@/components/container"
import UserNFTsDisplay from "@/components/nft-collection/user-nfts-display"

export default function MyNFTsPage() {
  return (
    <Container className="py-8">
      <UserNFTsDisplay />
    </Container>
  )
}
