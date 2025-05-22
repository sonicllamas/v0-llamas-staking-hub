"use client"

import type { StakingFormData } from "../create-staking-form"
import { InfoIcon as InfoCircle } from "lucide-react"
import { ContractPreview } from "../contract-preview"
import { useState } from "react"

interface ReviewStepProps {
  formData: StakingFormData
  nextStep: () => void
  prevStep: () => void
}

export function ReviewStep({ formData, nextStep, prevStep }: ReviewStepProps) {
  const [showCode, setShowCode] = useState(false)

  const formatDuration = (seconds: string) => {
    const intervalInSeconds = Number(seconds)
    if (intervalInSeconds === 3600) return "Hourly"
    if (intervalInSeconds === 86400) return "Daily"
    if (intervalInSeconds === 604800) return "Weekly"
    if (intervalInSeconds === 2592000) return "Monthly"
    return `${intervalInSeconds} seconds`
  }

  return (
    <div>
      <h2 className="text-white text-2xl font-bold mb-6">Review Contract Details</h2>

      <div className="space-y-8">
        <div className="bg-[#143621] p-4 rounded-lg">
          <h3 className="text-white font-bold mb-3">Basic Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Contract Name:</span>
              <span className="text-white font-medium">{formData.contractName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Contract Symbol:</span>
              <span className="text-white font-medium">{formData.contractSymbol}</span>
            </div>
            {formData.description && (
              <div>
                <span className="text-gray-400 block mb-1">Description:</span>
                <span className="text-white">{formData.description}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#143621] p-4 rounded-lg">
          <h3 className="text-white font-bold mb-3">Rewards Configuration</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Reward Token:</span>
              <span className="text-white font-medium truncate max-w-[250px]">{formData.rewardTokenAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Reward Rate:</span>
              <span className="text-white font-medium">{formData.rewardRate} tokens per interval</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Reward Interval:</span>
              <span className="text-white font-medium">{formatDuration(formData.rewardInterval)}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#143621] p-4 rounded-lg">
          <h3 className="text-white font-bold mb-3">NFT Configuration</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">NFT Collection:</span>
              <span className="text-white font-medium truncate max-w-[250px]">{formData.nftCollectionAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Staking Type:</span>
              <span className="text-white font-medium capitalize">{formData.stakingType}</span>
            </div>
            {formData.stakingType === "locked" && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lock Period:</span>
                  <span className="text-white font-medium">{formData.lockPeriod} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Early Withdrawal Fee:</span>
                  <span className="text-white font-medium">{formData.earlyWithdrawalFee}%</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-[#143621] p-4 rounded-lg">
          <h3 className="text-white font-bold mb-3">Advanced Settings</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Max NFTs Per Wallet:</span>
              <span className="text-white font-medium">
                {Number(formData.maxStakePerWallet) === 0 ? "Unlimited" : formData.maxStakePerWallet}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Min NFTs to Stake:</span>
              <span className="text-white font-medium">{formData.minStakeAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Emergency Withdraw:</span>
              <span className="text-white font-medium">{formData.emergencyWithdraw ? "Enabled" : "Disabled"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Pausable Contract:</span>
              <span className="text-white font-medium">{formData.pausable ? "Enabled" : "Disabled"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Upgradeable Contract:</span>
              <span className="text-white font-medium">{formData.upgradeable ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#143621] p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold">Contract Code</h3>
            <button
              onClick={() => setShowCode(!showCode)}
              className="text-green-400 hover:text-green-300 transition-colors text-sm"
            >
              {showCode ? "Hide Code" : "Show Code"}
            </button>
          </div>
          {showCode && <ContractPreview formData={formData} />}
        </div>

        <div className="bg-[#143621] p-4 rounded-lg flex items-start gap-3">
          <InfoCircle className="text-yellow-400 mt-1 flex-shrink-0" size={20} />
          <div>
            <p className="text-white text-sm">
              Please review all details carefully. Once deployed, some contract parameters cannot be changed.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="border border-white text-white py-3 px-6 rounded-full font-bold hover:bg-[#143621] transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-full font-bold transition-colors"
        >
          Deploy Contract
        </button>
      </div>
    </div>
  )
}
