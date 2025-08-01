"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/context/wallet-context';
import {
    SONIC_NETWORK,
    ERC721_ABI,
    ERC20_ABI,
    TRANSACTION_FEE_PERCENTAGE,
    resolveUrl,
    NFT_MARKETPLACE_DEPLOYMENT_BLOCK
} from '@/lib/constants';
import { COLLECTION_REGISTRY_CONTRACT_ADDRESS, COLLECTION_REGISTRY_ABI } from '@/contracts/CollectionRegistry';
import { NFT_MARKETPLACE_CONTRACT_ADDRESS, NFT_MARKETPLACE_ABI } from '@/contracts/NFTMarketplace';
import { Listing, CollectionInfo } from '@/types/marketplace';
import { 
    ShoppingCartIcon, 
    CloseIcon, 
    SonicTokenIcon, 
    TagIcon, 
    PaperAirplaneIcon, 
    TrashIcon, 
    FireIcon, 
    CircleStackIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    PencilSquareIcon, 
    CopyIcon, 
    EllipsisHorizontalIcon, 
    CheckBadgeIcon, 
    ExternalLinkIcon 
} from '@/components/icons';
import { Spinner } from '@/components/ui/spinner';

interface NftDisplayItem {
    tokenId: bigint;
    assetContract: string;
    owner: string;
    metadata?: {
        name: string;
        image: string;
    };
    listingInfo?: {
        pricePerToken: bigint;
        listingCreator: string;
        currency: string;
        tokenType: number;
    };
}

interface TrendingCollection extends CollectionInfo {
    volume: bigint;
}

interface ExtendedCollectionInfo extends CollectionInfo {
    description?: string;
    bannerUrl?: string;
}

interface CollectionStats {
    floor: bigint;
    volume: bigint;
    items: number;
    owners: number;
}

// Mirror the contract's enum for clarity, as per the ABI.
const ListingType = {
    FixedPrice: 0,
    Auction: 1,
    Offer: 2,
};

const formatLargeNumber = (num: number) => {
    if (num >= 1_000_000_000) {
        return `${(num / 1_000_000_000).toFixed(1)}B`;
    }
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
        return `${(num / 1_000).toFixed(0)}K`;
    }
    return num.toString();
};

// --- Sub-components for better structure ---

const NFTDetailModal: React.FC<{
    item: NftDisplayItem;
    collection: CollectionInfo | undefined;
    onClose: () => void;
    onBuy: (listing: Listing) => void;
    isBuying: boolean;
    isWalletConnected: boolean;
    onConnectWallet: () => void;
    onDelist: (item: NftDisplayItem) => void;
    onUpdatePrice: (item: NftDisplayItem) => void;
    isDelisting: boolean;
    selectedAccount: string | null;
}> = ({ item, collection, onClose, onBuy, isBuying, isWalletConnected, onConnectWallet, onDelist, onUpdatePrice, isDelisting, selectedAccount }) => {
    
    const isOwner = selectedAccount?.toLowerCase() === item.owner.toLowerCase();

    const handleBuyClick = () => {
        if (!item.listingInfo || isOwner) return;
        const listingForModal: Listing = {
            tokenId: item.tokenId,
            assetContract: item.assetContract,
            pricePerToken: item.listingInfo.pricePerToken,
            listingCreator: item.listingInfo.listingCreator,
            metadata: item.metadata,
            quantity: 1n,
            currency: item.listingInfo.currency,
            tokenType: item.listingInfo.tokenType,
            status: 1, 
        };
        onBuy(listingForModal);
    };

    const renderActionArea = () => {
        if (!item.listingInfo) {
            return (
                <div className="mt-6 p-4 bg-green-900 rounded-lg text-center">
                    <p className="text-lg font-semibold text-green-200">Not for Sale</p>
                    <p className="text-sm text-green-400 mt-1">This item is not currently listed on the marketplace.</p>
                </div>
            );
        }
        
        const listingPrice = item.listingInfo.pricePerToken;
        const fee = (listingPrice * BigInt(TRANSACTION_FEE_PERCENTAGE)) / 100n;
        const sellerReceives = listingPrice - fee;

        const renderButton = () => {
            if (isOwner) {
                return (
                    <div className="flex space-x-2 mt-4">
                        <button
                            onClick={() => onUpdatePrice(item)}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 text-lg"
                        >
                            <PencilSquareIcon className="h-6 w-6" />
                            <span>Update Price</span>
                        </button>
                        <button
                            onClick={() => onDelist(item)}
                            disabled={isDelisting}
                            className="w-full flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 text-lg"
                        >
                            {isDelisting ? <Spinner /> : <TrashIcon className="h-6 w-6" />}
                            <span>Delist Item</span>
                        </button>
                    </div>
                );
            }

            if (isWalletConnected) {
                return (
                    <button
                        onClick={handleBuyClick}
                        disabled={isBuying}
                        className="w-full mt-4 flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 text-lg"
                    >
                        {isBuying ? <Spinner /> : <ShoppingCartIcon className="h-6 w-6" />}
                        <span>Buy Now</span>
                    </button>
                );
            }

            return (
                    <button
                        onClick={onConnectWallet}
                        className="w-full mt-4 flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 text-lg"
                    >
                        Connect Wallet to Buy
                    </button>
            );
        };

        return (
            <div className="mt-6 p-4 bg-green-900 rounded-lg">
                <p className="text-sm text-green-400 mb-2">Price Details</p>
                <div className="space-y-2 pt-2 border-t border-green-700">
                    <div className="flex justify-between text-base text-green-100 font-bold">
                        <span>You Pay</span>
                        <span className="font-mono flex items-center">{ethers.formatEther(listingPrice)} <SonicTokenIcon className="h-4 w-4 ml-1.5"/></span>
                    </div>
                    <div className="flex justify-between text-sm text-green-300">
                        <span>Marketplace Fee ({TRANSACTION_FEE_PERCENTAGE}%)</span>
                        <span className="font-mono flex items-center">{ethers.formatEther(fee)} <SonicTokenIcon className="h-4 w-4 ml-1.5"/></span>
                    </div>
                    <div className="flex justify-between text-sm text-green-300 mt-2 pt-2 border-t border-green-600/50">
                        <span>Seller will receive</span>
                        <span className="font-mono flex items-center">{ethers.formatEther(sellerReceives)} <SonicTokenIcon className="h-4 w-4 ml-1.5"/></span>
                    </div>
                </div>
                {renderButton()}
            </div>
        );
    };

    return (
        <div className="modal-enter-active fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md" onClick={onClose}>
            <div className="bg-green-800 rounded-2xl shadow-2xl w-full max-w-4xl m-4 border border-green-700 flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                <div className="w-full md:w-1/2 p-6">
                    <div className="aspect-square bg-green-900 rounded-xl flex items-center justify-center overflow-hidden">
                        {item.metadata?.image ? (
                                <img src={item.metadata.image} alt={item.metadata.name} className="w-full h-full object-contain" />
                        ) : <Spinner size="h-16 w-16" />}
                    </div>
                </div>
                <div className="w-full md:w-1/2 p-8 flex flex-col relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-green-400 hover:text-green-200 transition-colors">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                    <div className="flex-grow">
                        <p className="text-green-300 font-semibold">{collection?.name || 'Unknown Collection'}</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-green-100 mt-1 mb-4">{item.metadata?.name || 'Loading...'}</h2>
                        <p className="text-sm text-green-400">Owned by: <span className="font-mono text-green-300 break-all">{item.owner}</span></p>
                    </div>
                    {renderActionArea()}
                </div>
            </div>
        </div>
    );
};

