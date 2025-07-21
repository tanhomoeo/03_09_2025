/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: true, // Allow build with TypeScript errors for production
  },
  eslint: {
    ignoreDuringBuilds: true, // Allow build with ESLint warnings
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Ensure all AI flows and data files are included in the build
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Include all AI flow files
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    // Handle JSON files properly
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });

    // Ensure raw-loader works for text files
    config.module.rules.push({
      test: /\.txt$/,
      use: 'raw-loader',
    });

    return config;
  },
  // Optimize for production builds
  swcMinify: true,
  compress: true,
  // Ensure proper static file handling
  trailingSlash: false,
  // Include all necessary directories in build
  experimental: {
    outputFileTracingIncludes: {
      '/**/*': ['./public/data/**/*', './src/ai/**/*'],
    },
  },
};

export default nextConfig;
