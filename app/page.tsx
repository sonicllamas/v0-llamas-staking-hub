"use client"

import { useState, useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WalletProvider } from "@/context/wallet-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import Footer from "@/components/footer"
import { Plus, Zap } from "lucide-react"

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      cacheTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <WalletProvider>
          <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
                {/* Empty Grid Box 1 - Top left */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Plus className="h-5 w-5 text-gray-400" />
                      Coming Soon
                    </h2>
                    <Zap className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <div className="text-gray-500 mb-2">Feature in Development</div>
                      <div className="text-sm text-gray-600">Stay tuned for updates</div>
                    </div>
                  </div>
                </div>

                {/* Empty Grid Box 2 - Top right */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Plus className="h-5 w-5 text-gray-400" />
                      Coming Soon
                    </h2>
                    <Zap className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <div className="text-gray-500 mb-2">Feature in Development</div>
                      <div className="text-sm text-gray-600">Stay tuned for updates</div>
                    </div>
                  </div>
                </div>

                {/* Empty Grid Box 3 - Bottom left */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Plus className="h-5 w-5 text-gray-400" />
                      Coming Soon
                    </h2>
                    <Zap className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <div className="text-gray-500 mb-2">Feature in Development</div>
                      <div className="text-sm text-gray-600">Stay tuned for updates</div>
                    </div>
                  </div>
                </div>

                {/* Empty Grid Box 4 - Bottom right */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Plus className="h-5 w-5 text-gray-400" />
                      Coming Soon
                    </h2>
                    <Zap className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <div className="text-gray-500 mb-2">Feature in Development</div>
                      <div className="text-sm text-gray-600">Stay tuned for updates</div>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