const UpdatePriceModal: React.FC<{
    item: NftDisplayItem;
    onClose: () => void;
    onUpdate: () => void;
    isUpdating: boolean;
    newPrice: string;
    setNewPrice: (price: string) => void;
}> = ({ item, onClose, onUpdate, isUpdating, newPrice, setNewPrice }) => (
    <div className="modal-enter-active fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md" onClick={onClose}>
        <div className="bg-green-800 rounded-2xl shadow-2xl w-full max-w-md m-4 border border-green-700" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-green-700">
                <h2 className="text-lg font-semibold text-green-100">Update Listing Price</h2>
                <button onClick={onClose} className="text-green-400 hover:text-green-200 transition-colors">
                    <CloseIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                    <img src={item.metadata?.image || 'https://iili.io/F1cARmG.jpg'} alt={item.metadata?.name} className="h-20 w-20 rounded-lg bg-green-900 object-cover" onError={(e) => { e.currentTarget.src = 'https://iili.io/F1cARmG.jpg'; }} />
                    <div>
                        <h3 className="font-bold text-green-100 text-xl">{item.metadata?.name}</h3>
                        <p className="text-sm text-green-400">Current Price: {ethers.formatEther(item.listingInfo?.pricePerToken || 0n)} {SONIC_NETWORK.nativeCurrency.symbol}</p>
                    </div>
                </div>
                <div>
                    <label htmlFor="list-price" className="block text-sm font-medium text-green-300">New Price</label>
                    <div className="relative mt-1">
                        <input
                            id="list-price"
                            type="number"
                            step="any"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            placeholder="0.0"
                            className="w-full bg-green-700 border border-green-600 rounded-md p-2 pr-12 text-green-100 focus:ring-2 focus:ring-green-400"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-green-400">{SONIC_NETWORK.nativeCurrency.symbol}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onUpdate}
                    disabled={isUpdating || !newPrice || parseFloat(newPrice) <= 0}
                    className="w-full mt-6 flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    {isUpdating ? <Spinner /> : <PencilSquareIcon className="h-5 w-5" />}
                    <span>Confirm Update</span>
                </button>
            </div>
        </div>
    </div>
);

const ListingModal: React.FC<{
    item: NftDisplayItem;
    onClose: () => void;
    onList: () => void;
    isListing: boolean;
    listPrice: string;
    setListPrice: (price: string) => void;
    isApproved: boolean;
    onApprove: () => void;
    isApproving: boolean;
}> = ({ item, onClose, onList, isListing, listPrice, setListPrice, isApproved, onApprove, isApproving }) => (
    <div className="modal-enter-active fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md" onClick={onClose}>
        <div className="bg-green-800 rounded-2xl shadow-2xl w-full max-w-md m-4 border border-green-700" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-green-700">
                <h2 className="text-lg font-semibold text-green-100">List Item for Sale</h2>
                <button onClick={onClose} className="text-green-400 hover:text-green-200 transition-colors">
                    <CloseIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                    <img src={item.metadata?.image || 'https://iili.io/F1cARmG.jpg'} alt={item.metadata?.name} className="h-20 w-20 rounded-lg bg-green-900 object-cover" onError={(e) => { e.currentTarget.src = 'https://iili.io/F1cARmG.jpg'; }} />
                    <div>
                        <h3 className="font-bold text-green-100 text-xl">{item.metadata?.name}</h3>
                        <p className="text-sm text-green-400">Token ID: {item.tokenId.toString()}</p>
                    </div>
                </div>
                <div>
                    <label htmlFor="list-price" className="block text-sm font-medium text-green-300">Price</label>
                    <div className="relative mt-1">
                        <input
                            id="list-price"
                            type="number"
                            step="any"
                            value={listPrice}
                            onChange={(e) => setListPrice(e.target.value)}
                            placeholder="0.0"
                            className="w-full bg-green-700 border border-green-600 rounded-md p-2 pr-12 text-green-100 focus:ring-2 focus:ring-green-400"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-green-400">{SONIC_NETWORK.nativeCurrency.symbol}</span>
                        </div>
                    </div>
                </div>
                   {isApproved ? (
                    <button
                        onClick={onList}
                        disabled={isListing || !listPrice || parseFloat(listPrice) <= 0}
                        className="w-full mt-6 flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        {isListing ? <Spinner /> : <TagIcon className="h-5 w-5" />}
                        <span>Confirm Listing</span>
                    </button>
                   ) : (
                    <button
                        onClick={onApprove}
                        disabled={isApproving}
                        className="w-full mt-6 flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        {isApproving ? <Spinner /> : 'Approve Collection to List'}
                    </button>
                   )}
            </div>
        </div>
    </div>
);

