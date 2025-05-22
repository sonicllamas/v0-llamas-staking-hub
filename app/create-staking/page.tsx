import { CreateStakingForm } from "@/components/create-staking/create-staking-form"
import { Container } from "@/components/container"

export default function CreateStakingPage() {
  return (
    <div className="min-h-screen bg-[#1a472a] py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-white text-3xl md:text-4xl font-bold mb-6 text-center">Create Staking Contract</h1>
          <p className="text-green-100 text-lg mb-8 text-center">
            Customize and deploy your own NFT staking contract on Sonic Mainnet
          </p>

          <CreateStakingForm />
        </div>
      </Container>
    </div>
  )
}
