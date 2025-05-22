"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface BackButtonProps {
  href?: string
  label?: string
}

export function BackButton({ href, label = "Back" }: BackButtonProps) {
  const router = useRouter()

  if (href) {
    return (
      <Link href={href} className="text-[#0d2416] hover:underline flex items-center gap-1">
        <ArrowLeft size={16} />
        <span>{label}</span>
      </Link>
    )
  }

  return (
    <button onClick={() => router.back()} className="text-[#0d2416] hover:underline flex items-center gap-1">
      <ArrowLeft size={16} />
      <span>{label}</span>
    </button>
  )
}
