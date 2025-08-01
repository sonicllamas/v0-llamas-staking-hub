import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import {
    SONIC_NETWORK,
    ERC721_ABI,
    ERC20_ABI,
    TRANSACTION_FEE_PERCENTAGE,
    resolveUrl,
    NFT_MARKETPLACE_DEPLOYMENT_BLOCK
} from '../constants';
import { COLLECTION_REGISTRY_CONTRACT_ADDRESS, COLLECTION_REGISTRY_ABI } from '../contracts/CollectionRegistry';
import { NFT_MARKETPLACE_CONTRACT_ADDRESS, NFT_MARKETPLACE_ABI } from '../contracts/NFTMarketplace';
import { Listing, CollectionInfo } from '../types';
import { ShoppingCartIcon, CloseIcon, SonicTokenIcon, TagIcon, PaperAirplaneIcon, TrashIcon, FireIcon, CircleStackIcon, ChevronLeftIcon, ChevronRightIcon, PencilSquareIcon, CopyIcon, EllipsisHorizontalIcon, CheckBadgeIcon, ExternalLinkIcon } from './Icons';
import { Spinner } from './Spinner';

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
    const { readOnlyProvider, selectedAccount, isVerified, openWalletModal, signer } = useWallet();

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

    // --- Admin & Pause Status Check ---
    useEffect(() => {
        const checkAdminAndStatus = async () => {
            if (!readOnlyProvider) return;
            setIsCheckingAdmin(true);
            const marketplace = new ethers.Contract(NFT_MARKETPLACE_CONTRACT_ADDRESS, NFT_MARKETPLACE_ABI, readOnlyProvider);
            try {
                const [owner, paused] = await Promise.all([
                    marketplace.owner(),
                    marketplace.paused()
                ]);
                
                const isAdminUser = selectedAccount?.toLowerCase() === owner.toLowerCase();
                setIsAdmin(isAdminUser);
                setIsMarketplacePaused(paused);

                if (isAdminUser && selectedCollection) {
                    const collectionPaused = await marketplace.pausedCollections(selectedCollection);
                    setIsCollectionPaused(collectionPaused);
                }
            } catch (e) {
                console.error("Failed to check admin or pause status:", e);
                setIsAdmin(false);
            } finally {
                setIsCheckingAdmin(false);
            }
        };
        checkAdminAndStatus();
    }, [selectedAccount, selectedCollection, readOnlyProvider]);

    useEffect(() => {
        const fetchCollectionDetails = async () => {
            if (!selectedCollection) {
                setExtendedCollectionInfo(null);
                setCollectionStats(null);
                return;
            }
            setIsLoadingCollectionDetails(true);
            try {
                // Fetch collection details (description, banner)
                const detailsResponse = await fetch(`https://api.paintswap.finance/collections/${selectedCollection}`);
                if (!detailsResponse.ok) throw new Error('Failed to fetch collection details');
                const detailsData = await detailsResponse.json();
                
                const currentCollection = collections.find(c => c.collectionAddress === selectedCollection);
                setExtendedCollectionInfo({
                    ...currentCollection,
                    description: detailsData.collection.description,
                    bannerUrl: detailsData.collection.bannerUrl,
                    imageUri: resolveUrl(detailsData.collection.logoUrl) || currentCollection?.imageUri || ''
                });

                // Fetch collection stats
                const statsResponse = await fetch(`https://api.paintswap.finance/collections/${selectedCollection}/stats`);
                if (!statsResponse.ok) throw new Error('Failed to fetch collection stats');
                const statsData = await statsResponse.json();
                                
                setCollectionStats({
                    floor: BigInt(statsData.stats.floor || 0),
                    volume: BigInt(statsData.stats.totalVolume || 0),
                    items: statsData.stats.numItems || 0,
                    owners: statsData.stats.numOwners || 0,
                });

            } catch (error) {
                console.error("Failed to fetch collection details:", error);
                const currentCollection = collections.find(c => c.collectionAddress === selectedCollection);
                if (currentCollection) setExtendedCollectionInfo(currentCollection);
            } finally {
                setIsLoadingCollectionDetails(false);
            }
        };

        fetchCollectionDetails();
    }, [selectedCollection, collections]);


    const fetchTrendingCollections = useCallback(async () => {
        setIsLoadingTrending(true);
        try {
            const marketplaceContract = new ethers.Contract(NFT_MARKETPLACE_CONTRACT_ADDRESS, NFT_MARKETPLACE_ABI, readOnlyProvider);
    
            // Define time window for "trending" (e.g., last 7 days)
            // Sonic has ~1s block time. 86400 blocks/day.
            const LATEST_BLOCK = await readOnlyProvider.getBlockNumber();
            const BLOCKS_IN_7_DAYS = 7 * 86400; 
            const fromBlock = Math.max(NFT_MARKETPLACE_DEPLOYMENT_BLOCK, LATEST_BLOCK - BLOCKS_IN_7_DAYS);
    
            const soldFilter = marketplaceContract.filters.NFTSold();
            const soldEvents = await marketplaceContract.queryFilter(soldFilter, fromBlock);
    
            const volumeByCollection = new Map<string, bigint>();
    
            for (const event of soldEvents) {
                if ('args' in event) {
                    const { nftContract, pricePaid } = event.args as any;
                    const collectionAddress = nftContract.toLowerCase();
                    const currentVolume = volumeByCollection.get(collectionAddress) || 0n;
                    volumeByCollection.set(collectionAddress, currentVolume + BigInt(pricePaid));
                }
            }
    
            const sortedByVolume = Array.from(volumeByCollection.entries())
                .sort((a, b) => {
                    if (b[1] > a[1]) return 1;
                    if (b[1] < a[1]) return -1;
                    return 0;
                })
                .slice(0, 5); // Get top 5
    
            // Map to TrendingCollection type using existing collections data
            const trending = sortedByVolume.map(([address, volume]) => {
                const collectionInfo = collections.find(c => c.collectionAddress.toLowerCase() === address);
                return collectionInfo ? { ...collectionInfo, volume } : null;
            }).filter((c): c is TrendingCollection => c !== null);
            
            setTrendingCollections(trending);
    
        } catch (e) {
            console.error("Error fetching trending collections:", e);
            // Fallback to placeholder if on-chain fetch fails
            const placeholderTrending = collections.slice(0, 5).map(collection => ({
                ...collection,
                volume: 0n
            }));
            setTrendingCollections(placeholderTrending);
        } finally {
            setIsLoadingTrending(false);
        }
    }, [collections, readOnlyProvider]);
    
    const fetchNftsForCollection = useCallback(async (collectionAddress: string, page: number) => {
        setIsLoadingNfts(true);
        setError(null);
        setNftItems([]);
    
        try {
            const marketplaceContract = new ethers.Contract(NFT_MARKETPLACE_CONTRACT_ADDRESS, NFT_MARKETPLACE_ABI, readOnlyProvider);
            const createListingId = (c: string, t: bigint) => `${c.toLowerCase()}-${t.toString()}`;
    
            const listedFilter = marketplaceContract.filters.NFTListed(collectionAddress);
            const cancelledFilter = marketplaceContract.filters.ListingCancelled(collectionAddress);
            const soldFilter = marketplaceContract.filters.NFTSold(collectionAddress);
    
            const [listedEvents, cancelledEvents, soldEvents] = await Promise.all([
                marketplaceContract.queryFilter(listedFilter, NFT_MARKETPLACE_DEPLOYMENT_BLOCK),
                marketplaceContract.queryFilter(cancelledFilter, NFT_MARKETPLACE_DEPLOYMENT_BLOCK),
                marketplaceContract.queryFilter(soldFilter, NFT_MARKETPLACE_DEPLOYMENT_BLOCK),
            ]);
    
            // Combine and sort events to process them chronologically
            const allEvents = [...listedEvents, ...cancelledEvents, ...soldEvents];
            allEvents.sort((a, b) => {
                if (a.blockNumber !== b.blockNumber) {
                    return a.blockNumber - b.blockNumber;
                }
                return a.transactionIndex - b.transactionIndex;
            });

            const activeListings = new Map<string, Listing>();
            for (const event of allEvents) {
                if (!('args' in event) || !('eventName' in event)) continue;
                
                const { nftContract, tokenId } = event.args as any;
                const listingId = createListingId(nftContract, tokenId);

                if (event.eventName === 'NFTListed') {
                    const { price, seller, paymentToken, quantity, listingType } = event.args as any;
                    activeListings.set(listingId, {
                        assetContract: nftContract, tokenId, pricePerToken: price, listingCreator: seller,
                        currency: paymentToken, quantity, tokenType: listingType, status: 1,
                    });
                } else if (event.eventName === 'ListingCancelled' || event.eventName === 'NFTSold') {
                    activeListings.delete(listingId);
                }
            }
            setListingCount(activeListings.size);
    
            // Step 2: Fetch a paginated list of NFTs from the API as a base
            const metadataResponse = await fetch(`https://api.paintswap.finance/metadata/${collectionAddress}?numToFetch=${NFTS_PER_PAGE}&numToSkip=${page * NFTS_PER_PAGE}`);
            if (!metadataResponse.ok) {
                throw new Error(`Could not fetch NFTs for this collection. Please try again.`);
            }
            const metadataData = await metadataResponse.json();
            if (!metadataData.nfts || !Array.isArray(metadataData.nfts)) {
                throw new Error("Invalid metadata response from PaintSwap.");
            }
            setTotalNfts(metadataData.total);
    
            // Step 3: Create a map of all display items, starting with the API results
            const allItemsMap = new Map<string, NftDisplayItem>();
            metadataData.nfts.forEach((nft: any) => {
                const tokenIdStr = nft.tokenId.toString();
                const listingId = createListingId(collectionAddress, BigInt(nft.tokenId));
                const listing = activeListings.get(listingId);
                
                allItemsMap.set(tokenIdStr, {
                    tokenId: BigInt(nft.tokenId),
                    assetContract: collectionAddress,
                    owner: listing ? listing.listingCreator : nft.owner, // Correct owner display
                    metadata: {
                        name: nft.name || `Token #${nft.tokenId}`,
                        image: resolveUrl(nft.image) || 'https://iili.io/F1cARmG.jpg',
                    },
                    listingInfo: listing ? {
                        pricePerToken: listing.pricePerToken,
                        listingCreator: listing.listingCreator,
                        currency: listing.currency,
                        tokenType: listing.tokenType,
                    } : undefined,
                });
            });
    
            // Step 4: Augment with listed items missed by the API, ensuring they are always added
            const unretrievedListedItemsPromises: Promise<void>[] = [];
            for (const listing of activeListings.values()) {
                const tokenIdStr = listing.tokenId.toString();
                if (!allItemsMap.has(tokenIdStr)) {
                    unretrievedListedItemsPromises.push((async () => {
                        let metadata = {
                            name: `Token #${listing.tokenId}`,
                            image: 'https://iili.io/F1cARmG.jpg',
                        };
                        try {
                            const metadataResponse = await fetch(`https://api.paintswap.finance/metadata/${collectionAddress}/${listing.tokenId}`);
                            if (metadataResponse.ok) {
                                const nft = await metadataResponse.json();
                                metadata.name = nft.name || metadata.name;
                                metadata.image = resolveUrl(nft.image) || metadata.image;
                            }
                        } catch (e) {
                            console.warn(`Failed to fetch metadata for listed item ${tokenIdStr}:`, e);
                        }
                        
                        allItemsMap.set(tokenIdStr, {
                            tokenId: listing.tokenId,
                            assetContract: collectionAddress,
                            owner: listing.listingCreator,
                            metadata: metadata,
                            listingInfo: {
                                pricePerToken: listing.pricePerToken,
                                listingCreator: listing.listingCreator,
                                currency: listing.currency,
                                tokenType: listing.tokenType,
                            },
                        });
                    })());
                }
            }
            
            await Promise.all(unretrievedListedItemsPromises);
    
            // Step 5: Convert map to array and set state. The `filteredAndSortedNfts` hook will handle final display sorting.
            setNftItems(Array.from(allItemsMap.values()));
    
        } catch (e: any) {
            console.error("Error fetching NFTs for collection:", e);
            setError(e.message || "An unexpected error occurred.");
            setTotalNfts(0);
        } finally {
            setIsLoadingNfts(false);
        }
    }, [readOnlyProvider]);

    const fetchMyNftsForCollection = useCallback(async (collectionAddress: string) => {
        if (!selectedAccount) {
            setNftItems([]);
            return;
        }
        setIsLoadingNfts(true);
        setError(null);
        try {
            const marketplaceContract = new ethers.Contract(NFT_MARKETPLACE_CONTRACT_ADDRESS, NFT_MARKETPLACE_ABI, readOnlyProvider);
            const createListingId = (c: string, t: bigint) => `${c.toLowerCase()}-${t.toString()}`;

            const listedFilter = marketplaceContract.filters.NFTListed(collectionAddress);
            const cancelledFilter = marketplaceContract.filters.ListingCancelled(collectionAddress);
            const soldFilter = marketplaceContract.filters.NFTSold(collectionAddress);

            const [listedEvents, cancelledEvents, soldEvents] = await Promise.all([
                marketplaceContract.queryFilter(listedFilter, NFT_MARKETPLACE_DEPLOYMENT_BLOCK),
                marketplaceContract.queryFilter(cancelledFilter, NFT_MARKETPLACE_DEPLOYMENT_BLOCK),
                marketplaceContract.queryFilter(soldFilter, NFT_MARKETPLACE_DEPLOYMENT_BLOCK),
            ]);
            
            // Combine and sort events to process them chronologically
            const allEvents = [...listedEvents, ...cancelledEvents, ...soldEvents];
            allEvents.sort((a, b) => {
                if (a.blockNumber !== b.blockNumber) {
                    return a.blockNumber - b.blockNumber;
                }
                return a.transactionIndex - b.transactionIndex;
            });

            const activeListings = new Map<string, Listing>();
            for (const event of allEvents) {
                if (!('args' in event) || !('eventName' in event)) continue;

                const { nftContract, tokenId } = event.args as any;
                const listingId = createListingId(nftContract, tokenId);

                if (event.eventName === 'NFTListed') {
                    const { price, seller, paymentToken, quantity, listingType } = event.args as any;
                    activeListings.set(listingId, {
                        assetContract: nftContract, tokenId, pricePerToken: price, listingCreator: seller,
                        currency: paymentToken, quantity, tokenType: listingType, status: 1,
                    });
                } else if (event.eventName === 'ListingCancelled' || event.eventName === 'NFTSold') {
                    activeListings.delete(listingId);
                }
            }

            // Step 2: Get NFTs the user has listed from the active listings
            const myListedItemsPromises: Promise<NftDisplayItem>[] = [];
            for (const listing of activeListings.values()) {
                if (listing.listingCreator.toLowerCase() === selectedAccount.toLowerCase()) {
                    myListedItemsPromises.push((async () => {
                        const metadataResponse = await fetch(`https://api.paintswap.finance/metadata/${collectionAddress}/${listing.tokenId}`);
                        const nft = await metadataResponse.json();
                        return {
                            tokenId: listing.tokenId,
                            assetContract: collectionAddress,
                            owner: selectedAccount,
                            metadata: {
                                name: nft.name || `Token #${listing.tokenId}`,
                                image: resolveUrl(nft.image) || 'https://iili.io/F1cARmG.jpg',
                            },
                            listingInfo: {
                                pricePerToken: listing.pricePerToken,
                                listingCreator: listing.listingCreator,
                                currency: listing.currency,
                                tokenType: listing.tokenType,
                            },
                        };
                    })());
                }
            }
            
            // Step 3: Get NFTs the user currently owns (unlisted) from PaintSwap API
            const response = await fetch(`https://api.paintswap.finance/userNFTs/?user=${selectedAccount}`);
            if (!response.ok) throw new Error(`Could not fetch your NFTs.`);
            const data = await response.json();
            if (!data.nfts || !Array.isArray(data.nfts)) throw new Error("Invalid response from PaintSwap.");

            const myUnlistedNfts = data.nfts
                .filter((nft: any) => nft.address.toLowerCase() === collectionAddress.toLowerCase())
                .map((nft: any): NftDisplayItem => ({
                    tokenId: BigInt(nft.tokenId),
                    assetContract: collectionAddress,
                    owner: selectedAccount,
                    metadata: {
                        name: nft.nft?.name || `Token #${nft.tokenId}`,
                        image: resolveUrl(nft.nft?.image) || 'https://iili.io/F1cARmG.jpg',
                    },
                    listingInfo: undefined,
                }));

            // Step 4: Combine and de-duplicate
            const myListedItems = await Promise.all(myListedItemsPromises);
            const allMyItemsMap = new Map<string, NftDisplayItem>();

            myUnlistedNfts.forEach(item => allMyItemsMap.set(item.tokenId.toString(), item));
            myListedItems.forEach(item => allMyItemsMap.set(item.tokenId.toString(), item));
            
            const finalItems = Array.from(allMyItemsMap.values());
            
            setNftItems(finalItems);
            setTotalNfts(finalItems.length);

        } catch (e: any) {
            console.error("Error fetching user's NFTs:", e);
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setIsLoadingNfts(false);
        }
    }, [selectedAccount, readOnlyProvider]);

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

    useEffect(() => {
        if (!isLoadingCollections && collections.length > 0) {
            fetchTrendingCollections();
        }
    }, [collections, isLoadingCollections, fetchTrendingCollections]);

    useEffect(() => {
        if (preselectedFilters?.collection) {
            handleCollectionSelect(preselectedFilters.collection);
            if (clearPreselectedFilters) {
                clearPreselectedFilters();
            }
        }
    }, [preselectedFilters, handleCollectionSelect, clearPreselectedFilters]);

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

    useEffect(() => {
        const checkApproval = async () => {
            if ((nftForListing || bulkActionType === 'list') && selectedAccount && signer && selectedCollection) {
                const nftContract = new ethers.Contract(selectedCollection, ERC721_ABI, signer);
                const approved = await nftContract.isApprovedForAll(selectedAccount, NFT_MARKETPLACE_CONTRACT_ADDRESS);
                setIsApproved(approved);
            }
        };
        checkApproval();
    }, [nftForListing, bulkActionType, selectedAccount, signer, selectedCollection]);

    const handleTx = async (action: () => Promise<any>, actionName: string, successCallback?: () => void) => {
        const setters: Record<string, React.Dispatch<React.SetStateAction<boolean>>> = {
            'buy': setIsBuying, 'approve': setIsApproving,
            'delist': setIsDelisting, 'transfer': setIsTransferring, 'burn': setIsBurning,
            'updatePrice': setIsUpdatingPrice, 'pause': setIsUpdatingPause
        };
        const setter = setters[actionName] || ((val: boolean) => {});
        
        setter(true);
        setError(null);
        try {
            const tx = await action();
            await tx.wait();
            successCallback?.();
            if (selectedCollection) {
                if(activeTab === 'browse') {
                   await fetchNftsForCollection(selectedCollection, currentPage);
                } else {
                   await fetchMyNftsForCollection(selectedCollection);
                }
            }
        } catch (e: any) {
            console.error(`${actionName} failed:`, e);
            const reason = e.reason || e.message || `Failed to ${actionName}.`;
            setError(reason.length > 100 ? reason.substring(0, 100) + '...' : reason);
        } finally {
            setter(false);
        }
    };
    
    const handleBuy = async (listing: Listing) => {
        if (!signer || !selectedAccount) {
            setError("Please connect your wallet to purchase an item.");
            return;
        }

        setIsBuying(true);
        setError(null);
        console.log("Initiating purchase for NFT:", listing);

        try {
            const marketplace = new ethers.Contract(NFT_MARKETPLACE_CONTRACT_ADDRESS, NFT_MARKETPLACE_ABI, signer);
            
            // --- STEP 1: Fetch listing details to determine the price and payment token ---
            console.log("Fetching latest listing details from the contract...");
            const currentListing = await marketplace.listings(listing.assetContract, listing.tokenId);

            if (!currentListing.isListed) {
                throw new Error("This item is no longer available for sale.");
            }
            
            const quantityToBuy = 1n; // UI supports buying 1 at a time
            if (currentListing.quantity < quantityToBuy) {
                throw new Error(`Only ${currentListing.quantity} available, but trying to buy ${quantityToBuy}.`);
            }

            const pricePerItem = currentListing.price;
            const paymentToken = currentListing.paymentToken;
            const totalPrice = pricePerItem * quantityToBuy;

            console.log(`Listing found: Price per item: ${ethers.formatEther(pricePerItem)}, Payment Token: ${paymentToken}, Total Price: ${ethers.formatEther(totalPrice)}`);

            // --- STEP 2: Handle payment based on paymentToken ---
            let tx;
            const isNativePayment = paymentToken === ethers.ZeroAddress;

            if (isNativePayment) {
                // Native currency (e.g., S) payment
                console.log(`Paying with native currency. Sending ${ethers.formatEther(totalPrice)} ${SONIC_NETWORK.nativeCurrency.symbol}.`);
                const balance = await readOnlyProvider.getBalance(selectedAccount);
                if(balance < totalPrice) {
                    throw new Error("You have insufficient funds for this purchase and gas fees.");
                }
                
                console.log("Calling buyItem on the marketplace with native currency...");
                tx = await marketplace.buyItem(listing.assetContract, listing.tokenId, quantityToBuy, { 
                    value: totalPrice,
                });

            } else {
                // ERC20 token payment
                console.log(`Paying with ERC-20 token: ${paymentToken}. Checking approval...`);
                const erc20Contract = new ethers.Contract(paymentToken, ERC20_ABI, signer);
                const balance = await erc20Contract.balanceOf(selectedAccount);

                if (balance < totalPrice) {
                    throw new Error("Insufficient token balance for this purchase.");
                }

                // Check allowance
                const allowance = await erc20Contract.allowance(selectedAccount, NFT_MARKETPLACE_CONTRACT_ADDRESS);
                if (allowance < totalPrice) {
                    console.log(`Marketplace not approved for ${ethers.formatUnits(totalPrice, 18)} tokens. Requesting approval...`);
                    // Approve spending
                    const approveTx = await erc20Contract.approve(NFT_MARKETPLACE_CONTRACT_ADDRESS, totalPrice);
                    console.log("ERC-20 approval transaction sent. Waiting for confirmation...");
                    await approveTx.wait();
                    console.log("Approval confirmed.");
                } else {
                     console.log("Marketplace is already approved to spend the required tokens.");
                }
                
                console.log("Calling buyItem on the marketplace for an ERC-20 purchase...");
                // Buy item (no `value` needed for ERC-20 purchases)
                tx = await marketplace.buyItem(listing.assetContract, listing.tokenId, quantityToBuy);
            }

            console.log("NFT Buy transaction sent:", tx.hash, "Waiting for confirmation...");
            await tx.wait();
            console.log("Transaction confirmed!");

            // --- STEP 4: Success ---
            setSelectedNftForDetail(null); // Close the modal
            // Refetch data to show updated state
            if (selectedCollection) {
                if(activeTab === 'browse') {
                   await fetchNftsForCollection(selectedCollection, currentPage);
                } else {
                   await fetchMyNftsForCollection(selectedCollection);
                }
            }

        } catch (e: any) {
            console.error("Error buying NFT:", e);
            // More specific error handling
            let message = e.reason || e.message || "An unknown error occurred.";
            if (e.code === 'ACTION_REJECTED') {
                message = "Transaction rejected in your wallet.";
            } else if (message.includes("InsufficientFunds")) {
                message = "You have insufficient funds for this purchase.";
            } else if (message.includes("ERC20ApprovalFailed")) {
                 message = "Failed to get approval for token spending.";
            } else if (message.includes("ListingNotFound")) {
                 message = "This item is no longer listed for sale.";
            }
            
            setError(message.length > 150 ? message.substring(0, 150) + '...' : message);
            
            // In case of failure, always refresh data to show the real current state
            if (selectedCollection) {
                try {
                    if(activeTab === 'browse') {
                        await fetchNftsForCollection(selectedCollection, currentPage);
                    } else {
                        await fetchMyNftsForCollection(selectedCollection);
                    }
                } catch (refreshError) {
                    console.error("Failed to refresh data after error:", refreshError);
                }
            }

        } finally {
            setIsBuying(false);
        }
    };


    const handleApprove = async () => {
        if (!signer || (!nftForListing && bulkActionType !== 'list') || !selectedCollection) return;
        const nftContract = new ethers.Contract(selectedCollection, ERC721_ABI, signer);
        await handleTx(
            () => nftContract.setApprovalForAll(NFT_MARKETPLACE_CONTRACT_ADDRESS, true),
            'approve',
            () => setIsApproved(true)
        );
    };

    const handleList = async () => {
        if (!signer || !nftForListing || !listPrice || parseFloat(listPrice) <= 0 || !selectedAccount) return;

        setIsListing(true);
        setError(null);

        try {
            // Pre-flight check: Verify ownership on-chain to prevent errors with stale data
            const nftContract = new ethers.Contract(nftForListing.assetContract, ERC721_ABI, readOnlyProvider);
            const owner = await nftContract.ownerOf(nftForListing.tokenId);
            if (owner.toLowerCase() !== selectedAccount.toLowerCase()) {
                setError("You are not the owner of this NFT. Please refresh your list.");
                setIsListing(false);
                return;
            }

            const marketplace = new ethers.Contract(NFT_MARKETPLACE_CONTRACT_ADDRESS, NFT_MARKETPLACE_ABI, signer);
            const priceWei = ethers.parseEther(listPrice);
            
            const tx = await marketplace.listNFT(nftForListing.assetContract, nftForListing.tokenId, priceWei, ethers.ZeroAddress, 1n, ListingType.FixedPrice);
            await tx.wait();
            
            setNftForListing(null); // Close modal on success
            setListPrice(''); // Clear price field
            
            // Refresh data to show the new listing
            if (selectedCollection) {
                if (activeTab === 'browse') {
                    await fetchNftsForCollection(selectedCollection, currentPage);
                } else {
                    await fetchMyNftsForCollection(selectedCollection);
                }
            }
        } catch (e: any) {
            console.error("Listing failed:", e);
            const reason = e.reason || e.message || "Failed to list item.";
            setError(reason.length > 100 ? reason.substring(0, 100) + '...' : reason);
        } finally {
            setIsListing(false);
        }
    };

    const handleUpdateListingPrice = async () => {
        if (!signer || !nftForPriceUpdate || !newPrice || parseFloat(newPrice) <= 0) return;
        const marketplace = new ethers.Contract(NFT_MARKETPLACE_CONTRACT_ADDRESS, NFT_MARKETPLACE_ABI, signer);
        await handleTx(
            () => marketplace.updateListingPrice(
                nftForPriceUpdate.assetContract,
                nftForPriceUpdate.tokenId,
                ethers.parseEther(newPrice)
            ),
            'updatePrice',
            () => { setNftForPriceUpdate(null); setNewPrice(''); }
        );
    };

    const handleDelist = async (itemToDelist: NftDisplayItem) => {
        if (!signer || !itemToDelist.listingInfo) return;
        const marketplace = new ethers.Contract(NFT_MARKETPLACE_CONTRACT_ADDRESS, NFT_MARKETPLACE_ABI, signer);
        await handleTx(
            () => marketplace.cancelListing(itemToDelist.assetContract, itemToDelist.tokenId),
            'delist',
            () => { setSelectedNftForDetail(null); setNftForDelist(null); }
        );
    };

    const handleTransfer = async () => {
        if (!signer || !nftForTransfer || !ethers.isAddress(transferAddress)) return;
        const nftContract = new ethers.Contract(nftForTransfer.assetContract, ERC721_ABI, signer);
        await handleTx(
            () => nftContract.transferFrom(selectedAccount, transferAddress, nftForTransfer.tokenId),
            'transfer',
            () => setNftForTransfer(null)
        );
    };
    
    const handleBurn = async () => {
        if (!signer || !nftForBurn) return;
        const nftContract = new ethers.Contract(nftForBurn.assetContract, ERC721_ABI, signer);
        await handleTx(
            () => nftContract.burn(nftForBurn.tokenId),
            'burn',
            () => setNftForBurn(null)
        );
    };

    // --- Admin Actions ---
    const handlePauseToggle = async (type: 'marketplace' | 'collection', collectionAddress?: string) => {
        if (!signer || !isAdmin) return;

        const marketplace = new ethers.Contract(NFT_MARKETPLACE_CONTRACT_ADDRESS, NFT_MARKETPLACE_ABI, signer);
        let action;

        if (type === 'marketplace') {
            action = isMarketplacePaused ? () => marketplace.unpause() : () => marketplace.pause();
        } else if (type === 'collection' && collectionAddress) {
            action = isCollectionPaused ? () => marketplace.unpauseCollection(collectionAddress) : () => marketplace.pauseCollection(collectionAddress);
        } else {
            return;
        }

        await handleTx(action, 'pause', () => {
            if (type === 'marketplace') setIsMarketplacePaused(!isMarketplacePaused);
            if (type === 'collection') setIsCollectionPaused(!isCollectionPaused);
        });
    };

    
    // --- Bulk Action Handlers ---
    const handleBulkList = async () => {
        if (!signer || !bulkListPrice || parseFloat(bulkListPrice) <= 0 || !selectedCollection) return;

        const unlistedItems = Array.from(selectedNfts)
            .map(id => nftItems.find(item => item.tokenId.toString() === id))
            .filter((item): item is NftDisplayItem => !!item && !item.listingInfo);

        if (unlistedItems.length === 0) {
            setError("All selected NFTs are already listed. No action was taken.");
            closeBulkModal();
            setSelectedNfts(new Set());
            return;
        }

        setIsProcessingBulk(true);
        setProcessingState({ processed: 0, total: 1, errors: [] });

        try {
            const marketplace = new ethers.Contract(NFT_MARKETPLACE_CONTRACT_ADDRESS, NFT_MARKETPLACE_ABI, signer);
            const priceWei = ethers.parseEther(bulkListPrice);
            
            const nftContracts = unlistedItems.map(item => item.assetContract);
            const tokenIds = unlistedItems.map(item => item.tokenId);
            
            const tx = await marketplace.bulkListNFTs(
                nftContracts,
                tokenIds,
                priceWei,
                ethers.ZeroAddress,
                ListingType.FixedPrice
            );
            
            setProcessingState(prev => prev ? ({ ...prev, processed: 1 }) : prev);
            await tx.wait();

        } catch (e: any) {
            console.error("Bulk listing failed:", e);
            const reason = e.reason || e.message || "Bulk listing failed. Please ensure all items are unlisted and you have approved the collection.";
            setError(reason);
            setProcessingState(prev => prev ? ({ ...prev, errors: [...prev.errors, reason] }) : { processed: 0, total: 1, errors: [reason] });
        } finally {
            setIsProcessingBulk(false);
            if (selectedCollection) {
                await (activeTab === 'browse' ? fetchNftsForCollection(selectedCollection, currentPage) : fetchMyNftsForCollection(selectedCollection));
            }
            setSelectedNfts(new Set());
        }
    };

    const handleBulkDelist = async () => {
        if (!signer || !selectedCollection) return;
        setIsProcessingBulk(true);
        const itemsToDelist = Array.from(selectedNfts).map(id => nftItems.find(item => item.tokenId.toString() === id)).filter(item => item && item.listingInfo);
        setProcessingState({ processed: 0, total: itemsToDelist.length, errors: [] });
        
        try {
            const marketplace = new ethers.Contract(NFT_MARKETPLACE_CONTRACT_ADDRESS, NFT_MARKETPLACE_ABI, signer);
            for (const [index, item] of itemsToDelist.entries()) {
                 if (!item) continue;
                try {
                    const tx = await marketplace.cancelListing(item.assetContract, item.tokenId);
                    await tx.wait();
                } catch (e: any) {
                    const reason = e.reason || e.message || `Failed to delist item #${item.tokenId}`;
                    setProcessingState(prev => prev ? ({ ...prev, errors: [...prev.errors, reason] }) : prev);
                }
                setProcessingState(prev => prev ? ({ ...prev, processed: index + 1 }) : prev);
            }
        } catch(e: any) {
            setError(e.message || "An unexpected error occurred during bulk delist.");
        } finally {
            setIsProcessingBulk(false);
            if (selectedCollection) {
               await (activeTab === 'browse' ? fetchNftsForCollection(selectedCollection, currentPage) : fetchMyNftsForCollection(selectedCollection));
            }
            setSelectedNfts(new Set());
        }
    };
    
    const handleBulkTransfer = async () => {
        if (!signer || !selectedCollection || !ethers.isAddress(bulkTransferAddress)) { setError("Invalid address"); return; }
        
        setIsProcessingBulk(true);
        setProcessingState({ processed: 0, total: 1, errors: [] });
        
        try {
            const marketplace = new ethers.Contract(NFT_MARKETPLACE_CONTRACT_ADDRESS, NFT_MARKETPLACE_ABI, signer);
            const tokenIds = Array.from(selectedNfts).map(id => BigInt(id));
            const contracts = Array(tokenIds.length).fill(selectedCollection);
            const receivers = Array(tokenIds.length).fill(bulkTransferAddress);
            const quantities = Array(tokenIds.length).fill(1n);
            const types = Array(tokenIds.length).fill(0);

            const tx = await marketplace.bulkSendNFTs(contracts, tokenIds, receivers, quantities, types);
            await tx.wait();
            setProcessingState(prev => prev ? { ...prev, processed: 1 } : prev);
        } catch (e: any) {
            const reason = e.reason || e.message || "Bulk transfer failed.";
            setError(reason);
            setProcessingState(prev => prev ? ({ ...prev, errors: [reason] }) : prev);
        } finally {
            setIsProcessingBulk(false);
            if (selectedCollection) {
               await (activeTab === 'browse' ? fetchNftsForCollection(selectedCollection, currentPage) : fetchMyNftsForCollection(selectedCollection));
            }
            setSelectedNfts(new Set());
        }
    };
    
    const handleBulkBurn = async () => {
        if (!signer || !selectedCollection) return;
        
        setIsProcessingBulk(true);
        setProcessingState({ processed: 0, total: 1, errors: [] });

        try {
            const marketplace = new ethers.Contract(NFT_MARKETPLACE_CONTRACT_ADDRESS, NFT_MARKETPLACE_ABI, signer);
            const tokenIds = Array.from(selectedNfts).map(id => BigInt(id));
            const contracts = Array(tokenIds.length).fill(selectedCollection);
            const quantities = Array(tokenIds.length).fill(1n);
            const types = Array(tokenIds.length).fill(0);

            const tx = await marketplace.bulkBurnNFTs(contracts, tokenIds, quantities, types);
            await tx.wait();
            setProcessingState(prev => prev ? { ...prev, processed: 1 } : prev);
        } catch (e: any) {
             const reason = e.reason || e.message || "Bulk burn failed.";
             setError(reason);
             setProcessingState(prev => prev ? ({ ...prev, errors: [reason] }) : prev);
        } finally {
            setIsProcessingBulk(false);
            if (selectedCollection) {
               await (activeTab === 'browse' ? fetchNftsForCollection(selectedCollection, currentPage) : fetchMyNftsForCollection(selectedCollection));
            }
            setSelectedNfts(new Set());
        }
    };

    const toggleSelectNft = (tokenId: bigint) => {
        const idStr = tokenId.toString();
        const newSet = new Set(selectedNfts);
        if (newSet.has(idStr)) newSet.delete(idStr);
        else newSet.add(idStr);
        setSelectedNfts(newSet);
    };

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
    
    if (isLoadingCollections) {
        return <div className="flex justify-center items-center h-64"><Spinner size="h-12 w-12"/></div>;
    }

    const AdminMarketplaceBar = () => {
        if (!isAdmin || selectedCollection) return null;
        return (
            <div className="w-full bg-yellow-900/50 border border-yellow-700 rounded-lg p-3 mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <span className="font-bold text-yellow-200">Admin Controls</span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isMarketplacePaused ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                        Marketplace is {isMarketplacePaused ? 'Paused' : 'Active'}
                    </span>
                </div>
                <button
                    onClick={() => handlePauseToggle('marketplace')}
                    disabled={isUpdatingPause}
                    className={`font-bold py-2 px-4 rounded-md text-sm text-white ${isMarketplacePaused ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} disabled:bg-gray-500`}
                >
                    {isUpdatingPause ? <Spinner size="h-4 w-4" /> : (isMarketplacePaused ? 'Unpause Marketplace' : 'Pause Marketplace')}
                </button>
            </div>
        );
    };

    if (!selectedCollection) {
        return (
            <div className="w-full max-w-7xl">
                 <AdminMarketplaceBar />
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

    return (
        <div className="w-full">
            <button onClick={() => { setSelectedCollection(null); setSelectedNfts(new Set()); }} className="text-green-300 hover:text-green-100 mb-4">&larr; Back to Collections</button>
            
            {isLoadingCollectionDetails ? (
                <div className="flex justify-center items-center h-48"><Spinner size="h-12 w-12"/></div>
            ) : extendedCollectionInfo && (
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
                                <a href={`${SONIC_NETWORK.blockExplorerUrls[0]}/address/${selectedCollection}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-green-700/50 hover:bg-green-700 text-green-300 transition-colors" title="View on Explorer">
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

export default LlamasMarketplace;