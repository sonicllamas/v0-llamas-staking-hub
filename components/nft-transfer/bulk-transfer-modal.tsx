"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Send, ExternalLink, Loader2, Wallet, Package } from "lucide-react"
import type { NFT } from "@/types/nft"
import { nftTransferService, type BulkTransferResult } from "@/lib/nft-transfer-service"

interface BulkTransferModalProps {
  isOpen: boolean
  onClose: () => void
  selectedNFTs: NFT[]
  userAddress: string
}

export function BulkTransferModal({ isOpen, onClose, selectedNFTs, userAddress }: BulkTransferModalProps) {
  const [recipientAddress, setRecipientAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [estimating, setEstimating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bulkEstimate, setBulkEstimate] = useState<{
    totalEstimatedCost: string
    perTransferCost: string
    gasPrice: string
  } | null>(null)
  const [userBalance, setUserBalance] = useState<string>("0")
  const [transferProgress, setTransferProgress] = useState<{
    completed: number
    total: number
    currentNFT: string
  } | null>(null)
  const [transferResults, setTransferResults] = useState<BulkTransferResult | null>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setRecipientAddress("")
      setError(null)
      setBulkEstimate(null)
      setTransferProgress(null)
      setTransferResults(null)
      loadUserBalance()
    }
  }, [isOpen, userAddress])

  const loadUserBalance = async () => {
    try {
      const balance = await nftTransferService.getUserBalance(userAddress)
      setUserBalance(balance)
    } catch (error) {
      console.error("Failed to load user balance:", error)
    }
  }

  const validateAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const estimateBulkCost = async () => {
    if (!recipientAddress || !validateAddress(recipientAddress) || selectedNFTs.length === 0) {
      setBulkEstimate(null)
      return
    }

    setEstimating(true)
    setError(null)

    try {
      await nftTransferService.initialize()

      const transfers = selectedNFTs.map((nft) => ({
        contractAddress: nft.contractAddress,
        tokenId: nft.tokenId,
        toAddress: recipientAddress,
      }))

      const estimate = await nftTransferService.estimateBulkTransferCost(transfers, userAddress)
      setBulkEstimate(estimate)
    } catch (error: any) {
      console.error("Bulk gas estimation failed:", error)
      setError(error.message || "Failed to estimate bulk transfer cost")
    } finally {
      setEstimating(false)
    }
  }

  // Auto-estimate gas when recipient address changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (recipientAddress && validateAddress(recipientAddress)) {
        estimateBulkCost()
      } else {
        setBulkEstimate(null)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [recipientAddress, selectedNFTs])

  const handleBulkTransfer = async () => {
    if (!recipientAddress || !validateAddress(recipientAddress) || selectedNFTs.length === 0) {
      setError("Please enter a valid recipient address")
      return
    }

    setLoading(true)
    setError(null)
    setTransferResults(null)

    try {
      await nftTransferService.initialize()

      const transfers = selectedNFTs.map((nft) => ({
        contractAddress: nft.contractAddress,
        tokenId: nft.tokenId,
        toAddress: recipientAddress,
      }))

      const results = await nftTransferService.bulkTransferNFTs(
        transfers,
        userAddress,
        (completed, total, currentNFT) => {
          setTransferProgress({ completed, total, currentNFT })
        },
      )

      setTransferResults(results)

      // Refresh balance
      setTimeout(() => {
        loadUserBalance()
      }, 2000)
    } catch (error: any) {
      console.error("Bulk transfer failed:", error)
      setError(error.message || "Bulk transfer failed")
    } finally {
      setLoading(false)
      setTransferProgress(null)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  const isValidRecipient = validateAddress(recipientAddress)
  const canTransfer = isValidRecipient && bulkEstimate && !loading && !estimating && selectedNFTs.length > 0
  const insufficientBalance =
    bulkEstimate && Number.parseFloat(userBalance) < Number.parseFloat(bulkEstimate.totalEstimatedCost)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Bulk Transfer NFTs ({selectedNFTs.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected NFTs Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Selected NFTs</span>
                  <Badge>{selectedNFTs.length} items</Badge>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {selectedNFTs.slice(0, 8).map((nft) => (
                    <div key={nft.id} className="aspect-square rounded overflow-hidden">
                      <img src={nft.thumbnail || nft.image} alt={nft.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {selectedNFTs.length > 8 && (
                    <div className="aspect-square rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm">
                      +{selectedNFTs.length - 8}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="bulk-recipient">Recipient Address (for all NFTs)</Label>
            <Input
              id="bulk-recipient"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className={!recipientAddress ? "" : isValidRecipient ? "border-green-500" : "border-red-500"}
            />
            {recipientAddress && !isValidRecipient && <p className="text-sm text-red-500">Invalid Ethereum address</p>}
          </div>

          {/* Gas Estimation */}
          {estimating && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Estimating bulk transfer cost...
            </div>
          )}

          {bulkEstimate && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Estimated Cost</span>
                  <Badge variant="outline">{bulkEstimate.totalEstimatedCost} S</Badge>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Per Transfer</span>
                    <span>{bulkEstimate.perTransferCost} S</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Number of Transfers</span>
                    <span>{selectedNFTs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Your Balance</span>
                    <span className="flex items-center gap-1">
                      <Wallet className="h-3 w-3" />
                      {Number.parseFloat(userBalance).toFixed(6)} S
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">After Transfer</span>
                    <span className={insufficientBalance ? "text-red-500" : ""}>
                      {(Number.parseFloat(userBalance) - Number.parseFloat(bulkEstimate.totalEstimatedCost)).toFixed(6)}{" "}
                      S
                    </span>
                  </div>
                </div>

                {insufficientBalance && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Insufficient balance for gas fees. You need at least {bulkEstimate.totalEstimatedCost} S.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transfer Progress */}
          {transferProgress && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Transfer Progress</span>
                  <span className="text-sm text-gray-500">
                    {transferProgress.completed} / {transferProgress.total}
                  </span>
                </div>

                <Progress value={(transferProgress.completed / transferProgress.total) * 100} className="w-full" />

                <p className="text-sm text-gray-500">
                  {transferProgress.currentNFT === "Complete"
                    ? "All transfers completed!"
                    : `Transferring: ${transferProgress.currentNFT}`}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Transfer Results */}
          {transferResults && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Transfer Results</span>
                  <Badge variant={transferResults.summary.failCount === 0 ? "default" : "destructive"}>
                    {transferResults.summary.successCount} / {transferResults.summary.totalTransfers} successful
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-600">Successful</span>
                    <span>{transferResults.summary.successCount}</span>
                  </div>
                  {transferResults.summary.failCount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-600">Failed</span>
                      <span>{transferResults.summary.failCount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Gas Used</span>
                    <span>{transferResults.totalGasCost} S</span>
                  </div>
                </div>

                {transferResults.successful.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-600">Successful Transfers:</p>
                    {transferResults.successful.slice(0, 3).map((result, index) => (
                      <div key={index} className="text-xs">
                        {result.txHash && (
                          <a
                            href={`https://sonicscan.org/tx/${result.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            {result.txHash.slice(0, 10)}...{result.txHash.slice(-8)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ))}
                    {transferResults.successful.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{transferResults.successful.length - 3} more successful transfers
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} disabled={loading} className="flex-1">
              {transferResults ? "Close" : "Cancel"}
            </Button>

            {!transferResults && (
              <Button onClick={handleBulkTransfer} disabled={!canTransfer || insufficientBalance} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Transfer All ({selectedNFTs.length})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
