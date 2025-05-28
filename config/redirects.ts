export interface RedirectConfig {
  source: string
  destination: string
  permanent: boolean
}

// Define your redirects here
export const redirects: RedirectConfig[] = [
  {
    source: "/sonic-llamas",
    destination: "https://your-traditional-domain.com",
    permanent: true,
  },
  // Add more redirects as needed
]
