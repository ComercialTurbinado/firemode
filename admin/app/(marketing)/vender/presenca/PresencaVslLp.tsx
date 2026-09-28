"use client";

import "./presenca-lp.css";
import PresencaChatNudge from "./PresencaChatNudge";
import PresencaHeroAb from "./PresencaHeroAb";
import PresencaInteresseChat from "./PresencaInteresseChat";
import PresencaMenubar from "./PresencaMenubar";
import PresencaStickyGuide from "./PresencaStickyGuide";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import BlurBox from "@/components/ui/blur-box";
import { BLUR_BODY_START, SlideActiveContext } from "@/components/ui/blur-motion";
import BlurText from "@/components/ui/blur-text";
import {
  Card,
  CardHeader,
} from "@/components/ui/card";
import ColorBends from "@/components/ui/color-bends";
import GlareHover from "@/components/ui/glare-hover";
import Image from "next/image";
import GradualBlur from "@/components/ui/gradual-blur";
import {
  PRESENCA_PRAZO_ENTREGA,
  PRESENCA_PRECO_LABEL,
  PRESENCA_VALOR_ANCORA_LABEL,
} from "@/lib/vender-presenca-ab";
import {
  PRESENCA_B_COMO,
  PRESENCA_B_DIFERENCIAL,
  PRESENCA_B_DORES,
  PRESENCA_B_DOR_TITULO,
  PRESENCA_B_ENTREGA,
  PRESENCA_B_ENTREGAVEIS,
  PRESENCA_B_ESTEIRA,
  PRESENCA_B_FAQ,
  PRESENCA_B_INTERESSE,
  PRESENCA_B_PRECO,
} from "@/lib/vender-presenca-lp-b";
import { useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Clapperboard,
  FileText,
  ListOrdered,
  Radar,
  ScanSearch,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const glassCard =
  "lp-glass gap-0 border-0 bg-transparent py-0 text-inherit shadow-none ring-0";
const glassCardHot =
  "lp-glass lp-glass--hot gap-0 border-0 bg-transparent py-0 text-inherit shadow-none ring-0";
const glassPad = "lp-glass--pad px-(--card-spacing)";

/** Capa do PostReelMock — webp em /public para SEO e performance. */
const PECA_CAPA = {
  src: "/vender/presenca/post-reel-capa-ortodontia-clinica.webp",
  alt: "Dentista sorrindo no consultório durante atendimento de ortodontia — capa de reel para clínica odontológica",
  title: "Reel ortodontia: profissional de saúde bucal atendendo paciente no consultório",
  width: 720,
  height: 1082,
} as const;

type Props = {
  whatsappUrl: string | null;
  /** Controle = a (default). Teste = b (sem garantia, esteira de preços). */
  variant?: "a" | "b";
};

const DORES = [
  {
    t: "Sua presença promete menos do que sua entrega",
    text: "A empresa pode atender muito bem e ainda parecer comum na busca, no Instagram ou no site. O cliente não enxerga o bastidor; decide pelo que consegue comparar na tela.",
  },
  {
    t: "Você publica sem saber o que precisa mudar",
    text: "Mais posts não corrigem uma oferta difícil de entender, um perfil sem prova ou uma página que interrompe o contato. Antes de produzir, é preciso saber onde a decisão está emperrando.",
  },
  {
    t: "Texto automático não corrige posicionamento",
    text: "A inteligência artificial ajuda a produzir. Ela não conhece, sozinha, por que um cliente escolhe sua empresa, quais dúvidas aparecem no atendimento e onde o concorrente leva vantagem.",
  },
];

const METODO = [
  {
    t: "O que o cliente encontra",
    d: "Buscamos sua empresa como alguém de fora buscaria. Observamos resultados, avaliações, perfis, páginas e as alternativas que aparecem ao lado.",
  },
  {
    t: "O que ele consegue entender",
    d: "Verificamos se a oferta está clara, se há motivos para confiar e se o caminho até o contato funciona sem exigir esforço desnecessário.",
  },
  {
    t: "A análise começa pelo que é público",
    d: "Não precisamos entrar no Instagram ou no gerenciador de anúncios. A primeira avaliação usa exatamente o que um possível cliente vê.",
  },
  {
    t: "A recomendação já vem com execução",
    d: "Escolhemos uma correção que caiba em 30 dias, fazemos o trabalho e acompanhamos um indicador combinado antes de começar.",
  },
];

const IA_VIS = [
  {
    t: "A comparação também acontece nas IAs",
    d: "Alguns clientes pedem indicações ao ChatGPT, Gemini ou Perplexity antes de visitar um site. Testamos perguntas que fazem sentido para o seu mercado.",
  },
  {
    t: "Você vê a resposta completa",
    d: "Registramos quando sua empresa aparece, quem é citado no lugar dela e quais fontes ajudam a sustentar a resposta. Sem transformar uma amostra em certeza.",
  },
  {
    t: "O diagnóstico aponta o que está faltando",
    d: "Pode ser informação inconsistente, pouca autoridade pública ou uma oferta mal explicada. Corrigimos o que está sob nosso controle; a resposta da plataforma não está.",
  },
];

const ENTREGAVEIS: {
  n: string;
  t: string;
  d: string;
  tone: "amber" | "orange" | "rose" | "ember" | "copper" | "flame";
  Icon: LucideIcon;
  bonus?: boolean;
}[] = [
  {
    n: "01",
    t: "Diagnóstico e ponto de partida",
    d: "Mostramos onde o cliente encontra dificuldade, como outras empresas se apresentam e qual número será acompanhado durante o trabalho.",
    tone: "amber",
    Icon: ScanSearch,
  },
  {
    n: "02",
    t: "Uma correção prioritária",
    d: "Você sabe o que será corrigido, por que isso veio primeiro, quem fará o trabalho e o que significa concluir a entrega.",
    tone: "orange",
    Icon: ListOrdered,
  },
  {
    n: "03",
    t: "Redação e correção no ponto escolhido",
    d: "Se o problema estiver na mensagem, escrevemos o texto a partir do serviço, das dúvidas dos clientes e do jeito de falar da empresa. Sem fórmulas prontas. Se a prioridade for técnica, executamos a correção combinada.",
    tone: "rose",
    Icon: FileText,
  },
  {
    n: "04",
    t: "Acompanhamento dos contatos",
    d: "Definimos quando responder, quando retomar a conversa e quando parar. Cada interessado fica com uma próxima ação visível.",
    tone: "ember",
    Icon: Sparkles,
  },
  {
    n: "05",
    t: "Comparação ao fim dos 30 dias",
    d: "Revisitamos o indicador escolhido, registramos o que mudou e explicamos o que ainda não pode ser atribuído ao trabalho.",
    tone: "copper",
    Icon: Radar,
  },
  {
    n: "06",
    t: "Reunião para decidir o próximo passo",
    d: "Apresentamos o trabalho, os resultados disponíveis e nossa recomendação. Você decide se encerra, mantém ou amplia a atuação.",
    tone: "flame",
    Icon: Clapperboard,
  },
];

/** Comparativo visual na seção #preco */
const PRECO_OUTROS = [
  "Muitos problemas listados de uma vez",
  "Recomendações sem responsável definido",
  "Mudanças simultâneas em vários canais",
  "Nenhum número registrado antes do trabalho",
  "Entrega encerrada no documento",
  "Dificuldade para saber o que realmente ajudou",
];

const PRECO_BONUS = {
  label: "Leitura inicial",
  price: 990,
  tip: "A leitura inicial mostra se existe um problema relevante para tratar. Quando o Sprint é contratado, ela já está incluída no valor.",
};

const PRECO_NOS: { label: string; price: number; tip?: string }[] = [
  { label: "Diagnóstico e registro do ponto de partida", price: 990 },
  { label: "Comparação com concorrentes diretos", price: 690 },
  { label: "Escolha da correção prioritária", price: 590 },
  { label: "Execução da correção escolhida", price: 1590 },
  { label: "Organização dos contatos comerciais", price: 690 },
  { label: "Medição e reunião de fechamento", price: 790 },
];

function formatPrecoBrl(value: number) {
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

const PRECO_STACK_TOTAL = PRECO_NOS.reduce((sum, item) => sum + item.price, 0);

const PASSOS = [
  {
    n: "01",
    t: "Refazemos o caminho do cliente",
    d: "Você envia o site ou o Instagram. Nós buscamos, comparamos, navegamos e tentamos entrar em contato como uma pessoa interessada faria.",
  },
  {
    n: "02",
    t: "Escolhemos o que merece atenção primeiro",
    d: "A recomendação considera importância comercial e possibilidade de execução em 30 dias. O trabalho começa somente depois de você aprovar o escopo.",
  },
  {
    n: "03",
    t: "Fazemos o trabalho e voltamos aos números",
    d: "No encerramento, mostramos o que foi alterado e comparamos o indicador definido no início. A continuidade é uma nova decisão, não uma renovação automática.",
  },
];

const FAQ = [
  {
    q: "O que eu recebo exatamente?",
    a: "Durante 30 dias, analisamos como sua empresa é encontrada e comparada, escolhemos uma correção, executamos o trabalho e acompanhamos um indicador. Você também recebe a organização dos contatos e a reunião final.",
  },
  {
    q: "Por que corrigir uma coisa de cada vez?",
    a: "Porque mudar site, perfil, anúncios e conteúdo ao mesmo tempo torna qualquer melhora difícil de explicar. Preferimos terminar uma correção importante e aprender com ela antes de abrir outra frente.",
  },
  {
    q: "Vocês garantem aumento de vendas?",
    a: "Não. Vendas também dependem da oferta, do atendimento, do preço e do momento do mercado. Nosso compromisso é executar o que foi aprovado e mostrar com honestidade o que mudou durante o período.",
  },
  {
    q: "Precisa da senha do Instagram?",
    a: "Para a análise inicial, não. Queremos ver a mesma experiência que o público encontra. Se a correção aprovada exigir acesso, isso será explicado antes e você poderá executá-la internamente.",
  },
  {
    q: "Quanto custa e em quanto tempo?",
    a: `O projeto piloto custa ${PRESENCA_PRECO_LABEL}. A primeira apresentação acontece em até 7 dias e o trabalho completo dura 30 dias. Depois das vagas-piloto, o valor previsto é ${PRESENCA_VALOR_ANCORA_LABEL}.`,
  },
  {
    q: "Como vocês comprovam o trabalho?",
    a: "Antes de alterar qualquer coisa, registramos a situação atual e escolhemos um indicador. No fim, mostramos a comparação e deixamos claro o que pode ou não ser relacionado ao trabalho.",
  },
  {
    q: "Existe fidelidade?",
    a: "Não. O projeto termina em 30 dias. Qualquer continuidade precisa de uma nova proposta e da sua aprovação.",
  },
  {
    q: "Vocês só entregam o relatório?",
    a: "Não. O diagnóstico serve para escolher o trabalho. O projeto inclui a execução da correção aprovada e a organização dos próximos contatos comerciais.",
  },
  {
    q: "Vocês olham se a IA recomenda a marca?",
    a: "Sim. Fazemos perguntas relacionadas ao seu serviço e registramos as respostas encontradas naquele momento. Isso é uma amostra, não uma promessa de que a plataforma sempre responderá da mesma maneira.",
  },
  {
    q: "Não tenho site. Serve?",
    a: "Serve. Começamos pelo Instagram, pelo perfil no Google e pelos demais resultados públicos. A ausência de um site pode ou não ser a prioridade; a análise é que vai mostrar.",
  },
  {
    q: "Isso entra em conflito com a minha agência?",
    a: "Não precisa entrar. Podemos entregar a recomendação e a especificação para sua agência executar. Se a Firemode ficar responsável pela correção, os limites de cada equipe serão combinados antes.",
  },
];

function Section({
  id,
  reduce,
  hero,
  theme = "dark",
  children,
}: {
  id: string;
  reduce: boolean | null;
  hero?: boolean;
  theme?: "dark" | "light";
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      setInView(true);
      return;
    }

    const check = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      // ~20% da tela mostrando → conteúdo entra (animação blur)
      if (visible / vh >= 0.2) setInView(true);
    };

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        check();
      });
    };

    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return (
    <section
      ref={ref}
      id={id}
      className={`lp-section lp-section--${theme}${hero ? " lp-section--hero" : ""}`}
      data-theme={theme}
      aria-label={id}
    >
      <SlideActiveContext.Provider value={reduce ? true : inView}>
        {hero ? children : <div className="lp-section__inner">{children}</div>}
      </SlideActiveContext.Provider>
    </section>
  );
}

