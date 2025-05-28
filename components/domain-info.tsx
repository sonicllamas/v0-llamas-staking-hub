"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"

export function DomainInfo() {
  const [linkType, setLinkType] = useState<"ipfs" | "traditional">("traditional")
  const [destination, setDestination] = useState("")
  const [domainName, setDomainName] = useState("")
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // This would typically connect to your backend or blockchain
    toast({
      title: "Domain configuration saved",
      description: `${domainName} will now redirect to ${destination}`,
    })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Custom Domain Configuration</CardTitle>
        <CardDescription>Link your Sonic Llamas domain to an IPFS hash or traditional website</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="domain-name">Domain Name</Label>
            <Input
              id="domain-name"
              placeholder="yourdomain.sonic"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              required
            />
          </div>

          <RadioGroup
            value={linkType}
            onValueChange={(value) => setLinkType(value as "ipfs" | "traditional")}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ipfs" id="ipfs" />
              <Label htmlFor="ipfs">IPFS Hash</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="traditional" id="traditional" />
              <Label htmlFor="traditional">Traditional Website</Label>
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="destination">{linkType === "ipfs" ? "IPFS Hash" : "Website URL"}</Label>
            <Input
              id="destination"
              placeholder={
                linkType === "ipfs" ? "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG" : "https://yourwebsite.com"
              }
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
            {linkType === "ipfs" && (
              <p className="text-sm text-gray-500">Your content will be accessible via IPFS gateways</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Save Configuration
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
