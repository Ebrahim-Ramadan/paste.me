const nextConfig = {
  compiler: {
    // Remove all console logs
    removeConsole: process.env.NODE_ENV === "production"
  },
  reactStrictMode: true,
}

module.exports = nextConfig

