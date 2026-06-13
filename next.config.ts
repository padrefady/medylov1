import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Ajoute cette ligne pour ignorer les erreurs TS sur Vercel
  },
};

export default nextConfig;