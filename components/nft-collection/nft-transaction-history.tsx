import type { NFTTransactionHistory as NFTTransaction } from "@/types/nft"

interface NFTTransactionHistoryProps {
  transactions: NFTTransaction[]
}

export function NFTTransactionHistory({ transactions }: NFTTransactionHistoryProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No transaction history available for this NFT.</p>
      </div>
    )
  }

  const getTransactionTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case "mint":
        return { label: "Mint", color: "bg-green-100 text-green-800" }
      case "transfer":
        return { label: "Transfer", color: "bg-blue-100 text-blue-800" }
      case "sale":
        return { label: "Sale", color: "bg-purple-100 text-purple-800" }
      case "list":
        return { label: "List", color: "bg-yellow-100 text-yellow-800" }
      case "unlist":
        return { label: "Unlist", color: "bg-gray-100 text-gray-800" }
      case "bid":
        return { label: "Bid", color: "bg-indigo-100 text-indigo-800" }
      case "cancel_bid":
        return { label: "Cancel Bid", color: "bg-red-100 text-red-800" }
      default:
        return { label: type, color: "bg-gray-100 text-gray-800" }
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return "Unknown"
    if (address === "0x0000000000000000000000000000000000000000") return "Null Address (Mint)"
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "Unknown"
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleString()
  }

  const formatPrice = (price: string) => {
    if (!price || price === "0") return "N/A"
    // Format price as FTM with 2 decimal places
    return `${(Number(price) / 1e18).toFixed(2)} FTM`
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Event
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              From
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              To
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((tx, index) => {
            const { label, color } = getTransactionTypeLabel(tx.type)
            return (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
                    {label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatAddress(tx.from)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatAddress(tx.to)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(tx.price)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTimestamp(tx.timestamp)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
