"use client"

import { useState } from "react"
import type { StakingFormData } from "../create-staking-form"
import { CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { deployContract } from "@/lib/contract-service"

interface DeploymentStepProps {
  formData: StakingFormData
  prevStep: () => void
}

type DeploymentStatus = "pending" | "deploying" | "success" | "error"

export function DeploymentStep({ formData, prevStep }: DeploymentStepProps) {
  const [status, setStatus] = useState<DeploymentStatus>("pending")
  const [contractAddress, setContractAddress] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [deploymentProgress, setDeploymentProgress] = useState(0)

  // Deploy contract when user clicks the button
  const handleDeploy = async () => {
    setStatus("deploying")
    setDeploymentProgress(0)

    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setDeploymentProgress((prev) => {
          const newProgress = prev + 5
          return newProgress >= 90 ? 90 : newProgress
        })
      }, 500)

      // Deploy contract
      const address = await deployContract(formData)

      // Clear interval and set final progress
      clearInterval(progressInterval)
      setDeploymentProgress(100)

      // Set contract address and status
      setContractAddress(address)
      setStatus("success")
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to deploy contract. Please try again.")
      setStatus("error")
    }
  }

  return (
    <div>
      <h2 className="text-white text-2xl font-bold mb-6">Deploy Staking Contract</h2>

      <div className="space-y-8">
        {status === "pending" && (
          <div className="bg-[#143621] p-6 rounded-lg text-center">
            <h3 className="text-white text-xl font-bold mb-4">Ready to Deploy</h3>
            <p className="text-green-100 mb-6">Your staking contract is ready to be deployed to Sonic Mainnet.</p>
            <button
              onClick={handleDeploy}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-full font-bold transition-colors"
            >
              Deploy Now
            </button>
          </div>
        )}

        {status === "deploying" && (
          <div className="bg-[#143621] p-6 rounded-lg text-center">
            <div className="flex justify-center mb-4">
              <Loader2 size={48} className="text-green-400 animate-spin" />
            </div>
            <h3 className="text-white text-xl font-bold mb-4">Deploying Contract</h3>
            <p className="text-green-100 mb-6">Please wait while your contract is being deployed to Sonic Mainnet.</p>
            <div className="w-full bg-[#0d2416] rounded-full h-4 mb-2">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${deploymentProgress}%` }}
              ></div>
            </div>
            <p className="text-green-300 text-sm">{deploymentProgress}% complete</p>
          </div>
        )}

        {status === "success" && (
          <div className="bg-[#143621] p-6 rounded-lg text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle size={48} className="text-green-400" />
            </div>
            <h3 className="text-white text-xl font-bold mb-4">Deployment Successful!</h3>
            <p className="text-green-100 mb-6">
              Your staking contract has been successfully deployed to Sonic Mainnet.
            </p>
            <div className="bg-[#0d2416] p-4 rounded-lg mb-6">
              <p className="text-gray-400 text-sm mb-1">Contract Address:</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-white font-mono">{contractAddress}</p>
                <a
                  href={`https://sonicscan.org/address/${contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href="/my-contracts"
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-full font-bold transition-colors"
              >
                View My Contracts
              </Link>
              <Link
                href="/create-staking"
                className="border border-white text-white py-3 px-6 rounded-full font-bold hover:bg-[#143621] transition-colors"
              >
                Create Another Contract
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="bg-[#143621] p-6 rounded-lg text-center">
            <div className="flex justify-center mb-4">
              <XCircle size={48} className="text-red-500" />
            </div>
            <h3 className="text-white text-xl font-bold mb-4">Deployment Failed</h3>
            <p className="text-red-300 mb-6">{errorMessage || "An error occurred during contract deployment."}</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={handleDeploy}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-full font-bold transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={prevStep}
                className="border border-white text-white py-3 px-6 rounded-full font-bold hover:bg-[#143621] transition-colors"
              >
                Edit Contract
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
