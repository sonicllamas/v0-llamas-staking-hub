"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Plus, Zap, TrendingUp, Settings, Search, Target } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "Stake More NFTs",
      description: "Browse collections and stake more NFTs",
      icon: Plus,
      href: "/collections",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Claim Rewards",
      description: "Claim your pending staking rewards",
      icon: Zap,
      href: "#",
      color: "bg-green-500 hover:bg-green-600",
      onClick: () => {
        // Handle claim all rewards
        console.log("Claiming all rewards...")
      },
    },
    {
      title: "Create Contract",
      description: "Deploy your own staking contract",
      icon: Target,
      href: "/create-staking",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "View Analytics",
      description: "See detailed performance analytics",
      icon: TrendingUp,
      href: "/analytics",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "Browse Contracts",
      description: "Discover new staking opportunities",
      icon: Search,
      href: "/contracts",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      title: "Settings",
      description: "Manage your account preferences",
      icon: Settings,
      href: "/settings",
      color: "bg-gray-500 hover:bg-gray-600",
    },
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon
            const content = (
              <div className="flex flex-col items-center text-center p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer group">
                <div
                  className={`p-3 rounded-full text-white mb-3 ${action.color} group-hover:scale-110 transition-transform`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="font-medium text-sm mb-1">{action.title}</h4>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            )

            if (action.onClick) {
              return (
                <div key={index} onClick={action.onClick}>
                  {content}
                </div>
              )
            }

            return (
              <Link key={index} href={action.href}>
                {content}
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
