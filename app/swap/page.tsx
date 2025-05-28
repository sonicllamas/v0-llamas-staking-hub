"use client"

import { Container } from "@/components/container"
import { OpenOceanWidget } from "@/components/swap/openocean-widget"

export default function SwapPage() {
  return (
    <Container>
      <div className="max-w-4xl mx-auto py-8">
        <OpenOceanWidget />
      </div>
    </Container>
  )
}
