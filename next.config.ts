import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'https://cv-analyzer-backend-rh2s.onrender.com/:path*',
      },
    ]
  },
}

export default nextConfig