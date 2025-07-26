// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Puppeteer/Chromium out of the normal bundle
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium"
  ],

  // Custom webpack only on server builds
  webpack(config, { isServer }) {
    if (isServer && config) {
      // Exclude heavy libs from the server bundle
      config.externals = [
        ...(config.externals || []),
        {
          puppeteer: "commonjs puppeteer",
          "puppeteer-core": "commonjs puppeteer-core",
          "@sparticuz/chromium": "commonjs @sparticuz/chromium",
          "chrome-aws-lambda": "commonjs chrome-aws-lambda",
        },
      ];

      // Disable built-in node modules & alias puppeteer → puppeteer-core
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...(config.resolve?.fallback || {}),
          fs: false,
          net: false,
          tls: false,
          child_process: false,
        },
        alias: {
          ...(config.resolve?.alias || {}),
          "puppeteer$": "puppeteer-core",
        },
      };

      // Split scraping libs into their own chunk
      config.optimization = {
        ...(config.optimization || {}),
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            scraping: {
              name: "scraping",
              test: /[\\/]node_modules[\\/](puppeteer|playwright|cheerio|jsdom)/,
              chunks: "all",
              priority: 20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },

  // Increase timeout for server‐side scraping
  serverRuntimeConfig: {
    maxDuration: 30, // seconds
  },

  // Cache SPA API calls at the edge for 5 minutes
  async headers() {
    return [
      {
        source: "/api/spa/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
        ],
      },
    ];
  },

  // Lock down external image domains
  images: {
    domains: [
      "images.unsplash.com",
      "cdn.autotrader.co.uk",
      "configurator.porsche.com",
      "configurator.mclaren.com",
    ],
    unoptimized: false,
  },

  // Strict build‐time linting
  typescript: { ignoreBuildErrors: false },
  eslint:      { ignoreDuringBuilds: false },

  // Standalone output in production
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,

  // Expose public env vars
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Misc cleanup
  poweredByHeader: false,
  compress:        true,
  trailingSlash:   false,
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;