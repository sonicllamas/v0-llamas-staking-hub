"use client"

import { ScrollAnimation } from "@/components/scroll-animation"

interface Attribute {
  trait_type: string
  value: string | number
  rarity?: number
}

interface NFTAttributesProps {
  attributes: Attribute[]
}

export function NFTAttributes({ attributes }: NFTAttributesProps) {
  if (!attributes || attributes.length === 0) {
    return (
      <ScrollAnimation animation="fadeInUp" delay={0.1}>
        <div className="text-center py-8">
          <p className="text-gray-400">No attributes available for this NFT.</p>
        </div>
      </ScrollAnimation>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {attributes.map((attribute, index) => (
        <ScrollAnimation
          key={`${attribute.trait_type}-${attribute.value}`}
          animation="fadeInUp"
          delay={0.1 + index * 0.05}
        >
          <div className="bg-[#0d2416] p-4 rounded-lg border border-[#143621] hover:border-[#1a4a2a] transition-colors">
            <div className="text-sm text-gray-400 uppercase tracking-wide mb-1">{attribute.trait_type}</div>
            <div className="text-white font-medium text-lg">{attribute.value}</div>
            {attribute.rarity && (
              <div className="text-xs text-green-400 mt-1">{(attribute.rarity * 100).toFixed(1)}% rarity</div>
            )}
          </div>
        </ScrollAnimation>
      ))}
    </div>
  )
}
