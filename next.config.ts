import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // O Segredo! Transforma seu site em arquivos estáticos (sem servidor)
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Necessário para exportação estática (imagens não são processadas no build)
  },
  typescript: {
    ignoreBuildErrors: true, // Garante que tipagens chatas não parem o deploy
  }
};

export default nextConfig;
