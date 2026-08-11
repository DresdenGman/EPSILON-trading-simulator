/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/simulator',
        destination: '/demo',
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
