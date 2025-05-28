"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, DollarSign, TrendingUp, Eye } from "lucide-react"
import { fetchNFTSales, formatPrice, formatSaleTime } from "@/lib/nft-service"
import { SaleDetailModal } from "./sale-detail-modal"
import Image from "next/image"

interface SalesListProps {
  collectionAddress?: string
  limit?: number
  showCollection?: boolean
}

export function SalesList({ collectionAddress, limit = 20, showCollection = true }: SalesListProps) {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadSales()
  }, [collectionAddress, limit])

  const loadSales = async () => {
    setLoading(true)
    setError(null)

    try {
      const { sales: fetchedSales } = await fetchNFTSales(limit * 2) // Fetch more to filter if needed

      let filteredSales = fetchedSales
      if (collectionAddress) {
        filteredSales = fetchedSales.filter((sale) => sale.address.toLowerCase() === collectionAddress.toLowerCase())
      }

      setSales(filteredSales.slice(0, limit))
    } catch (err) {
      setError("Failed to load sales data")
    } finally {
      setLoading(false)
    }
  }

  const handleSaleClick = (saleId: string) => {
    setSelectedSaleId(saleId)
    setIsModalOpen(true)
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-4 p-4 bg-gray-700 rounded-lg">
              <div className="w-16 h-16 bg-gray-600 rounded-lg"></div>
              <div className="flex-grow space-y-2">
                <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                <div className="h-4 bg-gray-600 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">{error}</div>
        <Button onClick={loadSales} variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  if (sales.length === 0) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">No sales found</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {sales.map((sale, index) => (
          <Card
            key={sale.id || index}
            className="bg-gray-700 border-gray-600 hover:bg-gray-650 transition-colors cursor-pointer"
            onClick={() => sale.id && handleSaleClick(sale.id)}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                  <Image
                    src={sale.nft?.image || `/placeholder.svg?height=64&width=64&query=NFT%20${sale.tokenId}`}
                    alt={sale.nft?.name || `NFT #${sale.tokenId}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-white">{sale.nft?.name || `NFT #${sale.tokenId}`}</h4>
                      {showCollection && (
                        <p className="text-sm text-gray-400">
                          {sale.nft?.collection?.name || formatAddress(sale.address)}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-400 font-bold">
                        <DollarSign className="h-4 w-4" />
                        {formatPrice(sale.price)}
                      </div>
                      {sale.isAuction && (
                        <Badge variant="outline" className="text-purple-400 border-purple-400 text-xs">
                          Auction
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                      <span>Seller: {formatAddress(sale.seller)}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatSaleTime(sale.startTime)}
                      </div>
                    </div>

                    {sale.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:text-blue-300 p-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSaleClick(sale.id)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SaleDetailModal
        saleId={selectedSaleId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedSaleId(null)
        }}
      />
    </>
  )
}
