/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['via.placeholder.com', 'maps.googleapis.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['axios'],
  },
}

module.exports = nextConfig