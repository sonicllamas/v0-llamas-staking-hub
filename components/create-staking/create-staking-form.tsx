"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { StepIndicator } from "./step-indicator"
import { BasicInfoStep } from "./steps/basic-info-step"
import { RewardsConfigStep } from "./steps/rewards-config-step"
import { NFTConfigStep } from "./steps/nft-config-step"
import { AdvancedSettingsStep } from "./steps/advanced-settings-step"
import { ReviewStep } from "./steps/review-step"
import { DeploymentStep } from "./steps/deployment-step"
import { useWallet } from "@/context/wallet-context"
import { Button } from "@/components/ui/button"
import { RefreshCw, Wallet, Network } from "lucide-react"

export type StakingFormData = {
  // Basic Info
  contractName: string
  contractSymbol: string
  description: string

  // Rewards Config
  rewardTokenAddress: string
  rewardRate: string
  rewardInterval: string

  // NFT Config
  nftCollectionAddress: string
  stakingType: "flexible" | "locked"
  lockPeriod: string
  earlyWithdrawalFee: string

  // Advanced Settings
  maxStakePerWallet: string
  minStakeAmount: string
  emergencyWithdraw: boolean
  pausable: boolean
  upgradeable: boolean
}

const initialFormData: StakingFormData = {
  contractName: "",
  contractSymbol: "",
  description: "",
  rewardTokenAddress: "",
  rewardRate: "10",
  rewardInterval: "86400", // 1 day in seconds
  nftCollectionAddress: "",
  stakingType: "flexible",
  lockPeriod: "0",
  earlyWithdrawalFee: "0",
  maxStakePerWallet: "0", // 0 means unlimited
  minStakeAmount: "1",
  emergencyWithdraw: true,
  pausable: true,
  upgradeable: false,
}

const steps = ["Basic Info", "Rewards", "NFT Config", "Advanced", "Review", "Deploy"]

