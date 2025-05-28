"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Send, ExternalLink, CheckCircle, Loader2, Wallet } from "lucide-react"
import type { NFT } from "@/types/nft"
import { nftTransferService } from "@/lib/nft-transfer-service"

interface TransferNFTModalProps {
  isOpen: boolean
  onClose: () => void
  nft: NFT | null
  userAddress: string
}

export function TransferNFTModal({ isOpen, onClose, nft, userAddress }: TransferNFTModalProps) {
  const [recipientAddress, setRecipientAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [estimating, setEstimating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [gasEstimate, setGasEstimate] = useState<{
    gasLimit: string
    gasPrice: string
    estimatedCost: string
  } | null>(null)
  const [userBalance, setUserBalance] = useState<string>("0")
  const [txHash, setTxHash] = useState<string | null>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setRecipientAddress("")
      setError(null)
      setSuccess(null)
      setGasEstimate(null)
      setTxHash(null)
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

  const estimateGas = async () => {
    if (!nft || !recipientAddress || !validateAddress(recipientAddress)) {
      setGasEstimate(null)
      return
    }

    setEstimating(true)
    setError(null)

    try {
      await nftTransferService.initialize()
      const estimate = await nftTransferService.estimateTransferGas(
        nft.contractAddress,
        nft.tokenId,
        userAddress,
        recipientAddress,
      )
      setGasEstimate(estimate)
    } catch (error: any) {
      console.error("Gas estimation failed:", error)
      setError(error.message || "Failed to estimate gas cost")
    } finally {
      setEstimating(false)
    }
  }

  // Auto-estimate gas when recipient address changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (recipientAddress && validateAddress(recipientAddress)) {
        estimateGas()
      } else {
        setGasEstimate(null)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [recipientAddress, nft])

  const handleTransfer = async () => {
    if (!nft || !recipientAddress || !validateAddress(recipientAddress)) {
      setError("Please enter a valid recipient address")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await nftTransferService.initialize()

      const result = await nftTransferService.transferNFT(
        nft.contractAddress,
        nft.tokenId,
        recipientAddress,
        userAddress,
      )

      if (result.success) {
        setSuccess("Transfer initiated successfully!")
        setTxHash(result.txHash || null)

        // Refresh balance
        setTimeout(() => {
          loadUserBalance()
        }, 2000)
      } else {
        setError(result.error || "Transfer failed")
      }
    } catch (error: any) {
      console.error("Transfer failed:", error)
      setError(error.message || "Transfer failed")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!nft) return null

  const isValidRecipient = validateAddress(recipientAddress)
  const canTransfer = isValidRecipient && gasEstimate && !loading && !estimating
  const insufficientBalance =
    gasEstimate && Number.parseFloat(userBalance) < Number.parseFloat(gasEstimate.estimatedCost)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Transfer NFT
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* NFT Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden">
                  <img src={nft.thumbnail || nft.image} alt={nft.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{nft.name}</h3>
                  <p className="text-sm text-gray-500">#{nft.tokenId}</p>
                  <p className="text-xs text-gray-400 truncate">{nft.collection.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
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
              Estimating gas cost...
            </div>
          )}

          {gasEstimate && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estimated Gas Cost</span>
                  <Badge variant="outline">{gasEstimate.estimatedCost} S</Badge>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
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
                      {(Number.parseFloat(userBalance) - Number.parseFloat(gasEstimate.estimatedCost)).toFixed(6)} S
                    </span>
                  </div>
                </div>

                {insufficientBalance && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Insufficient balance for gas fees. You need at least {gasEstimate.estimatedCost} S.
                    </AlertDescription>
                  </Alert>
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

          {/* Success Display */}
          {success && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                {success}
                {txHash && (
                  <div className="mt-2">
                    <a
                      href={`https://sonicscan.org/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      View on SonicScan
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} disabled={loading} className="flex-1">
              {success ? "Close" : "Cancel"}
            </Button>

            {!success && (
              <Button onClick={handleTransfer} disabled={!canTransfer || insufficientBalance} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Transfer NFT
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
