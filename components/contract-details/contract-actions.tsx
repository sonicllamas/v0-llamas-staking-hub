"use client"

import type React from "react"

import { useState } from "react"
import { Loader2 } from "lucide-react"

interface ContractActionsProps {
  contract: any
}

export function ContractActions({ contract }: ContractActionsProps) {
  const [isPausing, setIsPausing] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isAddingRewards, setIsAddingRewards] = useState(false)
  const [rewardAmount, setRewardAmount] = useState("")

  const handlePauseToggle = async () => {
    setIsPausing(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // In a real app, this would call the contract's pause/unpause function
      alert(`Contract ${contract.isPaused ? "unpaused" : "paused"} successfully!`)
    } catch (error) {
      console.error("Failed to toggle pause:", error)
    } finally {
      setIsPausing(false)
    }
  }

  const handleWithdrawTokens = async () => {
    setIsWithdrawing(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // In a real app, this would call the contract's withdraw function
      alert("Tokens withdrawn successfully!")
    } catch (error) {
      console.error("Failed to withdraw tokens:", error)
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleAddRewards = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingRewards(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // In a real app, this would call the contract's addRewards function
      alert(`${rewardAmount} tokens added to rewards pool!`)
      setRewardAmount("")
    } catch (error) {
      console.error("Failed to add rewards:", error)
    } finally {
      setIsAddingRewards(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0d2416] rounded-lg p-6">
        <h3 className="text-white text-lg font-bold mb-4">Contract Controls</h3>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handlePauseToggle}
              disabled={isPausing}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md text-white ${
                contract.isPaused ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isPausing && <Loader2 size={16} className="animate-spin" />}
              {contract.isPaused ? "Unpause Contract" : "Pause Contract"}
            </button>
            <button
              onClick={handleWithdrawTokens}
              disabled={isWithdrawing}
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-md text-white bg-[#143621] hover:bg-[#1a472a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWithdrawing && <Loader2 size={16} className="animate-spin" />}
              Withdraw Stuck Tokens
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#0d2416] rounded-lg p-6">
        <h3 className="text-white text-lg font-bold mb-4">Add Rewards</h3>
        <form onSubmit={handleAddRewards} className="space-y-4">
          <div>
            <label htmlFor="rewardAmount" className="block text-white font-medium mb-2">
              Reward Amount
            </label>
            <input
              id="rewardAmount"
              type="text"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
              className="w-full px-4 py-2 bg-[#143621] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter amount"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isAddingRewards || !rewardAmount}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingRewards && <Loader2 size={16} className="animate-spin" />}
            Add Rewards
          </button>
        </form>
      </div>
    </div>
  )
}
