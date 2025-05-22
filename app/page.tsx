"use client"
import Image from "next/image"
import { Container } from "@/components/container"
import { FeatureCard } from "@/components/feature-card"
import { StakingButton } from "@/components/staking-button"
import Link from "next/link"
import { X } from "lucide-react"

export default function Home() {
  return (
    <main>
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/llama-island.jpeg" alt="Llama Island" fill className="object-cover opacity-30" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30"></div>
        </div>

        <Container className="relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <Image
              src="/llama-logo.jpg"
              alt="Sonic Llamas"
              width={180}
              height={180}
              className="rounded-full border-4 border-green-500 mb-8"
            />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Sonic Llamas Staking Hub</h1>
            <p className="text-xl md:text-2xl text-green-100 mb-10 max-w-3xl">
              Create & Customize Your NFTs Staking Contract with our easy-to-use platform.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <StakingButton href="/create-staking" variant="primary">
                Create Staking Contract
              </StakingButton>
              <StakingButton href="/my-nfts" variant="secondary">
                My NFTs
              </StakingButton>
              <StakingButton href="/my-contracts" variant="secondary">
                My Contracts
              </StakingButton>
              <StakingButton href="/collections" variant="secondary">
                Browse Collections
              </StakingButton>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 bg-[#0d1a12]">
        <Container>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Quick Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Create Staking"
              description="Create custom staking contracts for your NFTs"
              icon="🔨"
              href="/create-staking"
            />
            <FeatureCard
              title="My Contracts"
              description="Manage your deployed staking contracts"
              icon="📝"
              href="/my-contracts"
            />
            <FeatureCard
              title="NFTs Collection"
              description="Browse and manage your NFT collection"
              icon="🖼️"
              href="/my-nfts"
            />
            <FeatureCard
              title="Browse Collections"
              description="Explore all available NFT collections on Sonic"
              icon="Search"
              href="/collections"
            />
            <FeatureCard
              title="Llamas Bridge"
              description="Bridge assets across multiple blockchains"
              icon="🌉"
              isBridge={true}
            />
          </div>
        </Container>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-[#143621]">
        <Container>
          <div className="bg-[#0d2416] rounded-xl p-6 md:p-8 shadow-lg">
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-4 text-center">About $SLL & $SLLAMA</h2>
            <p className="text-green-100 text-lg leading-relaxed text-center mb-6">
              $SLL is the utility token of the Sonic Llamas ecosystem. Stake your $SLL tokens to earn rewards and
              participate in governance.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <button className="bg-white text-[#1a472a] px-6 py-3 rounded-full font-bold hover:bg-green-100 transition-colors">
                Stake $SLL
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-full font-bold hover:bg-[#0d2416] transition-colors">
                Buy $SLLAMA NFT
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* Social Links */}
      <footer className="py-12 bg-[#0d2416]">
        <Container>
          <div className="flex flex-col items-center">
            <h3 className="text-white text-2xl font-bold mb-6">Connect With Us</h3>
            <div className="flex justify-center gap-6 mb-8">
              <Link href="#" className="bg-[#1a472a] p-3 rounded-full hover:bg-[#143621] transition-colors">
                <X className="w-6 h-6 text-white" />
              </Link>
              <Link href="#" className="bg-[#1a472a] p-3 rounded-full hover:bg-[#143621] transition-colors">
                <div className="w-6 h-6 flex items-center justify-center text-white font-bold">NFT</div>
              </Link>
              <Link href="#" className="bg-[#1a472a] p-3 rounded-full hover:bg-[#143621] transition-colors">
                <div className="w-6 h-6 flex items-center justify-center text-white font-bold">DC</div>
              </Link>
            </div>
            <p className="text-green-100 text-center">Domain Name: llamas.sonic | © 2025 Sonic Llamas</p>
          </div>
        </Container>
      </footer>
    </main>
  )
}
