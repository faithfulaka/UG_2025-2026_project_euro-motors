/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    domains: [
      'localhost',
      'images.unsplash.com',
      'source.unsplash.com',
      'cdn.euromotors.com',
      'euromotors.com',
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Ensure static files are served correctly
  poweredByHeader: false,
  compress: true,
  // Enable React strict mode for better debugging
  reactStrictMode: true,
  // Ensure CSS modules work properly
  swcMinify: true,
  // Configure webpack for better CSS handling
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
      type: 'asset',
    });
    return config;
  },
}

module.exports = nextConfig
