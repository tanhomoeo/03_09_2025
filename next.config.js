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
  experimental: {
    serverComponentsExternalPackages: [
      '@genkit-ai/google-cloud',
      '@google-cloud/functions-framework',
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
        config.externals.push(
            '@opentelemetry/exporter-jaeger',
            '@opentelemetry/instrumentation-grpc',
            'require-in-the-middle',
            'handlebars'
        );
    }
    
    config.module.rules.push({
      test: /\.txt$/,
      use: 'raw-loader',
    });

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
