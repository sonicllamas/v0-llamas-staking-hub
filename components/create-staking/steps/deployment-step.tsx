"use client"

import { useState } from "react"
import type { StakingFormData } from "../create-staking-form"
import { CheckCircle, XCircle, Loader2, ExternalLink, DollarSign, Coins } from "lucide-react"
import Link from "next/link"
import { deployContract } from "@/lib/contract-service"
import { getActivePaymentReceiver } from "@/config/payment-config"

interface DeploymentStepProps {
  formData: StakingFormData
  prevStep: () => void
}

type DeploymentStatus = "pending" | "payment_required" | "processing_payment" | "deploying" | "success" | "error"

const DEPLOYMENT_FEE = "300" // 300 S tokens
const SONIC_CHAIN_ID = "146"

export function DeploymentStep({ formData, prevStep }: DeploymentStepProps) {
  const [status, setStatus] = useState<DeploymentStatus>("pending")
  const [contractAddress, setContractAddress] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [deploymentProgress, setDeploymentProgress] = useState(0)
  const [paymentTxHash, setPaymentTxHash] = useState<string | null>(null)

  // Get payment receiver address
  const paymentReceiver = getActivePaymentReceiver(SONIC_CHAIN_ID)

  // Check user's S token balance
  const checkSTokenBalance = async (): Promise<{ balance: string; hasEnough: boolean }> => {
    try {
      if (!window.ethereum) {
        throw new Error("No wallet connected")
      }

      const provider = new (window as any).ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()

      // Get native SONIC balance (S tokens)
      const balance = await provider.getBalance(userAddress)
      const balanceInS = (window as any).ethers.formatEther(balance)
      const hasEnough = Number.parseFloat(balanceInS) >= Number.parseFloat(DEPLOYMENT_FEE)

      console.log(`User S token balance: ${balanceInS} S, Required: ${DEPLOYMENT_FEE} S, Has enough: ${hasEnough}`)

      return {
        balance: balanceInS,
        hasEnough,
      }
    } catch (error) {
      console.error("Failed to check S token balance:", error)
      throw error
    }
  }

  // Process payment for deployment
  const processPayment = async (): Promise<string> => {
    try {
      if (!window.ethereum) {
        throw new Error("No wallet connected")
      }

      const provider = new (window as any).ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()

      // Convert 300 S to wei
      const paymentAmountWei = (window as any).ethers.parseEther(DEPLOYMENT_FEE)

      console.log("=== PAYMENT VERIFICATION ===")
      console.log(`User Address: ${userAddress}`)
      console.log(`Payment Amount: ${DEPLOYMENT_FEE} S`)
      console.log(`Payment Receiver: ${paymentReceiver}`)
      console.log(`Amount in Wei: ${paymentAmountWei.toString()}`)
      console.log(`Chain ID: ${SONIC_CHAIN_ID}`)
      console.log("============================")

      // Send payment transaction
      const transaction = {
        to: paymentReceiver,
        value: paymentAmountWei,
        gasLimit: "21000", // Standard gas limit for ETH transfer
      }

      console.log("Transaction object:", transaction)

      const txResponse = await signer.sendTransaction(transaction)
      console.log("Payment transaction sent:", txResponse.hash)
      console.log("Transaction details:", {
        hash: txResponse.hash,
        to: txResponse.to,
        value: txResponse.value?.toString(),
        from: txResponse.from,
      })

      // Wait for confirmation
      const receipt = await txResponse.wait()
      console.log("Payment confirmed:", receipt)
      console.log("Receipt details:", {
        status: receipt?.status,
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
      })

      if (!receipt || receipt.status !== 1) {
        throw new Error("Payment transaction failed")
      }

      return txResponse.hash
    } catch (error: any) {
      console.error("Payment failed:", error)
      if (error.code === 4001) {
        throw new Error("Payment cancelled by user")
      }
      throw new Error(`Payment failed: ${error.message}`)
    }
  }

  // Handle deployment with payment
  const handleDeploy = async () => {
    setStatus("payment_required")
    setErrorMessage(null)

    try {
      // Check if user has enough S tokens
      const { balance, hasEnough } = await checkSTokenBalance()

      if (!hasEnough) {
        setErrorMessage(
          `Insufficient S token balance. You have ${Number.parseFloat(balance).toFixed(4)} S, but need ${DEPLOYMENT_FEE} S to deploy a staking contract.`,
        )
        setStatus("error")
        return
      }

      // Process payment
      setStatus("processing_payment")
      const txHash = await processPayment()
      setPaymentTxHash(txHash)

      // Start deployment
      setStatus("deploying")
      setDeploymentProgress(0)

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
          <div className="bg-[#143621] p-6 rounded-lg">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-[#0d2416] rounded-full flex items-center justify-center">
                  <Coins size={32} className="text-green-400" />
                </div>
              </div>
              <h3 className="text-white text-xl font-bold mb-4">Deployment Fee Required</h3>
              <p className="text-green-100 mb-4">
                To deploy your staking contract on Sonic Mainnet, a deployment fee of{" "}
                <span className="font-bold text-green-400">{DEPLOYMENT_FEE} S tokens</span> is required.
              </p>
            </div>

            {/* Fee breakdown */}
            <div className="bg-[#0d2416] p-4 rounded-lg mb-6">
              <h4 className="text-white font-semibold mb-3">Fee Breakdown:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Deployment Fee:</span>
                  <span className="text-white">{DEPLOYMENT_FEE} S</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Receiver:</span>
                  <span className="text-white font-mono text-xs">
                    {paymentReceiver.slice(0, 6)}...{paymentReceiver.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-600 pt-2">
                  <span className="text-green-400 font-semibold">Total Required:</span>
                  <span className="text-green-400 font-semibold">{DEPLOYMENT_FEE} S</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleDeploy}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-full font-bold transition-colors"
              >
                <DollarSign size={16} className="inline mr-2" />
                Pay {DEPLOYMENT_FEE} S & Deploy Contract
              </button>
            </div>
          </div>
        )}

        {status === "payment_required" && (
          <div className="bg-[#143621] p-6 rounded-lg text-center">
            <div className="flex justify-center mb-4">
              <Loader2 size={48} className="text-yellow-400 animate-spin" />
            </div>
            <h3 className="text-white text-xl font-bold mb-4">Checking Balance</h3>
            <p className="text-yellow-100">Verifying your S token balance...</p>
          </div>
        )}

        {status === "processing_payment" && (
          <div className="bg-[#143621] p-6 rounded-lg text-center">
            <div className="flex justify-center mb-4">
              <Loader2 size={48} className="text-blue-400 animate-spin" />
            </div>
            <h3 className="text-white text-xl font-bold mb-4">Processing Payment</h3>
            <p className="text-blue-100 mb-4">
              Please confirm the payment of {DEPLOYMENT_FEE} S tokens in your wallet.
            </p>
            <div className="bg-[#0d2416] p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Payment Amount:</p>
              <p className="text-white font-bold">{DEPLOYMENT_FEE} S</p>
              <p className="text-gray-400 text-sm mb-1 mt-2">Payment Receiver:</p>
              <p className="text-white font-mono text-sm">
                {paymentReceiver.slice(0, 6)}...{paymentReceiver.slice(-4)}
              </p>
            </div>
          </div>
        )}

        {status === "deploying" && (
          <div className="bg-[#143621] p-6 rounded-lg text-center">
            <div className="flex justify-center mb-4">
              <Loader2 size={48} className="text-green-400 animate-spin" />
            </div>
            <h3 className="text-white text-xl font-bold mb-4">Deploying Contract</h3>
            <p className="text-green-100 mb-6">Payment successful! Your contract is being deployed to Sonic Mainnet.</p>
            {paymentTxHash && (
              <div className="bg-[#0d2416] p-4 rounded-lg mb-4">
                <p className="text-gray-400 text-sm mb-1">Payment Transaction:</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-green-400 font-mono text-sm">
                    {paymentTxHash.slice(0, 10)}...{paymentTxHash.slice(-8)}
                  </p>
                  <a
                    href={`https://sonicscan.org/tx/${paymentTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )}
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

            {/* Payment confirmation */}
            {paymentTxHash && (
              <div className="bg-[#0d2416] p-4 rounded-lg mb-4">
                <p className="text-gray-400 text-sm mb-1">Payment Transaction:</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className="text-green-400 font-mono text-sm">
                    {paymentTxHash.slice(0, 10)}...{paymentTxHash.slice(-8)}
                  </p>
                  <a
                    href={`https://sonicscan.org/tx/${paymentTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
                <p className="text-green-400 text-sm">✅ {DEPLOYMENT_FEE} S payment confirmed</p>
              </div>
            )}

            {/* Contract address */}
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

            {/* Show payment transaction if it exists */}
            {paymentTxHash && (
              <div className="bg-[#0d2416] p-4 rounded-lg mb-4">
                <p className="text-gray-400 text-sm mb-1">Payment Transaction:</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className="text-green-400 font-mono text-sm">
                    {paymentTxHash.slice(0, 10)}...{paymentTxHash.slice(-8)}
                  </p>
                  <a
                    href={`https://sonicscan.org/tx/${paymentTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
                <p className="text-green-400 text-sm">✅ Payment was successful</p>
              </div>
            )}

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
