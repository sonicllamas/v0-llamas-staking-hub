"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import { fetchUserNFTs, fetchUserCollectionNFTs, fetchUserCollectionNFTsRange } from "@/lib/nft-service"
// Make sure the NFTGrid import is correct
import { NFTGrid } from "./nft-grid"
import { CollectionInfoCard } from "./collection-info-card"
import { NFTFilters } from "./nft-filters"
import { StakeNFTsModal } from "./stake-nfts-modal"
import { Loading } from "@/components/loading"
import { WalletModal } from "@/components/wallet-modal"
import type { NFT } from "@/types/nft"

export function NFTCollectionDisplay() {
  const { account, isConnected } = useWallet()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [filteredNfts, setFilteredNfts] = useState<NFT[]>([])
  const [selectedNfts, setSelectedNfts] = useState<NFT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [activeCollection, setActiveCollection] = useState<string | null>(null)
  const [startTokenId, setStartTokenId] = useState<number>(1)
  const [endTokenId, setEndTokenId] = useState<number>(1000)
  const [isRangeFilterActive, setIsRangeFilterActive] = useState(false)

  // Fetch NFTs when account changes
  useEffect(() => {
    async function loadNFTs() {
      if (!account) {
        setNfts([])
        setFilteredNfts([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const userNfts = await fetchUserNFTs(account)
        setNfts(userNfts)
        setFilteredNfts(userNfts)
      } catch (err) {
        console.error("Error loading NFTs:", err)
        setError("Failed to load your NFTs. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadNFTs()
  }, [account])

  // Load collection NFTs when active collection changes
  useEffect(() => {
    if (!account || !activeCollection) return

    async function loadCollectionNFTs() {
      setIsLoading(true)
      setError(null)

      try {
        const collectionNfts = await fetchUserCollectionNFTs(account, activeCollection)
        setFilteredNfts(collectionNfts)
      } catch (err) {
        console.error("Error loading collection NFTs:", err)
        setError("Failed to load collection NFTs. Please try again later.")
        // Fallback to filtering the already loaded NFTs
        setFilteredNfts(nfts.filter((nft) => nft.address === activeCollection))
      } finally {
        setIsLoading(false)
      }
    }

    loadCollectionNFTs()
  }, [account, activeCollection, nfts])

  // Handle NFT selection
  const toggleNftSelection = (nft: NFT) => {
    if (selectedNfts.some((selected) => selected.id === nft.id)) {
      setSelectedNfts(selectedNfts.filter((selected) => selected.id !== nft.id))
    } else {
      setSelectedNfts([...selectedNfts, nft])
    }
  }

  // Handle filter changes
  const handleFilterChange = (filtered: NFT[]) => {
    setFilteredNfts(filtered)
  }

  // Handle range filter
  const handleRangeFilter = async () => {
    if (!account || !activeCollection) {
      setError("Please select a collection first")
      return
    }

    setIsLoading(true)
    setError(null)
    setIsRangeFilterActive(true)

    try {
      const rangeNfts = await fetchUserCollectionNFTsRange(account, activeCollection, startTokenId, endTokenId)

      if (rangeNfts.length === 0) {
        setError(`No NFTs found in the range ${startTokenId}-${endTokenId}`)
      }

      setFilteredNfts(rangeNfts)
    } catch (err) {
      console.error("Error fetching NFTs by range:", err)
      setError("Failed to fetch NFTs in the specified range")
    } finally {
      setIsLoading(false)
    }
  }

  // Clear range filter
  const clearRangeFilter = async () => {
    if (!account || !activeCollection) return

    setIsLoading(true)
    setIsRangeFilterActive(false)

    try {
      const collectionNfts = await fetchUserCollectionNFTs(account, activeCollection)
      setFilteredNfts(collectionNfts)
    } catch (err) {
      console.error("Error clearing range filter:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Group NFTs by collection
  const collections = nfts.reduce(
    (acc, nft) => {
      const collectionAddress = nft.address
      if (!acc[collectionAddress]) {
        acc[collectionAddress] = {
          address: collectionAddress,
          name: nft.collection.name,
          isVerified: nft.collection.isVerified,
          isWhitelisted: nft.collection.isWhitelisted,
          nfts: [],
        }
      }
      acc[collectionAddress].nfts.push(nft)
      return acc
    },
    {} as Record<string, { address: string; name: string; isVerified: boolean; isWhitelisted: boolean; nfts: NFT[] }>,
  )

  // Get active collection NFTs
  const activeNfts = activeCollection ? filteredNfts : filteredNfts

  if (!isConnected) {
    return (
      <div className="bg-[#0d2416] rounded-xl p-8 text-center">
        <h2 className="text-white text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-green-100 mb-6">Please connect your wallet to view your NFT collection on Sonic Mainnet.</p>
        <button
          onClick={() => setIsWalletModalOpen(true)}
          className="bg-white text-[#1a472a] px-6 py-3 rounded-full font-bold hover:bg-green-100 transition-colors"
        >
          Connect Wallet
        </button>
        <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      </div>
    )
  }

  if (isLoading) {
    return <Loading message="Loading your NFTs..." />
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#0d2416] text-white px-4 py-2 rounded hover:bg-[#143621] transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">You don&apos;t have any NFTs in your wallet.</p>
        <p className="text-sm text-gray-500">
          Visit the{" "}
          <a href="/collections" className="text-[#0d2416] underline">
            Collections
          </a>{" "}
          page to browse available NFTs.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Collection selector */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => {
            setActiveCollection(null)
            setIsRangeFilterActive(false)
          }}
          className={`px-4 py-2 rounded-lg ${
            activeCollection === null ? "bg-[#0d2416] text-white" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          All Collections ({nfts.length})
        </button>

        {Object.values(collections).map((collection) => (
          <button
            key={collection.address}
            onClick={() => {
              setActiveCollection(collection.address)
              setIsRangeFilterActive(false)
            }}
            className={`px-4 py-2 rounded-lg flex items-center ${
              activeCollection === collection.address ? "bg-[#0d2416] text-white" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {collection.name} ({collection.nfts.length})
            {collection.isVerified && (
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Verified</span>
            )}
          </button>
        ))}
      </div>

      {/* Active collection info */}
      {activeCollection && collections[activeCollection] && (
        <CollectionInfoCard
          collection={collections[activeCollection]}
          nftCount={collections[activeCollection].nfts.length}
        />
      )}

      {/* Range filter */}
      {activeCollection && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Filter by Token ID Range</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <label htmlFor="startTokenId" className="block text-sm font-medium text-gray-700 mb-1">
                Start Token ID
              </label>
              <input
                id="startTokenId"
                type="number"
                min="1"
                value={startTokenId}
                onChange={(e) => setStartTokenId(Math.max(1, Number.parseInt(e.target.value) || 1))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="endTokenId" className="block text-sm font-medium text-gray-700 mb-1">
                End Token ID
              </label>
              <input
                id="endTokenId"
                type="number"
                min="1"
                value={endTokenId}
                onChange={(e) => setEndTokenId(Math.max(1, Number.parseInt(e.target.value) || 1000))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex items-end w-full sm:w-auto">
              {isRangeFilterActive ? (
                <button
                  onClick={clearRangeFilter}
                  className="w-full sm:w-auto bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Clear Filter
                </button>
              ) : (
                <button
                  onClick={handleRangeFilter}
                  className="w-full sm:w-auto bg-[#0d2416] text-white px-4 py-2 rounded hover:bg-[#143621] transition-colors"
                >
                  Apply Filter
                </button>
              )}
            </div>
          </div>
          {isRangeFilterActive && (
            <p className="mt-2 text-sm text-gray-600">
              Showing NFTs with token IDs between {startTokenId} and {endTokenId}
            </p>
          )}
        </div>
      )}

      {/* Filters */}
      <NFTFilters
        nfts={activeCollection && collections[activeCollection] ? collections[activeCollection].nfts : nfts}
        onFilterChange={handleFilterChange}
      />

      {/* Selection actions */}
      {selectedNfts.length > 0 && (
        <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
          <p>{selectedNfts.length} NFTs selected</p>
          <div className="space-x-4">
            <button onClick={() => setSelectedNfts([])} className="text-gray-600 hover:text-gray-800">
              Clear Selection
            </button>
            <button
              onClick={() => setIsStakeModalOpen(true)}
              className="bg-[#0d2416] text-white px-4 py-2 rounded hover:bg-[#143621] transition-colors"
            >
              Stake Selected NFTs
            </button>
          </div>
        </div>
      )}

      {/* NFT Grid */}
      <NFTGrid nfts={activeNfts} selectedNfts={selectedNfts} onSelectNft={toggleNftSelection} />

      {/* Stake Modal */}
      <StakeNFTsModal isOpen={isStakeModalOpen} onClose={() => setIsStakeModalOpen(false)} nfts={selectedNfts} />

      {/* Wallet Modal */}
      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </div>
  )
}
