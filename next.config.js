/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
};

module.exports = nextConfig;
// module.exports = {
//   webpack: (config, { isServer }) => {
//     // Fixes packages that depend on fs/module module
//     if (!isServer) {
//       config.node = { fs: "empty", module: "empty" };
//     }

//     return config;
//   },
// };
