// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Tell Next to leave these modules unbundled on the server
  serverExternalPackages: [
    'puppeteer-core',
    '@sparticuz/chromium'
  ],

  webpack(config, { isServer }) {
    if (isServer) {
      // Exclude full puppeteer, chrome-aws-lambda, etc.
      config.externals = [
        ...(config.externals || []),
        {
          puppeteer: 'commonjs puppeteer',
          'puppeteer-core': 'commonjs puppeteer-core',
          '@sparticuz/chromium': 'commonjs @sparticuz/chromium',
          'chrome-aws-lambda': 'commonjs chrome-aws-lambda'
        }
      ];

      // Node.js module fallbacks + alias puppeteer → puppeteer-core
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...(config.resolve?.fallback || {}),
          fs: false,
          net: false,
          tls: false,
          child_process: false
        },
        alias: {
          ...(config.resolve?.alias || {}),
          'puppeteer$': 'puppeteer-core'
        }
      };

      // Pull out all scraping libs into their own chunk
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            scraping: {
              name: 'scraping',
              test: /[\\/]node_modules[\\/](puppeteer|playwright|cheerio|jsdom)/,
              chunks: 'all',
              priority: 20,
              reuseExistingChunk: true
            }
          }
        }
      };
    }

    return config;
  },

  // Only available on the server
  serverRuntimeConfig: {
    maxDuration: 30 // seconds for your API routes
  },

  // Security / performance headers
  async headers() {
    return [
      {
        source: '/api/spa/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600'
          }
        ]
      }
    ];
  },

  // Image optimization: use remotePatterns instead of deprecated domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'cdn.autotrader.co.uk',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'configurator.porsche.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'configurator.mclaren.com',
        pathname: '/**'
      }
    ]
  },

  // Lint/build settings
  typescript: { ignoreBuildErrors: false },
  eslint:      { ignoreDuringBuilds: false },

  // Standalone output in production
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  // Remove X-Powered-By, enable gzip, no trailing slash
  poweredByHeader: false,
  compress:        true,
  trailingSlash:   false,

  // Dev indicator position
  devIndicators: {
    position: 'bottom-right'
  }
};

export default nextConfig;