const TransferModal: React.FC<{
    item: NftDisplayItem;
    onClose: () => void;
    onTransfer: () => void;
    isTransferring: boolean;
    transferAddress: string;
    setTransferAddress: (address: string) => void;
}> = ({ item, onClose, onTransfer, isTransferring, transferAddress, setTransferAddress }) => (
    <div className="modal-enter-active fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md" onClick={onClose}>
        <div className="bg-green-800 rounded-2xl shadow-2xl w-full max-w-md m-4 border border-green-700" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-green-700">
                <h2 className="text-lg font-semibold text-green-100">Transfer NFT</h2>
                <button onClick={onClose} className="text-green-400 hover:text-green-200 transition-colors">
                    <CloseIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                    <img src={item.metadata?.image || 'https://iili.io/F1cARmG.jpg'} alt={item.metadata?.name} className="h-20 w-20 rounded-lg bg-green-900 object-cover" onError={(e) => { e.currentTarget.src = 'https://iili.io/F1cARmG.jpg'; }} />
                    <div>
                        <h3 className="font-bold text-green-100 text-xl">{item.metadata?.name}</h3>
                        <p className="text-sm text-green-400">Token ID: {item.tokenId.toString()}</p>
                    </div>
                </div>
                <div>
                    <label htmlFor="transfer-address" className="block text-sm font-medium text-green-300">Recipient Address</label>
                    <div className="relative mt-1">
                        <input
                            id="transfer-address"
                            type="text"
                            value={transferAddress}
                            onChange={(e) => setTransferAddress(e.target.value)}
                            placeholder="0x..."
                            className="w-full bg-green-700 border border-green-600 rounded-md p-2 text-green-100 font-mono focus:ring-2 focus:ring-green-400"
                        />
                    </div>
                </div>
                <button
                    onClick={onTransfer}
                    disabled={isTransferring || !transferAddress || !ethers.isAddress(transferAddress)}
                    className="w-full mt-6 flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    {isTransferring ? <Spinner /> : <PaperAirplaneIcon className="h-5 w-5" />}
                    <span>Confirm Transfer</span>
                </button>
            </div>
        </div>
    </div>
);

