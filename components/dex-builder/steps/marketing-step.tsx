"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Megaphone, Twitter, Globe, Send, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface MarketingChannel {
  id: string
  name: string
  icon: React.ReactNode
  status: "pending" | "scheduled" | "published"
  reach: number
}

export const MarketingStep: React.FC = () => {
  const [marketingChannels, setMarketingChannels] = React.useState<MarketingChannel[]>([
    {
      id: "twitter",
      name: "Twitter",
      icon: <Twitter className="h-5 w-5" />,
      status: "scheduled",
      reach: 15000,
    },
    {
      id: "discord",
      name: "Discord",
      icon: <Send className="h-5 w-5" />,
      status: "published",
      reach: 8000,
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: <Send className="h-5 w-5" />,
      status: "published",
      reach: 12000,
    },
    {
      id: "medium",
      name: "Medium",
      icon: <Globe className="h-5 w-5" />,
      status: "pending",
      reach: 5000,
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: <Globe className="h-5 w-5" />,
      status: "pending",
      reach: 20000,
    },
  ])

  const [announcementText, setAnnouncementText] = React.useState(
    "We're excited to announce the launch of our new DEX on Sonic Network! Experience lightning-fast trades with minimal fees. Join us for the launch event and participate in our trading competition with $10,000 in prizes!",
  )

  const totalReach = marketingChannels.reduce((sum, channel) => sum + channel.reach, 0)
  const publishedReach = marketingChannels
    .filter((channel) => channel.status === "published")
    .reduce((sum, channel) => sum + channel.reach, 0)

  const reachPercentage = Math.round((publishedReach / totalReach) * 100)

  const updateChannelStatus = (id: string, status: "pending" | "scheduled" | "published") => {
    setMarketingChannels((prev) => prev.map((channel) => (channel.id === id ? { ...channel, status } : channel)))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Marketing & Promotion
        </CardTitle>
        <CardDescription>Prepare and schedule your DEX launch announcements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Launch Announcement</h3>

            <Textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="Write your launch announcement here..."
              className="min-h-[120px]"
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <Input type="text" placeholder="Launch date (e.g., June 15, 2023)" className="flex-1" />
              <Input type="text" placeholder="Launch time (e.g., 3:00 PM UTC)" className="flex-1" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Marketing Channels</h3>
              <span className="text-sm font-medium">
                Reach: {publishedReach.toLocaleString()} / {totalReach.toLocaleString()}
              </span>
            </div>

            <Progress value={reachPercentage} className="h-2" />

            <div className="space-y-3">
              {marketingChannels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">{channel.icon}</div>
                    <div>
                      <h4 className="font-medium">{channel.name}</h4>
                      <p className="text-sm text-gray-500">Potential reach: {channel.reach.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        channel.status === "published"
                          ? "bg-green-100 text-green-800"
                          : channel.status === "scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {channel.status.charAt(0).toUpperCase() + channel.status.slice(1)}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateChannelStatus(channel.id, "published")}
                      disabled={channel.status === "published"}
                    >
                      {channel.status === "published" ? <CheckCircle className="h-4 w-4 text-green-500" /> : "Publish"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Marketing Tips</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
              <li>Schedule announcements across all platforms simultaneously</li>
              <li>Include clear call-to-actions in your messages</li>
              <li>Highlight unique features that differentiate your DEX</li>
              <li>Consider running a trading competition to boost initial volume</li>
              <li>Partner with influencers to expand your reach</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MarketingStep
