/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: ['*.cloudworkstations.dev'],
  },
  typescript: {
    // প্রোডাকশনে যাওয়ার আগে অবশ্যই টাইপ এরর ফিক্স করা উচিত, 
    // তবে ইমার্জেন্সি ডিপ্লয়মেন্টের জন্য এটি true করে দেখতে পারেন (সুপারিশকৃত নয়)।
    ignoreBuildErrors: false, 
  },
};

export default nextConfig;