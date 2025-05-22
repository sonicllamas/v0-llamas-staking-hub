"use client"

import { useState, useEffect } from "react"
import type { NFTItem } from "@/types/nft"

interface NFTRarityCalculatorProps {
  nft: NFTItem
  collectionTraits?: Record<string, Record<string, number>>
}

export function NFTRarityCalculator({ nft, collectionTraits }: NFTRarityCalculatorProps) {
  const [rarityScore, setRarityScore] = useState<number | null>(null)
  const [traitScores, setTraitScores] = useState<Record<string, number>>({})

  useEffect(() => {
    // If we already have a rarity score from the API, use it
    if (nft.rarity) {
      setRarityScore(nft.rarity)
      return
    }

    // If we have collection traits data, calculate rarity
    if (collectionTraits && nft.attributes) {
      calculateRarity()
    }
  }, [nft, collectionTraits])

  const calculateRarity = () => {
    if (!nft.attributes || !collectionTraits) return

    let totalScore = 0
    const scores: Record<string, number> = {}

    nft.attributes.forEach((attr) => {
      if (attr.trait_type && attr.value) {
        // If we have rarity_percentage from the API, use it
        if (attr.rarity_percentage) {
          const score = 1 / (attr.rarity_percentage / 100)
          scores[attr.trait_type] = score
          totalScore += score
          return
        }

        // Otherwise calculate based on collection traits
        if (collectionTraits[attr.trait_type] && collectionTraits[attr.trait_type][attr.value.toString()]) {
          const traitCount = collectionTraits[attr.trait_type][attr.value.toString()]
          const totalNFTs = Object.values(collectionTraits[attr.trait_type]).reduce((sum, count) => sum + count, 0)
          const rarityPercentage = (traitCount / totalNFTs) * 100
          const score = 1 / (rarityPercentage / 100)
          scores[attr.trait_type] = score
          totalScore += score
        }
      }
    })

    // Normalize to 0-100 scale (assuming max score is around 50)
    const normalizedScore = Math.min(100, Math.round((totalScore / 50) * 100))
    setRarityScore(normalizedScore)
    setTraitScores(scores)
  }

  // Get rarity tier based on rarity score
  const getRarityTier = (score: number) => {
    if (score <= 20) return { label: "Common", color: "bg-gray-500" }
    if (score <= 40) return { label: "Uncommon", color: "bg-green-500" }
    if (score <= 60) return { label: "Rare", color: "bg-blue-500" }
    if (score <= 80) return { label: "Epic", color: "bg-purple-500" }
    return { label: "Legendary", color: "bg-yellow-500" }
  }

  if (!nft.attributes || nft.attributes.length === 0) {
    return <p className="text-gray-400">No attributes available for rarity calculation.</p>
  }

  if (rarityScore === null) {
    return <p className="text-gray-400">Calculating rarity score...</p>
  }

  const rarityTier = getRarityTier(rarityScore)

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-white font-medium mb-2">Rarity Score</h4>
        <div className="flex items-center gap-3">
          <div className="w-full bg-[#143621] rounded-full h-3">
            <div
              className={`h-3 rounded-full ${rarityTier.color}`}
              style={{ width: `${Math.min(100, rarityScore)}%` }}
            ></div>
          </div>
          <span className="text-white font-bold">{rarityScore}/100</span>
        </div>
        <div className="mt-1 flex justify-center">
          <span className={`${rarityTier.color} px-3 py-1 rounded-full text-sm text-white`}>{rarityTier.label}</span>
        </div>
      </div>

      {Object.keys(traitScores).length > 0 && (
        <div>
          <h4 className="text-white font-medium mb-2">Trait Rarity</h4>
          <div className="space-y-2">
            {Object.entries(traitScores)
              .sort(([, a], [, b]) => b - a)
              .map(([trait, score]) => {
                const traitValue = nft.attributes?.find((attr) => attr.trait_type === trait)?.value.toString() || ""
                return (
                  <div key={trait} className="bg-[#143621] p-3 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">{trait}</span>
                      <span className="text-white text-sm font-medium">{traitValue}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="w-full bg-[#0d2416] rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (score / 10) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-green-400 text-xs">{score.toFixed(1)}</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
