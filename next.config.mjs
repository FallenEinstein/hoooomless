/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removing output: 'export' so API routes work on Vercel
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
