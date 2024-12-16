// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/test/**',
      },
    ],
  },
};

export default nextConfig;