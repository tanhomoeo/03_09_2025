
/** @type {import('next').NextConfig} */
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

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

export default withPWA(nextConfig);