const BurnConfirmationModal: React.FC<{
    item: NftDisplayItem;
    onClose: () => void;
    onConfirm: () => void;
    isBurning: boolean;
}> = ({ item, onClose, onConfirm, isBurning }) => (
    <div className="modal-enter-active fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md" onClick={onClose}>
        <div className="bg-green-800 rounded-2xl shadow-2xl w-full max-w-md m-4 border border-red-700" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
                <FireIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-200">Burn This NFT?</h2>
                <p className="text-sm text-green-300 mt-2">
                    You are about to permanently destroy <span className="font-bold text-green-100">{item.metadata?.name || `#${item.tokenId}`}</span>.
                    This action is irreversible.
                </p>
                <div className="mt-6 flex justify-center space-x-4">
                    <button onClick={onClose} disabled={isBurning} className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={isBurning} className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg">
                        {isBurning ? <Spinner /> : <FireIcon className="h-5 w-5"/>}
                        <span>Confirm Burn</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const DelistConfirmationModal: React.FC<{
    item: NftDisplayItem;
    onClose: () => void;
    onConfirm: () => void;
    isDelisting: boolean;
}> = ({ item, onClose, onConfirm, isDelisting }) => (
    <div className="modal-enter-active fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md" onClick={onClose}>
        <div className="bg-green-800 rounded-2xl shadow-2xl w-full max-w-md m-4 border border-yellow-700" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
                <TagIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-yellow-200">Delist this NFT?</h2>
                <p className="text-sm text-green-300 mt-2">
                    You are about to remove <span className="font-bold text-green-100">{item.metadata?.name || `#${item.tokenId}`}</span> from the marketplace.
                </p>
                   <p className="text-sm text-green-400 mt-1">You can always list it again later.</p>
                <div className="mt-6 flex justify-center space-x-4">
                    <button onClick={onClose} disabled={isDelisting} className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={isDelisting} className="flex-1 flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg">
                        {isDelisting ? <Spinner /> : <TrashIcon className="h-5 w-5"/>}
                        <span>Confirm Delist</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const BulkActionModal: React.FC<{
    title: string;
    itemCount: number;
    actionLabel: string;
    onClose: () => void;
    onConfirm: () => void;
    isProcessing: boolean;
    processingState: { processed: number, total: number, errors: string[] } | null;
    children?: React.ReactNode;
}> = ({ title, itemCount, actionLabel, onClose, onConfirm, isProcessing, processingState, children }) => (
       <div className="modal-enter-active fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md" onClick={isProcessing ? undefined : onClose}>
        <div className="bg-green-800 rounded-2xl shadow-2xl w-full max-w-md m-4 border border-green-700" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-green-700">
                <h2 className="text-lg font-semibold text-green-100">{title}</h2>
                <button onClick={onClose} disabled={isProcessing} className="text-green-400 hover:text-green-200 transition-colors">
                    <CloseIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="p-6">
                { !processingState ? (
                    <>
                        <p className="text-green-300 mb-4">You are about to perform this action on {itemCount} selected NFTs.</p>
                        {children}
                        <div className="mt-6 flex justify-end space-x-4">
                            <button onClick={onClose} className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                            <button onClick={onConfirm} disabled={isProcessing} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">
                                {isProcessing ? <Spinner/> : actionLabel}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <p className="font-bold text-green-100 mb-2">Processing... {processingState.processed} / {processingState.total}</p>
                        <div className="w-full bg-green-700 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(processingState.processed / processingState.total) * 100}%` }}></div>
                        </div>
                        {processingState.errors.length > 0 && (
                               <div className="mt-4 text-left text-xs text-red-400 bg-red-900/50 p-2 rounded-md max-h-24 overflow-y-auto">
                                <p className="font-bold mb-1">Errors ({processingState.errors.length}):</p>
                                {processingState.errors.map((err, i) => <p key={i}>- {err}</p>)}
                            </div>
                        )}
                         {!isProcessing && (
                           <button onClick={onClose} className="mt-6 bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Close</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
);

const NftItemCard: React.FC<{
    item: NftDisplayItem;
    isSelected: boolean;
    onSelect: () => void;
    onCardClick: () => void;
    onListClick: () => void;
    onTransferClick: () => void;
    onDelistClick: () => void;
    onBurnClick: () => void;
    isBuying: boolean;
    isOwner: boolean;
}> = React.memo(({ item, isSelected, onSelect, onCardClick, onListClick, onTransferClick, onDelistClick, onBurnClick, isBuying, isOwner }) => {
    
    const isListed = !!item.listingInfo;

    const renderActionButtons = () => {
        if (isOwner) {
            if (isListed) {
                return (
                    <div className="flex items-center space-x-2">
                        <button onClick={(e) => { e.stopPropagation(); onDelistClick(); }} className="flex-1 flex items-center justify-center space-x-1.5 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold text-xs py-2 rounded-md transition-colors">
                            <TrashIcon className="h-4 w-4" />
                            <span>Delist</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onTransferClick(); }} className="flex-1 flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 rounded-md transition-colors">
                            <PaperAirplaneIcon className="h-4 w-4" />
                            <span>Transfer</span>
                        </button>
                    </div>
                );
            } else {
                return (
                    <div className="flex items-center space-x-2">
                        <button onClick={(e) => { e.stopPropagation(); onListClick(); }} className="flex-1 flex items-center justify-center space-x-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold text-xs py-2 rounded-md transition-colors">
                            <TagIcon className="h-4 w-4" />
                            <span>List</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onBurnClick(); }} className="flex-1 flex items-center justify-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs py-2 rounded-md transition-colors">
                               <FireIcon className="h-4 w-4" />
                            <span>Burn</span>
                        </button>
                    </div>
                );
            }
        } else { // Not owner
            if (isListed) {
                return (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onCardClick(); }} 
                        disabled={isBuying}
                        className="w-full flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 rounded-md transition-colors"
                    >
                        {isBuying ? <Spinner size="h-4 w-4" /> : <ShoppingCartIcon className="h-4 w-4" />}
                        <span>Buy Now</span>
                    </button>
                );
            } else {
                return <div className="text-center text-xs text-green-500 py-2 h-full flex items-center justify-center">Unlisted</div>;
            }
        }
    };

    return (
        <div
            onClick={onCardClick}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onCardClick()}
            role="button"
            tabIndex={0}
            className="border-2 border-green-800 rounded-lg bg-green-900/50 relative overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-green-400/20 hover:-translate-y-1 cursor-pointer"
        >
            {isOwner && (
                <div className="absolute top-2 left-2 z-10">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => { e.stopPropagation(); onSelect(); }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-5 w-5 rounded bg-green-700 border-green-500 text-green-500 focus:ring-green-400 cursor-pointer"
                        aria-label={`Select NFT ${item.metadata?.name || item.tokenId}`}
                    />
                </div>
            )}
            <div className="aspect-square w-full bg-green-800 flex items-center justify-center overflow-hidden">
                <img
                    src={item.metadata?.image || 'https://iili.io/F1cARmG.jpg'}
                    alt={item.metadata?.name}
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => { e.currentTarget.src = 'https://iili.io/F1cARmG.jpg'; }}
                    loading="lazy"
                />
            </div>
            <div className="p-3">
                <p className="font-bold text-green-100 text-sm truncate">{item.metadata?.name || `Token #${item.tokenId}`}</p>
                {item.listingInfo ? (
                    <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center space-x-1.5">
                            <SonicTokenIcon className="h-4 w-4" />
                            <span className="text-green-200 font-semibold">{ethers.formatEther(item.listingInfo.pricePerToken)}</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-xs text-green-400 mt-1 h-[24px]"></div>
                )}
                <div className="mt-2 h-[36px]">
                    {renderActionButtons()}
                </div>
            </div>
        </div>
    );
});

const CollectionCard: React.FC<{
    collection: CollectionInfo;
    onSelect: () => void;
}> = ({ collection, onSelect }) => (
    <div
        onClick={onSelect}
        className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-green-800 hover:border-green-600 transition-all duration-300"
        title={collection.name}
    >
        <img
            src={collection.imageUri}
            alt={collection.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.currentTarget.src = 'https://iili.io/F1cARmG.jpg'; }}
            loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-900/40 to-transparent flex flex-col justify-end p-4">
            <div>
                <h3 className="font-bold text-lg text-white truncate">{collection.name}</h3>
                <p className="text-sm text-green-300 font-mono uppercase">{collection.symbol}</p>
            </div>
        </div>
    </div>
);

