/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // output: 'standalone', 
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'https://github-repo-analyzer.onrender.com/:path*',
        },
      ];
    },
  };
  
  export default nextConfig;
  