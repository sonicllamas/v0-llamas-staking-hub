"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import type { StakingFormData } from "./create-staking-form"
import { generateContractCode } from "@/lib/contract-generator"

interface ContractPreviewProps {
  formData: StakingFormData
}

export function ContractPreview({ formData }: ContractPreviewProps) {
  const [copied, setCopied] = useState(false)
  const contractCode = generateContractCode(formData)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(contractCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  return (
    <div className="bg-[#0d2416] rounded-lg overflow-hidden">
      <div className="flex justify-between items-center bg-[#143621] px-4 py-2">
        <h3 className="text-white font-medium">Contract Preview</h3>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 text-green-300 hover:text-green-200 transition-colors"
        >
          {copied ? (
            <>
              <Check size={16} />
              <span className="text-sm">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span className="text-sm">Copy Code</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 max-h-[400px] overflow-auto">
        <pre className="text-green-300 text-sm font-mono whitespace-pre-wrap">{contractCode}</pre>
      </div>
    </div>
  )
}
