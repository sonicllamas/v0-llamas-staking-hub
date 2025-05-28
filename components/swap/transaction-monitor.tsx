import type React from "react"

export { TransactionMonitor }

interface TransactionMonitorProps {
  hash: string
}

const TransactionMonitor: React.FC<TransactionMonitorProps> = ({ hash }) => {
  const explorerLinks = [
    {
      name: "Sonic Explorer",
      url: "https://sonicscan.org",
      description: "Official Sonic blockchain explorer",
    },
  ]

  return (
    <div>
      <p>Transaction Hash: {hash}</p>
      <p>View on Explorer:</p>
      <ul>
        {explorerLinks.map((explorer, index) => (
          <li key={index}>
            <a href={`https://sonicscan.org/tx/${hash}`} target="_blank" rel="noopener noreferrer">
              {explorer.name}
            </a>{" "}
            - {explorer.description}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TransactionMonitor
