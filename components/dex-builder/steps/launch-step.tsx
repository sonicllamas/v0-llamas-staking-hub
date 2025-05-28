"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Rocket, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LaunchChecklistItem {
  id: string
  title: string
  description: string
  completed: boolean
}

export const LaunchStep: React.FC = () => {
  const [checklist, setChecklist] = React.useState<LaunchChecklistItem[]>([
    {
      id: "contracts",
      title: "Smart Contracts Deployed",
      description: "All core contracts deployed and verified on Sonic Explorer",
      completed: true,
    },
    {
      id: "frontend",
      title: "Frontend Deployed",
      description: "User interface deployed to production environment",
      completed: true,
    },
    {
      id: "liquidity",
      title: "Initial Liquidity Added",
      description: "Seed liquidity added to core trading pairs",
      completed: false,
    },
    {
      id: "monitoring",
      title: "Monitoring Systems",
      description: "Price and transaction monitoring systems active",
      completed: false,
    },
    {
      id: "documentation",
      title: "Documentation Published",
      description: "User guides and API documentation available",
      completed: true,
    },
    {
      id: "community",
      title: "Community Announcement",
      description: "Launch announcement posted to all community channels",
      completed: false,
    },
  ])

  const [launchStatus, setLaunchStatus] = React.useState<"pending" | "launched" | "failed">("pending")
  const [launchError, setLaunchError] = React.useState<string | null>(null)

  const toggleItem = (id: string) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const completedItems = checklist.filter((item) => item.completed).length
  const totalItems = checklist.length
  const allCompleted = completedItems === totalItems

  const handleLaunch = async () => {
    if (!allCompleted) {
      setLaunchError("Please complete all checklist items before launching")
      return
    }

    setLaunchError(null)

    try {
      // Simulate launch process
      await new Promise((resolve) => setTimeout(resolve, 3000))
      setLaunchStatus("launched")
    } catch (error) {
      setLaunchStatus("failed")
      setLaunchError("Launch failed. Please check system logs and try again.")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          DEX Launch
        </CardTitle>
        <CardDescription>Final preparations and launch sequence</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Launch Checklist</h3>

            <div className="space-y-3">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-md">
                  <Checkbox id={item.id} checked={item.completed} onCheckedChange={() => toggleItem(item.id)} />
                  <div className="space-y-1">
                    <label htmlFor={item.id} className="font-medium cursor-pointer">
                      {item.title}
                    </label>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">
                {completedItems} of {totalItems} tasks completed
              </span>
              <span className={`text-sm font-medium ${allCompleted ? "text-green-600" : "text-amber-600"}`}>
                {allCompleted ? "Ready to launch!" : "Checklist incomplete"}
              </span>
            </div>
          </div>

          {launchError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{launchError}</AlertDescription>
            </Alert>
          )}

          {launchStatus === "launched" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                DEX successfully launched! Your exchange is now live and operational.
              </AlertDescription>
            </Alert>
          )}

          <Button className="w-full" onClick={handleLaunch} disabled={launchStatus === "launched"}>
            {launchStatus === "launched" ? "DEX Successfully Launched" : "Launch DEX"}
          </Button>

          {launchStatus === "launched" && (
            <div className="text-center text-sm text-gray-500">
              <p>Launch completed at: {new Date().toLocaleString()}</p>
              <p className="mt-1">
                <a href="#" className="text-blue-600 hover:underline">
                  View Exchange Dashboard
                </a>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default LaunchStep
