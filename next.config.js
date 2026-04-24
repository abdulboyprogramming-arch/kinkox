/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  web3: false,
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
      crypto: false
    };
    return config;
  },
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig
