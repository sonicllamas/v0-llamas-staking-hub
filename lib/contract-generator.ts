import type { StakingFormData } from "@/components/create-staking/create-staking-form"

export function generateContractCode(formData: StakingFormData): string {
  const {
    contractName,
    contractSymbol,
    description,
    rewardTokenAddress,
    rewardRate,
    rewardInterval,
    nftCollectionAddress,
    stakingType,
    lockPeriod,
    earlyWithdrawalFee,
    maxStakePerWallet,
    minStakeAmount,
    emergencyWithdraw,
    pausable,
    upgradeable,
  } = formData

  // Convert days to seconds for lock period
  const lockPeriodInSeconds = Number(lockPeriod) * 86400

  // Generate contract code based on form data
  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
${pausable ? 'import "@openzeppelin/contracts/security/Pausable.sol";' : ""}
${upgradeable ? 'import "@openzeppelin/contracts/proxy/utils/Initializable.sol";' : ""}

/**
 * @title ${contractName}
 * @symbol ${contractSymbol}
 * @dev ${description || "NFT Staking Contract for Sonic Llamas"}
 */
contract ${contractName.replace(/\s+/g, "")} is Ownable${pausable ? ", Pausable" : ""}${
    upgradeable ? ", Initializable" : ""
  } {
    // State variables
    IERC721 public nftCollection;
    IERC20 public rewardToken;
    
    uint256 public rewardRate = ${rewardRate}; // Tokens per interval
    uint256 public rewardInterval = ${rewardInterval}; // Seconds
    
    uint256 public minStakeAmount = ${minStakeAmount};
    ${Number(maxStakePerWallet) > 0 ? `uint256 public maxStakePerWallet = ${maxStakePerWallet};` : ""}
    
    ${
      stakingType === "locked"
        ? `uint256 public lockPeriod = ${lockPeriodInSeconds}; // ${lockPeriod} days in seconds
    uint256 public earlyWithdrawalFee = ${earlyWithdrawalFee}; // Percentage`
        : ""
    }
    
    // Structs
    struct StakedNFT {
        address owner;
        uint256 tokenId;
        uint256 stakedAt;
        uint256 lastRewardCalculation;
    }
    
    // Mappings
    mapping(uint256 => StakedNFT) public stakedNFTs;
    mapping(address => uint256[]) public stakedNFTsByOwner;
    mapping(address => uint256) public pendingRewards;
    
    // Events
    event NFTStaked(address indexed owner, uint256 tokenId, uint256 timestamp);
    event NFTUnstaked(address indexed owner, uint256 tokenId, uint256 timestamp);
    event RewardClaimed(address indexed owner, uint256 amount);
    ${emergencyWithdraw ? "event EmergencyWithdraw(address indexed owner, uint256 tokenId);" : ""}
    
    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {
        nftCollection = IERC721(${nftCollectionAddress});
        rewardToken = IERC20(${rewardTokenAddress});
    }
    
    /**
     * @dev Stake NFTs
     * @param tokenIds Array of NFT token IDs to stake
     */
    function stakeNFTs(uint256[] calldata tokenIds) external ${pausable ? "whenNotPaused " : ""}{
        require(tokenIds.length >= minStakeAmount, "Must stake minimum amount");
        ${
          Number(maxStakePerWallet) > 0
            ? `require(stakedNFTsByOwner[msg.sender].length + tokenIds.length <= maxStakePerWallet, "Exceeds max stake per wallet");`
            : ""
        }
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(nftCollection.ownerOf(tokenId) == msg.sender, "Not the owner");
            
            // Transfer NFT to contract
            nftCollection.transferFrom(msg.sender, address(this), tokenId);
            
            // Record staking info
            stakedNFTs[tokenId] = StakedNFT({
                owner: msg.sender,
                tokenId: tokenId,
                stakedAt: block.timestamp,
                lastRewardCalculation: block.timestamp
            });
            
            stakedNFTsByOwner[msg.sender].push(tokenId);
            
            emit NFTStaked(msg.sender, tokenId, block.timestamp);
        }
    }
    
    /**
     * @dev Unstake NFTs
     * @param tokenIds Array of NFT token IDs to unstake
     */
    function unstakeNFTs(uint256[] calldata tokenIds) external ${pausable ? "whenNotPaused " : ""}{
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            StakedNFT storage stakedNFT = stakedNFTs[tokenId];
            
            require(stakedNFT.owner == msg.sender, "Not the staker");
            
            // Calculate and add pending rewards
            _calculateRewards(tokenId);
            
            ${
              stakingType === "locked"
                ? `// Check if lock period has passed
            if (block.timestamp < stakedNFT.stakedAt + lockPeriod) {
                // Apply early withdrawal fee
                uint256 penalty = (pendingRewards[msg.sender] * earlyWithdrawalFee) / 100;
                pendingRewards[msg.sender] -= penalty;
            }`
                : ""
            }
            
            // Remove from stakedNFTsByOwner
            _removeTokenFromOwnerList(msg.sender, tokenId);
            
            // Delete staking info
            delete stakedNFTs[tokenId];
            
            // Return NFT to owner
            nftCollection.transferFrom(address(this), msg.sender, tokenId);
            
            emit NFTUnstaked(msg.sender, tokenId, block.timestamp);
        }
    }
    
    /**
     * @dev Claim rewards
     */
    function claimRewards() external ${pausable ? "whenNotPaused " : ""}{
        // Calculate rewards for all staked NFTs
        uint256[] memory tokenIds = stakedNFTsByOwner[msg.sender];
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _calculateRewards(tokenIds[i]);
        }
        
        uint256 rewards = pendingRewards[msg.sender];
        require(rewards > 0, "No rewards to claim");
        
        // Reset pending rewards
        pendingRewards[msg.sender] = 0;
        
        // Transfer rewards
        require(rewardToken.transfer(msg.sender, rewards), "Reward transfer failed");
        
        emit RewardClaimed(msg.sender, rewards);
    }
    
    /**
     * @dev Calculate rewards for a staked NFT
     * @param tokenId NFT token ID
     */
    function _calculateRewards(uint256 tokenId) internal {
        StakedNFT storage stakedNFT = stakedNFTs[tokenId];
        
        // Calculate time elapsed since last calculation
        uint256 timeElapsed = block.timestamp - stakedNFT.lastRewardCalculation;
        
        // Calculate rewards
        uint256 intervals = timeElapsed / rewardInterval;
        uint256 rewards = intervals * rewardRate;
        
        // Update last reward calculation time
        stakedNFT.lastRewardCalculation = block.timestamp;
        
        // Add rewards to pending
        pendingRewards[stakedNFT.owner] += rewards;
    }
    
    /**
     * @dev Remove token from owner's list
     * @param owner Address of the owner
     * @param tokenId NFT token ID
     */
    function _removeTokenFromOwnerList(address owner, uint256 tokenId) internal {
        uint256[] storage tokenIds = stakedNFTsByOwner[owner];
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (tokenIds[i] == tokenId) {
                // Replace with the last element and pop
                tokenIds[i] = tokenIds[tokenIds.length - 1];
                tokenIds.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Get staked NFTs by owner
     * @param owner Address of the owner
     * @return Array of staked NFT token IDs
     */
    function getStakedNFTsByOwner(address owner) external view returns (uint256[] memory) {
        return stakedNFTsByOwner[owner];
    }
    
    /**
     * @dev Get pending rewards for an owner
     * @param owner Address of the owner
     * @return Pending rewards amount
     */
    function getPendingRewards(address owner) external view returns (uint256) {
        uint256 rewards = pendingRewards[owner];
        uint256[] memory tokenIds = stakedNFTsByOwner[owner];
        
        // Calculate current rewards
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            StakedNFT storage stakedNFT = stakedNFTs[tokenId];
            
            uint256 timeElapsed = block.timestamp - stakedNFT.lastRewardCalculation;
            uint256 intervals = timeElapsed / rewardInterval;
            rewards += intervals * rewardRate;
        }
        
        return rewards;
    }
    
    ${
      emergencyWithdraw
        ? `/**
     * @dev Emergency withdraw NFT
     * @param tokenId NFT token ID
     */
    function emergencyWithdraw(uint256 tokenId) external {
        StakedNFT storage stakedNFT = stakedNFTs[tokenId];
        require(stakedNFT.owner == msg.sender, "Not the staker");
        
        // Remove from stakedNFTsByOwner
        _removeTokenFromOwnerList(msg.sender, tokenId);
        
        // Delete staking info
        delete stakedNFTs[tokenId];
        
        // Return NFT to owner
        nftCollection.transferFrom(address(this), msg.sender, tokenId);
        
        emit EmergencyWithdraw(msg.sender, tokenId);
    }`
        : ""
    }
    
    ${
      pausable
        ? `/**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }`
        : ""
    }
    
    /**
     * @dev Update reward rate
     * @param newRate New reward rate
     */
    function updateRewardRate(uint256 newRate) external onlyOwner {
        rewardRate = newRate;
    }
    
    /**
     * @dev Update reward interval
     * @param newInterval New reward interval in seconds
     */
    function updateRewardInterval(uint256 newInterval) external onlyOwner {
        rewardInterval = newInterval;
    }
    
    ${
      stakingType === "locked"
        ? `/**
     * @dev Update lock period
     * @param newLockPeriod New lock period in seconds
     */
    function updateLockPeriod(uint256 newLockPeriod) external onlyOwner {
        lockPeriod = newLockPeriod;
    }
    
    /**
     * @dev Update early withdrawal fee
     * @param newFee New fee percentage
     */
    function updateEarlyWithdrawalFee(uint256 newFee) external onlyOwner {
        require(newFee <= 100, "Fee cannot exceed 100%");
        earlyWithdrawalFee = newFee;
    }`
        : ""
    }
    
    /**
     * @dev Withdraw ERC20 tokens accidentally sent to contract
     * @param token ERC20 token address
     */
    function withdrawERC20(address token) external onlyOwner {
        IERC20 erc20Token = IERC20(token);
        uint256 balance = erc20Token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        require(erc20Token.transfer(owner(), balance), "Transfer failed");
    }
}`
}
