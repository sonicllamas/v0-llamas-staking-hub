import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { animeAce } from "./fonts"
import "./globals.css"
import ClientLayout from "./client-layout"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Sonic Llamas Staking Hub",
  description: "Create & Customize Your NFTs Staking Contract",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={animeAce.className}>
        <Suspense>
          <ClientLayout>{children}</ClientLayout>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
