"use client"

import type React from "react"

import { useState } from "react"
import type { StakingFormData } from "../create-staking-form"
import { InfoIcon as InfoCircle } from "lucide-react"

interface NFTConfigStepProps {
  formData: StakingFormData
  updateFormData: (data: Partial<StakingFormData>) => void
  nextStep: () => void
  prevStep: () => void
}

export function NFTConfigStep({ formData, updateFormData, nextStep, prevStep }: NFTConfigStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nftCollectionAddress.trim()) {
      newErrors.nftCollectionAddress = "NFT collection address is required"
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.nftCollectionAddress)) {
      newErrors.nftCollectionAddress = "Invalid address format"
    }

    if (formData.stakingType === "locked") {
      if (!formData.lockPeriod.trim()) {
        newErrors.lockPeriod = "Lock period is required for locked staking"
      } else if (isNaN(Number(formData.lockPeriod)) || Number(formData.lockPeriod) <= 0) {
        newErrors.lockPeriod = "Lock period must be a positive number"
      }

      if (!formData.earlyWithdrawalFee.trim()) {
        newErrors.earlyWithdrawalFee = "Early withdrawal fee is required"
      } else if (
        isNaN(Number(formData.earlyWithdrawalFee)) ||
        Number(formData.earlyWithdrawalFee) < 0 ||
        Number(formData.earlyWithdrawalFee) > 100
      ) {
        newErrors.earlyWithdrawalFee = "Fee must be between 0 and 100"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      nextStep()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-white text-2xl font-bold mb-6">NFT Configuration</h2>

      <div className="space-y-6">
        <div>
          <label htmlFor="nftCollectionAddress" className="block text-white font-medium mb-2">
            NFT Collection Address
          </label>
          <input
            id="nftCollectionAddress"
            type="text"
            value={formData.nftCollectionAddress}
            onChange={(e) => updateFormData({ nftCollectionAddress: e.target.value })}
            className={`w-full px-4 py-3 bg-[#143621] border ${
              errors.nftCollectionAddress ? "border-red-500" : "border-gray-700"
            } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
            placeholder="0x..."
          />
          {errors.nftCollectionAddress && <p className="mt-1 text-red-500 text-sm">{errors.nftCollectionAddress}</p>}
          <p className="mt-1 text-gray-400 text-sm">The ERC-721 or ERC-1155 NFT collection that can be staked</p>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Staking Type</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-lg cursor-pointer border ${
                formData.stakingType === "flexible" ? "border-green-500 bg-[#143621]" : "border-gray-700 bg-[#0d2416]"
              }`}
              onClick={() => updateFormData({ stakingType: "flexible" })}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold">Flexible Staking</h3>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    formData.stakingType === "flexible" ? "border-green-500" : "border-gray-500"
                  }`}
                >
                  {formData.stakingType === "flexible" && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                </div>
              </div>
              <p className="text-gray-400 text-sm">Users can withdraw their NFTs at any time without penalties</p>
            </div>

            <div
              className={`p-4 rounded-lg cursor-pointer border ${
                formData.stakingType === "locked" ? "border-green-500 bg-[#143621]" : "border-gray-700 bg-[#0d2416]"
              }`}
              onClick={() => updateFormData({ stakingType: "locked" })}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold">Locked Staking</h3>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    formData.stakingType === "locked" ? "border-green-500" : "border-gray-500"
                  }`}
                >
                  {formData.stakingType === "locked" && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                </div>
              </div>
              <p className="text-gray-400 text-sm">NFTs are locked for a specific period with early withdrawal fees</p>
            </div>
          </div>
        </div>

        {formData.stakingType === "locked" && (
          <>
            <div>
              <label htmlFor="lockPeriod" className="block text-white font-medium mb-2">
                Lock Period (days)
              </label>
              <input
                id="lockPeriod"
                type="number"
                value={formData.lockPeriod}
                onChange={(e) => updateFormData({ lockPeriod: e.target.value })}
                className={`w-full px-4 py-3 bg-[#143621] border ${
                  errors.lockPeriod ? "border-red-500" : "border-gray-700"
                } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
                placeholder="30"
                min="1"
              />
              {errors.lockPeriod && <p className="mt-1 text-red-500 text-sm">{errors.lockPeriod}</p>}
            </div>

            <div>
              <label htmlFor="earlyWithdrawalFee" className="block text-white font-medium mb-2">
                Early Withdrawal Fee (%)
              </label>
              <input
                id="earlyWithdrawalFee"
                type="number"
                value={formData.earlyWithdrawalFee}
                onChange={(e) => updateFormData({ earlyWithdrawalFee: e.target.value })}
                className={`w-full px-4 py-3 bg-[#143621] border ${
                  errors.earlyWithdrawalFee ? "border-red-500" : "border-gray-700"
                } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
                placeholder="10"
                min="0"
                max="100"
              />
              {errors.earlyWithdrawalFee && <p className="mt-1 text-red-500 text-sm">{errors.earlyWithdrawalFee}</p>}
              <p className="mt-1 text-gray-400 text-sm">Fee charged if users withdraw before the lock period ends</p>
            </div>
          </>
        )}

        <div className="bg-[#143621] p-4 rounded-lg flex items-start gap-3">
          <InfoCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
          <div>
            <p className="text-white text-sm">
              Make sure your NFT collection is compatible with the staking contract. The collection must implement
              either ERC-721 or ERC-1155 standards.
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
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-full font-bold transition-colors"
        >
          Continue
        </button>
      </div>
    </form>
  )
}