function Frame({
  kicker,
  title,
  titleMuted,
  titleAccent,
  titleTail,
  sub,
  center,
  direction = "column",
  children,
}: {
  kicker?: string;
  title: string;
  titleMuted?: string;
  titleAccent?: string;
  /** Continuação branca depois do accent (ex.: “E até tem um site.”) */
  titleTail?: string;
  sub?: string;
  center?: boolean;
  direction?: "column" | "row";
  children: ReactNode;
}) {
  let order = 0;
  const kickerIndex = kicker ? order++ : -1;
  const titleIndex = order++;
  const accentIndex = titleAccent ? order++ : -1;
  const tailIndex = titleTail ? order++ : -1;
  const mutedIndex = titleMuted ? order++ : -1;
  const subIndex = sub ? order++ : -1;

  return (
    <div className={`lp-frame${direction === "row" ? " lp-frame--row" : ""}`}>
      <header className={`lp-frame__head${center ? " lp-frame__head--center" : ""}`}>
        {kicker ? (
          <BlurBox index={kickerIndex} delay={0} direction="top" className="w-fit" glare={false}>
            <Badge
              variant="outline"
              className="lp-kicker mb-1 h-auto rounded-md border-0 bg-orange-500/10 px-2.5 py-1 font-bold tracking-[0.14em] text-orange-300/90"
            >
              {kicker}
            </Badge>
          </BlurBox>
        ) : null}
        <BlurText
          as="h2"
          text={title}
          delay={55}
          animateBy="words"
          direction="top"
          index={titleIndex}
          className="lp-title"
          style={center ? { justifyContent: "center" } : undefined}
        />
        {titleAccent ? (
          <BlurText
            as="p"
            text={titleAccent}
            delay={55}
            animateBy="line"
            direction="top"
            index={accentIndex}
            className={`lp-title lp-title--accent${titleTail ? "" : ""}`}
            style={center ? { justifyContent: "center" } : undefined}
          />
        ) : null}
        {titleTail ? (
          <BlurText
            as="p"
            text={titleTail}
            delay={55}
            animateBy="words"
            direction="top"
            index={tailIndex}
            className="lp-title"
            style={center ? { justifyContent: "center" } : undefined}
          />
        ) : null}
        {titleMuted ? (
          <BlurText
            as="p"
            text={titleMuted}
            delay={55}
            animateBy="words"
            direction="top"
            index={mutedIndex}
            className="lp-title-muted"
            style={center ? { justifyContent: "center" } : undefined}
          />
        ) : null}
        {sub ? (
          <BlurText
            as="p"
            text={sub}
            delay={45}
            animateBy="words"
            direction="bottom"
            index={subIndex}
            className="lp-sub"
            style={center ? { justifyContent: "center" } : undefined}
          />
        ) : null}
      </header>
      <div className="lp-frame__body">{children}</div>
    </div>
  );
}

