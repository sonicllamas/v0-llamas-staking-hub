"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Container } from "./container"
import { WalletButton } from "./wallet-button"
import { MobileMenu } from "./mobile-menu"
import { useWallet } from "@/context/wallet-context"
import { MinimalNetworkSwitcher } from "./minimal-network-switcher"
import { StatsGrid } from "./stats-grid"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { isConnected } = useWallet()

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const navigationItems = [
    { name: "Home", href: "/" },
    { name: "Verified NFTs", href: "/verified-nfts" },
    { name: "My NFTs", href: "/my-nfts" },
    { name: "My Contracts", href: "/my-contracts" },
    { name: "Create Staking", href: "/create-staking" },
  ]

  return (
    <>
      <header className="bg-[#0d2416] border-b border-gray-800">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <div className="relative mr-2 overflow-hidden rounded-full transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(0,255,170,0.5)]">
                  <Image
                    src="/llama-logo.jpg"
                    alt="Sonic Llamas"
                    width={32}
                    height={32}
                    className="transition-transform duration-500 ease-out group-hover:scale-110"
                    priority
                  />
                </div>
                <span className="text-xl font-bold text-white transition-all duration-300 group-hover:text-[#00ffaa]">
                  LLAMAS HUB
                </span>
              </Link>
              <nav className="ml-10 hidden space-x-8 md:flex">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm ${pathname === item.href ? "text-white font-medium" : "text-gray-300 hover:text-white"}`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {isConnected && <MinimalNetworkSwitcher />}
              <WalletButton />
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white md:hidden"
                onClick={toggleMobileMenu}
                aria-expanded={mobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </Container>

        {mobileMenuOpen && (
          <MobileMenu
            isOpen={mobileMenuOpen}
            setIsOpen={closeMobileMenu}
            navigation={navigationItems}
            currentPath={pathname}
          />
        )}
      </header>
      <StatsGrid />
    </>
  )
}
