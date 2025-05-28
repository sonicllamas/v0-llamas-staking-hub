"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Clock, DollarSign, User, Calendar, TrendingUp } from "lucide-react"
import { fetchSaleDetails, formatPrice, formatSaleTime } from "@/lib/nft-service"
import Image from "next/image"

interface SaleDetailModalProps {
  saleId: string | null
  isOpen: boolean
  onClose: () => void
}

export function SaleDetailModal({ saleId, isOpen, onClose }: SaleDetailModalProps) {
  const [saleDetails, setSaleDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (saleId && isOpen) {
      loadSaleDetails()
    }
  }, [saleId, isOpen])

  const loadSaleDetails = async () => {
    if (!saleId) return

    setLoading(true)
    setError(null)

    try {
      const details = await fetchSaleDetails(saleId)
      if (details) {
        setSaleDetails(details)
      } else {
        setError("Sale details not available - this sale may have been completed or removed.")
      }
    } catch (err) {
      setError("Failed to load sale details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const getSaleStatus = () => {
    if (!saleDetails) return "Unknown"
    if (saleDetails.sold) return "Sold"
    if (saleDetails.cancelled) return "Cancelled"
    if (saleDetails.endTime && new Date(Number.parseInt(saleDetails.endTime) * 1000) < new Date()) return "Expired"
    return "Active"
  }

  const getStatusColor = () => {
    const status = getSaleStatus()
    switch (status) {
      case "Sold":
        return "bg-green-600"
      case "Cancelled":
        return "bg-red-600"
      case "Expired":
        return "bg-gray-600"
      case "Active":
        return "bg-blue-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sale Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about this NFT sale including price, seller, buyer, and transaction history.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-64 bg-gray-700 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-400 mb-4">{error}</div>
            <Button onClick={loadSaleDetails} variant="outline">
              Retry
            </Button>
          </div>
        )}

        {saleDetails && !loading && (
          <div className="space-y-6">
            {/* NFT Image and Basic Info */}
            <div className="flex gap-4">
              <div className="w-32 h-32 relative rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                <Image
                  src={
                    saleDetails.nft?.image || `/placeholder.svg?height=128&width=128&query=NFT%20${saleDetails.tokenId}`
                  }
                  alt={saleDetails.nft?.name || `NFT #${saleDetails.tokenId}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">{saleDetails.nft?.name || `NFT #${saleDetails.tokenId}`}</h3>
                  <Badge className={getStatusColor()}>{getSaleStatus()}</Badge>
                </div>

                <p className="text-gray-400 mb-2">
                  {saleDetails.nft?.collection?.name || `Collection ${formatAddress(saleDetails.address)}`}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Token ID: {saleDetails.tokenId}</span>
                  {saleDetails.isAuction && (
                    <Badge variant="outline" className="text-purple-400 border-purple-400">
                      Auction
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Sale Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="font-medium">Price</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{formatPrice(saleDetails.price)}</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-blue-400" />
                    <span className="font-medium">Seller</span>
                  </div>
                  <p className="text-blue-400 font-mono">{formatAddress(saleDetails.seller)}</p>
                </CardContent>
              </Card>

              {saleDetails.buyer && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-purple-400" />
                      <span className="font-medium">Buyer</span>
                    </div>
                    <p className="text-purple-400 font-mono">{formatAddress(saleDetails.buyer)}</p>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-orange-400" />
                    <span className="font-medium">Listed</span>
                  </div>
                  <p className="text-orange-400">{formatSaleTime(saleDetails.startTime)}</p>
                </CardContent>
              </Card>

              {saleDetails.endTime && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-red-400" />
                      <span className="font-medium">Ends</span>
                    </div>
                    <p className="text-red-400">{formatSaleTime(saleDetails.endTime)}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => window.open(`https://sonicscan.org/address/${saleDetails.address}`, "_blank")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View on Explorer
              </Button>

              <Button
                onClick={() =>
                  window.open(
                    `https://paintswap.finance/marketplace/assets/${saleDetails.address}/${saleDetails.tokenId}`,
                    "_blank",
                  )
                }
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View on PaintSwap
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
