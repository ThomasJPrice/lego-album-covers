/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-images.dzcdn.net',
      }
    ]
  }
};

export default nextConfig;
