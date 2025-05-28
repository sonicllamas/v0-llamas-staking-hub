"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

interface HashValidatorProps {
  value: string
  onChange: (value: string) => void
  onValidationChange?: (isValid: boolean) => void
}

export function HashValidator({ value, onChange, onValidationChange }: HashValidatorProps) {
  const [validationState, setValidationState] = useState<{
    isValid: boolean
    message: string
    type: "success" | "error" | "warning" | "info"
  }>({ isValid: false, message: "", type: "info" })

  const validateHash = (hash: string) => {
    if (!hash) {
      const state = { isValid: false, message: "", type: "info" as const }
      setValidationState(state)
      onValidationChange?.(false)
      return state
    }

    // Check prefix
    if (!hash.startsWith("0x")) {
      const state = { isValid: false, message: "Must start with '0x'", type: "error" as const }
      setValidationState(state)
      onValidationChange?.(false)
      return state
    }

    // Check length
    if (hash.length < 66) {
      const remaining = 66 - hash.length
      const state = {
        isValid: false,
        message: `Need ${remaining} more character${remaining !== 1 ? "s" : ""} (${hash.length}/66)`,
        type: "warning" as const,
      }
      setValidationState(state)
      onValidationChange?.(false)
      return state
    }

    if (hash.length > 66) {
      const state = { isValid: false, message: "Too long (max 66 characters)", type: "error" as const }
      setValidationState(state)
      onValidationChange?.(false)
      return state
    }

    // Check hex characters
    const hexPattern = /^0x[0-9a-fA-F]{64}$/
    if (!hexPattern.test(hash)) {
      const state = { isValid: false, message: "Contains invalid characters", type: "error" as const }
      setValidationState(state)
      onValidationChange?.(false)
      return state
    }

    // Valid hash
    const state = { isValid: true, message: "Valid transaction hash", type: "success" as const }
    setValidationState(state)
    onValidationChange?.(true)
    return state
  }

  const formatHashInput = (input: string) => {
    // Remove whitespace
    let formatted = input.trim()

    // Add 0x prefix if missing and input is not empty
    if (formatted && !formatted.startsWith("0x")) {
      formatted = "0x" + formatted
    }

    // Convert to lowercase for consistency
    formatted = formatted.toLowerCase()

    return formatted
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatHashInput(e.target.value)
    onChange(formatted)
    validateHash(formatted)
  }

  const getValidationIcon = () => {
    switch (validationState.type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getValidationBadge = () => {
    if (!validationState.message) return null

    const variants = {
      success: "default",
      error: "destructive",
      warning: "secondary",
      info: "outline",
    } as const

    return (
      <Badge variant={variants[validationState.type]} className="text-xs">
        {validationState.message}
      </Badge>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="tx-hash">Transaction Hash</Label>
      <div className="relative">
        <Input
          id="tx-hash"
          placeholder="0x..."
          value={value}
          onChange={handleChange}
          className={`font-mono text-sm pr-10 ${
            validationState.type === "error"
              ? "border-red-500 focus:border-red-500"
              : validationState.type === "success"
                ? "border-green-500 focus:border-green-500"
                : ""
          }`}
        />
        {validationState.message && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">{getValidationIcon()}</div>
        )}
      </div>

      {validationState.message && <div className="flex items-center gap-2">{getValidationBadge()}</div>}

      <div className="text-xs text-muted-foreground">
        <p>• Transaction hash must be exactly 66 characters</p>
        <p>• Must start with '0x' followed by 64 hexadecimal characters</p>
        <p>• Example: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef</p>
      </div>
    </div>
  )
}