/** Tick curto via Web Audio (sem arquivo). */
function playChatTick() {
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 880;
    gain.gain.value = 0.045;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.045, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.start(t);
    osc.stop(t + 0.055);
    osc.onended = () => {
      void ctx.close();
    };
  } catch {
    /* ignore autoplay / unsupported */
  }
}

/** Simulação: pergunta na IA → concorrente é citado (não a marca do cliente). */
function AiChatMock() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  /** 0 idle · 1 engines · 2 user · 3 typing · 4 ai · 5 miss */
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce) {
      setStep(5);
      return;
    }
    const el = rootRef.current;
    if (!el) return;

    const timers: number[] = [];
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry || startedRef.current) return;
        // Só dispara quando o bloco está praticamente inteiro na tela
        if (entry.intersectionRatio < 0.92) return;
        startedRef.current = true;
        io.disconnect();

        const delays = [120, 700, 1500, 2400, 3600];
        delays.forEach((ms, i) => {
          timers.push(
            window.setTimeout(() => {
              setStep(i + 1);
              if (i !== 2) playChatTick(); // sem tik no "digitando"
            }, ms),
          );
        });
      },
      { threshold: [0, 0.5, 0.75, 0.92, 1] },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [reduce]);

  return (
    <div
      ref={rootRef}
      className={`lp-ai-chat${step > 0 ? " is-playing" : ""}${reduce ? " is-instant" : ""}`}
      aria-label="Simulação: pergunta em ChatGPT, Gemini ou Perplexity citando o concorrente"
      data-step={step}
    >
      <div
        className={`lp-ai-chat__engines${step >= 1 ? " is-in" : ""}`}
        aria-label="Onde as pessoas perguntam"
      >
        <span className="lp-ai-chat__engine" title="ChatGPT">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path
              fill="currentColor"
              d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.908 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.908 6.056 6.056 0 0 0-.747-7.065zm-9.022 12.608a4.475 4.475 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.736l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.493zM4.24 17.03a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.897a4.5 4.5 0 0 1-5.5-2.867zm-.777-8.895a4.47 4.47 0 0 1 2.37-1.975V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 3.463 8.135zm15.198 3.547-5.836-3.37 2.024-1.168a.076.076 0 0 1 .071 0l4.83 2.785a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.034-3.023-.141-.085-4.778-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.61zm-12.64 3.967-2.02-1.163a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"
            />
          </svg>
          <span>ChatGPT</span>
        </span>
        <span className="lp-ai-chat__engine" title="Gemini">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path
              fill="currentColor"
              d="M12 2c.4 3.6 2.4 6.6 6 8-3.6 1.4-5.6 4.4-6 8-.4-3.6-2.4-6.6-6-8 3.6-1.4 5.6-4.4 6-8zm7.5 11.2c.2 1.8 1.2 3.3 3 4-1.8.7-2.8 2.2-3 4-.2-1.8-1.2-3.3-3-4 1.8-.7 2.8-2.2 3-4zM4.5 4.2c.15 1.2.8 2.2 2 2.7-1.2.5-1.85 1.5-2 2.7-.15-1.2-.8-2.2-2-2.7 1.2-.5 1.85-1.5 2-2.7z"
            />
          </svg>
          <span>Gemini</span>
        </span>
        <span className="lp-ai-chat__engine" title="Perplexity">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path
              fill="currentColor"
              d="M4 4h3.2v6.4L12 4h3.1l-5.2 7.2L15.2 20H12l-4.8-6.8V20H4V4zm12.5 0H20v16h-3.5V4z"
            />
          </svg>
          <span>Perplexity</span>
        </span>
      </div>

      <div className="lp-ai-chat__thread">
        {step >= 2 ? (
          <div className="lp-ai-chat__msg lp-ai-chat__msg--user is-in">
            <p>
              Qual a melhor clínica de ortodontia perto de mim em Campinas? Quero aparelho
              invisível e atendimento rápido.
            </p>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="lp-ai-chat__msg lp-ai-chat__msg--ai lp-ai-chat__typing is-in" aria-hidden>
            <span className="lp-ai-chat__dot" />
            <span className="lp-ai-chat__dot" />
            <span className="lp-ai-chat__dot" />
          </div>
        ) : null}

        {step >= 4 ? (
          <div className="lp-ai-chat__msg lp-ai-chat__msg--ai is-in">
            <p className="lp-ai-chat__ai-label">Resposta da IA</p>
            <p>
              Uma indicação recorrente é a <strong>Clínica Horizonte</strong> — boa nota no
              Google, presença clara em Maps e conteúdo atualizado sobre alinhadores. Também
              aparecem Ortho Campinas e SoftSmile.
            </p>
            {step >= 5 ? (
              <p className="lp-ai-chat__miss is-in">
                <AlertTriangle className="lp-ai-chat__miss-icon" aria-hidden strokeWidth={2.4} />
                <span>A sua marca não entrou na resposta.</span>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  // Arredonda pra evitar mismatch SSR/client em floats (cos/sin)
  return {
    x: Math.round((cx + r * Math.cos(rad)) * 1000) / 1000,
    y: Math.round((cy + r * Math.sin(rad)) * 1000) / 1000,
  };
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
) {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const sweep = endDeg - startDeg;
  const large = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

function ScoreVelocimetro({ value }: { value: number }) {
  const score = Math.min(100, Math.max(0, value));
  const size = 148;
  const cx = size / 2;
  const cy = size / 2 + 6;
  const r = 52;
  const stroke = 11;
  const startDeg = 150;
  const sweep = 240;
  const endDeg = startDeg + sweep;
  const valueDeg = startDeg + (sweep * score) / 100;
  const needle = polar(cx, cy, r - 14, valueDeg);
  const ticks = [0, 25, 50, 75, 100];

  return (
    <div className="lp-dash-gauge" aria-label={`Score geral ${score}`}>
      <svg
        className="lp-dash-gauge__svg"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
      >
        <defs>
          <linearGradient
            id="lp-dash-gauge-grad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="55%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fcd34d" />
          </linearGradient>
        </defs>

        <path
          className="lp-dash-gauge__track"
          d={arcPath(cx, cy, r, startDeg, endDeg)}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          className="lp-dash-gauge__fill"
          d={arcPath(cx, cy, r, startDeg, valueDeg)}
          fill="none"
          stroke="url(#lp-dash-gauge-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
        />

        {ticks.map((t) => {
          const a = startDeg + (sweep * t) / 100;
          const outer = polar(cx, cy, r + 8, a);
          const inner = polar(cx, cy, r - 2, a);
          return (
            <line
              key={t}
              className="lp-dash-gauge__tick"
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="currentColor"
              strokeWidth={t % 50 === 0 ? 2 : 1.25}
              strokeLinecap="round"
            />
          );
        })}

        <line
          className="lp-dash-gauge__needle"
          x1={cx}
          y1={cy}
          x2={needle.x}
          y2={needle.y}
          stroke="#fdba74"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={5.5} fill="#fff7ed" />
        <circle cx={cx} cy={cy} r={2.5} fill="#ea580c" />

        <text
          x={cx}
          y={cy + 28}
          textAnchor="middle"
          className="lp-dash-gauge__value"
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy + 42}
          textAnchor="middle"
          className="lp-dash-gauge__unit"
        >
          / 100
        </text>
      </svg>
    </div>
  );
}

function DashApresentacaoMock() {
  const canais = [
    { l: "Site", n: 54 },
    { l: "GMB", n: 58 },
    { l: "Instagram", n: 71 },
    { l: "Busca", n: 49 },
    { l: "Ads", n: 44 },
    { l: "IA", n: 38 },
  ];

  const techChecks: {
    status: "ok" | "warn" | "bad";
    label: string;
    tag: string;
    prio?: boolean;
  }[] = [
    { status: "ok", label: "HTTPS ativo", tag: "ok" },
    { status: "bad", label: "Meta title genérico (“Home”)", tag: "urgente", prio: true },
    { status: "warn", label: "Sem schema LocalBusiness", tag: "rápido" },
    { status: "bad", label: "Sitemap 404 — Google não indexa bem", tag: "urgente", prio: true },
    { status: "bad", label: "Autoridade digital insuficiente para ser citada", tag: "urgente", prio: true },
    { status: "warn", label: "Mobile: botões apertados no CTA", tag: "médio" },
  ];

  const bioChecks: {
    status: "ok" | "warn" | "bad";
    label: string;
    tag: string;
    prio?: boolean;
  }[] = [
    { status: "bad", label: "Bio sem oferta clara (só “empreendedora”)", tag: "urgente", prio: true },
    { status: "warn", label: "Link na bio aponta pra home vazia", tag: "rápido" },
    { status: "bad", label: "Posicionamento confunde com concorrente X", tag: "alto", prio: true },
    { status: "warn", label: "Highlights sem prova (antes/depois, reviews)", tag: "médio" },
    { status: "ok", label: "Feed consistente visualmente", tag: "ok" },
  ];

  const rivais = [
    {
      nome: "Clínica Horizonte",
      tags: [
        { kind: "serp", label: "melhor no Google" },
        { kind: "ia", label: "melhor na IA" },
      ],
      nota: 74,
    },
    {
      nome: "Sorriso Urban",
      tags: [
        { kind: "ads", label: "melhor nos Ads" },
        { kind: "ia", label: "melhor na IA" },
      ],
      nota: 61,
    },
    {
      nome: "Ortho Campinas",
      tags: [{ kind: "site", label: "site mais rápido" }],
      nota: 52,
    },
  ];

  const acoes = [
    "Bio do Instagram",
    "Site e SEO",
    "Ajuste para IAs",
    "GMB",
    "Posicionamento",
    "Melhorar posts",
    "Criar artigos no blog",
    "Ads",
  ];

  const statusMark = {
    ok: { ch: "✓", cls: "lp-dash-check__status--ok" },
    warn: { ch: "!", cls: "lp-dash-check__status--warn" },
    bad: { ch: "×", cls: "lp-dash-check__status--bad" },
  } as const;

  return (
    <div
      id="dash-apresentacao-mock"
      className="lp-dash-mock relative w-full overflow-hidden"
      aria-label="Prévia do relatório Firemode — score, notas, rivais e ações"
    >
      <div className="lp-dash-mock__chrome">
        <span className="lp-dash-mock__dot lp-dash-mock__dot--hot" />
        <span className="lp-dash-mock__dot" />
        <span className="lp-dash-mock__dot" />
        <span className="lp-dash-mock__chrome-label">
          firemode · relatório · clínica.exemplo.br
        </span>
      </div>

      <div className="lp-dash-mock__body">
        <div className="lp-dash-mock__top lp-dash-mock__top--3">
          <div className="lp-dash-mock__score">
            <p className="lp-dash-mock__col-label">Score geral</p>
            <ScoreVelocimetro value={58} />
          </div>

          <div className="lp-dash-mock__channels">
            <p className="lp-dash-mock__col-label">Notas</p>
            {canais.map((c) => (
              <div key={c.l} className="lp-dash-mock__channel">
                <span className="lp-dash-mock__channel-l">{c.l}</span>
                <div className="lp-dash-mock__bar">
                  <div
                    className="lp-dash-mock__bar-fill"
                    style={{ width: `${c.n}%` }}
                  />
                </div>
                <span className="lp-dash-mock__channel-n">{c.n}</span>
              </div>
            ))}
          </div>

          <div className="lp-dash-rivais__main">
            <div className="lp-dash-mock__panel-head">
              <p className="lp-dash-mock__panel-title">Concorrentes</p>
              <span className="lp-dash-mock__panel-score">{rivais.length}</span>
            </div>
            <ul className="lp-dash-rivais__list">
              {rivais.map((r) => (
                <li key={r.nome}>
                  <div className="lp-dash-rivais__row">
                    <div className="lp-dash-rivais__left">
                      <p className="lp-dash-rivais__nome">{r.nome}</p>
                      <div className="lp-dash-rivais__tags">
                        {r.tags.map((tag) => (
                          <span
                            key={tag.label}
                            className={`lp-dash-origem lp-dash-origem--${tag.kind}`}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span
                      className={`lp-dash-rivais__nota${r.nota > 58 ? " lp-dash-rivais__nota--up" : ""}`}
                    >
                      {r.nota}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lp-dash-leitura">
          <div className="lp-dash-leitura__col">
            <p className="lp-dash-leitura__kicker">O que encontramos</p>
            <p className="lp-dash-leitura__text">
              A clínica aparece na busca, mas o site usa um título genérico e a bio não explica
              qual tratamento é oferecido. Quem chega pela primeira vez precisa procurar demais
              para entender se encontrou o lugar certo.
            </p>
          </div>
          <div className="lp-dash-leitura__col">
            <p className="lp-dash-leitura__kicker">O que acontece na comparação</p>
            <p className="lp-dash-leitura__text">
              A Clínica Horizonte explica alinhadores logo no resultado do Google e reúne mais
              avaliações recentes. Por isso ela parece uma escolha mais segura antes mesmo de
              alguém abrir os dois sites.
            </p>
          </div>
          <div className="lp-dash-leitura__col lp-dash-leitura__col--next">
            <p className="lp-dash-leitura__kicker">Primeira correção recomendada</p>
            <p className="lp-dash-leitura__text">
              Reescrever o título da página e a apresentação do perfil para deixar claros o
              tratamento, a cidade e o caminho para agendar uma avaliação.
            </p>
            <p className="lp-dash-leitura__efeito">
              A mudança pode ser publicada rapidamente e acompanhada por cliques no contato e
              pedidos de avaliação.
            </p>
          </div>
        </div>

        <div className="lp-dash-mock__panels">
          <div className="lp-dash-mock__panel">
            <div className="lp-dash-mock__panel-head">
              <p className="lp-dash-mock__panel-title">Site · score técnico</p>
              <span className="lp-dash-mock__panel-score">54</span>
            </div>
            <ul className="lp-dash-check">
              {techChecks.map((item) => (
                <li key={item.label}>
                  <span
                    className={`lp-dash-check__status ${statusMark[item.status].cls}`}
                    aria-hidden
                  >
                    {statusMark[item.status].ch}
                  </span>
                  <span className="text-left">{item.label}</span>
                  <span
                    className={`lp-dash-check__tag${item.prio ? " lp-dash-check__tag--prio" : ""}`}
                  >
                    {item.tag}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lp-dash-mock__panel">
            <div className="lp-dash-mock__panel-head">
              <p className="lp-dash-mock__panel-title">Bio · posicionamento</p>
              <span className="lp-dash-mock__panel-score">61</span>
            </div>
            <ul className="lp-dash-check">
              {bioChecks.map((item) => (
                <li key={item.label}>
                  <span
                    className={`lp-dash-check__status ${statusMark[item.status].cls}`}
                    aria-hidden
                  >
                    {statusMark[item.status].ch}
                  </span>
                  <span className="text-left">{item.label}</span>
                  <span
                    className={`lp-dash-check__tag${item.prio ? " lp-dash-check__tag--prio" : ""}`}
                  >
                    {item.tag}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lp-dash-actions">
          <p className="lp-dash-actions__title">O que fazer primeiro</p>
          <ul className="lp-dash-actions__compact">
            {acoes.map((lugar, i) => (
              <li key={lugar}>
                <span className="lp-dash-actions__n" aria-hidden>
                  {i + 1}º
                </span>
                <span className="lp-dash-actions__lugar">{lugar}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="lp-dash-mock__foot">
          Exemplo ilustrativo — o seu relatório usa os dados reais do site e das redes.
        </p>
      </div>
    </div>
  );
}

/** Simulação: capa + headline + legenda + leitura comercial da peça. */
function PostReelMock() {
  return (
    <div
      id="peca-conteudo-mock"
      className="lp-peca-mock"
      aria-label="Simulação de análise de post e reel Firemode"
    >
      <div className="lp-peca-mock__chrome">
        <span className="h-2 w-2 rounded-full bg-orange-500/70" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="lp-peca-mock__chrome-label">
          firemode · peça · reel · clínica.exemplo.br
        </span>
      </div>

      <div className="lp-peca-mock__grid">
        {/* Telefone / capa */}
        <div className="lp-peca-phone" aria-hidden={false}>
          <div className="lp-peca-phone__bezel">
            <div className="lp-peca-phone__screen">
              <figure className="lp-peca-cover">
                <Image
                  className="lp-peca-cover__photo"
                  src={PECA_CAPA.src}
                  alt={PECA_CAPA.alt}
                  title={PECA_CAPA.title}
                  width={PECA_CAPA.width}
                  height={PECA_CAPA.height}
                  sizes="(max-width: 860px) 220px, 260px"
                  loading="lazy"
                  decoding="async"
                />
                <div className="lp-peca-cover__shade" aria-hidden />
                <div className="lp-peca-cover__glow" aria-hidden />
                <div className="lp-peca-cover__grain" aria-hidden />
                <figcaption className="lp-peca-cover__handle">@clinica.exemplo</figcaption>
                <p className="lp-peca-cover__headline">
                  Ortodontia sem medo de sorrir no trabalho
                </p>
                <div className="lp-peca-cover__progress" aria-hidden>
                  <span />
                </div>
              </figure>
              <div className="lp-peca-caption">
                <p className="lp-peca-caption__meta">Legenda</p>
                <p className="lp-peca-caption__text">
                  Você evita sorrir em fotos de trabalho? Uma avaliação mostra
                  quais tratamentos podem ser indicados para o seu caso.{" "}
                  <span className="lp-peca-caption__cta">Fale com a equipe ↗</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Análise */}
        <div className="lp-peca-analise">
          <div className="lp-peca-analise__row">
            <div className="lp-peca-pill lp-peca-pill--ok">
              <span className="lp-peca-pill__k">Objetivo</span>
              <span className="lp-peca-pill__v">Explicar · gerar conversa</span>
            </div>
            <div className="lp-peca-pill lp-peca-pill--warn">
              <span className="lp-peca-pill__k">Próxima ação</span>
              <span className="lp-peca-pill__v">Pouco específica</span>
            </div>
          </div>

          <div className="lp-peca-block">
            <p className="lp-peca-block__title">O que funciona</p>
            <ul>
              <li>A situação é reconhecível: evitar sorrir em uma foto de trabalho.</li>
              <li>A frase é curta e pode ser lida sem abrir a legenda.</li>
              <li>O texto explica o problema antes de usar termos clínicos.</li>
            </ul>
          </div>

          <div className="lp-peca-block lp-peca-block--fix">
            <p className="lp-peca-block__title">O que precisa mudar</p>
            <ul>
              <li>
                “Fale com a equipe” ainda deixa uma dúvida: o que acontece depois?
                A chamada deve explicar o primeiro passo da avaliação.
              </li>
              <li>O início do vídeo precisa mostrar a situação prometida na capa.</li>
              <li>
                A legenda pode informar como funciona a avaliação e quanto tempo ela
                costuma levar, usando dados confirmados pela clínica.
              </li>
            </ul>
          </div>

          <div className="lp-peca-seq">
            <p className="lp-peca-seq__kicker">Sequência comercial</p>
            <p className="lp-peca-seq__lead">
              Nos comentários, 7 pessoas perguntaram{" "}
              <strong>“dá pra parcelar?”</strong> e{" "}
              <strong>“quanto tempo até o alinhamento?”</strong>
            </p>
            <p className="lp-peca-seq__next">
              Essas perguntas indicam o próximo conteúdo:{" "}
              <strong>custo, formas de pagamento e etapas do tratamento</strong>.
              Antes de publicar, a clínica revisa os valores e prazos informados.
            </p>
          </div>

          <p className="lp-peca-mock__foot">
            Exemplo ilustrativo. A recomendação real usa informações confirmadas
            pelo cliente e os dados encontrados na análise.
          </p>
        </div>
      </div>
    </div>
  );
}

function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function ramp(
  y: number,
  fromY: number,
  toY: number,
  fromV: number,
  toV: number,
) {
  if (y <= fromY) return fromV;
  if (y >= toY) return toV;
  return fromV + (toV - fromV) * smoothstep((y - fromY) / (toY - fromY));
}

/**
 * Luz gradual: começa no mesmo limiar do conteúdo (~20% da tela)
 * e completa numa rampa curta (~30% da viewport) — acende/apaga, sem “grudar” no scroll.
 */
function samplePresencaLight(scrollY: number, vh: number, hasGarantia: boolean): number {
  const metodo = document.getElementById("metodo");
  const preco = document.getElementById("preco");
  if (!metodo || !preco) return 0;

  const rampLen = Math.max(120, vh * 0.3);
  const startAt = (top: number) => top - vh * 0.8;
  const m0 = startAt(metodo.offsetTop);
  const p0 = startAt(preco.offsetTop);

  if (scrollY < m0) return 0;

  // Variante B: sem ilha dark de garantia — luz permanece até o fim
  if (!hasGarantia) {
    return ramp(scrollY, m0, m0 + rampLen, 0, 1);
  }

  const garantia = document.getElementById("garantia");
  if (!garantia) return ramp(scrollY, m0, m0 + rampLen, 0, 1);

  const g0 = startAt(garantia.offsetTop);
  if (scrollY < g0) return ramp(scrollY, m0, m0 + rampLen, 0, 1);
  if (scrollY < p0) return ramp(scrollY, g0, g0 + rampLen, 1, 0);
  return ramp(scrollY, p0, p0 + rampLen, 0, 1);
}

export default function PresencaVslLp({ whatsappUrl, variant = "a" }: Props) {
  const isB = variant === "b";
  const reduce = useReducedMotion();
  const ctaHref = whatsappUrl || "#interesse";
  const rootRef = useRef<HTMLDivElement>(null);
  const dores = isB ? PRESENCA_B_DORES : DORES;
  const faq = isB ? PRESENCA_B_FAQ : FAQ;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let raf = 0;
    const apply = () => {
      raf = 0;
      const light = samplePresencaLight(window.scrollY, window.innerHeight, !isB);
      root.style.setProperty("--lp-light", light.toFixed(4));
      root.dataset.light = light >= 0.45 ? "1" : "0";
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isB]);

  return (
    <div
      id="lp-presenca"
      ref={rootRef}
      className={`lp-presenca${isB ? " lp-presenca--b" : ""}`}
      style={{ ["--lp-light" as string]: 0 }}
      data-light="0"
      data-variant={variant}
    >
      {!reduce ? (
        <div className="lp-color-bends" aria-hidden>
          <ColorBends
            colors={["#ea580c", "#fb923c", "#c2410c", "#7c2d12"]}
            rotation={82}
            speed={0.28}
            scale={1.05}
            frequency={1}
            warpStrength={0.85}
            mouseInfluence={0.7}
            noise={0.08}
            parallax={0.45}
            iterations={2}
            intensity={0.95}
            bandWidth={5.5}
            transparent
            autoRotate={0.35}
          />
        </div>
      ) : null}

      <div className="lp-presenca__wash" aria-hidden />

      <div className="lp-presenca__atmosphere" aria-hidden>
        <div className="lp-presenca__grain" />
      </div>

      <PresencaMenubar hideGarantia={isB} />

      <div className="lp-scroll">
        <Section id="hero" hero reduce={reduce}>
          <PresencaHeroAb whatsappUrl={whatsappUrl} lpVariant={variant} />
        </Section>

        {/* Vídeo — temporariamente oculto; reativar quando o conteúdo estiver pronto
        <Section id="video" reduce={reduce}>
          <Frame center kicker="Em um minuto" title="Veja como funciona">
            <BlurBox index={BLUR_BODY_START} direction="bottom">
              <div id="video-player" className="lp-video-player lp-glass">
                <button type="button" className="lp-video-player__play" aria-label="Assistir vídeo">
                  <span className="lp-video-player__icon" aria-hidden>
                    ▶
                  </span>
                </button>
              </div>
            </BlurBox>
          </Frame>
        </Section>
        */}

        <Section id="dor" reduce={reduce}>
          <Frame
            title={isB ? PRESENCA_B_DOR_TITULO.title : "O cliente não vê a empresa que você vê por dentro."}
            titleAccent={isB ? PRESENCA_B_DOR_TITULO.titleAccent : "Ele vê uma tela."}
            titleMuted={
              isB
                ? PRESENCA_B_DOR_TITULO.titleMuted
                : "Se a busca, o perfil ou o site contam mal a sua história, a comparação começa com você em desvantagem."
            }
          >
            <div className="lp-grid-3">
              {dores.map((item, i) => (
                <BlurBox
                  key={item.t}
                  index={BLUR_BODY_START + i}
                  direction="bottom"
                  className="h-full"
                >
                  <Card className={`${glassCard} h-full`}>
                    <CardHeader className={glassPad}>
                      <p className="lp-card-title">{item.t}</p>
                      <p className="lp-card-body">{item.text}</p>
                    </CardHeader>
                  </Card>
                </BlurBox>
              ))}
            </div>
          </Frame>
        </Section>

        <Section id="metodo" theme="light" reduce={reduce}>
          <div className="lp-split lp-split--col">
            <Frame
              kicker="Como fazemos a análise"
              title="Seguimos o caminho de quem ainda não conhece você."
              sub="O diagnóstico reúne o que está visível ao público, o funcionamento dos canais e a forma como concorrentes diretos se apresentam."
              direction="row"
            >
              <div className="lp-grid-2 mt-1">
                {METODO.map((p, i) => (
                  <BlurBox key={p.t} index={BLUR_BODY_START + i} direction="bottom" className="h-full">
                    <Card className={`${glassCard} h-full`}>
                      <CardHeader className={glassPad}>
                        <p className="lp-card-title">{p.t}</p>
                        <p className="lp-card-body">{p.d}</p>
                      </CardHeader>
                    </Card>
                  </BlurBox>
                ))}
              </div>
            </Frame>
            <BlurBox
              index={BLUR_BODY_START + METODO.length}
              direction="bottom"
              className="min-w-0"
            >
              <DashApresentacaoMock />
            </BlurBox>
          </div>
        </Section>

        <Section id="conteudo" theme="light" reduce={reduce}>
          <Frame
            kicker="Conteúdo"
            title="O próximo conteúdo precisa responder a uma dúvida real."
            sub="Analisamos capas, títulos, legendas e comentários. A recomendação explica o que manter, o que alterar e qual assunto merece a próxima publicação."
          >
            <BlurBox index={BLUR_BODY_START} direction="bottom" className="min-w-0">
              <PostReelMock />
            </BlurBox>
          </Frame>
        </Section>

        <Section id="ia" theme="light" reduce={reduce}>
          <div className="lp-split lp-split--col">
            <Frame
              direction="row"
              kicker="Visibilidade em IA"
              title="Alguns clientes já pedem indicações a uma IA."
              sub="Testamos perguntas plausíveis para o seu mercado e registramos quais empresas, páginas e argumentos aparecem nas respostas."
            >
              <BlurBox index={BLUR_BODY_START} direction="bottom" className="min-w-0">
                <AiChatMock />
              </BlurBox>
            </Frame>
            <div className="lp-grid-3">
              {IA_VIS.map((p, i) => (
                <BlurBox
                  key={p.t}
                  index={BLUR_BODY_START + 1 + i}
                  direction="bottom"
                  className="h-full"
                >
                  <Card className={`${glassCard} h-full`}>
                    <CardHeader className={glassPad}>
                      <p className="lp-card-title">{p.t}</p>
                      <p className="lp-card-body">{p.d}</p>
                    </CardHeader>
                  </Card>
                </BlurBox>
              ))}
            </div>
          </div>
        </Section>

        <Section id="como" theme="light" reduce={reduce}>
          <Frame
            kicker={isB ? PRESENCA_B_COMO.kicker : "Como funciona"}
            title={isB ? PRESENCA_B_COMO.title : "O trabalho cabe em 30 dias porque tem limite."}
            titleAccent={isB ? PRESENCA_B_COMO.titleAccent : undefined}
            sub={
              isB
                ? PRESENCA_B_COMO.sub
                : "A proposta define uma correção, um responsável e um indicador. Isso evita um projeto longo que tenta mexer em tudo e não termina nada."
            }
          >
            <ol className="lp-timeline" aria-label="Passos do diagnóstico Firemode">
              {(isB ? PRESENCA_B_COMO.passos : PASSOS).map((s, i) => (
                <li key={s.n} className="lp-timeline__step">
                  <BlurBox
                    index={BLUR_BODY_START + i}
                    direction="bottom"
                    className="lp-timeline__card h-full"
                  >
                    <div className="lp-timeline__marker" aria-hidden>
                      <span className="lp-timeline__dot">
                        <span className="lp-timeline__n">{s.n}</span>
                      </span>
                    </div>
                    <Card className={`${glassCard} h-full`}>
                      <CardHeader className={glassPad}>
                        <p className="lp-card-title">{s.t}</p>
                        <p className="lp-card-body">{s.d}</p>
                      </CardHeader>
                    </Card>
                  </BlurBox>
                </li>
              ))}
            </ol>
            {isB ? (
              <p className="lp-b-diferencial mt-6 text-center text-base leading-relaxed text-zinc-600 md:text-lg">
                {PRESENCA_B_DIFERENCIAL}
              </p>
            ) : null}
          </Frame>
        </Section>

        <Section id="depois" theme="light" reduce={reduce}>
          <Frame
            center
            kicker={isB ? PRESENCA_B_ENTREGA.kicker : "O que está incluído"}
            title={isB ? PRESENCA_B_ENTREGA.title : "Você recebe o diagnóstico e a correção pronta."}
            sub={
              isB
                ? PRESENCA_B_ENTREGA.sub
                : "A entrega não termina na recomendação. O valor inclui a execução do ponto aprovado, a organização do acompanhamento comercial e a medição final."
            }
          >
            <div className="lp-grid-3">
              {(isB
                ? PRESENCA_B_ENTREGAVEIS.map((item, idx) => ({
                    ...item,
                    tone: ENTREGAVEIS[idx]?.tone ?? ("orange" as const),
                    Icon: ENTREGAVEIS[idx]?.Icon ?? Sparkles,
                    bonus: "bonus" in item ? item.bonus : undefined,
                  }))
                : ENTREGAVEIS
              ).map((item, i) => (
                <BlurBox
                  key={item.t}
                  index={BLUR_BODY_START + i}
                  direction="bottom"
                  className="h-full"
                >
                  <Card
                    className={`lp-entrega lp-entrega--${item.tone}${item.bonus ? " lp-entrega--bonus" : ""} h-full gap-0 border-0 py-0 text-inherit shadow-none ring-0`}
                  >
                    <CardHeader className={`${glassPad} relative`}>
                      <div className="lp-entrega__top">
                        <span className="lp-entrega__icon" aria-hidden>
                          <item.Icon strokeWidth={2.1} />
                        </span>
                        <span className="lp-entrega__n">{item.n}</span>
                      </div>
                      <p className="lp-card-title mt-3">
                        {item.bonus ? <span className="lp-entrega__badge">Bônus</span> : null}
                        {item.t}
                      </p>
                      <p className="lp-card-body">{item.d}</p>
                    </CardHeader>
                  </Card>
                </BlurBox>
              ))}
            </div>
          </Frame>
        </Section>

        {!isB ? (
          <Section id="garantia" reduce={reduce}>
            <Frame
              center
              kicker="O nosso compromisso"
              title="Você sabe o que será feito antes de contratar."
              sub="A proposta registra a correção escolhida, o indicador acompanhado e o que precisa estar entregue ao fim dos 30 dias."
            >
              <div className="lp-grid-2 mx-auto max-w-3xl">
                <BlurBox index={BLUR_BODY_START} direction="bottom" className="h-full">
                  <Card className={`${glassCardHot} h-full`}>
                    <CardHeader className={`${glassPad} md:p-7`}>
                      <p className="text-5xl font-black tabular-nums text-orange-300 md:text-6xl">30</p>
                      <p className="lp-card-title mt-2">dias de Sprint</p>
                      <p className="lp-card-body text-zinc-400">
                        Prazo definido para analisar, executar a correção aprovada e apresentar a comparação final.
                      </p>
                    </CardHeader>
                  </Card>
                </BlurBox>
                <BlurBox index={BLUR_BODY_START + 1} direction="bottom" className="h-full">
                  <Card className={`${glassCard} h-full border-orange-400/40 bg-orange-600/90`}>
                    <CardHeader className={`${glassPad} md:p-7`}>
                      <p className="lp-card-title lp-card-title--lg mt-2 text-white">
                        Sem promessa de venda garantida
                      </p>
                      <p className="lp-card-body mt-2 text-zinc-400">
                        Vendas dependem de fatores que nenhum fornecedor controla sozinho. Nosso
                        compromisso é <strong>entregar o trabalho aprovado</strong> e mostrar o
                        resultado disponível sem forçar uma conclusão favorável.
                      </p>
                    </CardHeader>
                  </Card>
                </BlurBox>
              </div>
            </Frame>
          </Section>
        ) : null}

        <Section id="preco" theme="light" reduce={reduce}>
          {isB ? (
            <Frame
              center
              kicker={PRESENCA_B_PRECO.kicker}
              title={PRESENCA_B_PRECO.title}
              sub={PRESENCA_B_PRECO.sub}
            >
              <div className="lp-esteira">
                {PRESENCA_B_ESTEIRA.map((tier, i) => (
                  <BlurBox
                    key={tier.nivel}
                    index={BLUR_BODY_START + i}
                    direction="bottom"
                    className="h-full"
                  >
                    <div
                      className={`lp-esteira__card${tier.hot ? " lp-esteira__card--hot" : ""}`}
                    >
                      {tier.badge ? (
                        <span className="lp-esteira__badge">{tier.badge}</span>
                      ) : null}
                      <p className="lp-esteira__nivel">Nível {tier.nivel}</p>
                      <p className="lp-esteira__nome">{tier.nome}</p>
                      <p className="lp-esteira__preco">{tier.preco}</p>
                      <p className="lp-esteira__desc">{tier.descricao}</p>
                      <ul className="lp-esteira__checks">
                        {tier.entregas.map((item) => (
                          <li key={item}>
                            <span aria-hidden>✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <a href={ctaHref} className="lp-btn-primary lp-esteira__cta">
                        {tier.cta}
                      </a>
                    </div>
                  </BlurBox>
                ))}
              </div>
              <p className="lp-price__note mt-6">
                {PRESENCA_B_DIFERENCIAL}
                <br />
                Primeira entrega do Pacote Ativo {PRESENCA_PRAZO_ENTREGA}.
              </p>
            </Frame>
          ) : (
            <Frame
              center
              kicker="Investimento"
              title="Projeto de 30 dias por R$ 3.900."
              sub="Abrimos três projetos-piloto neste formato. Depois deles, o valor previsto passa para R$ 4.900."
            >
              <div className="lp-price">
                <div className="lp-value-compare">
                  <BlurBox index={BLUR_BODY_START} direction="bottom" className="h-full">
                    <div className="lp-value-card lp-value-card--muted">
                      <p className="lp-value-card__label">Quando termina no diagnóstico</p>
                      <p className="lp-value-card__lead">O trabalho fica com você</p>
                      <ul className="lp-checklist lp-checklist--muted">
                        {PRECO_OUTROS.map((item) => (
                          <li key={item}>
                            <span className="lp-checklist__mark" aria-hidden>
                              —
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </BlurBox>
                  <BlurBox index={BLUR_BODY_START + 1} direction="bottom" className="h-full">
                    <div className="lp-value-card lp-value-card--hot">
                      <p className="lp-value-card__label">Firemode</p>
                      <p className="lp-value-card__lead">O que está incluído no projeto</p>
                      <ul className="lp-checklist lp-value-stack">
                        {PRECO_NOS.map((item) => (
                          <li key={item.label} className="lp-value-stack__row">
                            <span className="lp-checklist__mark" aria-hidden>
                              ✓
                            </span>
                            <span className="lp-value-stack__main">
                              <span className="lp-checklist__text">
                                {item.label}
                                {item.tip ? (
                                  <span className="lp-checklist__tip">
                                    <button
                                      type="button"
                                      className="lp-checklist__tip-btn"
                                      aria-label={`O que é: ${item.label}`}
                                    >
                                      ?
                                    </button>
                                    <span className="lp-checklist__tip-bubble" role="tooltip">
                                      {item.tip}
                                    </span>
                                  </span>
                                ) : null}
                              </span>
                              <span className="lp-value-stack__price">
                                {formatPrecoBrl(item.price)}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="lp-value-stack__total">
                        <span>Valor total separado</span>
                        <span className="lp-value-stack__total-value">
                          {formatPrecoBrl(PRECO_STACK_TOTAL)}
                        </span>
                      </div>
                    </div>
                  </BlurBox>
                </div>

                <BlurBox index={BLUR_BODY_START + 2} direction="bottom" glare={false}>
                  <div className="lp-price__compare">
                    <div className="lp-price__bonus-col">
                      <GlareHover asChild transitionDuration={3200}>
                        <div
                          className={`lp-price-bonus${reduce ? "" : " lp-price-bonus--pulse"}`}
                          title={PRECO_BONUS.tip}
                        >
                          <span className="lp-price-bonus__tag">Incluído no Sprint</span>
                          <div className="lp-price-bonus__row">
                            <span className="lp-price-bonus__label">{PRECO_BONUS.label}</span>
                            <span className="lp-price-bonus__price">
                              {formatPrecoBrl(PRECO_BONUS.price)}
                            </span>
                          </div>
                          <p className="lp-price-bonus__desc">
                            A leitura inicial mostra se há um problema que vale tratar. Se você
                            contratar o projeto, ela já está incluída no valor.
                          </p>
                        </div>
                      </GlareHover>
                    </div>
                    <GlareHover asChild transitionDuration={3200}>
                      <div className="lp-price__col lp-price__col--hot">
                        <p className="lp-price__label">Sprint piloto · 3 vagas</p>
                        <p className="lp-price__value">{PRESENCA_PRECO_LABEL}</p>
                        <p className="lp-price__meta">
                          Primeira entrega {PRESENCA_PRAZO_ENTREGA}
                        </p>
                      </div>
                    </GlareHover>
                  </div>
                  <p className="lp-price__note">
                    Diagnóstico em até 7 dias e conclusão do Sprint em 30 dias.
                    <br />
                    Preço-piloto de R$ 3.900. Próximas vagas: R$ 4.900.
                    <br />
                    O projeto termina em 30 dias e não tem renovação automática.
                  </p>
                  <a href={ctaHref} className="lp-btn-primary mt-6 inline-flex">
                    Quero uma leitura do meu caso
                  </a>
                </BlurBox>
              </div>
            </Frame>
          )}
        </Section>

        <Section id="interesse" theme="light" reduce={reduce}>
          <Frame
            center
            kicker={isB ? PRESENCA_B_INTERESSE.kicker : "Seu caso"}
            title={isB ? PRESENCA_B_INTERESSE.title : "Envie seu site ou Instagram para uma primeira leitura"}
            sub={
              isB
                ? PRESENCA_B_INTERESSE.sub
                : "A conversa começa com o que já está público. Se não encontrarmos uma correção que justifique o projeto, diremos isso."
            }
          >
            <BlurBox index={BLUR_BODY_START} direction="bottom">
              <PresencaInteresseChat
                ctaHref={ctaHref}
                ctaLabel={
                  isB
                    ? "Continuar no WhatsApp"
                    : "Continuar esta conversa no WhatsApp"
                }
                reduceMotion={!!reduce}
              />
            </BlurBox>
          </Frame>
        </Section>

        <Section id="faq" theme="light" reduce={reduce}>
          <Frame kicker="Antes de decidir" title="O que normalmente nos perguntam">
            <BlurBox index={BLUR_BODY_START} direction="bottom">
              <Accordion
                defaultValue={["0"]}
                className="lp-glass lp-faq mx-auto max-w-2xl p-5 md:p-7"
              >
                {faq.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={String(i)}
                    className="lp-faq__item border-white/10"
                  >
                    <AccordionTrigger className="lp-faq__trigger py-3.5 text-base font-bold text-white hover:no-underline **:data-[slot=accordion-trigger-icon]:text-orange-400/90">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="lp-faq__answer pb-3.5 text-base leading-relaxed text-zinc-400">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </BlurBox>
            <p className="lp-faq__foot mt-8 text-center text-base text-zinc-500">
              Firemode · Diagnóstico de presença digital
            </p>
          </Frame>
        </Section>
      </div>

      <GradualBlur
        target="page"
        position="top"
        height="7rem"
        strength={2.2}
        divCount={6}
        curve="bezier"
        exponential
        opacity={1}
        style={{ zIndex: 25, pointerEvents: "none" }}
      />
      <GradualBlur
        target="page"
        position="bottom"
        height="8rem"
        strength={2.4}
        divCount={6}
        curve="bezier"
        exponential
        opacity={1}
        style={{ zIndex: 25, pointerEvents: "none" }}
      />

      <PresencaStickyGuide finalHref={ctaHref} hideGarantia={isB} />
      <PresencaChatNudge ctaHref={ctaHref} reduceMotion={!!reduce} />
    </div>
  );
}
