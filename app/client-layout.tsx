"use client"

import type React from "react"

import { ThemeProvider } from "next-themes"
import { WagmiProvider, createConfig, http } from "wagmi"
import { mainnet, polygon, arbitrum, optimism, bsc } from "wagmi/chains"
import { sonic } from "@/config/networks"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WalletProvider } from "@/context/wallet-context"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Container from "@/components/container"

// Create wagmi config
const config = createConfig({
  chains: [mainnet, polygon, arbitrum, optimism, bsc, sonic],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [bsc.id]: http(),
    [sonic.id]: http(),
  },
})

// Create a client for React Query
const queryClient = new QueryClient()

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <WalletProvider>
            <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white">
              <Header />
              <main className="flex-1">
                <Container>{children}</Container>
              </main>
              <Footer />
            </div>
          </WalletProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
