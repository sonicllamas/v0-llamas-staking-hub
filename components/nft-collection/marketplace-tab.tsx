"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, Clock } from "lucide-react"
import { SalesList } from "./sales-list"
import { MarketplaceStats } from "./marketplace-stats"

interface MarketplaceTabProps {
  collectionAddress?: string
}

export function MarketplaceTab({ collectionAddress }: MarketplaceTabProps) {
  return (
    <div className="space-y-6">
      {/* Market Stats */}
      <MarketplaceStats />

      {/* Sales Tabs */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
          <TabsTrigger value="recent" className="data-[state=active]:bg-gray-700">
            Recent Sales
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-gray-700">
            Active Listings
          </TabsTrigger>
          <TabsTrigger value="auctions" className="data-[state=active]:bg-gray-700">
            Auctions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SalesList collectionAddress={collectionAddress} limit={20} showCollection={!collectionAddress} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Active Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SalesList collectionAddress={collectionAddress} limit={20} showCollection={!collectionAddress} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auctions" className="mt-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Live Auctions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No active auctions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
