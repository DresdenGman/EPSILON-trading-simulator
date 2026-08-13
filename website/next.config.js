/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/demo',
        destination: '/dashboard/backtest',
        permanent: true,
      },
      {
        source: '/simulator',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/video',
        destination: '/landing',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
