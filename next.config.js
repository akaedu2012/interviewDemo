/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize pdf-parse and its dependencies for server-side
      config.externals = config.externals || [];
      config.externals.push({
        'pdf-parse': 'commonjs pdf-parse',
        canvas: 'commonjs canvas',
      });
    }
    return config;
  },
}

module.exports = nextConfig
