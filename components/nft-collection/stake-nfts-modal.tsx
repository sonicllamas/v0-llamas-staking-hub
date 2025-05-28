"use client"

import { useState, useEffect } from "react"
import { X, Check, AlertCircle, Loader2 } from "lucide-react"
import type { NFT } from "@/types/nft"
import { approveNFT, checkNFTApproval, stakeNFTs } from "@/lib/nft-service"
import { useWallet } from "@/context/wallet-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface StakeNFTsModalProps {
  isOpen: boolean
  onClose: () => void
  nfts: NFT[]
  stakingContractAddress?: string
}

export function StakeNFTsModal({ isOpen, onClose, nfts, stakingContractAddress = "0x123..." }: StakeNFTsModalProps) {
  const { address } = useWallet()
  const [step, setStep] = useState<"check" | "approve" | "stake" | "success" | "error">("check")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [approvalStatus, setApprovalStatus] = useState<Record<string, boolean>>({})
  const [needsApproval, setNeedsApproval] = useState(true)

  // Reset state when modal opens or NFTs change
  useEffect(() => {
    if (isOpen && nfts.length > 0) {
      setStep("check")
      setIsProcessing(true)
      setProgress(0)
      setErrorMessage("")
      checkApprovals()
    }
  }, [isOpen, nfts])

  const checkApprovals = async () => {
    if (!address || nfts.length === 0) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const statuses: Record<string, boolean> = {}
      let allApproved = true

      for (let i = 0; i < nfts.length; i++) {
        const nft = nfts[i]
        setProgress(Math.floor((i / nfts.length) * 100))

        // Check if this NFT is approved for staking
        const isApproved = await checkNFTApproval(nft.address, nft.tokenId, stakingContractAddress, address)

        statuses[nft.tokenId] = isApproved
        if (!isApproved) {
          allApproved = false
        }
      }

      setApprovalStatus(statuses)
      setNeedsApproval(!allApproved)

      // Move to next step based on approval status
      setStep(allApproved ? "stake" : "approve")
    } catch (error) {
      console.error("Error checking NFT approvals:", error)
      setStep("error")
      setErrorMessage("Failed to check NFT approvals. Please try again.")
    } finally {
      setIsProcessing(false)
      setProgress(100)
    }
  }

  const handleApprove = async () => {
    if (!address || nfts.length === 0) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const newStatuses = { ...approvalStatus }

      // Get NFTs that need approval
      const unapprovedNFTs = nfts.filter((nft) => !approvalStatus[nft.tokenId])

      for (let i = 0; i < unapprovedNFTs.length; i++) {
        const nft = unapprovedNFTs[i]
        setProgress(Math.floor((i / unapprovedNFTs.length) * 100))

        // Approve this NFT for staking
        await approveNFT(nft.address, nft.tokenId, stakingContractAddress)

        newStatuses[nft.tokenId] = true
      }

      setApprovalStatus(newStatuses)
      setNeedsApproval(false)
      setStep("stake")
    } catch (error) {
      console.error("Error approving NFTs:", error)
      setStep("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to approve NFTs. Please try again.")
    } finally {
      setIsProcessing(false)
      setProgress(100)
    }
  }

  const handleStake = async () => {
    if (!address || nfts.length === 0) return

    setIsProcessing(true)
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 95))
      }, 100)

      // Stake all NFTs
      await stakeNFTs(
        stakingContractAddress,
        nfts[0].address, // Assuming all NFTs are from the same collection
        nfts.map((nft) => nft.tokenId),
        address,
      )

      clearInterval(progressInterval)
      setProgress(100)
      setStep("success")
    } catch (error) {
      console.error("Error staking NFTs:", error)
      setStep("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to stake NFTs. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      onClose()
      // Reset state after modal is closed
      setTimeout(() => {
        setStep("check")
        setProgress(0)
        setErrorMessage("")
      }, 200)
    }
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogContent
          className="mx-auto max-w-lg w-full rounded-xl bg-white p-6"
          aria-describedby="stake-modal-description"
        >
          <DialogHeader>
            <DialogTitle>
              {step === "check" && "Checking NFT Approvals"}
              {step === "approve" && "Approve NFTs for Staking"}
              {step === "stake" && "Stake NFTs"}
              {step === "success" && "Staking Successful"}
              {step === "error" && "Staking Failed"}
            </DialogTitle>
            <DialogDescription id="stake-modal-description">
              {step === "check" && "Checking approval status for your selected NFTs before staking."}
              {step === "approve" && "Approve your NFTs for staking to the selected contract."}
              {step === "stake" && "Stake your approved NFTs to start earning rewards."}
              {step === "success" && "Your NFTs have been successfully staked and are now earning rewards."}
              {step === "error" && "There was an issue with the staking process. Please try again."}
            </DialogDescription>
          </DialogHeader>

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            <X size={20} />
          </button>

          <div className="mb-6">
            {step === "check" && (
              <div>
                <p className="mb-4">
                  Checking approval status for {nfts.length} NFT{nfts.length !== 1 ? "s" : ""}...
                </p>

                {isProcessing && (
                  <div className="mb-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Checking approvals... {progress}%</p>
                  </div>
                )}
              </div>
            )}

            {step === "approve" && (
              <div>
                <p className="mb-4">
                  You need to approve {nfts.filter((nft) => !approvalStatus[nft.tokenId]).length} NFT
                  {nfts.filter((nft) => !approvalStatus[nft.tokenId]).length !== 1 ? "s" : ""} before staking. This is a
                  one-time approval for each NFT.
                </p>

                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2">Selected NFTs:</h3>
                  <ul className="max-h-40 overflow-y-auto">
                    {nfts.map((nft) => (
                      <li key={nft.id} className="flex items-center justify-between py-1">
                        <span className="text-sm">
                          {nft.name} (#{nft.tokenId})
                        </span>
                        {approvalStatus[nft.tokenId] ? (
                          <span className="text-green-500 flex items-center">
                            <Check size={16} className="mr-1" /> Approved
                          </span>
                        ) : (
                          <span className="text-orange-500 flex items-center">
                            <AlertCircle size={16} className="mr-1" /> Needs Approval
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {isProcessing && (
                  <div className="mb-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Approving NFTs... {progress}%</p>
                  </div>
                )}
              </div>
            )}

            {step === "stake" && (
              <div>
                <p className="mb-4">Your NFTs are now approved. Click the button below to stake them.</p>

                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2">Ready to stake:</h3>
                  <ul className="max-h-40 overflow-y-auto">
                    {nfts.map((nft) => (
                      <li key={nft.id} className="flex items-center justify-between py-1">
                        <span className="text-sm">
                          {nft.name} (#{nft.tokenId})
                        </span>
                        <span className="text-green-500 flex items-center">
                          <Check size={16} className="mr-1" /> Ready
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {isProcessing && (
                  <div className="mb-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Staking NFTs... {progress}%</p>
                  </div>
                )}
              </div>
            )}

            {step === "success" && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <p className="mb-2">
                  Successfully staked {nfts.length} NFT{nfts.length !== 1 ? "s" : ""}!
                </p>
                <p className="text-sm text-gray-500">You can view your staked NFTs in the "My Staked NFTs" section.</p>
              </div>
            )}

            {step === "error" && (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="h-8 w-8 text-red-500" />
                </div>
                <p className="mb-2 text-red-600">{errorMessage}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            {step === "check" && (
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isProcessing}
              >
                Cancel
              </button>
            )}

            {step === "approve" && (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-[#0d2416] text-white rounded-lg hover:bg-[#143621] disabled:opacity-50 flex items-center"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Approving...
                    </>
                  ) : (
                    "Approve NFTs"
                  )}
                </button>
              </>
            )}

            {step === "stake" && (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStake}
                  className="px-4 py-2 bg-[#0d2416] text-white rounded-lg hover:bg-[#143621] disabled:opacity-50 flex items-center"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Staking...
                    </>
                  ) : (
                    `Stake ${nfts.length} NFT${nfts.length !== 1 ? "s" : ""}`
                  )}
                </button>
              </>
            )}

            {(step === "success" || step === "error") && (
              <button onClick={handleClose} className="px-4 py-2 bg-[#0d2416] text-white rounded-lg hover:bg-[#143621]">
                Close
              </button>
            )}
          </div>
        </DialogContent>
      </div>
    </Dialog>
  )
}
