import { BackButton } from "@/components/back-button"
import { Container } from "@/components/container"
import { NFTContractVerifier } from "@/components/nft-verification/nft-contract-verifier"

export default function VerifiedNFTsPage() {
  return (
    <Container>
      <div className="space-y-6">
        <BackButton />

        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">NFT Contract Verification</h1>
            <p className="text-gray-400 mt-2">
              Verify NFT contracts on Sonic Mainnet. Enter a contract address to analyze its security, authenticity, and
              compliance.
            </p>
          </div>

          <div className="bg-[#0d2416] border border-[#1a3726] rounded-lg p-6">
            <NFTContractVerifier />
          </div>
        </div>
      </div>
    </Container>
  )
}
