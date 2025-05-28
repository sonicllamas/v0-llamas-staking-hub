"use client"

import type React from "react"

import { forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FormFieldProps {
  id: string
  label: string
  error?: string
  required?: boolean
  description?: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  "aria-describedby"?: string
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    { id, label, error, required, description, type = "text", placeholder, value, onChange, disabled, ...props },
    ref,
  ) => {
    const describedBy =
      [description ? `${id}-description` : "", error ? `${id}-error` : "", props["aria-describedby"] || ""]
        .filter(Boolean)
        .join(" ") || undefined

    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </Label>

        {description && (
          <p id={`${id}-description`} className="text-sm text-gray-600">
            {description}
          </p>
        )}

        <Input
          ref={ref}
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={error ? "true" : "false"}
          className={error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
        />

        {error && (
          <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)

FormField.displayName = "FormField"
