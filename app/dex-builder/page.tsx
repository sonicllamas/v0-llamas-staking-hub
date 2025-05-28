import { Container } from "@/components/container"
import { DEXDevelopmentDashboard } from "@/components/dex-builder/dex-development-dashboard"

export default function DEXBuilderPage() {
  return (
    <Container>
      <div className="py-8">
        <DEXDevelopmentDashboard />
      </div>
    </Container>
  )
}
