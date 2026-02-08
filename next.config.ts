import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração padrão para Vercel (sem output: export)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
