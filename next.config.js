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
    config.module.rules.push({
      test: /\.txt$/,
      use: 'raw-loader',
    });

    if (isServer) {
        config.externals.push('@opentelemetry/exporter-jaeger');
    }

    return config;
  },
  devIndicators: {
    allowedDevOrigins: ['*.cloudworkstations.dev'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
