import { Container } from "@/components/container"
import { Github, Twitter, DiscIcon as Discord, Globe, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
      <Container>
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1: About */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/llama-logo.jpg"
                  alt="Sonic Llamas"
                  width={32}
                  height={32}
                  className="rounded-full border-2 border-green-500"
                />
                <h3 className="text-white font-bold text-lg">Sonic Llamas</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                The premier cross-chain platform on Sonic Network for seamless bridging and swapping.
              </p>
              <div className="flex space-x-3">
                <Link
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Twitter size={16} className="text-blue-400" />
                </Link>
                <Link
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Discord size={16} className="text-indigo-400" />
                </Link>
                <Link
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Github size={16} className="text-gray-300" />
                </Link>
                <Link
                  href="https://llamas.sonic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Globe size={16} className="text-green-400" />
                </Link>
              </div>
            </div>

            {/* Column 2: Platform */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/create-staking" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Create Staking
                  </Link>
                </li>
                <li>
                  <Link href="/my-contracts" className="text-gray-400 hover:text-white transition-colors text-sm">
                    My Contracts
                  </Link>
                </li>
                <li>
                  <Link href="/my-nfts" className="text-gray-400 hover:text-white transition-colors text-sm">
                    My NFTs
                  </Link>
                </li>
                <li>
                  <Link href="/collections" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Collections
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Contact</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Bug Reports
                  </Link>
                </li>
                <li>
                  <Link
                    href="mailto:hello@llamas.sonic"
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                  >
                    <Mail size={12} />
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="py-6 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">© {currentYear} Sonic Llamas. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">Powered by</span>
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent font-semibold text-sm">
              Sonic Network
            </span>
          </div>
        </div>
      </Container>
    </footer>
  )
}
