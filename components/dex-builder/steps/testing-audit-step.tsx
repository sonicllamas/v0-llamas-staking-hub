"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, Shield } from "lucide-react"

interface AuditResult {
  category: string
  status: "passed" | "failed" | "warning"
  details: string
  severity?: "low" | "medium" | "high" | "critical"
}

export const TestingAuditStep: React.FC = () => {
  const [auditResults, setAuditResults] = React.useState<AuditResult[]>([
    {
      category: "Access Control",
      status: "passed",
      details: "All access control mechanisms properly implemented",
    },
    {
      category: "Reentrancy",
      status: "passed",
      details: "No reentrancy vulnerabilities detected",
    },
    {
      category: "Integer Overflow",
      status: "warning",
      details: "Potential edge case in fee calculation function",
      severity: "low",
    },
    {
      category: "Oracle Manipulation",
      status: "passed",
      details: "Price oracle implementation secure",
    },
    {
      category: "Flash Loan Attack",
      status: "passed",
      details: "Resistant to flash loan manipulation",
    },
    {
      category: "Front-Running",
      status: "warning",
      details: "Potential MEV exposure in swap functions",
      severity: "medium",
    },
  ])

  const passedTests = auditResults.filter((r) => r.status === "passed").length
  const totalTests = auditResults.length
  const passRate = Math.round((passedTests / totalTests) * 100)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Testing & Security Audit
        </CardTitle>
        <CardDescription>Comprehensive security testing and audit results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Audit Progress</h3>
              <span className="text-sm font-medium">{passRate}% Complete</span>
            </div>
            <Progress value={passRate} className="h-2" />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Security Audit Results</h3>

            <div className="space-y-3">
              {auditResults.map((result, index) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result.status === "passed" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : result.status === "warning" ? (
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">{result.category}</span>
                    </div>

                    {result.severity && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          result.severity === "critical"
                            ? "bg-red-100 text-red-800"
                            : result.severity === "high"
                              ? "bg-orange-100 text-orange-800"
                              : result.severity === "medium"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{result.details}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Audit Summary</h4>
            <p className="text-sm text-gray-600">
              The security audit identified {auditResults.filter((r) => r.status === "warning").length} potential issues
              of low to medium severity. No critical vulnerabilities were found. It is recommended to address the
              identified issues before proceeding to production deployment.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TestingAuditStep
