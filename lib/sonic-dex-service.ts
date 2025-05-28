"use client"

// Real Sonic DEX service for blockchain interactions
export interface SonicDEXConfig {
  chainId: number
  rpcUrl: string
  explorerUrl: string
  factoryAddress: string
  routerAddress: string
  wethAddress: string
}

export interface TokenInfo {
  symbol: string
  name: string
  address: string
  decimals: number
  isNative: boolean
  logo: string
}

export interface SwapQuote {
  amountOut: string
  priceImpact: string
  route: string[]
  gasEstimate: string
  minimumAmountOut: string
  exchangeRate: string
}

export interface SwapResult {
  hash: string
  success: boolean
  error?: string
}

// Real Sonic Mainnet configuration
export const SONIC_CONFIG: SonicDEXConfig = {
  chainId: 146,
  rpcUrl: "https://rpc.soniclabs.com",
  explorerUrl: "https://sonicscan.org",
  factoryAddress: "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6", // Real Sonic DEX Factory
  routerAddress: "0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295", // Real Sonic DEX Router
  wethAddress: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38", // Real WETH on Sonic
}

// Real token addresses on Sonic Mainnet
export const SONIC_TOKENS: TokenInfo[] = [
  {
    symbol: "S",
    name: "Sonic",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    isNative: true,
    logo: "/networks/sonic.svg",
  },
  {
    symbol: "WETH",
    name: "Wrapped Ethereum",
    address: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
    decimals: 18,
    isNative: false,
    logo: "/ethereum-logo.svg",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
    decimals: 6,
    isNative: false,
    logo: "/usdc-logo.png",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x5C7e299CF531eb66f2A1dF637d37AbB78e6200C7",
    decimals: 6,
    isNative: false,
    logo: "/usdt-coins.png",
  },
]

// ERC20 ABI for token interactions
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
]

// DEX Router ABI for swaps
const ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
]

// Check if user is on Sonic network
export async function checkSonicNetwork(): Promise<boolean> {
  if (typeof window === "undefined" || !window.ethereum) return false

  try {
    const chainId = await window.ethereum.request({ method: "eth_chainId" })
    return Number.parseInt(chainId, 16) === SONIC_CONFIG.chainId
  } catch (error) {
    console.error("Error checking network:", error)
    return false
  }
}

// Switch to Sonic network
export async function switchToSonicNetwork(): Promise<boolean> {
  if (typeof window === "undefined" || !window.ethereum) return false

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${SONIC_CONFIG.chainId.toString(16)}` }],
    })
    return true
  } catch (switchError: any) {
    // Network not added, try to add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${SONIC_CONFIG.chainId.toString(16)}`,
              chainName: "Sonic Mainnet",
              nativeCurrency: {
                name: "Sonic",
                symbol: "S",
                decimals: 18,
              },
              rpcUrls: [SONIC_CONFIG.rpcUrl],
              blockExplorerUrls: [SONIC_CONFIG.explorerUrl],
            },
          ],
        })
        return true
      } catch (addError) {
        console.error("Error adding Sonic network:", addError)
        return false
      }
    }
    console.error("Error switching to Sonic network:", switchError)
    return false
  }
}

// Get real token balances from blockchain
export async function getRealTokenBalances(userAddress: string): Promise<Record<string, string>> {
  if (typeof window === "undefined" || !window.ethereum) return {}

  try {
    const { ethers } = await import("ethers")
    const provider = new ethers.BrowserProvider(window.ethereum)
    const balances: Record<string, string> = {}

    for (const token of SONIC_TOKENS) {
      try {
        if (token.isNative) {
          // Get native S balance
          const balance = await provider.getBalance(userAddress)
          balances[token.address] = ethers.formatEther(balance)
        } else {
          // Get ERC20 token balance
          const contract = new ethers.Contract(token.address, ERC20_ABI, provider)
          const balance = await contract.balanceOf(userAddress)
          const decimals = await contract.decimals()
          balances[token.address] = ethers.formatUnits(balance, decimals)
        }
      } catch (error) {
        console.error(`Error getting balance for ${token.symbol}:`, error)
        balances[token.address] = "0"
      }
    }

    return balances
  } catch (error) {
    console.error("Error getting token balances:", error)
    return {}
  }
}

// Get real swap quote from DEX
export async function getRealSwapQuote(fromToken: TokenInfo, toToken: TokenInfo, amountIn: string): Promise<SwapQuote> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Web3 not available")
  }

  try {
    const { ethers } = await import("ethers")
    const provider = new ethers.BrowserProvider(window.ethereum)
    const router = new ethers.Contract(SONIC_CONFIG.routerAddress, ROUTER_ABI, provider)

    // Build swap path
    const path = [fromToken.address, toToken.address]
    if (!fromToken.isNative && !toToken.isNative) {
      // For token-to-token swaps, route through WETH
      path.splice(1, 0, SONIC_CONFIG.wethAddress)
    }

    // Convert amount to wei
    const amountInWei = ethers.parseUnits(amountIn, fromToken.decimals)

    // Get amounts out from DEX
    const amounts = await router.getAmountsOut(amountInWei, path)
    const amountOut = amounts[amounts.length - 1]

    // Format output amount
    const formattedAmountOut = ethers.formatUnits(amountOut, toToken.decimals)

    // Calculate exchange rate
    const exchangeRate = (Number.parseFloat(formattedAmountOut) / Number.parseFloat(amountIn)).toFixed(6)

    // Calculate minimum amount out with 0.5% slippage
    const slippage = 0.005 // 0.5%
    const minimumAmountOut = (Number.parseFloat(formattedAmountOut) * (1 - slippage)).toFixed(6)

    // Estimate gas
    const gasEstimate = "0.002" // Approximate gas cost in S

    // Calculate price impact (simplified)
    const priceImpact = "0.1" // Would need more complex calculation for real price impact

    return {
      amountOut: formattedAmountOut,
      priceImpact,
      route: path.map((addr) => {
        const token = SONIC_TOKENS.find((t) => t.address.toLowerCase() === addr.toLowerCase())
        return token?.symbol || "UNKNOWN"
      }),
      gasEstimate,
      minimumAmountOut,
      exchangeRate,
    }
  } catch (error) {
    console.error("Error getting swap quote:", error)
    throw new Error("Failed to get swap quote from DEX")
  }
}

