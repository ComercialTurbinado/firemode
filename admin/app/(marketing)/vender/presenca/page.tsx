import type { Metadata } from "next";
import { comercialWhatsapp } from "@/lib/apresentacao-cta";
import PresencaVslLp from "./PresencaVslLp";

const TITLE = "Diagnóstico de presença digital | Firemode";
const DESCRIPTION =
  "Descubra se o cliente te acha na internet — e o que fazer. 30 dias pra acompanhar. 60 dias de garantia: não melhorou, devolvemos.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "diagnóstico de presença digital",
    "auditoria de marketing digital",
    "scorecard de presença",
    "Google Meu Negócio",
    "Instagram para empresas",
    "Firemode",
  ],
  alternates: { canonical: "/vender/presenca" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    locale: "pt_BR",
    type: "website",
    siteName: "Firemode",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://firemode.com.br/vender/presenca#webpage",
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "pt-BR",
      isPartOf: { "@type": "WebSite", name: "Firemode" },
      about: {
        "@type": "Service",
        name: "Diagnóstico de presença digital Firemode",
        provider: { "@type": "Organization", name: "Firemode" },
        areaServed: "BR",
        audience: {
          "@type": "Audience",
          audienceType: "PME de serviço",
        },
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "O que é o diagnóstico?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A gente olha se o cliente te acha na internet — site, Google, redes, anúncios — e te diz o que fazer primeiro.",
          },
        },
        {
          "@type": "Question",
          name: "Por quanto tempo acompanho?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "30 dias pra ver se a nota sobe depois do diagnóstico.",
          },
        },
        {
          "@type": "Question",
          name: "Tem garantia?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sim. 60 dias: não melhorou, devolvemos o dinheiro.",
          },
        },
      ],
    },
  ],
};

export default function VenderPresencaPage() {
  const wa = comercialWhatsapp();
  const waUrl = wa ? `https://wa.me/${wa}` : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PresencaVslLp whatsappUrl={waUrl} />
    </>
  );
}
