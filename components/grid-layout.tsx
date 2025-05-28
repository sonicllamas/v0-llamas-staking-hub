"use client"
import { cn } from "@/lib/utils"
import { Container } from "./container"
import type { StakingStats } from "@/lib/redis-service"
import { BridgeWidget } from "./bridge-widget"
import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { OpenOceanSDKWidget } from "./swap/openocean-sdk-widget"

interface GridLayoutProps {
  initialStats: StakingStats
  className?: string
}

export function GridLayout({ initialStats, className }: GridLayoutProps) {
  const [activeWidget, setActiveWidget] = useState<"bridge" | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Toggle widget visibility on mobile
  const toggleWidget = (widget: "bridge") => {
    if (isMobile) {
      setActiveWidget(activeWidget === widget ? null : widget)
    }
  }

  return (
    <div className={cn("py-8 bg-[#0a1c11]", className)}>
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* OpenOcean Widget - Left side */}
          <div className="bg-[#0d2416] border border-[#1a3726] rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:border-[#00ffaa]/30 min-h-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-medium">Llamas Swap</h3>
              <div className="flex items-center">
                <p className="text-gray-400 text-xs mr-2">Powered by OpenOcean</p>
              </div>
            </div>

            <div className="w-full h-full min-h-[500px] rounded-lg overflow-hidden">
              <iframe
                src="https://widget.openocean.finance?p=JTIzMTcxMjJCJTI0KiUyNCUyMzIyMjAzNyUyNColMjQlMjMxNzEyMmIlMjQqJTI0JTIzMjkyNzNEJTI0KiUyNCUyM2ZmZiUyNColMjQlMjM4QzdGOEMlMjQqJTI0JTIzZmI1MzRmJTI0KiUyNCUyM2ZmZmZmZiUyNColMjQlMjMzMzMxNDclMjQqJTI0JTIzYjFhN2IxJTI0KiUyNCUyMzQ3OWE0YiUyNColMjQlMjNmNzUwMjklMjQqJTI0TGxhbWFzJTIwU3dhcCUyNColMjRSb2JvdG8lMjQqJTI0JTI0KiUyNFNvbmljTGxhbWFzJTI0KiUyNDB4MWU5ZjMxN2NiM2EwYzNiMjNjOWQ4MmRhZWM1YTE4ZDc4OTU2MzlmMCUyNColMjQyLjklMjQqJTI0c29uaWMlMjQqJTI0UyUyNColMjRVU0RDLmUlMjQqJTI0"
                width="100%"
                height="500"
                frameBorder="0"
                allow="clipboard-write"
                title="OpenOcean Widget"
                className="rounded-lg"
                style={{
                  border: "none",
                  borderRadius: "8px",
                  background: "transparent",
                }}
              />
            </div>
          </div>

          {/* Bridge Widget - Right side */}
          <div className="bg-[#0d2416] border border-[#1a3726] rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:border-[#00ffaa]/30">
            <div
              className="flex justify-between items-center mb-4 cursor-pointer"
              onClick={() => toggleWidget("bridge")}
            >
              <h3 className="text-white text-lg font-medium">Llamas Bridge</h3>
              <div className="flex items-center">
                <p className="text-gray-400 text-xs mr-2">Powered by deBridge</p>
                {isMobile &&
                  (activeWidget === "bridge" ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ))}
              </div>
            </div>

            {(!isMobile || activeWidget === "bridge") && (
              <div className="transition-all duration-300 overflow-hidden rounded-md">
                <BridgeWidget />
              </div>
            )}

            {isMobile && activeWidget !== "bridge" && (
              <p className="text-center text-gray-400 text-xs py-2">Tap to expand bridge</p>
            )}
          </div>

          {/* OpenOcean SDK Widget - Full width below */}
          <div className="md:col-span-2 bg-[#0d2416] border border-[#1a3726] rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:border-[#00ffaa]/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-medium">OpenOcean SDK</h3>
              <div className="flex items-center">
                <p className="text-gray-400 text-xs mr-2">Professional Trading</p>
              </div>
            </div>

            <div className="transition-all duration-300 overflow-hidden rounded-md">
              <OpenOceanSDKWidget />
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
