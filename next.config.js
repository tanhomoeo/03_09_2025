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
  webpack: (config, { isServer }) => {
    // raw-loader এর বদলে Webpack 5 Asset Modules ব্যবহার করা হলো
    config.module.rules.push({
      test: /\.txt$/,
      type: 'asset/source',
    });

    if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            "fs": false,
        };
    }
    
    // externals helps with dependencies that are not meant to be bundled for the client
    config.externals = [...(config.externals || []), 'canvas', 'handlebars', 'eslint'];

    return config;
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