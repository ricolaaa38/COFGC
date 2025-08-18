/** @type {import('next').NextConfig} */
const nextConfig = {
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000, // vérifie les changements toutes les 1000 ms
      aggregateTimeout: 300, // petite latence avant recompilation
    };
    return config;
  },
};

export default nextConfig;
