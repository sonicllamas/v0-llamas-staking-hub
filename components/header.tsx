"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import Container from "./container"
import WalletButton from "./wallet-button"
import NetworkSwitcher from "./network-switcher"
import MobileMenu from "./mobile-menu"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Collections", href: "/collections" },
    { name: "My NFTs", href: "/my-nfts" },
    { name: "My Contracts", href: "/my-contracts" },
    { name: "Create Staking", href: "/create-staking" },
  ]

  return (
    <header className="border-b border-gray-800">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img src="/llama-logo.jpg" alt="Sonic Llamas" className="mr-2 h-8 w-8 rounded-full" />
              <span className="text-xl font-bold">Sonic Llamas</span>
            </Link>
            <nav className="ml-10 hidden space-x-8 md:flex">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm ${
                    pathname === item.href ? "text-white font-medium" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <NetworkSwitcher />
            <WalletButton />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </Container>

      <MobileMenu
        isOpen={mobileMenuOpen}
        setIsOpen={setMobileMenuOpen}
        navigation={navigation}
        currentPath={pathname}
      />
    </header>
  )
}
