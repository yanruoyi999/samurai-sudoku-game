/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ];
  },
  experimental: {
    // @ts-ignore
    isrFlushToDisk: true,
  },
};

module.exports = nextConfig;