const TrendingCollectionCard: React.FC<{
    collection: TrendingCollection;
    rank: number;
    onSelect: () => void;
}> = ({ collection, rank, onSelect }) => (
    <div
        onClick={onSelect}
        className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-green-800 hover:border-green-600 transition-all duration-300"
        title={collection.name}
    >
        <img
            src={collection.imageUri}
            alt={collection.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.currentTarget.src = 'https://iili.io/F1cARmG.jpg'; }}
            loading="lazy"
        />
        <div className="absolute -top-2 -left-2 bg-green-500 text-white font-bold text-lg w-10 h-10 rounded-full flex items-center justify-center border-4 border-green-800 transform -rotate-12">
            {rank}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
            <div>
                <h3 className="font-bold text-lg text-white truncate">{collection.name}</h3>
                <div className="flex justify-between items-end">
                    <p className="text-sm text-green-300 font-mono uppercase">{collection.symbol}</p>
                    <div className="text-right">
                        <p className="text-xs text-green-400">Volume</p>
                        <div className="flex items-center space-x-1 font-semibold text-green-100">
                             <SonicTokenIcon className="h-4 w-4" />
                            <span>{parseFloat(ethers.formatEther(collection.volume)).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const LlamasMarketplace: React.FC<{
    collections: CollectionInfo[];
    isLoadingCollections: boolean;
    preselectedFilters?: Record<string, string> | null;
    clearPreselectedFilters?: () => void;
}> = ({ collections, isLoadingCollections, preselectedFilters, clearPreselectedFilters }) => {
    const { address: selectedAccount, isConnected, connect } = useWallet();
    
    // Mock provider for now - replace with actual provider
    const readOnlyProvider = useMemo(() => {
        if (typeof window !== 'undefined' && window.ethereum) {
            return new ethers.BrowserProvider(window.ethereum);
        }
        return null;
    }, []);

    const signer = useMemo(() => {
        if (readOnlyProvider && isConnected) {
            return readOnlyProvider.getSigner();
        }
        return null;
    }, [readOnlyProvider, isConnected]);

    const [trendingCollections, setTrendingCollections] = useState<TrendingCollection[]>([]);
    const [nftItems, setNftItems] = useState<NftDisplayItem[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_low' | 'price_high'>('newest');
    const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
    const [selectedNfts, setSelectedNfts] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'browse' | 'my_nfts'>('browse');

    const [isLoadingNfts, setIsLoadingNfts] = useState(false);
    const [isLoadingTrending, setIsLoadingTrending] = useState(true);

    const [selectedNftForDetail, setSelectedNftForDetail] = useState<NftDisplayItem | null>(null);
    const [nftForListing, setNftForListing] = useState<NftDisplayItem | null>(null);
    const [nftForPriceUpdate, setNftForPriceUpdate] = useState<NftDisplayItem | null>(null);
    const [nftForTransfer, setNftForTransfer] = useState<NftDisplayItem | null>(null);
    const [nftForBurn, setNftForBurn] = useState<NftDisplayItem | null>(null);
    const [nftForDelist, setNftForDelist] = useState<NftDisplayItem | null>(null);
    const [bulkActionType, setBulkActionType] = useState<'list' | 'transfer' | 'burn' | 'delist' | null>(null);

    const [listPrice, setListPrice] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [transferAddress, setTransferAddress] = useState('');
    const [bulkListPrice, setBulkListPrice] = useState('');
    const [bulkTransferAddress, setBulkTransferAddress] = useState('');

    const [isBuying, setIsBuying] = useState(false);
    const [isListing, setIsListing] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
    const [isTransferring, setIsTransferring] = useState(false);
    const [isBurning, setIsBurning] = useState(false);
    const [isDelisting, setIsDelisting] = useState(false);
    const [isProcessingBulk, setIsProcessingBulk] = useState(false);
    const [processingState, setProcessingState] = useState<{ processed: number, total: number, errors: string[] } | null>(null);

    // Admin State
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMarketplacePaused, setIsMarketplacePaused] = useState(false);
    const [isCollectionPaused, setIsCollectionPaused] = useState(false);
    const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
    const [isUpdatingPause, setIsUpdatingPause] = useState(false);

    const [error, setError] = useState<string | null>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalNfts, setTotalNfts] = useState(0);
    const NFTS_PER_PAGE = 50;

    // Collection Details State
    const [extendedCollectionInfo, setExtendedCollectionInfo] = useState<ExtendedCollectionInfo | null>(null);
    const [collectionStats, setCollectionStats] = useState<CollectionStats | null>(null);
    const [listingCount, setListingCount] = useState(0);
    const [isLoadingCollectionDetails, setIsLoadingCollectionDetails] = useState(false);

    // Mock wallet functions
    const openWalletModal = () => {
        if (connect) {
            connect();
        }
    };

    // Mock functions for now - these would be implemented with actual contract calls
    const fetchTrendingCollections = useCallback(async () => {
        setIsLoadingTrending(true);
        try {
            // Mock trending collections
            const mockTrending = collections.slice(0, 5).map((collection, index) => ({
                ...collection,
                volume: BigInt(Math.floor(Math.random() * 1000) * 1e18) // Random volume
            }));
            setTrendingCollections(mockTrending);
        } catch (e) {
            console.error("Error fetching trending collections:", e);
        } finally {
            setIsLoadingTrending(false);
        }
    }, [collections]);

    const fetchNftsForCollection = useCallback(async (collectionAddress: string, page: number) => {
        setIsLoadingNfts(true);
        setError(null);
        setNftItems([]);

        try {
            // Mock NFT data for demonstration
            const mockNfts: NftDisplayItem[] = Array.from({ length: 20 }, (_, i) => ({
                tokenId: BigInt(i + 1 + (page * NFTS_PER_PAGE)),
                assetContract: collectionAddress,
                owner: i % 3 === 0 ? selectedAccount || '0x1234567890123456789012345678901234567890' : '0x0987654321098765432109876543210987654321',
                metadata: {
                    name: `NFT #${i + 1 + (page * NFTS_PER_PAGE)}`,
                    image: '/sonic-llamas-logo.jpg'
                },
                listingInfo: i % 2 === 0 ? {
                    pricePerToken: BigInt(Math.floor(Math.random() * 10 + 1) * 1e18),
                    listingCreator: '0x0987654321098765432109876543210987654321',
                    currency: ethers.ZeroAddress,
                    tokenType: 0
                } : undefined
            }));

            setNftItems(mockNfts);
            setTotalNfts(100); // Mock total
        } catch (e: any) {
            console.error("Error fetching NFTs for collection:", e);
            setError(e.message || "An unexpected error occurred.");
            setTotalNfts(0);
        } finally {
            setIsLoadingNfts(false);
        }
    }, [selectedAccount]);

    const fetchMyNftsForCollection = useCallback(async (collectionAddress: string) => {
        if (!selectedAccount) {
            setNftItems([]);
            return;
        }
        setIsLoadingNfts(true);
        setError(null);
        
        try {
            // Mock user's NFTs
            const mockMyNfts: NftDisplayItem[] = Array.from({ length: 5 }, (_, i) => ({
                tokenId: BigInt(i + 1),
                assetContract: collectionAddress,
                owner: selectedAccount,
                metadata: {
                    name: `My NFT #${i + 1}`,
                    image: '/sonic-llamas-logo.jpg'
                },
                listingInfo: i % 2 === 0 ? {
                    pricePerToken: BigInt(Math.floor(Math.random() * 5 + 1) * 1e18),
                    listingCreator: selectedAccount,
                    currency: ethers.ZeroAddress,
                    tokenType: 0
                } : undefined
            }));

            setNftItems(mockMyNfts);
            setTotalNfts(mockMyNfts.length);
        } catch (e: any) {
            console.error("Error fetching user's NFTs:", e);
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setIsLoadingNfts(false);
        }
    }, [selectedAccount]);

    // Mock handlers - these would implement actual blockchain interactions
    const handleBuy = async (listing: Listing) => {
        console.log("Mock buy:", listing);
        setError("Marketplace functionality is in development. This is a demo interface.");
    };

    const handleList = async () => {
        console.log("Mock list");
        setError("Marketplace functionality is in development. This is a demo interface.");
    };

    const handleApprove = async () => {
        console.log("Mock approve");
        setIsApproved(true);
    };

    const handleUpdateListingPrice = async () => {
        console.log("Mock update price");
        setError("Marketplace functionality is in development. This is a demo interface.");
    };

    const handleDelist = async (itemToDelist: NftDisplayItem) => {
        console.log("Mock delist:", itemToDelist);
        setError("Marketplace functionality is in development. This is a demo interface.");
    };

    const handleTransfer = async () => {
        console.log("Mock transfer");
        setError("Marketplace functionality is in development. This is a demo interface.");
    };

    const handleBurn = async () => {
        console.log("Mock burn");
        setError("Marketplace functionality is in development. This is a demo interface.");
    };

    const handleBulkList = async () => {
        console.log("Mock bulk list");
        setError("Marketplace functionality is in development. This is a demo interface.");
    };

    const handleBulkDelist = async () => {
        console.log("Mock bulk delist");
        setError("Marketplace functionality is in development. This is a demo interface.");
    };

    const handleBulkTransfer = async () => {
        console.log("Mock bulk transfer");
        setError("Marketplace functionality is in development. This is a demo interface.");
    };

    const handleBulkBurn = async () => {
        console.log("Mock bulk burn");
        setError("Marketplace functionality is in development. This is a demo interface.");
    };

    const handleTabChange = useCallback((tab: 'browse' | 'my_nfts') => {
        setActiveTab(tab);
        setNftItems([]);
        setIsLoadingNfts(true);
        setCurrentPage(0);
        setTotalNfts(0);
        setError(null);
    }, []);

    const handleCollectionSelect = useCallback((collectionAddress: string) => {
        setSelectedCollection(collectionAddress);
        setSelectedNfts(new Set());
        handleTabChange('browse');
    }, [handleTabChange]);

    const toggleSelectNft = (tokenId: bigint) => {
        const idStr = tokenId.toString();
        const newSet = new Set(selectedNfts);
        if (newSet.has(idStr)) newSet.delete(idStr);
        else newSet.add(idStr);
        setSelectedNfts(newSet);
    };

    useEffect(() => {
        if (!isLoadingCollections && collections.length > 0) {
            fetchTrendingCollections();
        }
    }, [collections, isLoadingCollections, fetchTrendingCollections]);

    useEffect(() => {
        if (selectedCollection) {
            if (activeTab === 'browse') {
                fetchNftsForCollection(selectedCollection, currentPage);
            } else if (activeTab === 'my_nfts') {
                fetchMyNftsForCollection(selectedCollection);
            }
        } else {
            setNftItems([]);
            setTotalNfts(0);
        }
    }, [selectedCollection, activeTab, currentPage, fetchNftsForCollection, fetchMyNftsForCollection]);

    const filteredAndSortedNfts = useMemo(() => {
        let filtered = nftItems.filter(item => {
            const nameMatch = item.metadata?.name.toLowerCase().includes(searchQuery.toLowerCase());
            const idMatch = item.tokenId.toString().includes(searchQuery);
            const price = item.listingInfo ? parseFloat(ethers.formatEther(item.listingInfo.pricePerToken)) : -1;
            const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
            const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
            
            const priceFilterActive = !!(priceRange.min || priceRange.max);
            const priceMatch = !priceFilterActive || (item.listingInfo && price >= minPrice && price <= maxPrice);

            return (nameMatch || idMatch) && priceMatch;
        });

        return filtered.sort((a, b) => {
            const aIsListed = !!a.listingInfo;
            const bIsListed = !!b.listingInfo;

            // 1. Primary Sort: Listed items first
            if (aIsListed && !bIsListed) {
                return -1;
            }
            if (!aIsListed && bIsListed) {
                return 1;
            }

            // 2. Secondary Sort: Based on user selection
            const aPrice = a.listingInfo ? a.listingInfo.pricePerToken : 0n;
            const bPrice = b.listingInfo ? b.listingInfo.pricePerToken : 0n;
            
            // Safe comparison for BigInts
            const compareBigInt = (n1: bigint, n2: bigint) => {
                if (n1 > n2) return 1;
                if (n1 < n2) return -1;
                return 0;
            };

            switch(sortBy) {
                case 'price_low':
                    return compareBigInt(aPrice, bPrice);
                case 'price_high':
                    return compareBigInt(bPrice, aPrice);
                case 'newest':
                    return compareBigInt(b.tokenId, a.tokenId);
                case 'oldest':
                    return compareBigInt(a.tokenId, b.tokenId);
                default:
                    return 0;
            }
        });
    }, [nftItems, searchQuery, priceRange, sortBy]);

    const totalPages = Math.ceil(totalNfts / NFTS_PER_PAGE);

    const PaginationControls = () => {
        if (totalPages <= 1 || isLoadingNfts || activeTab === 'my_nfts') return null;
        return (
            <div className="flex justify-between items-center my-6">
                <button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="flex items-center space-x-2 bg-green-700 hover:bg-green-600 disabled:bg-green-800/50 disabled:text-green-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                    <span>Back</span>
                </button>
                <span className="text-green-300 font-semibold">
                    Page {currentPage + 1} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage + 1 >= totalPages}
                    className="flex items-center space-x-2 bg-green-700 hover:bg-green-600 disabled:bg-green-800/50 disabled:text-green-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <span>Next</span>
                    <ChevronRightIcon className="h-5 w-5" />
                </button>
            </div>
        );
    };

    const closeBulkModal = () => {
        setBulkActionType(null);
        setIsProcessingBulk(false);
        setProcessingState(null);
        setBulkListPrice('');
        setBulkTransferAddress('');
    }

    const selectedNftDetails = nftItems.filter(item => selectedNfts.has(item.tokenId.toString()));
    const canBulkDelist = selectedNftDetails.some(item => item.listingInfo);
    const canBulkList = selectedNftDetails.some(item => !item.listingInfo);

    if (isLoadingCollections) {
        return <div className="flex justify-center items-center h-64"><Spinner size="h-12 w-12"/></div>;
    }

    if (!selectedCollection) {
        return (
            <div className="w-full max-w-7xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-green-100">Llamas Hub NFT Marketplace</h1>
                    <p className="text-lg text-green-300 mt-2 max-w-3xl mx-auto">Discover, buy, and sell digital treasures from across the Sonic ecosystem.</p>
                </div>
                <h2 className="text-3xl font-bold text-green-100 mb-4">Trending Collections</h2>
                {isLoadingTrending ? <Spinner /> : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
                    {trendingCollections.map((col, i) => <TrendingCollectionCard key={col.collectionAddress} collection={col} rank={i+1} onSelect={() => handleCollectionSelect(col.collectionAddress)} />)}
                </div>
                )}
                
                <h2 className="text-3xl font-bold text-green-100 mb-4">All Collections</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {collections.map(col => <CollectionCard key={col.collectionAddress} collection={col} onSelect={() => handleCollectionSelect(col.collectionAddress)} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <button onClick={() => { setSelectedCollection(null); setSelectedNfts(new Set()); }} className="text-green-300 hover:text-green-100 mb-4">&larr; Back to Collections</button>
            
            {extendedCollectionInfo && (
                <div className="bg-green-800 p-6 rounded-2xl mb-8 border border-green-700">
                    <div className="flex items-center space-x-6">
                        <img 
                            src={extendedCollectionInfo.imageUri} 
                            alt={extendedCollectionInfo.name} 
                            className="h-28 w-28 rounded-2xl bg-green-900 object-cover border-2 border-green-700 shadow-lg flex-shrink-0"
                        />
                        <div className="flex-grow">
                            <div className="flex items-center space-x-3">
                                <h1 className="text-4xl font-bold text-green-100 truncate">{extendedCollectionInfo.name}</h1>
                                <CheckBadgeIcon className="h-8 w-8 text-blue-400 flex-shrink-0"/>
                            </div>
                            <div className="flex items-center space-x-2 mt-3">
                                <button className="p-2 rounded-lg bg-green-700/50 hover:bg-green-700 text-green-300 transition-colors" title="Copy Address">
                                    <CopyIcon className="h-5 w-5"/>
                                </button>
                                <a href={`https://sonicscan.org/address/${selectedCollection}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-green-700/50 hover:bg-green-700 text-green-300 transition-colors" title="View on Explorer">
                                    <ExternalLinkIcon className="h-5 w-5"/>
                                </a>
                                <button className="p-2 rounded-lg bg-green-700/50 hover:bg-green-700 text-green-300 transition-colors" title="More options">
                                    <EllipsisHorizontalIcon className="h-5 w-5"/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="flex border-b border-green-700 mb-4">
                <button onClick={() => handleTabChange('browse')} className={`px-4 py-2 font-semibold ${activeTab === 'browse' ? 'border-b-2 border-green-400 text-green-100' : 'text-green-400'}`}>Browse Items</button>
                <button onClick={() => handleTabChange('my_nfts')} className={`px-4 py-2 font-semibold ${activeTab === 'my_nfts' ? 'border-b-2 border-green-400 text-green-100' : 'text-green-400'}`}>My NFTs</button>
            </div>
            
            {error && <p className="text-red-400 text-sm text-center mb-4 bg-red-900/50 p-3 rounded-lg">{error}</p>}
            
            {isLoadingNfts ? (
                <div className="flex justify-center items-center py-20"><Spinner size="h-10 w-10"/></div>
            ) : filteredAndSortedNfts.length === 0 ? (
                <div className="text-center text-green-400 py-20 border-2 border-dashed border-green-700 rounded-lg">No NFTs found.</div>
            ) : (
                <>
                    <PaginationControls />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredAndSortedNfts.map(item => (
                            <NftItemCard
                                key={item.tokenId.toString()}
                                item={item}
                                isSelected={selectedNfts.has(item.tokenId.toString())}
                                onSelect={() => toggleSelectNft(item.tokenId)}
                                onCardClick={() => setSelectedNftForDetail(item)}
                                onListClick={() => setNftForListing(item)}
                                onTransferClick={() => setNftForTransfer(item)}
                                onDelistClick={() => setNftForDelist(item)}
                                onBurnClick={() => setNftForBurn(item)}
                                isBuying={isBuying && selectedNftForDetail?.tokenId === item.tokenId}
                                isOwner={selectedAccount?.toLowerCase() === item.owner.toLowerCase()}
                            />
                        ))}
                    </div>
                    <PaginationControls />
                </>
            )}

            {/* Modals */}
            {selectedNftForDetail && (
                <NFTDetailModal 
                    item={selectedNftForDetail} 
                    collection={extendedCollectionInfo || collections.find(c => c.collectionAddress === selectedCollection)}
                    onClose={() => setSelectedNftForDetail(null)}
                    onBuy={handleBuy}
                    isBuying={isBuying}
                    isWalletConnected={!!selectedAccount}
                    onConnectWallet={openWalletModal}
                    onDelist={() => setNftForDelist(selectedNftForDetail)}
                    onUpdatePrice={() => setNftForPriceUpdate(selectedNftForDetail)}
                    isDelisting={isDelisting}
                    selectedAccount={selectedAccount}
                />
            )}
            {nftForListing && (
                <ListingModal
                    item={nftForListing}
                    onClose={() => setNftForListing(null)}
                    onList={handleList}
                    isListing={isListing}
                    listPrice={listPrice}
                    setListPrice={setListPrice}
                    isApproved={isApproved}
                    onApprove={handleApprove}
                    isApproving={isApproving}
                />
            )}
             {nftForPriceUpdate && (
                <UpdatePriceModal
                    item={nftForPriceUpdate}
                    onClose={() => setNftForPriceUpdate(null)}
                    onUpdate={handleUpdateListingPrice}
                    isUpdating={isUpdatingPrice}
                    newPrice={newPrice}
                    setNewPrice={setNewPrice}
                />
            )}
            {nftForTransfer && (
                <TransferModal
                    item={nftForTransfer}
                    onClose={() => setNftForTransfer(null)}
                    onTransfer={handleTransfer}
                    isTransferring={isTransferring}
                    transferAddress={transferAddress}
                    setTransferAddress={setTransferAddress}
                />
            )}
            {nftForBurn && (
                <BurnConfirmationModal
                    item={nftForBurn}
                    onClose={() => setNftForBurn(null)}
                    onConfirm={handleBurn}
                    isBurning={isBurning}
                />
            )}
            {nftForDelist && (
                <DelistConfirmationModal
                    item={nftForDelist}
                    onClose={() => setNftForDelist(null)}
                    onConfirm={() => handleDelist(nftForDelist)}
                    isDelisting={isDelisting}
                />
            )}
            
            {/* Bulk Action Bar */}
             {selectedNfts.size > 0 && activeTab === 'my_nfts' && (
                <div className="fixed bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 w-full max-w-lg z-30 p-2">
                    <div className="bg-green-700/80 backdrop-blur-md p-2 rounded-xl shadow-lg border border-green-600 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-green-100 px-3">{selectedNfts.size} items selected</p>
                        <div className="flex items-center gap-1">
                            {canBulkList && <button onClick={() => setBulkActionType('list')} className="bg-green-500 hover:bg-green-600 text-white font-semibold text-xs py-2 px-3 rounded-md">List</button>}
                            {canBulkDelist && <button onClick={() => setBulkActionType('delist')} className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-xs py-2 px-3 rounded-md">Delist</button>}
                            <button onClick={() => setBulkActionType('transfer')} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs py-2 px-3 rounded-md">Transfer</button>
                            <button onClick={() => setBulkActionType('burn')} className="bg-red-500 hover:bg-red-600 text-white font-semibold text-xs py-2 px-3 rounded-md">Burn</button>
                        </div>
                    </div>
                </div>
             )}
             
             {/* Bulk Action Modals */}
             {bulkActionType === 'list' && (
                <BulkActionModal title="Bulk List NFTs" itemCount={selectedNfts.size} actionLabel="Confirm & List All" onClose={closeBulkModal} onConfirm={handleBulkList} isProcessing={isProcessingBulk} processingState={processingState}>
                    {!isApproved && <button onClick={handleApprove} disabled={isApproving} className="w-full mb-4 flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2.5 rounded-lg">{isApproving ? <Spinner /> : 'Approve Collection First'}</button>}
                    <input type="number" value={bulkListPrice} onChange={e => setBulkListPrice(e.target.value)} placeholder="Price for each NFT in S" className="w-full bg-green-700 border-green-600 rounded-md p-2 text-green-100" disabled={!isApproved}/>
                </BulkActionModal>
             )}
             {bulkActionType === 'delist' && (
                <BulkActionModal title="Bulk Delist NFTs" itemCount={selectedNfts.size} actionLabel="Confirm & Delist All" onClose={closeBulkModal} onConfirm={handleBulkDelist} isProcessing={isProcessingBulk} processingState={processingState} />
             )}
             {bulkActionType === 'transfer' && (
                <BulkActionModal title="Bulk Transfer NFTs" itemCount={selectedNfts.size} actionLabel="Confirm & Transfer All" onClose={closeBulkModal} onConfirm={handleBulkTransfer} isProcessing={isProcessingBulk} processingState={processingState}>
                    <input type="text" value={bulkTransferAddress} onChange={e => setBulkTransferAddress(e.target.value)} placeholder="Recipient Address" className="w-full bg-green-700 border-green-600 rounded-md p-2 text-green-100"/>
                </BulkActionModal>
             )}
             {bulkActionType === 'burn' && (
                <BulkActionModal title="Bulk Burn NFTs" itemCount={selectedNfts.size} actionLabel="Confirm & Burn All" onClose={closeBulkModal} onConfirm={handleBulkBurn} isProcessing={isProcessingBulk} processingState={processingState} />
             )}
        </div>
    );
};

export { LlamasMarketplace };