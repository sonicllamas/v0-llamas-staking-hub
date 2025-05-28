"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react"

interface HashInputValidatorProps {
  value: string
  onChange: (value: string) => void
  onValidChange?: (isValid: boolean) => void
  placeholder?: string
  label?: string
}

export function HashInputValidator({
  value,
  onChange,
  onValidChange,
  placeholder = "0x...",
  label = "Transaction Hash",
}: HashInputValidatorProps) {
  const [validation, setValidation] = useState<{
    isValid: boolean
    message: string
    type: "success" | "error" | "warning" | "info"
    icon: React.ReactNode
  }>({
    isValid: false,
    message: "",
    type: "info",
    icon: <Info className="h-4 w-4" />,
  })

  useEffect(() => {
    validateHash(value)
  }, [value])

  const validateHash = (hash: string) => {
    if (!hash || hash.length === 0) {
      const result = {
        isValid: false,
        message: "Enter a transaction hash to validate",
        type: "info" as const,
        icon: <Info className="h-4 w-4" />,
      }
      setValidation(result)
      onValidChange?.(false)
      return
    }

    // Check prefix
    if (!hash.startsWith("0x")) {
      const result = {
        isValid: false,
        message: "Transaction hash must start with '0x'",
        type: "error" as const,
        icon: <XCircle className="h-4 w-4 text-red-500" />,
      }
      setValidation(result)
      onValidChange?.(false)
      return
    }

    // Check length
    if (hash.length < 66) {
      const needed = 66 - hash.length
      const result = {
        isValid: false,
        message: `Need ${needed} more character${needed !== 1 ? "s" : ""} (${hash.length}/66)`,
        type: "warning" as const,
        icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      }
      setValidation(result)
      onValidChange?.(false)
      return
    }

    if (hash.length > 66) {
      const extra = hash.length - 66
      const result = {
        isValid: false,
        message: `Too long by ${extra} character${extra !== 1 ? "s" : ""} (${hash.length}/66)`,
        type: "error" as const,
        icon: <XCircle className="h-4 w-4 text-red-500" />,
      }
      setValidation(result)
      onValidChange?.(false)
      return
    }

    // Check hex characters
    const hexPattern = /^0x[0-9a-fA-F]{64}$/
    if (!hexPattern.test(hash)) {
      const result = {
        isValid: false,
        message: "Contains invalid characters. Only 0-9 and a-f allowed after '0x'",
        type: "error" as const,
        icon: <XCircle className="h-4 w-4 text-red-500" />,
      }
      setValidation(result)
      onValidChange?.(false)
      return
    }

    // Valid hash
    const result = {
      isValid: true,
      message: "Valid transaction hash ✓",
      type: "success" as const,
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    }
    setValidation(result)
    onValidChange?.(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.trim()

    // Auto-add 0x prefix if user starts typing hex without it
    if (newValue.length > 0 && !newValue.startsWith("0x") && /^[0-9a-fA-F]/.test(newValue)) {
      newValue = "0x" + newValue
    }

    // Convert to lowercase for consistency
    newValue = newValue.toLowerCase()

    onChange(newValue)
  }

  const getAlertVariant = () => {
    switch (validation.type) {
      case "error":
        return "destructive"
      case "success":
        return "default"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="hash-input">{label}</Label>
        <div className="relative">
          <Input
            id="hash-input"
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            className={`font-mono text-sm ${
              validation.type === "error"
                ? "border-red-500 focus:border-red-500"
                : validation.type === "success"
                  ? "border-green-500 focus:border-green-500"
                  : validation.type === "warning"
                    ? "border-yellow-500 focus:border-yellow-500"
                    : ""
            }`}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">{validation.icon}</div>
        </div>
      </div>

      {validation.message && (
        <Alert variant={getAlertVariant()}>
          <AlertDescription className="flex items-center gap-2">
            {validation.icon}
            {validation.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Required format:</strong> 0x + 64 hexadecimal characters (total: 66 characters)
        </p>
        <p>
          <strong>Example:</strong> 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
        </p>
        <p>
          <strong>Current length:</strong> {value.length}/66 characters
        </p>
      </div>
    </div>
  )
}
