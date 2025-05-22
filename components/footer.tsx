export default function Footer() {
  return (
    <footer className="border-t border-gray-800 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} Sonic Llamas Staking Hub. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-sm text-gray-400 hover:text-white">
              Terms
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white">
              Privacy
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
