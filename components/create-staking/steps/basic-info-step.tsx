"use client"

import type React from "react"

import { useState } from "react"
import type { StakingFormData } from "../create-staking-form"
import { InfoIcon as InfoCircle } from "lucide-react"

interface BasicInfoStepProps {
  formData: StakingFormData
  updateFormData: (data: Partial<StakingFormData>) => void
  nextStep: () => void
}

export function BasicInfoStep({ formData, updateFormData, nextStep }: BasicInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.contractName.trim()) {
      newErrors.contractName = "Contract name is required"
    }

    if (!formData.contractSymbol.trim()) {
      newErrors.contractSymbol = "Contract symbol is required"
    } else if (formData.contractSymbol.length > 5) {
      newErrors.contractSymbol = "Symbol should be 5 characters or less"
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
      <h2 className="text-white text-2xl font-bold mb-6">Basic Information</h2>

      <div className="space-y-6">
        <div>
          <label htmlFor="contractName" className="block text-white font-medium mb-2">
            Contract Name
          </label>
          <input
            id="contractName"
            type="text"
            value={formData.contractName}
            onChange={(e) => updateFormData({ contractName: e.target.value })}
            className={`w-full px-4 py-3 bg-[#143621] border ${
              errors.contractName ? "border-red-500" : "border-gray-700"
            } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
            placeholder="Llama Staking"
          />
          {errors.contractName && <p className="mt-1 text-red-500 text-sm">{errors.contractName}</p>}
        </div>

        <div>
          <label htmlFor="contractSymbol" className="block text-white font-medium mb-2">
            Contract Symbol
          </label>
          <input
            id="contractSymbol"
            type="text"
            value={formData.contractSymbol}
            onChange={(e) => updateFormData({ contractSymbol: e.target.value })}
            className={`w-full px-4 py-3 bg-[#143621] border ${
              errors.contractSymbol ? "border-red-500" : "border-gray-700"
            } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
            placeholder="LLSTK"
            maxLength={5}
          />
          {errors.contractSymbol && <p className="mt-1 text-red-500 text-sm">{errors.contractSymbol}</p>}
          <p className="mt-1 text-gray-400 text-sm">Maximum 5 characters</p>
        </div>

        <div>
          <label htmlFor="description" className="block text-white font-medium mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            className="w-full px-4 py-3 bg-[#143621] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
            placeholder="Describe your staking contract..."
          />
        </div>

        <div className="bg-[#143621] p-4 rounded-lg flex items-start gap-3">
          <InfoCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
          <div>
            <p className="text-white text-sm">
              This information will be used to identify your staking contract on the blockchain and in the Llamas
              Staking Hub.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
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
