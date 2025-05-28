import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { Container } from "@/components/container"
import { BackButton } from "@/components/back-button"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#1a472a] py-8">
      <Container>
        <div className="mb-6">
          <BackButton href="/" label="Back to Home" />
        </div>
        <AnalyticsDashboard />
      </Container>
    </div>
  )
}
