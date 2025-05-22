"use client"

import { Search, X, Filter, SlidersHorizontal } from "lucide-react"
import { useState, type ReactNode } from "react"

interface Collection {
  address: string
  name: string
}

interface NFTFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  collections?: Collection[]
  selectedCollection: string | null
  setSelectedCollection: (collection: string | null) => void
  selectedRarity: string | null
  setSelectedRarity: (rarity: string | null) => void
  sortOption: string
  setSortOption: (option: string) => void
  selectedCount: number
  clearSelection: () => void
  openStakeModal: () => void
  showCollectionFilter?: boolean
  children?: ReactNode
}

export function NFTFilters({
  searchTerm,
  setSearchTerm,
  collections = [],
  selectedCollection,
  setSelectedCollection,
  selectedRarity,
  setSelectedRarity,
  sortOption,
  setSortOption,
  selectedCount,
  clearSelection,
  openStakeModal,
  showCollectionFilter = true,
  children,
}: NFTFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const rarityOptions = [
    { value: null, label: "All Rarities" },
    { value: "common", label: "Common (1-20)" },
    { value: "uncommon", label: "Uncommon (21-40)" },
    { value: "rare", label: "Rare (41-60)" },
    { value: "epic", label: "Epic (61-80)" },
    { value: "legendary", label: "Legendary (81-100)" },
  ]

  const sortOptions = [
    { value: "rarity-desc", label: "Rarity (High to Low)" },
    { value: "rarity-asc", label: "Rarity (Low to High)" },
    { value: "id-asc", label: "Token ID (Low to High)" },
    { value: "id-desc", label: "Token ID (High to Low)" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "price-asc", label: "Price (Low to High)" },
    { value: "price-desc", label: "Price (High to Low)" },
  ]

  return (
    <div className="bg-[#0d2416] rounded-xl p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, ID, or traits..."
            className="w-full pl-10 pr-4 py-2 bg-[#143621] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {showCollectionFilter && collections && collections.length > 0 && (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={selectedCollection || ""}
              onChange={(e) => setSelectedCollection(e.target.value || null)}
              className="pl-10 pr-8 py-2 bg-[#143621] border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Collections</option>
              {collections.map((collection) => (
                <option key={collection.address} value={collection.address}>
                  {collection.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-[#143621] border border-gray-700 rounded-lg text-white hover:bg-[#1a472a] transition-colors"
        >
          <SlidersHorizontal size={18} />
          <span>Advanced</span>
        </button>

        {/* Additional filter buttons passed as children */}
        {children}
      </div>

      {showAdvancedFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-gray-400 text-sm mb-1">Rarity</label>
            <select
              value={selectedRarity || ""}
              onChange={(e) => setSelectedRarity(e.target.value || null)}
              className="w-full px-3 py-2 bg-[#143621] border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {rarityOptions.map((option) => (
                <option key={option.value || "all"} value={option.value || ""}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-[calc(50%+0.5rem)] transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <label className="block text-gray-400 text-sm mb-1">Sort By</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full px-3 py-2 bg-[#143621] border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-[calc(50%+0.5rem)] transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {selectedCount > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between bg-[#143621] p-3 rounded-lg">
          <div className="text-white mb-2 sm:mb-0">
            <span className="font-bold">{selectedCount}</span> NFT{selectedCount !== 1 && "s"} selected
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearSelection}
              className="px-3 py-1 border border-gray-600 rounded-md text-gray-300 hover:bg-[#0d2416] transition-colors"
            >
              Clear
            </button>
            <button
              onClick={openStakeModal}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md text-white transition-colors"
            >
              Stake Selected
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
