"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Code,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Play,
  FileText,
  Zap,
  Lock,
  TestTube,
  GitBranch,
} from "lucide-react"
import type { DEXProject } from "../dex-development-dashboard"

interface SmartContractStepProps {
  project: DEXProject
  onComplete: () => void
  onUpdate: (updates: Partial<DEXProject>) => void
}

const CONTRACT_TEMPLATES = {
  factory: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Pair.sol";

contract DEXFactory {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;
    
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);
    
    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, 'IDENTICAL_ADDRESSES');
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'ZERO_ADDRESS');
        require(getPair[token0][token1] == address(0), 'PAIR_EXISTS');
        
        bytes memory bytecode = type(Pair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        
        Pair(pair).initialize(token0, token1);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);
        
        emit PairCreated(token0, token1, pair, allPairs.length);
    }
    
    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }
}`,
  router: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IERC20.sol";
import "./interfaces/IDEXFactory.sol";
import "./interfaces/IDEXPair.sol";
import "./libraries/SafeMath.sol";

contract DEXRouter {
    using SafeMath for uint;
    
    address public immutable factory;
    address public immutable WETH;
    
    modifier ensure(uint deadline) {
        require(deadline >= block.timestamp, 'EXPIRED');
        _;
    }
    
    constructor(address _factory, address _WETH) {
        factory = _factory;
        WETH = _WETH;
    }
    
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external ensure(deadline) returns (uint amountA, uint amountB, uint liquidity) {
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        address pair = pairFor(tokenA, tokenB);
        IERC20(tokenA).transferFrom(msg.sender, pair, amountA);
        IERC20(tokenB).transferFrom(msg.sender, pair, amountB);
        liquidity = IDEXPair(pair).mint(to);
    }
    
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external ensure(deadline) returns (uint[] memory amounts) {
        amounts = getAmountsOut(amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, 'INSUFFICIENT_OUTPUT_AMOUNT');
        IERC20(path[0]).transferFrom(msg.sender, pairFor(path[0], path[1]), amounts[0]);
        _swap(amounts, path, to);
    }
    
    // Additional router functions...
}`,
  pair: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IERC20.sol";
import "./libraries/Math.sol";
import "./libraries/UQ112x112.sol";

