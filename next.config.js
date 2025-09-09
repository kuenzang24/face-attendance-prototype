/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    FACEPP_API_KEY: process.env.FACEPP_API_KEY,
    FACEPP_API_SECRET: process.env.FACEPP_API_SECRET,
  },
}

module.exports = nextConfig
