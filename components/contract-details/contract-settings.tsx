"use client"

import type React from "react"

import { useState } from "react"
import { Loader2 } from "lucide-react"

interface ContractSettingsProps {
  contract: any
}

export function ContractSettings({ contract }: ContractSettingsProps) {
  const [rewardRate, setRewardRate] = useState(contract.rewardRate)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // In a real app, this would call the contract's update functions
      alert("Contract settings updated successfully!")
    } catch (error) {
      console.error("Failed to update settings:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0d2416] rounded-lg p-6">
        <h3 className="text-white text-lg font-bold mb-4">Contract Settings</h3>
        <form onSubmit={handleUpdateSettings} className="space-y-4">
          <div>
            <label htmlFor="rewardRate" className="block text-white font-medium mb-2">
              Reward Rate (tokens per day)
            </label>
            <input
              id="rewardRate"
              type="text"
              value={rewardRate}
              onChange={(e) => setRewardRate(e.target.value)}
              className="w-full px-4 py-2 bg-[#143621] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter reward rate"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isUpdating}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating && <Loader2 size={16} className="animate-spin" />}
            Update Settings
          </button>
        </form>
      </div>

      <div className="bg-[#0d2416] rounded-lg p-6">
        <h3 className="text-white text-lg font-bold mb-4">Danger Zone</h3>
        <div className="space-y-4">
          <div className="border border-red-800 rounded-lg p-4">
            <h4 className="text-red-400 font-medium mb-2">Transfer Ownership</h4>
            <p className="text-gray-400 text-sm mb-4">
              Transfer ownership of this contract to another address. This action cannot be undone.
            </p>
            <button className="py-2 px-4 rounded-md text-white bg-red-700 hover:bg-red-800 transition-colors">
              Transfer Ownership
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
