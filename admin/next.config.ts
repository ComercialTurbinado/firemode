import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Preview / browser às vezes abre 127.0.0.1 em vez de localhost — sem isso o HMR/cliente quebra
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async redirects() {
    return [
      // Admin antigo (raiz) → /fireadmin
      { source: "/login", destination: "/fireadmin/login", permanent: false },
      { source: "/conteudo", destination: "/fireadmin/conteudo", permanent: false },
      { source: "/conteudo/:path*", destination: "/fireadmin/conteudo/:path*", permanent: false },
      { source: "/clientes", destination: "/fireadmin/clientes", permanent: false },
      { source: "/clientes/:path*", destination: "/fireadmin/clientes/:path*", permanent: false },
      { source: "/planos", destination: "/fireadmin/planos", permanent: false },
      { source: "/planos/:path*", destination: "/fireadmin/planos/:path*", permanent: false },
      { source: "/leads", destination: "/fireadmin/leads", permanent: false },
      { source: "/leads/:path*", destination: "/fireadmin/leads/:path*", permanent: false },
      { source: "/analises", destination: "/fireadmin/analises", permanent: false },
      { source: "/analises/:path*", destination: "/fireadmin/analises/:path*", permanent: false },
      { source: "/pipeline", destination: "/fireadmin/pipeline", permanent: false },
      { source: "/pipeline/:path*", destination: "/fireadmin/pipeline/:path*", permanent: false },
      // LP antiga
      { source: "/vender/presenca", destination: "/", permanent: false },
      { source: "/vender/presenca/b", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
