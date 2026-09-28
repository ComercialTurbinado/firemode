import type { Metadata } from "next";
import { comercialWhatsapp } from "@/lib/apresentacao-cta";
import PresencaVslLp from "./vender/presenca/PresencaVslLp";

const TITLE = "Sprint Presença que Vende | Firemode";
const DESCRIPTION =
  "Veja como sua empresa aparece para quem ainda não a conhece. Em 30 dias, corrigimos um ponto importante e mostramos o que mudou.";

const PECA_CAPA_OG = "/vender/presenca/post-reel-capa-ortodontia-clinica.webp";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "diagnóstico de presença digital",
    "auditoria de marketing digital",
    "scorecard de presença",
    "Google Meu Negócio",
    "Instagram para empresas",
    "conteúdo para clínica odontológica",
    "reel ortodontia",
    "capa de post Instagram",
    "Firemode",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    locale: "pt_BR",
    type: "website",
    siteName: "Firemode",
    images: [
      {
        url: PECA_CAPA_OG,
        width: 720,
        height: 1082,
        alt: "Dentista no consultório — exemplo de capa de reel para clínica odontológica",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [PECA_CAPA_OG],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://firemode.com.br/#webpage",
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "pt-BR",
      isPartOf: { "@type": "WebSite", name: "Firemode", url: "https://firemode.com.br/" },
      about: {
        "@type": "Service",
        name: "Sprint Presença que Vende Firemode",
        provider: { "@type": "Organization", name: "Firemode" },
        areaServed: "BR",
        audience: {
          "@type": "Audience",
          audienceType: "PME de serviço",
        },
        image: {
          "@type": "ImageObject",
          url: "https://firemode.com.br/vender/presenca/post-reel-capa-ortodontia-clinica.webp",
          width: 720,
          height: 1082,
          caption:
            "Exemplo de capa de reel para clínica odontológica: dentista no consultório durante atendimento de ortodontia",
          contentLocation: {
            "@type": "Place",
            name: "Consultório odontológico",
          },
        },
        offers: {
          "@type": "Offer",
          price: "3900",
          priceCurrency: "BRL",
          availability: "https://schema.org/LimitedAvailability",
        },
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "O que eu recebo exatamente?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Durante 30 dias, analisamos como sua empresa é encontrada e comparada, escolhemos uma correção, executamos o trabalho e acompanhamos um indicador.",
          },
        },
        {
          "@type": "Question",
          name: "Por que corrigir uma coisa de cada vez?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Porque mudar vários canais ao mesmo tempo dificulta saber o que ajudou. Preferimos concluir uma correção importante antes de abrir outra frente.",
          },
        },
        {
          "@type": "Question",
          name: "Vocês garantem aumento de vendas?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Não. Vendas também dependem da oferta, do atendimento, do preço e do mercado. Nosso compromisso é executar o trabalho aprovado e mostrar com honestidade o que mudou.",
          },
        },
      ],
    },
  ],
};

/** Homepage pública = LP de presença digital. Admin em /fireadmin. */
export default function HomeLpPage() {
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