// Execute real swap transaction
export async function executeRealSwap(
  fromToken: TokenInfo,
  toToken: TokenInfo,
  amountIn: string,
  amountOutMin: string,
  userAddress: string,
): Promise<SwapResult> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Web3 not available")
  }

  try {
    const { ethers } = await import("ethers")
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const router = new ethers.Contract(SONIC_CONFIG.routerAddress, ROUTER_ABI, signer)

    // Build swap path
    const path = [fromToken.address, toToken.address]
    if (!fromToken.isNative && !toToken.isNative) {
      path.splice(1, 0, SONIC_CONFIG.wethAddress)
    }

    // Convert amounts to wei
    const amountInWei = ethers.parseUnits(amountIn, fromToken.decimals)
    const amountOutMinWei = ethers.parseUnits(amountOutMin, toToken.decimals)

    // Set deadline (20 minutes from now)
    const deadline = Math.floor(Date.now() / 1000) + 1200

    let tx

    if (fromToken.isNative) {
      // ETH to Token swap
      tx = await router.swapExactETHForTokens(amountOutMinWei, path, userAddress, deadline, {
        value: amountInWei,
      })
    } else if (toToken.isNative) {
      // Token to ETH swap
      // First approve token spending
      const tokenContract = new ethers.Contract(fromToken.address, ERC20_ABI, signer)
      const allowance = await tokenContract.allowance(userAddress, SONIC_CONFIG.routerAddress)

      if (allowance < amountInWei) {
        const approveTx = await tokenContract.approve(SONIC_CONFIG.routerAddress, amountInWei)
        await approveTx.wait()
      }

      tx = await router.swapExactTokensForETH(amountInWei, amountOutMinWei, path, userAddress, deadline)
    } else {
      // Token to Token swap
      // First approve token spending
      const tokenContract = new ethers.Contract(fromToken.address, ERC20_ABI, signer)
      const allowance = await tokenContract.allowance(userAddress, SONIC_CONFIG.routerAddress)

      if (allowance < amountInWei) {
        const approveTx = await tokenContract.approve(SONIC_CONFIG.routerAddress, amountInWei)
        await approveTx.wait()
      }

      tx = await router.swapExactTokensForTokens(amountInWei, amountOutMinWei, path, userAddress, deadline)
    }

    return {
      hash: tx.hash,
      success: true,
    }
  } catch (error: any) {
    console.error("Error executing swap:", error)
    return {
      hash: "",
      success: false,
      error: error.message || "Swap transaction failed",
    }
  }
}

// Monitor real transaction status
export async function monitorTransaction(txHash: string): Promise<any> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Web3 not available")
  }

  try {
    const { ethers } = await import("ethers")
    const provider = new ethers.BrowserProvider(window.ethereum)

    // Wait for transaction receipt
    const receipt = await provider.waitForTransaction(txHash)

    if (receipt) {
      return {
        status: receipt.status === 1 ? "success" : "failed",
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        confirmations: (await provider.getBlockNumber()) - receipt.blockNumber,
      }
    }

    return { status: "pending" }
  } catch (error) {
    console.error("Error monitoring transaction:", error)
    return { status: "failed", error: "Failed to monitor transaction" }
  }
}

// Check if DEX contracts are available
export async function checkDEXAvailability(): Promise<{ available: boolean; error?: string }> {
  if (typeof window === "undefined" || !window.ethereum) {
    return { available: false, error: "Web3 not available" }
  }

  try {
    const { ethers } = await import("ethers")
    const provider = new ethers.BrowserProvider(window.ethereum)

    // Check if router contract exists
    const code = await provider.getCode(SONIC_CONFIG.routerAddress)
    if (code === "0x") {
      return { available: false, error: "DEX router contract not found" }
    }

    // Try to call a view function to verify contract is working
    const router = new ethers.Contract(SONIC_CONFIG.routerAddress, ROUTER_ABI, provider)
    await router.getAmountsOut(ethers.parseEther("1"), [SONIC_CONFIG.wethAddress, SONIC_TOKENS[2].address])

    return { available: true }
  } catch (error: any) {
    console.error("DEX availability check failed:", error)
    return { available: false, error: error.message || "DEX not available" }
  }
}

// Get Sonic explorer URL
export function getSonicExplorerUrl(txHash: string): string {
  return `${SONIC_CONFIG.explorerUrl}/tx/${txHash}`
}
