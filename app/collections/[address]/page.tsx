import { fetchNFTCollection } from "@/lib/nft-service"
import Link from "next/link"
import Image from "next/image"
import { BackButton } from "@/components/back-button"

interface CollectionPageProps {
  params: {
    address: string
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { address } = params

  // Try to fetch the collection with retries
  let collection = null
  let attempts = 0
  const maxAttempts = 3

  while (!collection && attempts < maxAttempts) {
    attempts++
    try {
      collection = await fetchNFTCollection(address)
      console.log(`Successfully fetched collection on attempt ${attempts}`)
    } catch (error) {
      console.error(`Error fetching collection on attempt ${attempts}:`, error)
      if (attempts < maxAttempts) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  }

  // If we still don't have a collection, try to get a minimal version
  if (!collection) {
    console.log("Falling back to minimal collection data")
    collection = {
      address,
      name: `Collection ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      description: "Collection details could not be loaded.",
      image: "/diverse-nft-collection.png",
      banner: "/llama-banner.png",
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <BackButton href="/collections" label="Back to Collections" />
      </div>

      {/* Collection Banner */}
      <div className="relative h-48 md:h-64 lg:h-80 w-full rounded-xl overflow-hidden mb-8">
        <Image
          src={collection.banner || collection.bannerImage || "/llama-banner.png"}
          alt={collection.name}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Collection Info */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/3">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="relative h-64 w-full">
              <Image
                src={collection.image || "/placeholder.svg?height=400&width=400&query=NFT%20Collection"}
                alt={collection.name}
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-2">{collection.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                {collection.verified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verified</span>
                )}
                {collection.isWhitelisted && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Whitelisted</span>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-4">{collection.description || "No description available."}</p>
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-xs">Total Supply</p>
                    <p className="font-medium">
                      {typeof collection.totalSupply === "number"
                        ? collection.totalSupply.toLocaleString()
                        : collection.totalSupply || "Unknown"}
                    </p>
                  </div>
                  {collection.symbol && (
                    <div>
                      <p className="text-gray-500 text-xs">Symbol</p>
                      <p className="font-medium">{collection.symbol}</p>
                    </div>
                  )}
                  {collection.floorPrice && (
                    <div>
                      <p className="text-gray-500 text-xs">Floor Price</p>
                      <p className="font-medium">{collection.floorPrice}</p>
                    </div>
                  )}
                  {collection.volume24h && (
                    <div>
                      <p className="text-gray-500 text-xs">24h Volume</p>
                      <p className="font-medium">{collection.volume24h}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          {(collection.website || collection.twitter || collection.discord) && (
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
              <h2 className="text-lg font-bold mb-4">Links</h2>
              <div className="space-y-2">
                {collection.website && (
                  <a
                    href={collection.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#0d2416] hover:underline"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    Website
                  </a>
                )}
                {collection.twitter && (
                  <a
                    href={`https://twitter.com/${collection.twitter.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#0d2416] hover:underline"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                    Twitter
                  </a>
                )}
                {collection.discord && (
                  <a
                    href={
                      collection.discord.startsWith("http")
                        ? collection.discord
                        : `https://discord.gg/${collection.discord}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#0d2416] hover:underline"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 8a6 6 0 0 0-12 0" />
                      <path d="M3 12h18" />
                      <path d="M3 16h18" />
                      <path d="M3 20h18" />
                      <path d="M20 4h-4l-4-4-4 4H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                    </svg>
                    Discord
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="md:w-2/3">
          {/* Actions */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Collection Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href={`/collections/${address}/browse`}
                className="bg-[#0d2416] text-white px-6 py-3 rounded-lg hover:bg-[#143621] transition-colors text-center"
              >
                Browse NFTs
              </Link>
              <Link
                href={`/collections/${address}/stake`}
                className="bg-[#0d2416] text-white px-6 py-3 rounded-lg hover:bg-[#143621] transition-colors text-center"
              >
                Stake NFTs
              </Link>
              <Link
                href={`/create-staking?collection=${address}`}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                Create Staking Contract
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Collection Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-xs">Total Supply</p>
                <p className="text-xl font-bold">
                  {typeof collection.totalSupply === "number"
                    ? collection.totalSupply.toLocaleString()
                    : collection.totalSupply || "Unknown"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-xs">Owners</p>
                <p className="text-xl font-bold">
                  {collection.ownersCount ? collection.ownersCount.toLocaleString() : "Unknown"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-xs">Floor Price</p>
                <p className="text-xl font-bold">{collection.floorPrice || "Unknown"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-xs">Total Volume</p>
                <p className="text-xl font-bold">{collection.totalVolume || "Unknown"}</p>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">About Collection</h2>
            <p className="text-gray-600">{collection.description || "No description available for this collection."}</p>
            {collection.creator && (
              <div className="mt-4">
                <p className="text-gray-500 text-sm">Creator</p>
                <p className="font-medium break-all">{collection.creator}</p>
              </div>
            )}
            {collection.categories && collection.categories.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-500 text-sm">Categories</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {collection.categories.map((category) => (
                    <span key={category} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
