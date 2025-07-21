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
        // These are required by Genkit but can be ignored for the client build
        // as they are not used in the browser.
        config.externals.push('@opentelemetry/exporter-jaeger');
        config.externals.push('@opentelemetry/instrumentation-grpc');
        config.externals.push('require-in-the-middle');
        config.externals.push('handlebars');
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
