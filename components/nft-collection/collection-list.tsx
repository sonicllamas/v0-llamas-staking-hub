"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { NFTCollection } from "@/types/nft"
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import { ScrollAnimation } from "@/components/scroll-animation"

export function CollectionList() {
  const [collections, setCollections] = useState<NFTCollection[]>([])
  const [filteredCollections, setFilteredCollections] = useState<NFTCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(9)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const loadCollections = async () => {
      setLoading(true)
      try {
        // Directly use the provided collections data
        const apiResponse = {
          collections: [
            {
              id: "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e",
              createdAt: "2025-05-01T10:00:00.000Z",
              updatedAt: "2025-05-20T15:30:00.000Z",
              address: "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e",
              owner: "0xd6d8bd42e87f44fad9e14f8828d3853409df6766",
              name: "Sonic Llamas",
              description:
                "A collection of unique Sonic Llamas on the Sonic network. Each Llama has its own personality and traits, making them perfect companions for your digital adventures.",
              nsfw: false,
              mintPriceLow: 0,
              mintPriceHigh: 0,
              verified: true,
              startBlock: 23000000,
              path: "sonic-llamas",
              website: "https://sonicllamas.io",
              twitter: "@SonicLlamas",
              discord: "https://discord.gg/sonicllamas",
              medium: "",
              telegram: "@SonicLlamas",
              reddit: "",
              poster: "/llama-banner.png",
              banner: "/llama-banner.png",
              thumbnail: "/llama-logo.jpg",
              marketing: "/llama-logo.jpg",
              standard: "721",
              featured: true,
              displayed: true,
              imageStyle: "cover",
              customMetadata: null,
              isFnft: false,
              isInFnftMarketplace: false,
              isReveal: false,
              isSkipRank: false,
              isDynamicMetadata: false,
              isDynamicMedia: false,
              chainId: 146,
              stats: {
                id: "0x0dcbf9741bbc21b7696ca73f5f87731c9a3d303e",
                name: "Sonic Llamas",
                symbol: "LLAMA",
                collectionCreationOrder: 1,
                startBlock: "23000000",
                isWhitelisted: true,
                numTradesLast7Days: "156",
                numTradesLast24Hours: "32",
                createdTimestamp: "1746000000",
                totalMinted: "10000",
                floor: "150000000000000000000",
                floorCap: "1500000000000000000000000",
                lowestPrice: "150000000000000000000",
                highestPrice: "5000000000000000000000",
                numOwners: "3500",
                totalTrades: "4250",
                lastSellPrice: "175000000000000000000",
                totalNFTs: "10000",
                highestSale: "4500000000000000000000",
                totalVolumeTraded: "750000000000000000000000",
                volumeLast24Hours: "5000000000000000000000",
                volumeLast7Days: "35000000000000000000000",
                activeSales: "250",
                activeSalesNonAuction: "245",
                timestampLastSale: "1747925000",
                timestampLastTrim: "1747925100",
              },
              tracked: true,
              meta: true,
              isWhitelisted: true,
            },
            {
              id: "0x0dd93c18b9c4247265fafe1c99cec247186a2e03",
              createdAt: "2025-05-15T09:15:25.630Z",
              updatedAt: "2025-05-15T16:07:46.903Z",
              address: "0x0dd93c18b9c4247265fafe1c99cec247186a2e03",
              owner: "0xd6d8bd42e87f44fad9e14f8828d3853409df6766",
              name: "Sonic Shards",
              description: "If you know, you know.",
              nsfw: false,
              mintPriceLow: 0,
              mintPriceHigh: 0,
              verified: true,
              startBlock: 23767924,
              path: "sonic-shards",
              website: "https://shards.soniclabs.com/",
              twitter: "@SonicLabs",
              discord: "https://discord.gg/3Ynr2QDSnB",
              medium: "",
              telegram: "@Sonic_English",
              reddit: "",
              poster: "https://media-paint.paintswap.finance/0x0dd93c18b9c4247265fafe1c99cec247186a2e03_poster.jpg",
              banner: "https://media-paint.paintswap.finance/0x0dd93c18b9c4247265fafe1c99cec247186a2e03_banner.jpg",
              thumbnail:
                "https://media-paint.paintswap.finance/0x0dd93c18b9c4247265fafe1c99cec247186a2e03_thumb_v3.png",
              marketing:
                "https://media-paint.paintswap.finance/0x0dd93c18b9c4247265fafe1c99cec247186a2e03_marketing.png",
              standard: "721",
              featured: true,
              displayed: true,
              imageStyle: "cover",
              customMetadata: null,
              isFnft: false,
              isInFnftMarketplace: false,
              isReveal: false,
              isSkipRank: true,
              isDynamicMetadata: false,
              isDynamicMedia: false,
              chainId: 146,
              stats: {
                id: "0x0dd93c18b9c4247265fafe1c99cec247186a2e03",
                name: "Sonic Shards",
                symbol: "SHARDS",
                collectionCreationOrder: 209,
                startBlock: "23767925",
                isWhitelisted: true,
                numTradesLast7Days: "2235",
                numTradesLast24Hours: "83",
                createdTimestamp: "1746185291",
                totalMinted: "32110",
                floor: "82000000000000000000",
                floorCap: "2632774000000000000000000",
                lowestPrice: "82000000000000000000",
                highestPrice: "1000000000000000000000000",
                numOwners: "30496",
                totalTrades: "2235",
                lastSellPrice: "83400000000000000000",
                totalNFTs: "32110",
                highestSale: "988000000000000000000",
                totalVolumeTraded: "251785971000000000000000",
                volumeLast24Hours: "6975490000000000000000",
                volumeLast7Days: "251785971000000000000000",
                activeSales: "931",
                activeSalesNonAuction: "923",
                timestampLastSale: "1747924704",
                timestampLastTrim: "1747924704",
              },
              tracked: true,
              meta: true,
              isWhitelisted: true,
            },
            {
              id: "0xaa30f0977620d4d46b3bb3cf0794fe645d576ca3",
              createdAt: "2025-01-17T16:08:25.737Z",
              updatedAt: "2025-01-19T15:11:12.473Z",
              address: "0xaa30f0977620d4d46b3bb3cf0794fe645d576ca3",
              owner: "0xadb5a1518713095c39dbca08da6656af7249dd20",
              name: "SwapX | Voting Power Collection",
              description:
                "Use veSWPx to join the SwapX voting system!<br>Earn weekly voting incentives and swap fees from your favorite pools—forever.<br>",
              nsfw: false,
              mintPriceLow: 0,
              mintPriceHigh: 0,
              verified: true,
              startBlock: 1470036,
              path: "swapx-%7C-voting-power-collection",
              website: "https://swapx.fi",
              twitter: "swapxfi",
              discord: "http://discord.com/invite/yXU4HMsp6P",
              medium: "https://medium.com/@swapxfi",
              telegram: "http://@swapxfi",
              reddit: "",
              poster:
                "https://media-paint.paintswap.finance/0xaa30f0977620d4d46b3bb3cf0794fe645d576ca3-146-1737129788_poster.jpg",
              banner:
                "https://media-paint.paintswap.finance/0xaa30f0977620d4d46b3bb3cf0794fe645d576ca3-146-1737129788-v2_banner.jpg",
              thumbnail:
                "https://media-paint.paintswap.finance/0xaa30f0977620d4d46b3bb3cf0794fe645d576ca3-146-1737129788_thumb.png",
              marketing:
                "https://media-paint.paintswap.finance/0xaa30f0977620d4d46b3bb3cf0794fe645d576ca3-146-1737129788_marketing.png",
              standard: "721",
              featured: true,
              displayed: true,
              imageStyle: "contain",
              customMetadata: null,
              isFnft: false,
              isInFnftMarketplace: false,
              isReveal: false,
              isSkipRank: false,
              isDynamicMetadata: false,
              isDynamicMedia: false,
              chainId: 146,
              stats: {
                id: "0xaa30f0977620d4d46b3bb3cf0794fe645d576ca3",
                name: "veSwapX",
                symbol: "veSWPx",
                collectionCreationOrder: 54,
                startBlock: "1470036",
                isWhitelisted: true,
                numTradesLast7Days: "107",
                numTradesLast24Hours: "19",
                createdTimestamp: "1735050536",
                totalMinted: "40900",
                floor: "1000000000000000000",
                floorCap: "13641000000000000000000",
                lowestPrice: "2000000000000000000",
                highestPrice: "58000000000000000000000",
                numOwners: "7970",
                totalTrades: "991",
                lastSellPrice: "230000000000000000000",
                totalNFTs: "13645",
                highestSale: "49750000000000000000000",
                totalVolumeTraded: "940342191680000000000000",
                volumeLast24Hours: "53514500000000000000000",
                volumeLast7Days: "129099182630000000000000",
                activeSales: "23",
                activeSalesNonAuction: "23",
                timestampLastSale: "1747907575",
                timestampLastTrim: "1747925087",
              },
              tracked: true,
              meta: true,
              isWhitelisted: true,
            },
            {
              id: "0x8500d84b203775fc8b418148223872b35c43b050",
              createdAt: "2024-12-23T20:58:26.856Z",
              updatedAt: "2024-12-23T20:58:26.856Z",
              address: "0x8500d84b203775fc8b418148223872b35c43b050",
              owner: "0x8de3c3891268502f77db7e876d727257dec0f852",
              name: "Derps",
              description: "I caught the derpes.",
              nsfw: false,
              mintPriceLow: 0,
              mintPriceHigh: 0,
              verified: true,
              startBlock: 527907,
              path: "derps",
              website: "https://derpe.xyz",
              twitter: "@derpedewdz",
              discord: "https://discord.gg/3BUen4F9Tw",
              medium: "",
              telegram: "@derpedewdz",
              reddit: "",
              poster:
                "https://media-paint.paintswap.finance/0x8500d84b203775fc8b418148223872b35c43b050-146-1734986837_poster.jpg",
              banner:
                "https://media-paint.paintswap.finance/0x8500d84b203775fc8b418148223872b35c43b050-146-1734986837_banner.jpg",
              thumbnail:
                "https://media-paint.paintswap.finance/0x8500d84b203775fc8b418148223872b35c43b050-146-1734986837_thumb.png",
              marketing:
                "https://media-paint.paintswap.finance/0x8500d84b203775fc8b418148223872b35c43b050-146-1734986837_marketing.png",
              standard: "721",
              featured: true,
              displayed: true,
              imageStyle: "contain",
              customMetadata: null,
              isFnft: false,
              isInFnftMarketplace: false,
              isReveal: false,
              isSkipRank: false,
              isDynamicMetadata: false,
              isDynamicMedia: false,
              chainId: 146,
              stats: {
                id: "0x8500d84b203775fc8b418148223872b35c43b050",
                name: "The Derps",
                symbol: "DERPS",
                collectionCreationOrder: 4,
                startBlock: "528091",
                isWhitelisted: true,
                numTradesLast7Days: "29",
                numTradesLast24Hours: "5",
                createdTimestamp: "1734470896",
                totalMinted: "2000",
                floor: "1504000000000000000000",
                floorCap: "3008000000000000000000000",
                lowestPrice: "1504000000000000000000",
                highestPrice: "1000000000000000000000000",
                numOwners: "1332",
                totalTrades: "2348",
                lastSellPrice: "1500000000000000000000",
                totalNFTs: "2000",
                highestSale: "15000000000000000000000",
                totalVolumeTraded: "3599485123400000000000000",
                volumeLast24Hours: "7944000000000000000000",
                volumeLast7Days: "47228030000000000000000",
                activeSales: "103",
                activeSalesNonAuction: "103",
                timestampLastSale: "1747916766",
                timestampLastTrim: "1747916766",
              },
              tracked: true,
              meta: true,
              isWhitelisted: true,
            },
            {
              id: "0xc83f364827b9f0d7b27a9c48b2419e4a14e72f78",
              createdAt: "2025-01-04T07:19:22.188Z",
              updatedAt: "2025-01-04T08:47:23.852Z",
              address: "0xc83f364827b9f0d7b27a9c48b2419e4a14e72f78",
              owner: "0x83943a422b5ec0be815ca5c9adc4a39a00097920",
              name: "SwapX xNFT | Founders Collection",
              description:
                "Unlock DeFi's Future with SwapX XNFTs founder collection on Sonic Blockchain! Limited to 3,000, these NFTs offer revenue sharing of SwapX and exclusive opportunities. 🚀  👉 Learn more: linktr.ee/swapxfi",
              nsfw: false,
              mintPriceLow: 0,
              mintPriceHigh: 0,
              verified: true,
              startBlock: 1471635,
              path: "swapx",
              website: "http://swapx.fi/",
              twitter: "@swapxfi",
              discord: "http://discord.com/invite/yXU4HMsp6P",
              medium: "http://discord.com/invite/yXU4HMsp6P",
              telegram: "http://t.me/swapxfi",
              reddit: "",
              poster:
                "https://media-paint.paintswap.finance/0xc83f364827b9f0d7b27a9c48b2419e4a14e72f78-146-1735942291_poster.jpg",
              banner:
                "https://media-paint.paintswap.finance/0xc83f364827b9f0d7b27a9c48b2419e4a14e72f78-146-1735942291_banner.jpg",
              thumbnail:
                "https://media-paint.paintswap.finance/0xc83f364827b9f0d7b27a9c48b2419e4a14e72f78-146-1735942291_thumb.png",
              marketing:
                "https://media-paint.paintswap.finance/0xc83f364827b9f0d7b27a9c48b2419e4a14e72f78-146-1735942291_marketing.png",
              standard: "721",
              featured: true,
              displayed: true,
              imageStyle: "contain",
              customMetadata: null,
              isFnft: false,
              isInFnftMarketplace: false,
              isReveal: false,
              isSkipRank: false,
              isDynamicMetadata: false,
              isDynamicMedia: false,
              chainId: 146,
              stats: {
                id: "0xc83f364827b9f0d7b27a9c48b2419e4a14e72f78",
                name: "SwapX Founders NFTs",
                symbol: "xNFT",
                collectionCreationOrder: 32,
                startBlock: "2276870",
                isWhitelisted: true,
                numTradesLast7Days: "16",
                numTradesLast24Hours: "1",
                createdTimestamp: "1735839389",
                totalMinted: "2989",
                floor: "2240000000000000000000",
                floorCap: "6695360000000000000000000",
                lowestPrice: "2240000000000000000000",
                highestPrice: "20000000000000000000000",
                numOwners: "590",
                totalTrades: "588",
                lastSellPrice: "4900000000000000000000",
                totalNFTs: "2989",
                highestSale: "19500000000000000000000",
                totalVolumeTraded: "1653501568200000000000000",
                volumeLast24Hours: "4900000000000000000000",
                volumeLast7Days: "37165000000000000000000",
                activeSales: "7",
                activeSalesNonAuction: "7",
                timestampLastSale: "1747859284",
                timestampLastTrim: "1747893850",
              },
              tracked: true,
              meta: true,
              isWhitelisted: true,
            },
            {
              id: "0x382e0867853c7da57b9f7e93b31458a217ec44a6",
              createdAt: "2025-03-07T19:50:22.585Z",
              updatedAt: "2025-03-24T10:08:03.030Z",
              address: "0x382e0867853c7da57b9f7e93b31458a217ec44a6",
              owner: "0x6cde3e2a3f66c916d26d3f3a2ee2e389e903b2b1",
              name: "Petroleum Plot",
              description: "Plots are filled with $OIL ! <br><br>Extract it and become the best Petroleum Tycoon ! ",
              nsfw: false,
              mintPriceLow: 0,
              mintPriceHigh: 0,
              verified: true,
              startBlock: 12085673,
              path: "petroleum-plot",
              website: "https://petroleum.land/",
              twitter: "@Petroleum_Defi",
              discord: "",
              medium: "",
              telegram: "@Petroleum_Defi",
              reddit: "",
              poster:
                "https://media-paint.paintswap.finance/0x382e0867853c7da57b9f7e93b31458a217ec44a6-146-1741375159_poster.jpg",
              banner:
                "https://media-paint.paintswap.finance/0x382e0867853c7da57b9f7e93b31458a217ec44a6-146-1741375159_banner.jpg",
              thumbnail:
                "https://media-paint.paintswap.finance/0x382e0867853c7da57b9f7e93b31458a217ec44a6-146-1741375159_thumb.png",
              marketing:
                "https://media-paint.paintswap.finance/0x382e0867853c7da57b9f7e93b31458a217ec44a6-146-1741375159_marketing.png",
              standard: "721",
              featured: true,
              displayed: true,
              imageStyle: "cover",
              customMetadata: null,
              isFnft: false,
              isInFnftMarketplace: false,
              isReveal: false,
              isSkipRank: false,
              isDynamicMetadata: true,
              isDynamicMedia: false,
              chainId: 146,
              stats: {
                id: "0x382e0867853c7da57b9f7e93b31458a217ec44a6",
                name: "Petroleum Land",
                symbol: "Plot",
                collectionCreationOrder: 132,
                startBlock: "12088220",
                isWhitelisted: true,
                numTradesLast7Days: "68",
                numTradesLast24Hours: "9",
                createdTimestamp: "1741279748",
                totalMinted: "3067",
                floor: "82000000000000000000",
                floorCap: "251166000000000000000000",
                lowestPrice: "55000000000000000000",
                highestPrice: "500000000000000000000000",
                numOwners: "1245",
                totalTrades: "4111",
                lastSellPrice: "62000000000000000000",
                totalNFTs: "3063",
                highestSale: "15000000000000000000000",
                totalVolumeTraded: "1245642939740000000000000",
                volumeLast24Hours: "525000000000000000000",
                volumeLast7Days: "8205800000000000000000",
                activeSales: "228",
                activeSalesNonAuction: "226",
                timestampLastSale: "1747924654",
                timestampLastTrim: "1747924654",
              },
              tracked: true,
              meta: true,
              isWhitelisted: true,
            },
            {
              id: "0x26f98611296ae0dd15922b41a855e635941c0ca6",
              createdAt: "2025-01-15T19:11:48.940Z",
              updatedAt: "2025-04-28T12:30:04.865Z",
              address: "0x26f98611296ae0dd15922b41a855e635941c0ca6",
              owner: "0xb8188217f14f44fad9e14f8828d3853409df6766",
              name: "METRONIX",
              description:
                "Rising from the streets of Metropolis, the METRONIX are the OG hustlers who never stop striving to reach the top. With a growing treasury behind them, they represent the largest $METRO staker community in the ecosystem. All $USDC staking revenue is distributed directly to METRONIX holders.",
              nsfw: false,
              mintPriceLow: 0,
              mintPriceHigh: 0,
              verified: true,
              startBlock: 4002455,
              path: "metronix",
              website: "https://metropolis.exchange",
              twitter: "@MetropolisDEX",
              discord: "https://discord.com/invite/B46m6RjByh",
              medium: "https://medium.com/@metropolisdex/metronix-nft-collection-815b00c08a3f",
              telegram: "@MetropolisDEX",
              reddit: "",
              poster:
                "https://media-paint.paintswap.finance/0x26f98611296ae0dd15922b41a855e635941c0ca6-146-1736967820_poster.jpg",
              banner:
                "https://media-paint.paintswap.finance/0x26f98611296ae0dd15922b41a855e635941c0ca6-146-1736967820_banner.jpg",
              thumbnail:
                "https://media-paint.paintswap.finance/0x26f98611296ae0dd15922b41a855e635941c0ca6-146-1736967820_thumb.png",
              marketing:
                "https://media-paint.paintswap.finance/0x26f98611296ae0dd15922b41a855e635941c0ca6-146-1736967820_marketing.png",
              standard: "721",
              featured: true,
              displayed: true,
              imageStyle: "cover",
              customMetadata: null,
              isFnft: false,
              isInFnftMarketplace: false,
              isReveal: false,
              isSkipRank: false,
              isDynamicMetadata: false,
              isDynamicMedia: false,
              chainId: 146,
              stats: {
                id: "0x26f98611296ae0dd15922b41a855e635941c0ca6",
                name: "Metronix",
                symbol: "MTRX",
                collectionCreationOrder: 51,
                startBlock: "4004659",
                isWhitelisted: true,
                numTradesLast7Days: "10",
                numTradesLast24Hours: "0",
                createdTimestamp: "1736951297",
                totalMinted: "777",
                floor: "600000000000000000000",
                floorCap: "466200000000000000000000",
                lowestPrice: "600000000000000000000",
                highestPrice: "9999000000000000000000",
                numOwners: "442",
                totalTrades: "667",
                lastSellPrice: "500000000000000000000",
                totalNFTs: "777",
                highestSale: "25000000000000000000000",
                totalVolumeTraded: "505646140000000000000000",
                volumeLast24Hours: "0",
                volumeLast7Days: "5719000000000000000000",
                activeSales: "34",
                activeSalesNonAuction: "34",
                timestampLastSale: "1747688380",
                timestampLastTrim: "1747912284",
              },
              tracked: true,
              meta: true,
              isWhitelisted: true,
            },
            {
              id: "0x4b9fcdf6358d126d49358342a99e8fd293ee8f60",
              createdAt: "2025-04-23T17:39:40.927Z",
              updatedAt: "2025-04-23T20:26:08.797Z",
              address: "0x4b9fcdf6358d126d49358342a99e8fd293ee8f60",
              owner: "0xb63059e823473e309af8c98576b420a0c950025f",
              name: "Gotcha Gaming",
              description: "FEED, BATTLE, EARN AND DOMINATE !",
              nsfw: false,
              mintPriceLow: 0,
              mintPriceHigh: 0,
              verified: true,
              startBlock: 21744023,
              path: "gotcha-gaming",
              website: "https://gotchanft.com/",
              twitter: "@GotchA_P2E",
              discord: "https://discord.com/invite/gotchagaming",
              medium: "",
              telegram: "",
              reddit: "",
              poster:
                "https://media-paint.paintswap.finance/0x4b9fcdf6358d126d49358342a99e8fd293ee8f60-146-1745421977_poster.jpg",
              banner:
                "https://media-paint.paintswap.finance/0x4b9fcdf6358d126d49358342a99e8fd293ee8f60-146-1745421977_banner.jpg",
              thumbnail:
                "https://media-paint.paintswap.finance/0x4b9fcdf6358d126d49358342a99e8fd293ee8f60-146-1745421977_thumb.png",
              marketing:
                "https://media-paint.paintswap.finance/0x4b9fcdf6358d126d49358342a99e8fd293ee8f60-146-1745421977_marketing.png",
              standard: "721",
              featured: true,
              displayed: true,
              imageStyle: "contain",
              customMetadata: null,
              isFnft: false,
              isInFnftMarketplace: false,
              isReveal: false,
              isSkipRank: false,
              isDynamicMetadata: true,
              isDynamicMedia: false,
              chainId: 146,
              stats: {
                id: "0x4b9fcdf6358d126d49358342a99e8fd293ee8f60",
                name: "GotchaNFT",
                symbol: "GotchA",
                collectionCreationOrder: 192,
                startBlock: "21766739",
                isWhitelisted: true,
                numTradesLast7Days: "285",
                numTradesLast24Hours: "39",
                createdTimestamp: "1745413461",
                totalMinted: "7777",
                floor: "19000000000000000000",
                floorCap: "147763000000000000000000",
                lowestPrice: "14000000000000000000",
                highestPrice: "600000000000000000000",
                numOwners: "2064",
                totalTrades: "3888",
                lastSellPrice: "28000000000000000000",
                totalNFTs: "7777",
                highestSale: "300000000000000000000",
                totalVolumeTraded: "53713109520000000000000",
                volumeLast24Hours: "769370000000000000000",
                volumeLast7Days: "5144646800000000000000",
                activeSales: "176",
                activeSalesNonAuction: "174",
                timestampLastSale: "1747919021",
                timestampLastTrim: "1747924924",
              },
              tracked: true,
              meta: true,
              isWhitelisted: true,
            },
            {
              id: "0xf20bd8b3a20a6d9884121d7a6e37a95a810183e2",
              createdAt: "2025-01-23T12:12:56.402Z",
              updatedAt: "2025-01-23T12:12:56.402Z",
              address: "0xf20bd8b3a20a6d9884121d7a6e37a95a810183e2",
              owner: "0x316342122a9ae36de41b231260579b92f4c8be7f",
              name: "Beardies",
              description:
                "The next-gen NFT with utility created by the Paintswap team. With novel provenance technology for a fair distribution and claimable rewards, they make YOU part of Paintswap success. Each Beardie in your possession gives you Paintswap marketplace fees in return, in $S! More Beardies >> More Reward, No Limits. They also give you access to a secret Discord channel. This is just the beginning, with other benefits and secrets to come! No more than 2048 of them will ever be painted. Full description and features in the medium link.",
              nsfw: false,
              mintPriceLow: 0,
              mintPriceHigh: 0,
              verified: true,
              startBlock: 5013153,
              path: "beardies",
              website: "https://paintswap.io/",
              twitter: "@paint_swap",
              discord: "https://discord.gg/paintswap",
              medium: "https://paint-swap-finance.medium.com/6161a72ae3da",
              telegram: "@paintswaphq",
              reddit: "",
              poster:
                "https://media-paint.paintswap.finance/0xf20bd8b3a20a6d9884121d7a6e37a95a810183e2-146-1737630183_poster.jpg",
              banner:
                "https://media-paint.paintswap.finance/0xf20bd8b3a20a6d9884121d7a6e37a95a810183e2-146-1737630183_banner.jpg",
              thumbnail:
                "https://media-paint.paintswap.finance/0xf20bd8b3a20a6d9884121d7a6e37a95a810183e2-146-1737630183_thumb.png",
              marketing:
                "https://media-paint.paintswap.finance/0xf20bd8b3a20a6d9884121d7a6e37a95a810183e2-146-1737630183_marketing.png",
              standard: "721",
              featured: true,
              displayed: true,
              imageStyle: "contain",
              customMetadata: null,
              isFnft: false,
              isInFnftMarketplace: false,
              isReveal: false,
              isSkipRank: false,
              isDynamicMetadata: false,
              isDynamicMedia: false,
              chainId: 146,
              stats: {
                id: "0xf20bd8b3a20a6d9884121d7a6e37a95a810183e2",
                name: "Paintswap Beardies",
                symbol: "BEARDIES",
                collectionCreationOrder: 64,
                startBlock: "5016753",
                isWhitelisted: true,
                numTradesLast7Days: "6",
                numTradesLast24Hours: "0",
                createdTimestamp: "1737568398",
                totalMinted: "2048",
                floor: "850000000000000000000",
                floorCap: "1740800000000000000000000",
                lowestPrice: "995000000000000000000",
                highestPrice: "50000000000000000000000",
                numOwners: "483",
                totalTrades: "108",
                lastSellPrice: "790000000000000000000",
                totalNFTs: "2048",
                highestSale: "2500000000000000000000",
                totalVolumeTraded: "147245768800000000000000",
                volumeLast24Hours: "0",
                volumeLast7Days: "4746000000000000000000",
                activeSales: "33",
                activeSalesNonAuction: "33",
                timestampLastSale: "1747743745",
                timestampLastTrim: "1747840003",
              },
              tracked: true,
              meta: true,
              isWhitelisted: true,
            },
            {
              id: "0xca0557de70c87762ea23b23e0443696179378d63",
              createdAt: "2025-04-05T07:23:28.275Z",
              updatedAt: "2025-04-05T07:23:28.275Z",
              address: "0xca0557de70c87762ea23b23e0443696179378d63",
              owner: "0x6cde3e2a3f66c916d26d3f3a2ee2e389e903b2b1",
              name: "Petroleum CBD",
              description:
                "Petroleum Central Business District.<br><br>Earn even more with the Petroleum CBD ! <br><br>The 2nd NFT collection of Petroleum !",
              nsfw: false,
              mintPriceLow: 0,
              mintPriceHigh: 0,
              verified: true,
              startBlock: 17941002,
              path: "petroleum-cbd",
              website: "http://swapx.fi/",
              twitter: "@swapxfi",
              discord: "http://discord.com/invite/yXU4HMsp6P",
              medium: "http://discord.com/invite/yXU4HMsp6P",
              telegram: "http://t.me/swapxfi",
              reddit: "",
              poster:
                "https://media-paint.paintswap.finance/0xca0557de70c87762ea23b23e0443696179378d63-146-1743831625_poster.jpg",
              banner:
                "https://media-paint.paintswap.finance/0xca0557de70c87762ea23b23e0443696179378d63-146-1743831625_banner.jpg",
              thumbnail:
                "https://media-paint.paintswap.finance/0xca0557de70c87762ea23b23e0443696179378d63-146-1743831625_thumb.png",
              marketing:
                "https://media-paint.paintswap.finance/0xca0557de70c87762ea23b23e0443696179378d63-146-1743831625_marketing.png",
              standard: "721",
              featured: true,
              displayed: true,
              imageStyle: "contain",
              customMetadata: null,
              isFnft: false,
              isInFnftMarketplace: false,
              isReveal: false,
              isSkipRank: false,
              isDynamicMetadata: false,
              isDynamicMedia: false,
              chainId: 146,
              stats: {
                id: "0xca0557de70c87762ea23b23e0443696179378d63",
                name: "PetroleumCity",
                symbol: "PetroleumC",
                collectionCreationOrder: 172,
                startBlock: "17949826",
                isWhitelisted: true,
                numTradesLast7Days: "25",
                numTradesLast24Hours: "0",
                createdTimestamp: "1743700374",
                totalMinted: "1001",
                floor: "140000000000000000000",
                floorCap: "140140000000000000000000",
                lowestPrice: "140000000000000000000",
                highestPrice: "79800000000000000000000",
                numOwners: "320",
                totalTrades: "544",
                lastSellPrice: "119000000000000000000",
                totalNFTs: "1001",
                highestSale: "6900000000000000000000",
                totalVolumeTraded: "415882550000000000000000",
                volumeLast24Hours: "0",
                volumeLast7Days: "3710000000000000000000",
                activeSales: "29",
                activeSalesNonAuction: "29",
                timestampLastSale: "1747774708",
                timestampLastTrim: "1747875028",
              },
              tracked: true,
              meta: true,
              isWhitelisted: true,
            },
            {
              id: "0x83c27147f0aa26b153de120f600d0238ef7a4ebb",
              createdAt: "2025-02-23T18:00:22.184Z",
              updatedAt: "2025-02-23T18:00:22.184Z",
              address: "0x83c27147f0aa26b153de120f600d0238ef7a4ebb",
              owner: "0x3a7a1f256b6180d59f58efc080321a09d456ee9b",
              name: "Lazy Bear",
              description: "...ugh too lazy to write this",
              nsfw: false,
              mintPriceLow: 0,
              mintPriceHigh: 0,
              verified: true,
              startBlock: 9508099,
              path: "lazy-bear",
              website: "https://lazybear.cc",
              twitter: "@LazyBearSonic",
              discord: "",
              medium: "",
              telegram: "@LazyBearPortal",
              reddit: "",
              poster:
                "https://media-paint.paintswap.finance/0x83c27147f0aa26b153de120f600d0238ef7a4ebb-146-1740333134_poster.jpg",
              banner:
                "https://media-paint.paintswap.finance/0x83c27147f0aa26b153de120f600d0238ef7a4ebb-146-1740333134_banner.jpg",
              thumbnail:
                "https://media-paint.paintswap.finance/0x83c27147f0aa26b153de120f600d0238ef7a4ebb-146-1740333134_thumb.png",
              marketing:
                "https://media-paint.paintswap.finance/0x83c27147f0aa26b153de120f600d0238ef7a4ebb-146-1740333134_marketing.png",
              standard: "721",
              featured: true,
              displayed: true,
              imageStyle: "contain",
              customMetadata: null,
              isFnft: false,
              isInFnftMarketplace: false,
              isReveal: false,
              isSkipRank: false,
              isDynamicMetadata: false,
              isDynamicMedia: false,
              chainId: 146,
              stats: {
                id: "0x83c27147f0aa26b153de120f600d0238ef7a4ebb",
                name: "Lazy Bear",
                symbol: "LBEAR",
                collectionCreationOrder: 104,
                startBlock: "9508099",
                isWhitelisted: true,
                numTradesLast7Days: "40",
                numTradesLast24Hours: "5",
                createdTimestamp: "1740289339",
                totalMinted: "2244",
                floor: "80000000000000000000",
                floorCap: "179520000000000000000000",
                lowestPrice: "80000000000000000000",
                highestPrice: "11000000000000000000000",
                numOwners: "846",
                totalTrades: "2210",
                lastSellPrice: "54000000000000000000",
                totalNFTs: "2244",
                highestSale: "1234000000000000000000",
                totalVolumeTraded: "484469477210000000000000",
                volumeLast24Hours: "254000000000000000000",
                volumeLast7Days: "3650102610000000000000",
                activeSales: "67",
                activeSalesNonAuction: "67",
                timestampLastSale: "1747913855",
                timestampLastTrim: "1747917726",
              },
              tracked: true,
              meta: true,
              isWhitelisted: true,
            },
            {
              id: "0xbc8e0c6d35526106f21a4791ff796ec500c316cb",
              createdAt: "2025-03-10T18:27:57.930Z",
              updatedAt: "2025-03-10T18:27:57.930Z",
              address: "0xbc8e0c6d35526106f21a4791ff796ec500c316cb",
              owner: "0x2d60684bb60445c1a3db3c02cc4b47b62cb4b2d2",
              name: "Sonic OG by 9mm.Pro",
              description:
                "Sonic OG is an NFT collection integrated into the 9mm Pro ecosystem. With 10,000 unique NFTs, Sonic OG holders receive 96% of secondary revenue, sourced from a 9.99% royalty fee on NFT sales, earnings from initialized liquidity pools (such as PUSSY/S token and 9MM/S token), and DEX fees from 9MM trading pairs. Revenue collected in native tokens is used to buy 9MM, which is then distributed to NFT holders creating a self-sustaining rewards cycle. Learn more at 9mm.pro",
              nsfw: false,
              mintPriceLow: 0,
              mintPriceHigh: 0,
              verified: true,
              startBlock: 12664498,
              path: "sonic-og-by-9mm.pro",
              website: "https://9mm.pro",
              twitter: "@9mm_pro",
              discord: "https://discord.gg/3BUen4F9Tw",
              medium: "",
              telegram: "",
              reddit: "",
              poster:
                "https://media-paint.paintswap.finance/0xbc8e0c6d35526106f21a4791ff796ec500c316cb-146-1741630564_poster.jpg",
              banner:
                "https://media-paint.paintswap.finance/0xbc8e0c6d35526106f21a4791ff796ec500c316cb-146-1741630564_banner.jpg",
              thumbnail:
                "https://media-paint.paintswap.finance/0xbc8e0c6d35526106f21a4791ff796ec500c316cb-146-1741630564_thumb.png",
              marketing:
                "https://media-paint.paintswap.finance/0xbc8e0c6d35526106f21a4791ff796ec500c316cb-146-1741630564_marketing.png",
              standard: "721",
              featured: true,
              displayed: true,
              imageStyle: "contain",
              customMetadata: null,
              isFnft: false,
              isInFnftMarketplace: false,
              isReveal: false,
              isSkipRank: false,
              isDynamicMetadata: false,
              isDynamicMedia: false,
              chainId: 146,
              stats: {
                id: "0xbc8e0c6d35526106f21a4791ff796ec500c316cb",
                name: "Sonic OG by 9mm.Pro",
                symbol: "SOG",
                collectionCreationOrder: 135,
                startBlock: "12720500",
                isWhitelisted: true,
                numTradesLast7Days: "90",
                numTradesLast24Hours: "20",
                createdTimestamp: "1741555810",
                totalMinted: "8977",
                floor: "30000000000000000000",
                floorCap: "269310000000000000000000",
                lowestPrice: "30000000000000000000",
                highestPrice: "50000000000000000000000",
                numOwners: "552",
                totalTrades: "330",
                lastSellPrice: "35000000000000000000",
                totalNFTs: "8977",
                highestSale: "3333000000000000000000",
                totalVolumeTraded: "34102000000000000000000",
                volumeLast24Hours: "675000000000000000000",
                volumeLast7Days: "3560000000000000000000",
                activeSales: "161",
                activeSalesNonAuction: "160",
                timestampLastSale: "1747882165",
                timestampLastTrim: "1747922029",
              },
              tracked: true,
              meta: true,
              isWhitelisted: true,
            },
            {
              id: "0x95443e8c0e4772221fc0bb4019cf88868f2830d0",
              createdAt: "2025-04-10T15:40:43.028Z",
              updatedAt: "2025-04-10T16:31:55.065Z",
              address: "0x95443e8c0e4772221fc0bb4019cf88868f2830d0",
              owner: "0x6cde3e2a3f66c916d26d3f3a2ee2e389e903b2b1",
              name: "SHEIKHS",
              description: "An NFT collection built for yield, powered by Petroleum.",
              nsfw: false,
              mintPriceLow: 0,
              mintPriceHigh: 0,
              verified: true,
              startBlock: 19361240,
              path: "sheikhs",
              website: "https://petroleum.land/sheikhs/",
              twitter: "@SheikhsOnSonic",
              discord: "",
              medium: "",
              telegram: "@Petroleum_Defi",
              reddit: "",
              poster:
                "https://media-paint.paintswap.finance/0x95443e8c0e4772221fc0bb4019cf88868f2830d0-146-1744299229_poster.jpg",
              banner:
                "https://media-paint.paintswap.finance/0x95443e8c0e4772221fc0bb4019cf88868f2830d0-146-1744299229_banner.jpg",
              thumbnail:
                "https://media-paint.paintswap.finance/0x95443e8c0e4772221fc0bb4019cf88868f2830d0-146-1744299229_thumb.png",
              marketing:
                "https://media-paint.paintswap.finance/0x95443e8c0e4772221fc0bb4019cf88868f2830d0-146-1744299229_marketing.png",
              standard: "721",
              featured: true,
              displayed: true,
              imageStyle: "contain",
              customMetadata: null,
              isFnft: false,
              isInFnftMarketplace: false,
              isReveal: false,
              isSkipRank: false,
              isDynamicMetadata: false,
              isDynamicMedia: false,
              chainId: 146,
              stats: {
                id: "0x95443e8c0e4772221fc0bb4019cf88868f2830d0",
                name: "SHEIKS",
                symbol: "SHEIKS",
                collectionCreationOrder: 177,
                startBlock: "19362133",
                isWhitelisted: true,
                numTradesLast7Days: "79",
                numTradesLast24Hours: "11",
                createdTimestamp: "1744284782",
                totalMinted: "2000",
                floor: "25000000000000000000",
                floorCap: "50000000000000000000000",
                lowestPrice: "25000000000000000000",
                highestPrice: "1000000000000000000000000",
                numOwners: "435",
                totalTrades: "1573",
                lastSellPrice: "25000000000000000000",
                totalNFTs: "2000",
                highestSale: "1950000000000000000000",
                totalVolumeTraded: "353474900000000000000000",
                volumeLast24Hours: "275000000000000000000",
                volumeLast7Days: "3389000000000000000000",
                activeSales: "130",
                activeSalesNonAuction: "130",
                timestampLastSale: "1747855507",
                timestampLastTrim: "1747870901",
              },
              tracked: true,
              meta: true,
              isWhitelisted: true,
            },
            {
              id: "0x219c848f5b17952ef13be8e44a934ed7d7027d69",
              createdAt: "2025-04-16T17:41:05.765Z",
              updatedAt: "2025-04-16T17:41:47.321Z",
              address: "0x219c848f5b17952ef13be8e44a934ed7d7027d69",
              owner: "0x683f511df0bdbb80347c4e04e1cc0195c288eb0c",
              name: "Tala Hess - The 'CEO' Of ANDRe  - $tala",
              description:
                "The First NFTs Chronicling The Mayhem and Monster That Is Tala Hess  - And His Wild Clan! <br><br>These Are All Inspired  From The Graphic Novel, Factual Illusions, And Inspired By The Fantastic Art Of Kyle Hotz (The First Factual illusions Artist). ",
              nsfw: false,
              mintPriceLow: 0,
              mintPriceHigh: 0,
              verified: true,
              startBlock: 18529477,
              path: "tala-hess",
              website: "",
              twitter: "@DannyManDeBo",
              discord: "",
              medium: "",
              telegram: "@DannyManDeBo",
              reddit: "",
              poster:
                "https://media-paint.paintswap.finance/0x219c848f5b17952ef13be8e44a934ed7d7027d69-146-1744732208_poster.jpg",
              banner:
                "https://media-paint.paintswap.finance/0x219c848f5b17952ef13be8e44a934ed7d7027d69-146-1744732208_banner.jpg",
              thumbnail:
                "https://media-paint.paintswap.finance/0x219c848f5b17952ef13be8e44a934ed7d7027d69-146-1744732208_thumb.png",
              marketing:
                "https://media-paint.paintswap.finance/0x219c848f5b17952ef13be8e44a934ed7d7027d69-146-1744732208_marketing.png",
              standard: "1155",
              featured: true,
              displayed: true,
              imageStyle: "contain",
              customMetadata: null,
              isFnft: false,
              isInFnftMarketplace: false,
              isReveal: false,
              isSkipRank: false,
              isDynamicMetadata: false,
              isDynamicMedia: false,
              chainId: 146,
              stats: {
                id: "0x219c848f5b17952ef13be8e44a934ed7d7027d69",
                name: "Tala Hess:  CEO Of ANDRe",
                symbol: "TALA",
                collectionCreationOrder: 182,
                startBlock: "20385226",
                isWhitelisted: true,
                numTradesLast7Days: "16",
                numTradesLast24Hours: "0",
                createdTimestamp: "1744725683",
                totalMinted: "64",
                floor: "100000000000000000000",
                floorCap: "6400000000000000000000",
                lowestPrice: "100000000000000000000",
                highestPrice: "10000000000000000000000",
                numOwners: "1",
                totalTrades: "16",
                lastSellPrice: "100000000000000000000",
                totalNFTs: "64",
                highestSale: "1000000000000000000000",
                totalVolumeTraded: "1600000000000000000000",
                volumeLast24Hours: "0",
                volumeLast7Days: "160000000000000000000",
                activeSales: "0",
                activeSalesNonAuction: "0",
                timestampLastSale: "1747774708",
                timestampLastTrim: "1747875028",
              },
              tracked: true,
              meta: true,
              isWhitelisted: true,
            },
          ],
        }
        const collectionsData = apiResponse.collections
        setCollections(collectionsData)
        setFilteredCollections(collectionsData)
      } catch (error) {
        console.error("Failed to load collections:", error)
        // Show an error message to the user
        setCollections([])
        setFilteredCollections([])
      } finally {
        setLoading(false)
      }
    }

    loadCollections()
  }, [])

  // Filter collections based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCollections(collections)
    } else {
      const filtered = collections.filter(
        (collection) =>
          collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (collection.description && collection.description.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredCollections(filtered)
    }
  }, [searchTerm, collections])

  // Calculate total pages whenever filtered collections change
  useEffect(() => {
    setTotalPages(Math.ceil(filteredCollections.length / itemsPerPage))
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [filteredCollections, itemsPerPage])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of the list
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredCollections.slice(startIndex, endIndex)
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5 // Show at most 5 page numbers

    if (totalPages <= maxPagesToShow) {
      // If we have fewer pages than maxPagesToShow, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always show first page
      pageNumbers.push(1)

      // Calculate start and end of page range to show
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, maxPagesToShow - 1)
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - maxPagesToShow + 2)
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push("...")
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("...")
      }

      // Always show last page
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white">Loading collections...</p>
        </div>
      </div>
    )
  }

  const currentPageItems = getCurrentPageItems()

  return (
    <div className="space-y-6">
      <ScrollAnimation animation="fadeInUp" delay={0}>
        <div className="bg-[#0d2416] rounded-xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search collections by name..."
              className="w-full pl-10 pr-10 py-3 bg-[#143621] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </ScrollAnimation>

      {filteredCollections.length === 0 ? (
        <ScrollAnimation animation="fadeInUp" delay={0.2}>
          <div className="bg-[#0d2416] rounded-xl p-8 text-center">
            <h2 className="text-white text-2xl font-bold mb-4">No Collections Found</h2>
            <p className="text-green-100 mb-6">
              {collections.length === 0
                ? "No collections are available at the moment."
                : "No collections match your search criteria."}
            </p>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        </ScrollAnimation>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPageItems.map((collection, index) => (
              <ScrollAnimation key={collection.address} animation="fadeInUp" delay={0.1 + (index % 9) * 0.1}>
                <Link href={`/collections/${collection.address}`} className="block">
                  <div className="bg-[#0d2416] rounded-lg overflow-hidden shadow-md hover:scale-105 transition-transform duration-200">
                    <div className="h-48 overflow-hidden">
                      <img
                        src={
                          collection.banner ||
                          collection.poster ||
                          "/placeholder.svg?height=400&width=800&query=NFT%20Collection" ||
                          "/placeholder.svg"
                        }
                        alt={collection.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <img
                          src={collection.thumbnail || "/placeholder.svg?height=40&width=40&query=NFT%20Logo"}
                          alt={`${collection.name} logo`}
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                        <h3 className="text-white font-bold truncate hover:text-green-300 transition-colors">
                          {collection.name}
                        </h3>
                        {collection.verified && (
                          <span className="ml-2 text-green-400 text-xs bg-green-900 px-2 py-1 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {collection.description?.replace(/<br\s*\/?>/gi, " ") || "No description available"}
                      </p>
                      {collection.stats && (
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-[#143621] p-2 rounded">
                            <p className="text-gray-400">Floor</p>
                            <p className="text-white font-medium">
                              {Number.parseFloat(collection.stats.floor) / 1e18 > 0
                                ? `${(Number.parseFloat(collection.stats.floor) / 1e18).toFixed(2)} S`
                                : "N/A"}
                            </p>
                          </div>
                          <div className="bg-[#143621] p-2 rounded">
                            <p className="text-gray-400">Items</p>
                            <p className="text-white font-medium">{collection.stats.totalNFTs || "N/A"}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </ScrollAnimation>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <ScrollAnimation animation="fadeInUp" delay={0.3}>
              <div className="flex justify-center items-center mt-8 space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center w-10 h-10 rounded-md ${
                    currentPage === 1
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-[#143621] text-white hover:bg-green-700"
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} />
                </button>

                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === "number" && goToPage(page)}
                    className={`flex items-center justify-center w-10 h-10 rounded-md ${
                      page === currentPage
                        ? "bg-green-600 text-white"
                        : page === "..."
                          ? "bg-transparent text-gray-400 cursor-default"
                          : "bg-[#143621] text-white hover:bg-green-700"
                    }`}
                    disabled={page === "..."}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center w-10 h-10 rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-[#143621] text-white hover:bg-green-700"
                  }`}
                  aria-label="Next page"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </ScrollAnimation>
          )}

          {/* Page size selector */}
          <ScrollAnimation animation="fadeInUp" delay={0.4}>
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <span>Show per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-[#143621] border border-gray-700 rounded px-2 py-1 text-white"
                >
                  <option value={9}>9</option>
                  <option value={18}>18</option>
                  <option value={27}>27</option>
                  <option value={36}>36</option>
                </select>
              </div>
            </div>
          </ScrollAnimation>
        </>
      )}
    </div>
  )
}
