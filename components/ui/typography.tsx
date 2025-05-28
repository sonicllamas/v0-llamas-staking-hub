import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface TypographyProps {
  children: ReactNode
  className?: string
}

export function H1({ children, className }: TypographyProps) {
  return (
    <h1 className={cn("scroll-m-20 text-4xl font-extrabold tracking-tight font-heading lg:text-5xl", className)}>
      {children}
    </h1>
  )
}

export function H2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn("scroll-m-20 text-3xl font-semibold tracking-tight font-heading first:mt-0", className)}>
      {children}
    </h2>
  )
}

export function H3({ children, className }: TypographyProps) {
  return <h3 className={cn("scroll-m-20 text-2xl font-semibold tracking-tight font-heading", className)}>{children}</h3>
}

export function H4({ children, className }: TypographyProps) {
  return <h4 className={cn("scroll-m-20 text-xl font-semibold tracking-tight font-heading", className)}>{children}</h4>
}

export function P({ children, className }: TypographyProps) {
  return <p className={cn("leading-7 [&:not(:first-child)]:mt-6 font-body", className)}>{children}</p>
}

export function Blockquote({ children, className }: TypographyProps) {
  return (
    <blockquote className={cn("mt-6 border-l-2 border-slate-300 pl-6 italic font-serif", className)}>
      {children}
    </blockquote>
  )
}

export function Code({ children, className }: TypographyProps) {
  return (
    <code className={cn("relative rounded bg-slate-800 px-[0.3rem] py-[0.2rem] font-mono text-sm", className)}>
      {children}
    </code>
  )
}

export function Lead({ children, className }: TypographyProps) {
  return <p className={cn("text-xl text-slate-300 font-body", className)}>{children}</p>
}

export function Large({ children, className }: TypographyProps) {
  return <div className={cn("text-lg font-semibold font-body", className)}>{children}</div>
}

export function Small({ children, className }: TypographyProps) {
  return <small className={cn("text-sm font-medium leading-none font-body", className)}>{children}</small>
}

export function Subtle({ children, className }: TypographyProps) {
  return <p className={cn("text-sm text-slate-400 font-body", className)}>{children}</p>
}

export function PixelText({ children, className }: TypographyProps) {
  return <span className={cn("font-pixel tracking-wide", className)}>{children}</span>
}

export function MonoText({ children, className }: TypographyProps) {
  return <span className={cn("font-mono", className)}>{children}</span>
}

export function AnimeText({ children, className }: TypographyProps) {
  return <span className={cn("font-anime", className)}>{children}</span>
}
