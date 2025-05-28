import Image from "next/image"

interface NetworkIconProps {
  src: string
  alt: string
  size?: number
}

export function NetworkIcon({ src, alt, size = 20 }: NetworkIconProps) {
  return (
    <div className="relative rounded-full overflow-hidden" style={{ width: size, height: size }}>
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={size}
        height={size}
        className="object-contain"
        onError={(e) => {
          // Replace with fallback icon if image fails to load
          e.currentTarget.style.display = "none"
          const parent = e.currentTarget.parentElement
          if (parent) {
            parent.classList.add("bg-gray-100", "flex", "items-center", "justify-center")
            const fallback = document.createElement("div")
            fallback.innerHTML = `<svg width="${size * 0.7}" height="${size * 0.7}" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`
            parent.appendChild(fallback)
          }
        }}
      />
    </div>
  )
}
