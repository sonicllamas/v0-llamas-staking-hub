"use client"

import { useState } from "react"
import {
  ErrorMessage,
  NetworkError,
  ApiError,
  NotFoundError,
  WalletError,
  PermissionError,
  NFTLoadingError,
  ContractLoadingError,
  ErrorBoundaryWrapper,
} from "@/components/error-states"
import { Button } from "@/components/ui/button"

// Component that will throw an error for demonstration
const ErrorThrower = () => {
  const [shouldThrow, setShouldThrow] = useState(false)

  if (shouldThrow) {
    throw new Error("This is a demo error thrown from a component")
  }

  return (
    <div className="p-4 bg-[#0d2416] rounded-lg">
      <p className="mb-4 text-white">Click the button to simulate a component error</p>
      <Button onClick={() => setShouldThrow(true)}>Throw Error</Button>
    </div>
  )
}

export default function ErrorStatesDemo() {
  return (
    <div className="container mx-auto py-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-6 text-white">Error State Components</h1>
        <p className="text-gray-300 mb-8">
          This page demonstrates the various error state components available in the application.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4 text-white">Base Error Message</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2 text-white">Default Variant</h3>
              <ErrorMessage
                title="Something went wrong"
                message="We encountered an error while loading this content. Please try again later."
                actionFn={() => alert("Retry action triggered")}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-white">Warning Variant</h3>
              <ErrorMessage
                title="Warning"
                message="This action might cause unexpected results."
                variant="warning"
                actionFn={() => alert("Warning action triggered")}
                actionLabel="Proceed Anyway"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-white">Critical Variant</h3>
              <ErrorMessage
                title="Critical Error"
                message="A critical error has occurred that prevents the application from functioning."
                variant="critical"
                actionFn={() => alert("Critical action triggered")}
                homeLink={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-white">Info Variant</h3>
              <ErrorMessage
                title="Information"
                message="This feature is currently under development and will be available soon."
                variant="info"
                homeLink={true}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-white">Specialized Error Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2 text-white">Network Error</h3>
              <NetworkError onRetry={() => alert("Network retry triggered")} />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-white">API Error</h3>
              <ApiError
                onRetry={() => alert("API retry triggered")}
                message="The API returned a 500 Internal Server Error. Our team has been notified."
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-white">Not Found Error</h3>
              <NotFoundError resourceType="collection" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-white">Wallet Error</h3>
              <WalletError onConnect={() => alert("Connect wallet triggered")} />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-white">Permission Error</h3>
              <PermissionError />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-white">NFT Loading Error</h3>
              <NFTLoadingError onRetry={() => alert("NFT retry triggered")} collectionName="Sonic Llamas" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-white">Contract Loading Error</h3>
              <ContractLoadingError
                onRetry={() => alert("Contract retry triggered")}
                contractAddress="0x1234567890123456789012345678901234567890"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-white">Error Boundary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2 text-white">Default Error Boundary</h3>
              <ErrorBoundaryWrapper>
                <ErrorThrower />
              </ErrorBoundaryWrapper>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-white">Custom Fallback</h3>
              <ErrorBoundaryWrapper
                fallback={
                  <div className="p-6 bg-amber-950/40 border border-amber-700 rounded-xl text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Custom Error Fallback</h3>
                    <p className="text-amber-200 mb-4">This is a custom fallback UI for the error boundary.</p>
                    <Button onClick={() => window.location.reload()}>Refresh Page</Button>
                  </div>
                }
              >
                <ErrorThrower />
              </ErrorBoundaryWrapper>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
