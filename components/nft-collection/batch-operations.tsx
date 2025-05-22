"use client"

import { useState } from "react"
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import type { NFTItem } from "@/types/nft"
import { approveNFT, stakeNFTs } from "@/lib/nft-service"

interface BatchOperationsProps {
  selectedNfts: NFTItem[]
  stakingContract: string
  onSuccess: () => void
  onError: (error: string) => void
}

type OperationStatus = "idle" | "approving" | "staking" | "success" | "error"

export function BatchOperations({ selectedNfts, stakingContract, onSuccess, onError }: BatchOperationsProps) {
  const [status, setStatus] = useState<OperationStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [currentNftIndex, setCurrentNftIndex] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const startBatchOperation = async () => {
    if (selectedNfts.length === 0) {
      setErrorMessage("No NFTs selected")
      setStatus("error")
      onError("No NFTs selected")
      return
    }

    try {
      // Start approval process
      setStatus("approving")
      setProgress(0)
      setCurrentNftIndex(0)

      // Approve each NFT
      for (let i = 0; i < selectedNfts.length; i++) {
        setCurrentNftIndex(i)
        const nft = selectedNfts[i]

        // Update progress
        setProgress(Math.round((i / selectedNfts.length) * 100))

        // Approve NFT
        await approveNFT(nft.collectionAddress, nft.tokenId, stakingContract)
      }

      // Start staking process
      setStatus("staking")
      setProgress(0)

      // Group NFTs by collection for batch staking
      const nftsByCollection: Record<string, string[]> = {}
      selectedNfts.forEach((nft) => {
        if (!nftsByCollection[nft.collectionAddress]) {
          nftsByCollection[nft.collectionAddress] = []
        }
        nftsByCollection[nft.collectionAddress].push(nft.tokenId)
      })

      // Stake NFTs by collection
      let collectionIndex = 0
      for (const [collectionAddress, tokenIds] of Object.entries(nftsByCollection)) {
        // Update progress
        setProgress(Math.round((collectionIndex / Object.keys(nftsByCollection).length) * 100))
        collectionIndex++

        // Stake NFTs
        await stakeNFTs(stakingContract, tokenIds)
      }

      // Complete
      setProgress(100)
      setStatus("success")
      onSuccess()
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to process batch operation")
      setStatus("error")
      onError(error.message || "Failed to process batch operation")
    }
  }

  const resetOperation = () => {
    setStatus("idle")
    setProgress(0)
    setCurrentNftIndex(0)
    setErrorMessage(null)
  }

  const renderStatusContent = () => {
    switch (status) {
      case "idle":
        return (
          <button
            onClick={startBatchOperation}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition-colors"
          >
            Stake {selectedNfts.length} NFTs
          </button>
        )

      case "approving":
      case "staking":
        const currentNft = selectedNfts[currentNftIndex]
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Loader2 size={24} className="text-green-400 animate-spin" />
              <span className="text-white font-medium">
                {status === "approving" ? "Approving NFTs" : "Staking NFTs"}
              </span>
            </div>

            {currentNft && (
              <div className="bg-[#143621] p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-[#0d2416] rounded overflow-hidden relative">
                    <img
                      src={currentNft.image || "/placeholder.svg"}
                      alt={currentNft.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/nft-placeholder.png"
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-white text-sm">{currentNft.name}</p>
                    <p className="text-gray-400 text-xs">ID: {currentNft.tokenId}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">
                  {status === "approving" ? "Approving" : "Staking"} {currentNftIndex + 1} of {selectedNfts.length}
                </span>
                <span className="text-white">{progress}%</span>
              </div>
              <div className="w-full bg-[#0d2416] rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )

      case "success":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <CheckCircle size={24} className="text-green-400" />
              <span className="text-white font-medium">Operation Successful</span>
            </div>
            <p className="text-center text-green-300">
              Successfully staked {selectedNfts.length} NFT{selectedNfts.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={resetOperation}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition-colors"
            >
              Done
            </button>
          </div>
        )

      case "error":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <AlertTriangle size={24} className="text-red-500" />
              <span className="text-white font-medium">Operation Failed</span>
            </div>
            <p className="text-center text-red-400">{errorMessage}</p>
            <div className="flex gap-2">
              <button
                onClick={resetOperation}
                className="flex-1 border border-gray-600 text-white py-2 rounded-md hover:bg-[#143621] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={startBatchOperation}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )
    }
  }

  return <div className="p-4 bg-[#0d2416] rounded-lg">{renderStatusContent()}</div>
}
