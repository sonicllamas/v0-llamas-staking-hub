import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface GridItemProps {
  title: string
  value: string
  change?: string
  changeDirection?: "up" | "down" | "neutral"
  className?: string
  actionButton?: ReactNode
}

export function GridItem({ title, value, change, changeDirection = "up", className, actionButton }: GridItemProps) {
  return (
    <div
      className={cn(
        "bg-[#0d2416] border border-[#1a3726] rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:border-[#00ffaa]/30",
        className,
      )}
    >
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <div className="flex justify-between items-end mb-3">
        <p className="text-white text-xl font-bold">{value}</p>
        {change && (
          <div
            className={cn(
              "flex items-center text-sm font-medium",
              changeDirection === "up"
                ? "text-green-400"
                : changeDirection === "down"
                  ? "text-red-400"
                  : "text-gray-400",
            )}
          >
            {changeDirection === "up" && <ArrowUp className="w-3 h-3 mr-1" />}
            {changeDirection === "down" && <ArrowDown className="w-3 h-3 mr-1" />}
            {changeDirection === "neutral" && <Minus className="w-3 h-3 mr-1" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      {actionButton && <div className="mt-3 pt-3 border-t border-[#1a3726]">{actionButton}</div>}
    </div>
  )
}
