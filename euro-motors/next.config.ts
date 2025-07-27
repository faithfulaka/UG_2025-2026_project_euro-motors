// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium",
  ],

  webpack(config, { isServer }) {
    if (isServer && config) {
      config.externals = [
        ...(config.externals || []),
        {
          puppeteer: "commonjs puppeteer",
          "puppeteer-core": "commonjs puppeteer-core",
          "@sparticuz/chromium": "commonjs @sparticuz/chromium",
          "chrome-aws-lambda": "commonjs chrome-aws-lambda",
        },
      ];
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

  serverRuntimeConfig: {
    maxDuration: 30, // seconds
  },

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

  images: {
    domains: [
      "images.unsplash.com",
      "cdn.autotrader.co.uk",
      "configurator.porsche.com",
      "configurator.mclaren.com",
    ],
    unoptimized: false,
  },

  typescript: { ignoreBuildErrors: false },
  eslint:      { ignoreDuringBuilds: false },

  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,

  poweredByHeader: false,
  compress:        true,
  trailingSlash:   false,
  devIndicators:  { position: "bottom-right" },
};

export default nextConfig;