export function CreateStakingForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<StakingFormData>(initialFormData)
  const { isConnected: contextConnected, chainId: contextChainId } = useWallet()

  // Direct wallet detection state
  const [directWalletInfo, setDirectWalletInfo] = useState<{
    address: string | null
    chainId: number | null
    isConnected: boolean
  }>({
    address: null,
    chainId: null,
    isConnected: false,
  })
  const [isChecking, setIsChecking] = useState(true)
  const [hasInitialCheck, setHasInitialCheck] = useState(false)

  // Refs to prevent unnecessary re-renders
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastCheckRef = useRef<string>("")

  // Direct wallet check function
  const checkWalletDirect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      return { address: null, chainId: null, isConnected: false }
    }

    try {
      const [accounts, chainIdHex] = await Promise.all([
        window.ethereum.request({ method: "eth_accounts" }) as Promise<string[]>,
        window.ethereum.request({ method: "eth_chainId" }) as Promise<string>,
      ])

      const address = accounts && accounts.length > 0 ? accounts[0] : null
      const chainId = chainIdHex ? Number.parseInt(chainIdHex, 16) : null
      const isConnected = !!address

      // Create a hash of the current state to prevent unnecessary updates
      const currentState = `${address}-${chainId}-${isConnected}`

      // Only update if state actually changed
      if (lastCheckRef.current !== currentState) {
        lastCheckRef.current = currentState
        console.log("📱 [Create Staking] Wallet state changed:", { address, chainId, isConnected })
        return { address, chainId, isConnected }
      }

      return null // No change
    } catch (error) {
      console.error("❌ [Create Staking] Direct wallet check failed:", error)
      return { address: null, chainId: null, isConnected: false }
    }
  }, [])

  // Check wallet on mount and set up periodic checking
  useEffect(() => {
    const performWalletCheck = async () => {
      if (!hasInitialCheck) {
        setIsChecking(true)
      }

      const result = await checkWalletDirect()

      // Only update state if there was an actual change
      if (result !== null) {
        setDirectWalletInfo(result)
      }

      if (!hasInitialCheck) {
        setIsChecking(false)
        setHasInitialCheck(true)
      }
    }

    // Initial check
    performWalletCheck()

    // Set up periodic checking (less frequent to reduce blinking)
    intervalRef.current = setInterval(performWalletCheck, 5000) // Check every 5 seconds instead of 2

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [checkWalletDirect, hasInitialCheck])

  // Direct connect function
  const connectWalletDirect = async () => {
    console.log("🔗 [Create Staking] Connecting wallet directly...")

    if (typeof window === "undefined" || !window.ethereum) {
      alert("No Ethereum wallet found. Please install MetaMask.")
      return
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" })
      const result = await checkWalletDirect()
      if (result) {
        setDirectWalletInfo(result)
      }
    } catch (error) {
      console.error("❌ [Create Staking] Failed to connect wallet:", error)
      alert("Failed to connect wallet. Please try again.")
    }
  }

  // Direct network switch function
  const switchToSonicDirect = async () => {
    console.log("🔄 [Create Staking] Switching to Sonic network directly...")

    if (typeof window === "undefined" || !window.ethereum) {
      alert("No Ethereum wallet found.")
      return
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x92" }], // 146 in hex
      })
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x92",
                chainName: "Sonic Mainnet",
                nativeCurrency: {
                  name: "Sonic",
                  symbol: "S",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.soniclabs.com"],
                blockExplorerUrls: ["https://sonicscan.org"],
              },
            ],
          })
        } catch (addError) {
          console.error("❌ [Create Staking] Failed to add Sonic network:", addError)
          alert("Failed to add Sonic network. Please add it manually.")
        }
      } else {
        console.error("❌ [Create Staking] Failed to switch network:", switchError)
        alert("Failed to switch to Sonic network. Please switch manually.")
      }
    }

    // Refresh wallet info after network change
    setTimeout(async () => {
      const result = await checkWalletDirect()
      if (result) {
        setDirectWalletInfo(result)
      }
    }, 1000)
  }

  // Determine final wallet state (use direct detection or fallback to context)
  const finalAddress = directWalletInfo.address || null
  const finalChainId = directWalletInfo.chainId || contextChainId || null
  const finalIsConnected = directWalletInfo.isConnected || contextConnected || false

  // Optimized step navigation functions - only scroll on actual step changes
  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => {
        const newStep = prev + 1
        // Only scroll to top when actually changing steps
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100)
        return newStep
      })
    }
  }, [currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => {
        const newStep = prev - 1
        // Only scroll to top when actually changing steps
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100)
        return newStep
      })
    }
  }, [currentStep])

  const updateFormData = useCallback((data: Partial<StakingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }, [])

  // Show loading state while checking (only on initial load)
  if (isChecking && !hasInitialCheck) {
    return (
      <div className="bg-[#0d2416] rounded-xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <RefreshCw className="animate-spin text-green-400" size={32} />
        </div>
        <h2 className="text-white text-2xl font-bold mb-4">Checking Wallet Connection...</h2>
        <p className="text-green-100">Please wait while we detect your wallet...</p>
      </div>
    )
  }

  // Show wallet connection success
  if (finalIsConnected && finalAddress) {
    // Check if user is on Sonic Mainnet
    if (finalChainId !== 146) {
      return (
        <div className="space-y-4">
          <div className="bg-yellow-900/20 border border-yellow-600 rounded-xl p-6 text-center">
            <div className="flex justify-center mb-4">
              <Network size={32} className="text-yellow-400" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-4">Switch to Sonic Mainnet</h2>
            <p className="text-yellow-100 mb-4">
              You're connected to chain ID {finalChainId}. Please switch to Sonic Mainnet (Chain ID 146) to create
              staking contracts.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={switchToSonicDirect} className="bg-yellow-600 hover:bg-yellow-700">
                Switch to Sonic Mainnet
              </Button>
              <Button
                onClick={async () => {
                  const result = await checkWalletDirect()
                  if (result) {
                    setDirectWalletInfo(result)
                  }
                }}
                variant="outline"
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // Show success and render the form
    return (
      <div className="space-y-4">
        {/* Success banner */}
        <div className="bg-green-900/20 border border-green-600 rounded-xl p-4 text-center">
          <div className="text-green-400 font-medium">
            ✅ Wallet Connected: {finalAddress.slice(0, 6)}...{finalAddress.slice(-4)} on Sonic Mainnet
          </div>
        </div>

        {/* Staking form */}
        <div className="bg-[#0d2416] rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <StepIndicator steps={steps} currentStep={currentStep} />

            <div className="mt-8">
              {currentStep === 0 && (
                <BasicInfoStep formData={formData} updateFormData={updateFormData} nextStep={nextStep} />
              )}

              {currentStep === 1 && (
                <RewardsConfigStep
                  formData={formData}
                  updateFormData={updateFormData}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 2 && (
                <NFTConfigStep
                  formData={formData}
                  updateFormData={updateFormData}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 3 && (
                <AdvancedSettingsStep
                  formData={formData}
                  updateFormData={updateFormData}
                  nextStep={nextStep}
                  prevStep={prevStep}
                />
              )}

              {currentStep === 4 && <ReviewStep formData={formData} nextStep={nextStep} prevStep={prevStep} />}

              {currentStep === 5 && <DeploymentStep formData={formData} prevStep={prevStep} />}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show wallet connection required
  return (
    <div className="space-y-4">
      <div className="bg-[#0d2416] rounded-xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[#143621] rounded-full flex items-center justify-center">
            <Wallet size={32} className="text-green-400" />
          </div>
        </div>
        <h2 className="text-white text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-green-100 mb-6">You need to connect your wallet to create a staking contract.</p>

        <div className="flex gap-4 justify-center">
          <Button onClick={connectWalletDirect} className="bg-green-600 hover:bg-green-700">
            <Wallet size={16} className="mr-2" />
            Connect Wallet
          </Button>
          <Button
            onClick={async () => {
              const result = await checkWalletDirect()
              if (result) {
                setDirectWalletInfo(result)
              }
            }}
            variant="outline"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh Connection
          </Button>
        </div>
      </div>
    </div>
  )
}
