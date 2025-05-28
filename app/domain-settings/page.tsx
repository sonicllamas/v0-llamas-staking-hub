import { Container } from "@/components/container"
import { DomainInfo } from "@/components/domain-info"
import { BackButton } from "@/components/back-button"

export default function DomainSettingsPage() {
  return (
    <main className="py-12">
      <Container>
        <div className="mb-6">
          <BackButton />
        </div>
        <h1 className="text-3xl font-bold mb-8 text-center">Domain Settings</h1>
        <DomainInfo />
      </Container>
    </main>
  )
}
