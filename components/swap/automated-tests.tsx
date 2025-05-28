"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, PlayCircle } from "lucide-react"

interface TestResult {
  name: string
  status: "success" | "failure" | "pending"
  message?: string
}

export const AutomatedTests: React.FC = () => {
  const [isRunning, setIsRunning] = React.useState(false)
  const [results, setResults] = React.useState<TestResult[]>([
    { name: "Connection Test", status: "pending" },
    { name: "Balance Check", status: "pending" },
    { name: "Quote Generation", status: "pending" },
    { name: "Transaction Simulation", status: "pending" },
    { name: "Gas Estimation", status: "pending" },
  ])

  const runTests = async () => {
    setIsRunning(true)

    // Reset all tests to pending
    setResults((prev) => prev.map((test) => ({ ...test, status: "pending" as const })))

    // Simulate running tests with delays
    for (let i = 0; i < results.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setResults((prev) => {
        const newResults = [...prev]
        // Randomly succeed or fail for demo purposes
        const success = Math.random() > 0.3
        newResults[i] = {
          ...newResults[i],
          status: success ? "success" : "failure",
          message: success ? "Test passed successfully" : "Test failed - see details",
        }
        return newResults
      })
    }

    setIsRunning(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Automated Swap Tests</CardTitle>
        <CardDescription>Run automated tests to verify swap functionality</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Test Suite</h3>
            <Button onClick={runTests} disabled={isRunning} className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              {isRunning ? "Running Tests..." : "Run Tests"}
            </Button>
          </div>

          <div className="space-y-2">
            {results.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  {test.status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {test.status === "failure" && <AlertCircle className="h-5 w-5 text-red-500" />}
                  {test.status === "pending" && (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
                  )}
                  <span>{test.name}</span>
                </div>
                <span
                  className={`text-sm ${
                    test.status === "success"
                      ? "text-green-500"
                      : test.status === "failure"
                        ? "text-red-500"
                        : "text-gray-500"
                  }`}
                >
                  {test.status === "pending" ? "Pending" : test.status === "success" ? "Passed" : "Failed"}
                </span>
              </div>
            ))}
          </div>

          {results.some((r) => r.status === "failure") && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Test Failures Detected</AlertTitle>
              <AlertDescription>
                Some tests have failed. Please check your network connection and wallet configuration.
              </AlertDescription>
            </Alert>
          )}

          {results.every((r) => r.status === "success") && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">All Tests Passed</AlertTitle>
              <AlertDescription className="text-green-600">
                All swap functionality tests completed successfully.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AutomatedTests
