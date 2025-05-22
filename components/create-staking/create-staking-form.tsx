"use client"

import { useState } from "react"
import { StepIndicator } from "./step-indicator"
import { BasicInfoStep } from "./steps/basic-info-step"
import { RewardsConfigStep } from "./steps/rewards-config-step"
import { NFTConfigStep } from "./steps/nft-config-step"
import { AdvancedSettingsStep } from "./steps/advanced-settings-step"
import { ReviewStep } from "./steps/review-step"
import { DeploymentStep } from "./steps/deployment-step"
import { useWallet } from "@/context/wallet-context"
import { WalletRequiredCard } from "./wallet-required-card"
import { NetworkRequiredCard } from "./network-required-card"

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
  const { isConnected, chainId } = useWallet()

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const updateFormData = (data: Partial<StakingFormData>) => {
    setFormData({ ...formData, ...data })
  }

  // Check if user is connected to wallet
  if (!isConnected) {
    return <WalletRequiredCard />
  }

  // Check if user is on Sonic Mainnet
  if (chainId !== 146) {
    return <NetworkRequiredCard />
  }

  return (
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
  )
}
