"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Tag, ExternalLink } from "lucide-react"
import type { NFTItem } from "@/types/nft"

interface MarketplacePreviewProps {
  nft: NFTItem
}

export function MarketplacePreview({ nft }: MarketplacePreviewProps) {
  const [price, setPrice] = useState("")
  const [currency, setCurrency] = useState("FTM")
  const [duration, setDuration] = useState("7")
  const [isListing, setIsListing] = useState(false)

  const handleListNFT = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!price || Number(price) <= 0) {
      alert("Please enter a valid price")
      return
    }

    setIsListing(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      alert(`NFT listed for ${price} ${currency} successfully!`)

      // Reset form
      setPrice("")
    } catch (error) {
      console.error("Failed to list NFT:", error)
      alert("Failed to list NFT. Please try again.")
    } finally {
      setIsListing(false)
    }
  }

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="bg-[#0d2416] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-bold">List on Marketplace</h3>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
            <Image src={nft.image || "/nft-placeholder.png"} alt={nft.name} fill className="object-cover" unoptimized />
          </div>
          <div>
            <h4 className="text-white font-medium">{nft.name}</h4>
            <p className="text-gray-400 text-sm">{nft.collectionName}</p>
          </div>
        </div>

        <form onSubmit={handleListNFT} className="space-y-4">
          <div>
            <label htmlFor="price" className="block text-white font-medium mb-2">
              Price
            </label>
            <div className="flex">
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="flex-grow px-4 py-2 bg-[#143621] border border-gray-700 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
                required
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2 bg-[#143621] border border-gray-700 border-l-0 rounded-r-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="FTM">FTM</option>
                <option value="USDC">USDC</option>
                <option value="SLL">SLL</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="duration" className="block text-white font-medium mb-2">
              Duration
            </label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-2 bg-[#143621] border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </div>

          <div className="bg-[#143621] p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Listing Fee</span>
              <span className="text-white">1.5%</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-400">Royalty Fee</span>
              <span className="text-white">5.0%</span>
            </div>
            <div className="flex justify-between items-center mt-1 border-t border-gray-700 pt-1">
              <span className="text-gray-400">You'll Receive</span>
              <span className="text-white font-medium">
                {price ? `${(Number(price) * 0.935).toFixed(2)} ${currency}` : "-"}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isListing || !price}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isListing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Listing...</span>
              </>
            ) : (
              <>
                <Tag size={18} />
                <span>List for Sale</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <a
            href={`https://paintswap.finance/marketplace/collections/${nft.collectionAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-green-400 hover:text-green-300 transition-colors"
          >
            <ExternalLink size={16} />
            <span>View Collection on PaintSwap</span>
          </a>
        </div>
      </div>
    </div>
  )
}
