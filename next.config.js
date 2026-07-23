const createNextIntlPlugin = require('next-intl/plugin');
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  publicExcludes: ['!puzzles/**/*.json'],
  fallbacks: {
    document: '/offline.html',
  },
  workboxOptions: {
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-webfonts',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
          }
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'google-fonts-stylesheets',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
          }
        }
      },
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-font-assets',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
          }
        }
      },
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-image-assets',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          }
        }
      },
      {
        urlPattern: /\.(?:js)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-js-assets',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          }
        }
      },
      {
        urlPattern: /\.(?:css|less)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-style-assets',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          }
        }
      },
      {
        urlPattern: /\/puzzles\/index\.json$/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'puzzle-index',
          expiration: {
            maxEntries: 1,
            maxAgeSeconds: 60 * 60 // 1 hour
          },
          networkTimeoutSeconds: 5
        }
      },
      {
        urlPattern: /\/puzzles\/\d{4}\/\d{4}-\d{2}-\d{2}\.json$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'puzzle-data',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
          }
        }
      },
      {
        urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-data',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          }
        }
      },
      {
        urlPattern: /\/api\/(?:paypal|download)\/.*/i,
        handler: 'NetworkOnly'
      },
      {
        urlPattern: /\/samuraisudoku\.zip(?:\?.*)?$/i,
        handler: 'NetworkOnly'
      },
      {
        urlPattern: /\/api\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'apis',
          expiration: {
            maxEntries: 16,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          },
          networkTimeoutSeconds: 10
        }
      },
      {
        urlPattern: /.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'others',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          },
          networkTimeoutSeconds: 10
        }
      }
    ]
  },
});

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  outputFileTracingIncludes: {
    '/api/download/pdf-pack': ['./private-assets/samurai-sudoku-100-puzzle-pack.zip'],
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  async headers() {
    return [
      {
        source: '/puzzles/:year/:id.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/puzzles/index.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate',
          },
        ],
      },
      {
        source: '/downloads/:file*.pdf',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      // Static assets caching
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/daily',
        destination: '/en/games/samurai',
        permanent: true,
      },
      {
        source: '/daily/:path*',
        destination: '/en/games/samurai/:path*',
        permanent: true,
      },
      {
        source: '/today',
        destination: '/en/games/samurai',
        permanent: true,
      },
      {
        source: '/today/:path*',
        destination: '/en/games/samurai/:path*',
        permanent: true,
      },
      {
        source: '/samurai-sudoku-overlap-boxes',
        destination: '/en/games/samurai/overlap-boxes',
        permanent: true,
      },
      {
        source: '/samurai-sudoku-candidate-notes',
        destination: '/en/games/samurai/candidate-notes',
        permanent: true,
      },
      {
        source: '/samurai-sudoku-candidates',
        destination: '/en/games/samurai/candidate-notes',
        permanent: true,
      },
      {
        source: '/evil-samurai-sudoku-strategy',
        destination: '/en/games/samurai/evil-solving-path',
        permanent: true,
      },
      {
        source: '/samurai-sudoku-stuck',
        destination: '/en/games/samurai/evil-stuck-after-two-grids',
        permanent: true,
      },
      {
        source: '/evil-samurai-sudoku-stuck',
        destination: '/en/games/samurai/evil-stuck-after-two-grids',
        permanent: true,
      },
      {
        source: '/samurai-sudoku-stuck-after-two-grids',
        destination: '/en/games/samurai/evil-stuck-after-two-grids',
        permanent: true,
      },
      {
        source: '/samurai-sudoku-third-grid-stuck',
        destination: '/en/games/samurai/evil-stuck-after-two-grids',
        permanent: true,
      },
      {
        source: '/minesweeper',
        destination: '/en/games/minesweeper',
        permanent: true,
      },
      {
        source: '/play-minesweeper',
        destination: '/en/games/minesweeper',
        permanent: true,
      },
      {
        source: '/online-minesweeper',
        destination: '/en/games/minesweeper',
        permanent: true,
      },
      {
        source: '/how-to-play-minesweeper',
        destination: '/en/games/minesweeper/how-to-play',
        permanent: true,
      },
      {
        source: '/minesweeper-strategy',
        destination: '/en/games/minesweeper/beginner-strategy',
        permanent: true,
      },
      {
        source: '/minesweeper-first-click-safe',
        destination: '/en/games/minesweeper/first-click-safe',
        permanent: true,
      },
      {
        source: '/minesweeper-flags',
        destination: '/en/games/minesweeper/flags-and-numbers',
        permanent: true,
      },
      {
        source: '/en/daily',
        destination: '/en/games/samurai',
        permanent: true,
      },
      {
        source: '/en/daily/:path*',
        destination: '/en/games/samurai/:path*',
        permanent: true,
      },
      {
        source: '/zh/daily',
        destination: '/zh/games/samurai',
        permanent: true,
      },
      {
        source: '/zh/daily/:path*',
        destination: '/zh/games/samurai/:path*',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/en/about',
        permanent: true,
      },
      {
        source: '/about-us',
        destination: '/en/about',
        permanent: true,
      },
      {
        source: '/company',
        destination: '/en/about',
        permanent: true,
      },
      {
        source: '/our-team',
        destination: '/en/about',
        permanent: true,
      },
    ];
  },
};

module.exports = withPWA(withNextIntl(nextConfig));
