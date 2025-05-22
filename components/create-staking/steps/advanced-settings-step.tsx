"use client"

import type React from "react"

import { useState } from "react"
import type { StakingFormData } from "../create-staking-form"
import { InfoIcon as InfoCircle } from "lucide-react"

interface AdvancedSettingsStepProps {
  formData: StakingFormData
  updateFormData: (data: Partial<StakingFormData>) => void
  nextStep: () => void
  prevStep: () => void
}

export function AdvancedSettingsStep({ formData, updateFormData, nextStep, prevStep }: AdvancedSettingsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (
      formData.maxStakePerWallet.trim() &&
      (isNaN(Number(formData.maxStakePerWallet)) || Number(formData.maxStakePerWallet) < 0)
    ) {
      newErrors.maxStakePerWallet = "Must be a non-negative number"
    }

    if (!formData.minStakeAmount.trim()) {
      newErrors.minStakeAmount = "Minimum stake amount is required"
    } else if (isNaN(Number(formData.minStakeAmount)) || Number(formData.minStakeAmount) <= 0) {
      newErrors.minStakeAmount = "Must be greater than 0"
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
      <h2 className="text-white text-2xl font-bold mb-6">Advanced Settings</h2>

      <div className="space-y-6">
        <div>
          <label htmlFor="maxStakePerWallet" className="block text-white font-medium mb-2">
            Maximum NFTs Per Wallet (0 = unlimited)
          </label>
          <input
            id="maxStakePerWallet"
            type="number"
            value={formData.maxStakePerWallet}
            onChange={(e) => updateFormData({ maxStakePerWallet: e.target.value })}
            className={`w-full px-4 py-3 bg-[#143621] border ${
              errors.maxStakePerWallet ? "border-red-500" : "border-gray-700"
            } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
            placeholder="0"
            min="0"
          />
          {errors.maxStakePerWallet && <p className="mt-1 text-red-500 text-sm">{errors.maxStakePerWallet}</p>}
          <p className="mt-1 text-gray-400 text-sm">
            Limit the number of NFTs a single wallet can stake (0 means no limit)
          </p>
        </div>

        <div>
          <label htmlFor="minStakeAmount" className="block text-white font-medium mb-2">
            Minimum NFTs to Stake
          </label>
          <input
            id="minStakeAmount"
            type="number"
            value={formData.minStakeAmount}
            onChange={(e) => updateFormData({ minStakeAmount: e.target.value })}
            className={`w-full px-4 py-3 bg-[#143621] border ${
              errors.minStakeAmount ? "border-red-500" : "border-gray-700"
            } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
            placeholder="1"
            min="1"
          />
          {errors.minStakeAmount && <p className="mt-1 text-red-500 text-sm">{errors.minStakeAmount}</p>}
        </div>

        <div className="space-y-4">
          <label className="block text-white font-medium mb-2">Contract Features</label>

          <div className="flex items-center">
            <input
              id="emergencyWithdraw"
              type="checkbox"
              checked={formData.emergencyWithdraw}
              onChange={(e) => updateFormData({ emergencyWithdraw: e.target.checked })}
              className="w-5 h-5 bg-[#143621] border border-gray-700 rounded text-green-500 focus:ring-green-500"
            />
            <label htmlFor="emergencyWithdraw" className="ml-3 text-white">
              Emergency Withdraw
            </label>
          </div>
          <p className="text-gray-400 text-sm ml-8">
            Allow users to withdraw their NFTs in case of emergency (bypassing lock periods)
          </p>

          <div className="flex items-center">
            <input
              id="pausable"
              type="checkbox"
              checked={formData.pausable}
              onChange={(e) => updateFormData({ pausable: e.target.checked })}
              className="w-5 h-5 bg-[#143621] border border-gray-700 rounded text-green-500 focus:ring-green-500"
            />
            <label htmlFor="pausable" className="ml-3 text-white">
              Pausable Contract
            </label>
          </div>
          <p className="text-gray-400 text-sm ml-8">Allow contract owner to pause staking and withdrawals</p>

          <div className="flex items-center">
            <input
              id="upgradeable"
              type="checkbox"
              checked={formData.upgradeable}
              onChange={(e) => updateFormData({ upgradeable: e.target.checked })}
              className="w-5 h-5 bg-[#143621] border border-gray-700 rounded text-green-500 focus:ring-green-500"
            />
            <label htmlFor="upgradeable" className="ml-3 text-white">
              Upgradeable Contract
            </label>
          </div>
          <p className="text-gray-400 text-sm ml-8">Allow contract owner to upgrade the contract logic (advanced)</p>
        </div>

        <div className="bg-[#143621] p-4 rounded-lg flex items-start gap-3">
          <InfoCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
          <div>
            <p className="text-white text-sm">
              These advanced settings allow you to customize the security and functionality of your staking contract.
              Choose carefully based on your needs.
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
