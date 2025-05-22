import type { NFTAttribute } from "@/types/nft"

interface NFTAttributesProps {
  attributes: NFTAttribute[]
  showRarity?: boolean
}

export function NFTAttributes({ attributes, showRarity = true }: NFTAttributesProps) {
  if (!attributes || attributes.length === 0) {
    return (
      <div className="p-4 bg-[#0d2416] rounded-lg text-center">
        <p className="text-gray-300">No attributes found for this NFT</p>
      </div>
    )
  }

  // Group attributes by trait type
  const groupedAttributes: Record<string, NFTAttribute[]> = {}
  attributes.forEach((attr) => {
    if (!groupedAttributes[attr.trait_type]) {
      groupedAttributes[attr.trait_type] = []
    }
    groupedAttributes[attr.trait_type].push(attr)
  })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {Object.entries(groupedAttributes).map(([traitType, attrs]) => (
        <div key={traitType} className="bg-[#0d2416] rounded-lg p-3 flex flex-col">
          <h3 className="text-sm font-medium text-gray-300 mb-1">{traitType}</h3>
          {attrs.map((attr, index) => (
            <div key={index} className="flex flex-col">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">{attr.value.toString()}</span>
                {showRarity && attr.frequency !== undefined && (
                  <span className="text-xs text-gray-400">{attr.frequency.toFixed(1)}% have this</span>
                )}
              </div>
              {showRarity && attr.frequency !== undefined && (
                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-green-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(attr.frequency, 100)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
