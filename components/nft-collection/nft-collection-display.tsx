import type React from "react"
import { AlertCircle } from "lucide-react"

interface CollectionErrorProps {
  message: string
}

const CollectionError: React.FC<CollectionErrorProps> = ({ message }) => {
  return (
    <div className="flex items-center space-x-2 text-red-500">
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )
}

interface NFTCollectionDisplayProps {
  isLoading: boolean
  error: string | null
  data: any // Replace 'any' with a more specific type if possible
}

const NFTCollectionDisplay: React.FC<NFTCollectionDisplayProps> = ({ isLoading, error, data }) => {
  if (isLoading) {
    return <div>Loading NFT Collection...</div>
  }

  if (error) {
    return <CollectionError message={error} />
  }

  if (!data) {
    return <div>No NFT collection data available.</div>
  }

  // Assuming 'data' is an array of NFT objects
  return (
    <div>
      <h2>NFT Collection</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map(
          (
            nft: any, // Replace 'any' with a more specific type if possible
          ) => (
            <div key={nft.id} className="border rounded-md p-4">
              <img
                src={nft.image || "/placeholder.svg"}
                alt={nft.name}
                className="w-full h-48 object-cover rounded-md mb-2"
              />
              <h3>{nft.name}</h3>
              <p>{nft.description}</p>
            </div>
          ),
        )}
      </div>
    </div>
  )
}

export default NFTCollectionDisplay
