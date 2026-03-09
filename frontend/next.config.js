/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '72.62.71.97', port: '5001', pathname: '/uploads/**' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://72.62.71.97:5001'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
