import { ExternalLink } from "lucide-react"

interface ContractStatsProps {
  contract: any
}

export function ContractStats({ contract }: ContractStatsProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <p className="text-gray-400 text-xs">Contract Address</p>
        <div className="flex items-center gap-1">
          <p className="text-white font-mono text-sm">{formatAddress(contract.address)}</p>
          <a
            href={`https://sonicscan.org/address/${contract.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-xs">NFT Collection</p>
        <div className="flex items-center gap-1">
          <p className="text-white font-mono text-sm">{formatAddress(contract.nftCollection)}</p>
          <a
            href={`https://sonicscan.org/address/${contract.nftCollection}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-xs">Reward Token</p>
        <div className="flex items-center gap-1">
          <p className="text-white font-mono text-sm">{formatAddress(contract.rewardToken)}</p>
          <a
            href={`https://sonicscan.org/address/${contract.rewardToken}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-xs">Staking Type</p>
        <p className="text-white text-sm capitalize">{contract.stakingType}</p>
      </div>
      <div>
        <p className="text-gray-400 text-xs">Staked NFTs</p>
        <p className="text-white text-sm">{contract.stakedCount}</p>
      </div>
      <div>
        <p className="text-gray-400 text-xs">Total Rewards</p>
        <p className="text-white text-sm">{contract.totalRewards}</p>
      </div>
      <div>
        <p className="text-gray-400 text-xs">Reward Rate</p>
        <p className="text-white text-sm">{contract.rewardRate} tokens/day</p>
      </div>
      <div>
        <p className="text-gray-400 text-xs">Owner</p>
        <div className="flex items-center gap-1">
          <p className="text-white font-mono text-sm">{formatAddress(contract.owner)}</p>
          <a
            href={`https://sonicscan.org/address/${contract.owner}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}
