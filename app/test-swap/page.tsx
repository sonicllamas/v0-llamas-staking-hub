import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AutomatedTests } from "@/components/swap/automated-tests"
import { LiveSwap } from "@/components/swap/live-swap"
import { RealBalanceTest } from "@/components/swap/real-balance-test"
// Add the TransactionMonitor import
import { TransactionMonitor } from "@/components/swap/transaction-monitor"

export default function TestSwapPage() {
  return (
    <Tabs defaultValue="automated" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="automated">Automated Tests</TabsTrigger>
        <TabsTrigger value="live">Live Swap</TabsTrigger>
        <TabsTrigger value="real-balance">Real Balance Test</TabsTrigger>
        <TabsTrigger value="monitor">Transaction Monitor</TabsTrigger>
      </TabsList>
      <TabsContent value="automated">
        <AutomatedTests />
      </TabsContent>
      <TabsContent value="live">
        <LiveSwap />
      </TabsContent>
      <TabsContent value="real-balance">
        <RealBalanceTest />
      </TabsContent>
      {/* Add the new TabsContent for transaction monitoring */}
      <TabsContent value="monitor">
        <TransactionMonitor />
      </TabsContent>
    </Tabs>
  )
}
