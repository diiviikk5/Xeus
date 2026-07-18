import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "solana-agent-kit",
    "@langchain/core",
    "langsmith",
    "@langchain/openai",
    "@langchain/textsplitters",
    "@langchain/community"
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push(
        "solana-agent-kit",
        "@langchain/core",
        "langsmith",
        "@langchain/openai",
        "@langchain/textsplitters",
        "@langchain/community"
      );
    }
    return config;
  },
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
