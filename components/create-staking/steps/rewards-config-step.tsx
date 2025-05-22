"use client"

import type React from "react"

import { useState } from "react"
import type { StakingFormData } from "../create-staking-form"
import { InfoIcon as InfoCircle } from "lucide-react"

interface RewardsConfigStepProps {
  formData: StakingFormData
  updateFormData: (data: Partial<StakingFormData>) => void
  nextStep: () => void
  prevStep: () => void
}

export function RewardsConfigStep({ formData, updateFormData, nextStep, prevStep }: RewardsConfigStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.rewardTokenAddress.trim()) {
      newErrors.rewardTokenAddress = "Reward token address is required"
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.rewardTokenAddress)) {
      newErrors.rewardTokenAddress = "Invalid token address format"
    }

    if (!formData.rewardRate.trim()) {
      newErrors.rewardRate = "Reward rate is required"
    } else if (isNaN(Number(formData.rewardRate)) || Number(formData.rewardRate) <= 0) {
      newErrors.rewardRate = "Reward rate must be a positive number"
    }

    if (!formData.rewardInterval.trim()) {
      newErrors.rewardInterval = "Reward interval is required"
    } else if (isNaN(Number(formData.rewardInterval)) || Number(formData.rewardInterval) <= 0) {
      newErrors.rewardInterval = "Reward interval must be a positive number"
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

  const intervalOptions = [
    { value: "3600", label: "Hourly" },
    { value: "86400", label: "Daily" },
    { value: "604800", label: "Weekly" },
    { value: "2592000", label: "Monthly" },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-white text-2xl font-bold mb-6">Rewards Configuration</h2>

      <div className="space-y-6">
        <div>
          <label htmlFor="rewardTokenAddress" className="block text-white font-medium mb-2">
            Reward Token Address
          </label>
          <input
            id="rewardTokenAddress"
            type="text"
            value={formData.rewardTokenAddress}
            onChange={(e) => updateFormData({ rewardTokenAddress: e.target.value })}
            className={`w-full px-4 py-3 bg-[#143621] border ${
              errors.rewardTokenAddress ? "border-red-500" : "border-gray-700"
            } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
            placeholder="0x..."
          />
          {errors.rewardTokenAddress && <p className="mt-1 text-red-500 text-sm">{errors.rewardTokenAddress}</p>}
          <p className="mt-1 text-gray-400 text-sm">The ERC-20 token that will be distributed as rewards</p>
        </div>

        <div>
          <label htmlFor="rewardRate" className="block text-white font-medium mb-2">
            Reward Rate (tokens per interval)
          </label>
          <input
            id="rewardRate"
            type="text"
            value={formData.rewardRate}
            onChange={(e) => updateFormData({ rewardRate: e.target.value })}
            className={`w-full px-4 py-3 bg-[#143621] border ${
              errors.rewardRate ? "border-red-500" : "border-gray-700"
            } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
            placeholder="10"
          />
          {errors.rewardRate && <p className="mt-1 text-red-500 text-sm">{errors.rewardRate}</p>}
        </div>

        <div>
          <label htmlFor="rewardInterval" className="block text-white font-medium mb-2">
            Reward Interval
          </label>
          <select
            id="rewardInterval"
            value={formData.rewardInterval}
            onChange={(e) => updateFormData({ rewardInterval: e.target.value })}
            className={`w-full px-4 py-3 bg-[#143621] border ${
              errors.rewardInterval ? "border-red-500" : "border-gray-700"
            } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
          >
            {intervalOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.rewardInterval && <p className="mt-1 text-red-500 text-sm">{errors.rewardInterval}</p>}
        </div>

        <div className="bg-[#143621] p-4 rounded-lg flex items-start gap-3">
          <InfoCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
          <div>
            <p className="text-white text-sm">
              Make sure you have enough reward tokens to distribute. You will need to approve the contract to spend your
              tokens before staking begins.
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
