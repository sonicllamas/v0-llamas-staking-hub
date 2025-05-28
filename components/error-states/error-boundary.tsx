"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { ErrorMessage } from "./error-message"
import { Bug } from "lucide-react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service here
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorMessage
          title="Something Went Wrong"
          message={this.state.error?.message || "An unexpected error occurred in this component."}
          icon={<Bug className="h-12 w-12 text-red-500" />}
          actionLabel="Reset"
          actionFn={this.resetError}
          variant="critical"
        />
      )
    }

    return this.props.children
  }
}
