import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SkipLink } from "@/components/accessibility/skip-link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Llamas Hub - NFT Staking & DeFi Platform",
  description:
    "Stake NFTs, swap tokens, and manage contracts on Sonic Network. Accessible DeFi platform for all users.",
  keywords: "NFT staking, DeFi, Sonic Network, accessibility, token swap",
  authors: [{ name: "Llamas Hub Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#0d2416",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <SkipLink />
        <div className="min-h-screen bg-background">
          <header role="banner">{/* Header content will be here */}</header>
          <main id="main-content" role="main" tabIndex={-1}>
            {children}
          </main>
          <footer role="contentinfo">{/* Footer content will be here */}</footer>
        </div>
        <div id="announcements" aria-live="polite" aria-atomic="true" className="sr-only" />
      </body>
    </html>
  )
}
