import { Container } from "@/components/container"
import { ContractDetails } from "@/components/contract-details/contract-details"

interface ContractPageProps {
  params: {
    address: string
  }
}

export default function ContractPage({ params }: ContractPageProps) {
  return (
    <div className="min-h-screen bg-[#1a472a] py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-white text-3xl md:text-4xl font-bold mb-6 text-center">Staking Contract</h1>
          <p className="text-green-100 text-lg mb-8 text-center">Manage your NFT staking contract on Sonic Mainnet</p>

          <ContractDetails address={params.address} />
        </div>
      </Container>
    </div>
  )
}
