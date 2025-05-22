import { Container } from "@/components/container"
import { UserNFTsDisplay } from "@/components/nft-collection/user-nfts-display"

export default function MyNFTsPage() {
  return (
    <div className="min-h-screen bg-[#1a472a] py-12">
      <Container>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-white text-3xl md:text-4xl font-bold mb-6 text-center">My NFT Collection</h1>
          <p className="text-green-100 text-lg mb-8 text-center">
            Browse and manage your NFTs on Sonic Mainnet. Connect your wallet to view your NFTs.
          </p>

          <UserNFTsDisplay />
        </div>
      </Container>
    </div>
  )
}
