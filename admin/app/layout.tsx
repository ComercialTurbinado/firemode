import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Firemode Admin",
  description: "Painel de controle Firemode",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} dark h-full`}>
      <body className="min-h-full" style={{ background: "var(--fm-bg)", color: "var(--fm-text)" }}>
        {children}
      </body>
    </html>
  );
}
