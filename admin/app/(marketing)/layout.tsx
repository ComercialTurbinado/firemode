import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Firemode — Diagnóstico de Presença Digital",
    template: "%s | Firemode",
  },
  description:
    "Veja o que um cliente encontra sobre sua empresa e receba as correções prioritárias para os seus pontos de contato.",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} ${body.variable}`} style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}>
      {children}
    </div>
  );
}
