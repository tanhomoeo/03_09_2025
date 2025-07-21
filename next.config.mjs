/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Note: This webpack config is no longer needed with the fs.readFileSync approach.
    // Keeping it commented out for reference in case of future needs.
    // webpack: (config, { isServer }) => {
    //     // Add a rule to handle .txt files with raw-loader
    //     config.module.rules.push({
    //         test: /\.txt$/,
    //         use: 'raw-loader',
    //     });

    //     // Important: return the modified config
    //     return config;
    // },
};

export default nextConfig;