contract Pair {
    using SafeMath for uint;
    using UQ112x112 for uint224;
    
    uint public constant MINIMUM_LIQUIDITY = 10**3;
    
    address public factory;
    address public token0;
    address public token1;
    
    uint112 private reserve0;
    uint112 private reserve1;
    uint32 private blockTimestampLast;
    
    uint public price0CumulativeLast;
    uint public price1CumulativeLast;
    uint public kLast;
    
    uint private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, 'LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }
    
    event Mint(address indexed sender, uint amount0, uint amount1);
    event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);
    event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to);
    event Sync(uint112 reserve0, uint112 reserve1);
    
    constructor() {
        factory = msg.sender;
    }
    
    function initialize(address _token0, address _token1) external {
        require(msg.sender == factory, 'FORBIDDEN');
        token0 = _token0;
        token1 = _token1;
    }
    
    function mint(address to) external lock returns (uint liquidity) {
        (uint112 _reserve0, uint112 _reserve1,) = getReserves();
        uint balance0 = IERC20(token0).balanceOf(address(this));
        uint balance1 = IERC20(token1).balanceOf(address(this));
        uint amount0 = balance0.sub(_reserve0);
        uint amount1 = balance1.sub(_reserve1);
        
        uint _totalSupply = totalSupply;
        if (_totalSupply == 0) {
            liquidity = Math.sqrt(amount0.mul(amount1)).sub(MINIMUM_LIQUIDITY);
            _mint(address(0), MINIMUM_LIQUIDITY);
        } else {
            liquidity = Math.min(amount0.mul(_totalSupply) / _reserve0, amount1.mul(_totalSupply) / _reserve1);
        }
        require(liquidity > 0, 'INSUFFICIENT_LIQUIDITY_MINTED');
        _mint(to, liquidity);
        
        _update(balance0, balance1, _reserve0, _reserve1);
        emit Mint(msg.sender, amount0, amount1);
    }
    
    // Additional pair functions...
}`,
}

const DEVELOPMENT_PHASES = [
  {
    id: "setup",
    title: "Development Setup",
    description: "Initialize project structure and dependencies",
    tasks: ["Create Hardhat project", "Install dependencies", "Configure networks", "Setup testing framework"],
    estimatedHours: 4,
  },
  {
    id: "core",
    title: "Core Contracts",
    description: "Implement factory, router, and pair contracts",
    tasks: ["Factory contract", "Router contract", "Pair contract", "Interface definitions"],
    estimatedHours: 40,
  },
  {
    id: "features",
    title: "Feature Contracts",
    description: "Add governance, staking, and farming contracts",
    tasks: ["Governance token", "Staking contract", "Yield farming", "Fee distribution"],
    estimatedHours: 30,
  },
  {
    id: "testing",
    title: "Testing Suite",
    description: "Comprehensive contract testing",
    tasks: ["Unit tests", "Integration tests", "Gas optimization", "Edge case testing"],
    estimatedHours: 25,
  },
  {
    id: "security",
    title: "Security Review",
    description: "Security analysis and improvements",
    tasks: ["Static analysis", "Slither audit", "Manual review", "Fix vulnerabilities"],
    estimatedHours: 15,
  },
]

export function SmartContractStep({ project, onComplete, onUpdate }: SmartContractStepProps) {
  const [activePhase, setActivePhase] = useState("setup")
  const [completedPhases, setCompletedPhases] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof CONTRACT_TEMPLATES>("factory")
  const [customizations, setCustomizations] = useState("")
  const [securityChecklist, setSecurityChecklist] = useState<string[]>([])

  const SECURITY_ITEMS = [
    "Reentrancy protection implemented",
    "Integer overflow/underflow checks",
    "Access control mechanisms",
    "Input validation on all functions",
    "Emergency pause functionality",
    "Upgrade mechanism (if needed)",
    "Gas optimization review",
    "External dependency security",
  ]

  const completePhase = (phaseId: string) => {
    if (!completedPhases.includes(phaseId)) {
      setCompletedPhases([...completedPhases, phaseId])
    }
  }

  const toggleSecurityItem = (item: string) => {
    setSecurityChecklist((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }

  const calculateProgress = () => {
    return (completedPhases.length / DEVELOPMENT_PHASES.length) * 100
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const isComplete = completedPhases.length >= 4 && securityChecklist.length >= 6

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Alert>
        <Code className="h-4 w-4" />
        <AlertTitle>Smart Contract Development</AlertTitle>
        <AlertDescription>
          Develop and test your DEX smart contracts. Follow the phases to ensure proper implementation and security.
        </AlertDescription>
      </Alert>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Development Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>
                {completedPhases.length}/{DEVELOPMENT_PHASES.length} phases completed
              </span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {DEVELOPMENT_PHASES.reduce((total, phase) => total + phase.estimatedHours, 0)}h
                </div>
                <div className="text-sm text-muted-foreground">Total Estimated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {completedPhases.reduce(
                    (total, phaseId) => total + (DEVELOPMENT_PHASES.find((p) => p.id === phaseId)?.estimatedHours || 0),
                    0,
                  )}
                  h
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {DEVELOPMENT_PHASES.reduce((total, phase) => total + phase.estimatedHours, 0) -
                    completedPhases.reduce(
                      (total, phaseId) =>
                        total + (DEVELOPMENT_PHASES.find((p) => p.id === phaseId)?.estimatedHours || 0),
                      0,
                    )}
                  h
                </div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="phases" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="phases">Development Phases</TabsTrigger>
          <TabsTrigger value="templates">Contract Templates</TabsTrigger>
          <TabsTrigger value="security">Security Review</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="phases" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {DEVELOPMENT_PHASES.map((phase) => (
              <Card
                key={phase.id}
                className={`cursor-pointer transition-all ${
                  activePhase === phase.id ? "ring-2 ring-blue-500" : ""
                } ${completedPhases.includes(phase.id) ? "bg-green-50 dark:bg-green-950" : ""}`}
                onClick={() => setActivePhase(phase.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {completedPhases.includes(phase.id) ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{phase.title}</h3>
                        <Badge variant="outline">{phase.estimatedHours}h</Badge>
                        {completedPhases.includes(phase.id) && <Badge variant="secondary">Completed</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
                      <div className="space-y-1">
                        {phase.tasks.map((task, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!completedPhases.includes(phase.id) && (
                        <Button size="sm" onClick={() => completePhase(phase.id)}>
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contract Templates
              </CardTitle>
              <CardDescription>Ready-to-use smart contract templates for your DEX</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  {Object.keys(CONTRACT_TEMPLATES).map((template) => (
                    <Button
                      key={template}
                      variant={selectedTemplate === template ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTemplate(template as keyof typeof CONTRACT_TEMPLATES)}
                    >
                      {template.charAt(0).toUpperCase() + template.slice(1)}
                    </Button>
                  ))}
                </div>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                    <code>{CONTRACT_TEMPLATES[selectedTemplate]}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(CONTRACT_TEMPLATES[selectedTemplate])}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <GitBranch className="mr-2 h-4 w-4" />
                    Fork Repository
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customizations</CardTitle>
              <CardDescription>Describe any custom modifications needed for your contracts</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe custom features, modifications, or specific requirements for your smart contracts..."
                value={customizations}
                onChange={(e) => setCustomizations(e.target.value)}
                className="min-h-24"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Checklist
              </CardTitle>
              <CardDescription>Ensure your contracts meet security best practices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SECURITY_ITEMS.map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={item}
                      checked={securityChecklist.includes(item)}
                      onChange={() => toggleSecurityItem(item)}
                      className="rounded"
                    />
                    <Label htmlFor={item} className="text-sm">
                      {item}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4" />
                  <span className="font-medium">Security Score</span>
                </div>
                <Progress value={(securityChecklist.length / SECURITY_ITEMS.length) * 100} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  {securityChecklist.length}/{SECURITY_ITEMS.length} security measures implemented
                </p>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Security Audit Recommendation</AlertTitle>
            <AlertDescription>
              Consider getting a professional security audit before mainnet deployment. Popular audit firms include
              ConsenSys Diligence, Trail of Bits, and OpenZeppelin.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Deployment Configuration
              </CardTitle>
              <CardDescription>Configure deployment parameters for your contracts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="network">Target Network</Label>
                  <Input id="network" value={project.blockchain || "sonic"} disabled />
                </div>
                <div>
                  <Label htmlFor="gas-price">Gas Price (Gwei)</Label>
                  <Input id="gas-price" placeholder="20" />
                </div>
                <div>
                  <Label htmlFor="deployer">Deployer Address</Label>
                  <Input id="deployer" placeholder="0x..." />
                </div>
                <div>
                  <Label htmlFor="verification">Verify Contracts</Label>
                  <Input id="verification" value="Yes" disabled />
                </div>
              </div>

              <Alert>
                <TestTube className="h-4 w-4" />
                <AlertTitle>Testnet Deployment First</AlertTitle>
                <AlertDescription>
                  Always deploy to testnet first for final testing before mainnet deployment. This helps catch any
                  last-minute issues.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <TestTube className="mr-2 h-4 w-4" />
                  Deploy to Testnet
                </Button>
                <Button className="flex-1" disabled={!isComplete}>
                  <Play className="mr-2 h-4 w-4" />
                  Deploy to Mainnet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Complete Step */}
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          )}
          <span className="text-sm">
            {isComplete
              ? "Smart contract development complete"
              : "Complete at least 4 phases and 6 security items to continue"}
          </span>
        </div>
        <Button onClick={onComplete} disabled={!isComplete}>
          Complete Smart Contract Development
        </Button>
      </div>
    </div>
  )
}
