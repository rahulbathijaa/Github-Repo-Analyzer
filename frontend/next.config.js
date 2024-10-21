/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:8000/:path*' 
            : 'https://github-repo-analyzer.onrender.com/:path*', 
      },
    ];
  },
};

module.exports = nextConfig;
