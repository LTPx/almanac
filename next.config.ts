import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com"
      },
      {
        protocol: "https",
        hostname: "ivory-many-cheetah-189.mypinata.cloud"
      },

      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        pathname: "/ipfs/**"
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "/ipfs/**"
      },
      {
        protocol: "https",
        hostname: "cloudflare-ipfs.com",
        pathname: "/ipfs/**"
      },
      {
        protocol: "https",
        hostname: "dweb.link",
        pathname: "/ipfs/**"
      }
    ]
  }
  // devIndicators: false
};

export default nextConfig;
