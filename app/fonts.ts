import { Inter, Montserrat, Roboto_Mono, Playfair_Display } from "next/font/google"
import localFont from "next/font/local"

// Anime Ace font (already in the project)
export const animeAce = localFont({
  src: "../public/fonts/anime-ace.regular.ttf",
  display: "swap",
  variable: "--font-anime-ace",
})

// Inter font (sans-serif for UI and body text)
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

// Montserrat font (sans-serif for headings)
export const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
})

// Roboto Mono font (monospace for code and addresses)
export const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
})

// Playfair Display font (serif for special content)
export const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
})

// Pixel font (for gaming-inspired elements)
export const pixelFont = localFont({
  src: "../public/fonts/pixel.ttf",
  display: "swap",
  variable: "--font-pixel",
})
