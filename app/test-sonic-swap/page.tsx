import { Container } from "@/components/container"
import { SonicSwapTest } from "@/components/swap/sonic-swap-test"

export default function TestSonicSwapPage() {
  return (
    <Container>
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Sonic Swap Testing</h1>
          <p className="text-muted-foreground mt-2">
            Test the Sonic swap functionality including balance loading and token swapping
          </p>
        </div>

        <SonicSwapTest />
      </div>
    </Container>
  )
}
