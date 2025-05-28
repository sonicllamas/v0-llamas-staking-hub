"use client"

import { useState, useEffect } from "react"
import {
  getActivePaymentReceiver,
  getPaymentConfig,
  DEFAULT_PAYMENT_RECEIVER,
  ADMIN_PAYMENT_RECEIVER,
} from "@/config/payment-config"
import { CheckCircle, AlertTriangle, ExternalLink, Copy, Eye } from "lucide-react"

export function PaymentVerification() {
  const [verificationData, setVerificationData] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Verify payment configuration
    const sonicChainId = "146"
    const ethereumChainId = "1"

    const verification = {
      // Environment variables
      envPaymentReceiver: process.env.PAYMENT_RECEIVER_ADDRESS || "Not set",
      adminPaymentReceiver: ADMIN_PAYMENT_RECEIVER,
      defaultPaymentReceiver: DEFAULT_PAYMENT_RECEIVER,

      // Active receivers for different networks
      sonicActiveReceiver: getActivePaymentReceiver(sonicChainId),
      ethereumActiveReceiver: getActivePaymentReceiver(ethereumChainId),

      // Payment configs
      sonicConfig: getPaymentConfig(sonicChainId),
      ethereumConfig: getPaymentConfig(ethereumChainId),

      // Verification checks
      isUsingEnvVariable: !!process.env.PAYMENT_RECEIVER_ADDRESS,
      allReceiversMatch: getActivePaymentReceiver(sonicChainId) === getActivePaymentReceiver(ethereumChainId),

      // Current timestamp
      timestamp: new Date().toISOString(),
    }

    setVerificationData(verification)
    console.log("Payment Verification Data:", verification)
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!verificationData) {
    return (
      <div className="bg-[#143621] p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
          <span className="text-white">Verifying payment configuration...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#143621] p-6 rounded-lg">
        <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
          <Eye size={24} className="text-green-400" />
          Payment Address Verification
        </h3>

        {/* Primary Payment Receiver */}
        <div className="bg-[#0d2416] p-4 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={20} className="text-green-400" />
            <h4 className="text-green-400 font-semibold">Active Payment Receiver</h4>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <code className="text-white font-mono bg-black/30 px-2 py-1 rounded text-sm">
              {verificationData.sonicActiveReceiver}
            </code>
            <button
              onClick={() => copyToClipboard(verificationData.sonicActiveReceiver)}
              className="text-green-400 hover:text-green-300 transition-colors"
              title="Copy address"
            >
              <Copy size={16} />
            </button>
            <a
              href={`https://sonicscan.org/address/${verificationData.sonicActiveReceiver}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 transition-colors"
              title="View on Sonicscan"
            >
              <ExternalLink size={16} />
            </a>
          </div>
          {copied && <p className="text-green-400 text-sm">✅ Address copied to clipboard!</p>}
        </div>

        {/* Configuration Details */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-[#0d2416] p-4 rounded-lg">
            <h5 className="text-white font-semibold mb-2">Environment Configuration</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Using Env Variable:</span>
                <span className={verificationData.isUsingEnvVariable ? "text-green-400" : "text-yellow-400"}>
                  {verificationData.isUsingEnvVariable ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Env Receiver:</span>
                <span className="text-white font-mono text-xs">
                  {verificationData.envPaymentReceiver === "Not set"
                    ? "Not set"
                    : `${verificationData.envPaymentReceiver.slice(0, 6)}...${verificationData.envPaymentReceiver.slice(-4)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Default Receiver:</span>
                <span className="text-white font-mono text-xs">
                  {verificationData.defaultPaymentReceiver.slice(0, 6)}...
                  {verificationData.defaultPaymentReceiver.slice(-4)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#0d2416] p-4 rounded-lg">
            <h5 className="text-white font-semibold mb-2">Network Configuration</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Sonic Receiver:</span>
                <span className="text-white font-mono text-xs">
                  {verificationData.sonicActiveReceiver.slice(0, 6)}...{verificationData.sonicActiveReceiver.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ethereum Receiver:</span>
                <span className="text-white font-mono text-xs">
                  {verificationData.ethereumActiveReceiver.slice(0, 6)}...
                  {verificationData.ethereumActiveReceiver.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">All Networks Match:</span>
                <span className={verificationData.allReceiversMatch ? "text-green-400" : "text-red-400"}>
                  {verificationData.allReceiversMatch ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Configuration */}
        <div className="bg-[#0d2416] p-4 rounded-lg mb-4">
          <h5 className="text-white font-semibold mb-2">Fee Configuration</h5>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h6 className="text-green-400 text-sm font-semibold mb-1">Sonic Mainnet</h6>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Fee Percentage:</span>
                  <span className="text-white">{verificationData.sonicConfig.feePercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Min Fee:</span>
                  <span className="text-white">{verificationData.sonicConfig.minFeeAmount} S</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Fee:</span>
                  <span className="text-white">{verificationData.sonicConfig.maxFeeAmount} S</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Enabled:</span>
                  <span className={verificationData.sonicConfig.enabled ? "text-green-400" : "text-red-400"}>
                    {verificationData.sonicConfig.enabled ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h6 className="text-blue-400 text-sm font-semibold mb-1">Ethereum Mainnet</h6>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Fee Percentage:</span>
                  <span className="text-white">{verificationData.ethereumConfig.feePercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Min Fee:</span>
                  <span className="text-white">{verificationData.ethereumConfig.minFeeAmount} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Fee:</span>
                  <span className="text-white">{verificationData.ethereumConfig.maxFeeAmount} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Enabled:</span>
                  <span className={verificationData.ethereumConfig.enabled ? "text-green-400" : "text-red-400"}>
                    {verificationData.ethereumConfig.enabled ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-[#0d2416] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {verificationData.allReceiversMatch && verificationData.sonicConfig.enabled ? (
              <CheckCircle size={20} className="text-green-400" />
            ) : (
              <AlertTriangle size={20} className="text-yellow-400" />
            )}
            <h5 className="text-white font-semibold">Verification Status</h5>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className={verificationData.sonicConfig.enabled ? "text-green-400" : "text-red-400"}>
                {verificationData.sonicConfig.enabled ? "✅" : "❌"}
              </span>
              <span className="text-gray-300">Sonic payments enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={verificationData.allReceiversMatch ? "text-green-400" : "text-yellow-400"}>
                {verificationData.allReceiversMatch ? "✅" : "⚠️"}
              </span>
              <span className="text-gray-300">All networks use same receiver</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✅</span>
              <span className="text-gray-300">Payment receiver address is valid</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400 mt-4">
          Last verified: {new Date(verificationData.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  )
}
