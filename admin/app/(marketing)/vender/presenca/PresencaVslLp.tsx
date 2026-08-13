"use client";

import "./presenca-lp.css";
import PresencaHeroAb from "./PresencaHeroAb";
import PresencaMenubar from "./PresencaMenubar";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import GradualBlur from "@/components/ui/gradual-blur";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildPresencaLeadWhatsappMsg } from "@/lib/vender-presenca-lead";
import { useReducedMotion } from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

const glassCard =
  "lp-glass gap-0 border-0 bg-transparent py-0 text-inherit shadow-none ring-0";
const glassCardHot =
  "lp-glass lp-glass--hot gap-0 border-0 bg-transparent py-0 text-inherit shadow-none ring-0";
const glassPad = "lp-glass--pad px-(--card-spacing)";

type Props = { whatsappUrl: string | null };

const PONTOS = [
  {
    t: "Te acham no Google?",
    d: "Se busca e não te encontra, o resto quase não importa.",
  },
  {
    t: "O que as redes dizem",
    d: "Seu Instagram vende — ou só enche o feed?",
  },
  {
    t: "O anúncio fecha?",
    d: "A pessoa clica e compra — ou some no meio do caminho?",
  },
  {
    t: "O que o cliente sente",
    d: "O que você fala × o que ele acredita. Se não bate, ele vai embora.",
  },
];

const PASSOS = [
  { n: "01", t: "Você manda site ou Instagram", d: "Tem site? Olhamos tudo. Só a rede? Olhamos o Instagram." },
  { n: "02", t: "Você vê a apresentação", d: "Nota, o que está errado e o que fazer primeiro." },
  { n: "03", t: "Te mandamos um relatório a cada 15 dias", d: "Vê se a nota sobe enquanto você ajusta." },
  { n: "04", t: "Garantia de 60 dias", d: "Não melhorou? Devolvemos o dinheiro." },
];

const DEPOIMENTOS = [
  { quote: "Espaço para depoimento — resultado após o diagnóstico.", nome: "Nome", cargo: "Cargo · Empresa" },
  { quote: "Espaço para depoimento — clareza do que priorizar.", nome: "Nome", cargo: "Cargo · Empresa" },
  { quote: "Espaço para depoimento — apresentação com o time.", nome: "Nome", cargo: "Cargo · Empresa" },
];

const ARTIGOS = [
  { tag: "Presença", titulo: "Título do artigo — espaço editorial", resumo: "Resumo curto. Conteúdo real depois.", href: "#blog" },
  { tag: "Comercial", titulo: "Título do artigo — espaço editorial", resumo: "Resumo curto. Conteúdo real depois.", href: "#blog" },
  { tag: "Marketing", titulo: "Título do artigo — espaço editorial", resumo: "Resumo curto. Conteúdo real depois.", href: "#blog" },
];

const FAQ = [
  {
    q: "Já tenho agência.",
    a: "Ótimo. A gente mostra se o esforço está no lugar certo. Dá pra postar bem e ainda sumir.",
  },
  {
    q: "Não tenho site. Serve?",
    a: "Serve. Olhamos o Instagram e os concorrentes. E falamos o que você perde sem site.",
  },
  {
    q: "Não quero relatório chato.",
    a: "Não é PDF pra arquivar. É apresentação pra decidir: onde some e o que fazer agora.",
  },
  {
    q: "E se não melhorar?",
    a: "Em 60 dias, se a nota não subir, devolvemos o valor.",
  },
  {
    q: "Só pra empresa grande?",
    a: "Não. Feito pra quem vende serviço e não tem time enorme.",
  },
];

function ProgressSteps({ active = 1, total = 4 }: { active?: number; total?: number }) {
  return (
    <div className="lp-progress" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < active ? "is-on" : undefined} />
      ))}
    </div>
  );
}

function Section({
  id,
  reduce,
  hero,
  children,
}: {
  id: string;
  reduce: boolean | null;
  hero?: boolean;
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
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.28, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <section
      ref={ref}
      id={id}
      className={`lp-section${hero ? " lp-section--hero" : ""}`}
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
  sub,
  center,
  progress,
  direction = "column",
  children,
}: {
  kicker?: string;
  title: string;
  titleMuted?: string;
  titleAccent?: string;
  sub?: string;
  center?: boolean;
  progress?: number;
  direction?: "column" | "row";
  children: ReactNode;
}) {
  let order = 0;
  const kickerIndex = kicker ? order++ : -1;
  const titleIndex = order++;
  const mutedIndex = titleMuted ? order++ : -1;
  const accentIndex = titleAccent ? order++ : -1;
  const subIndex = sub ? order++ : -1;

  return (
    <div className={`lp-frame${direction === "row" ? " lp-frame--row" : ""}`}>
      <header className={`lp-frame__head${center ? " lp-frame__head--center" : ""}`}>
        {progress != null ? <ProgressSteps active={progress} /> : null}
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
        {titleAccent ? (
          <BlurText
            as="p"
            text={titleAccent}
            delay={55}
            animateBy="words"
            direction="top"
            index={accentIndex}
            className="lp-title mt-1 text-orange-400"
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

function DashApresentacaoMock() {
  return (
    <div
      id="dash-apresentacao-mock"
      className="lp-dash-mock relative w-full overflow-hidden"
      aria-label="Prévia do painel da apresentação Firemode"
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-orange-500/70" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="ml-3 text-base font-medium tracking-wide text-zinc-500">
          firemode · apresentação
        </span>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-[1fr_1.2fr]">
        <div className="lp-glass rounded-xl p-4">
          <p className="lp-card-meta">Score geral</p>
          <p className="mt-2 text-4xl font-bold tabular-nums text-white">67</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[67%] rounded-full bg-gradient-to-r from-orange-600 to-amber-300" />
          </div>
        </div>
        <div className="space-y-2">
          {[
            { l: "Site", n: 72 },
            { l: "Google", n: 58 },
            { l: "Instagram", n: 81 },
            { l: "Ads", n: 44 },
          ].map((c) => (
            <div
              key={c.l}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2"
            >
              <span className="w-20 text-base font-semibold text-zinc-300">{c.l}</span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-orange-500/80"
                  style={{ width: `${c.n}%` }}
                />
              </div>
              <span className="w-8 text-right text-base font-bold tabular-nums text-zinc-400">
                {c.n}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FormInteresse({ whatsappUrl }: { whatsappUrl: string | null }) {
  const [site, setSite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok">("idle");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!whatsappUrl) return;

    const msg = buildPresencaLeadWhatsappMsg({
      nome,
      site,
      instagram,
      whatsapp,
      email,
    });
    if (!msg) {
      setError("Manda o site ou o Instagram — um dos dois.");
      return;
    }
    if (!whatsapp.trim() || !email.trim()) {
      setError("Precisa do WhatsApp e do e-mail.");
      return;
    }

    const sep = whatsappUrl.includes("?") ? "&" : "?";
    window.open(
      `${whatsappUrl}${sep}text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setStatus("ok");
  }

  return (
    <Card
      id="form-interesse"
      className={`${glassCard} lp-form-interesse mx-auto w-full max-w-md`}
    >
      <CardContent className="space-y-3 p-6 md:p-8">
        <ProgressSteps active={2} />
        <p className="text-left text-base leading-relaxed text-zinc-400">
          Site ou Instagram. WhatsApp e e-mail pra falar com você.
        </p>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1.5 text-left">
            <Label
              htmlFor="interesse-nome"
              className="text-base font-semibold uppercase tracking-wider text-orange-300/70"
            >
              Seu nome
            </Label>
            <Input
              id="interesse-nome"
              name="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Como te chamamos"
              className="lp-input h-auto"
              autoComplete="name"
            />
          </div>
          <div className="space-y-1.5 text-left">
            <Label
              htmlFor="interesse-site"
              className="text-base font-semibold uppercase tracking-wider text-orange-300/70"
            >
              Site da empresa{" "}
              <span className="normal-case tracking-normal font-medium text-zinc-500">
                (opcional)
              </span>
            </Label>
            <Input
              id="interesse-site"
              name="site"
              value={site}
              onChange={(e) => {
                setError(null);
                setSite(e.target.value);
              }}
              placeholder="seusite.com.br"
              className="lp-input h-auto"
              autoComplete="url"
              inputMode="url"
            />
          </div>
          <div className="space-y-1.5 text-left">
            <Label
              htmlFor="interesse-instagram"
              className="text-base font-semibold uppercase tracking-wider text-orange-300/70"
            >
              Instagram{" "}
              <span className="normal-case tracking-normal font-medium text-zinc-500">
                (sem site? use este)
              </span>
            </Label>
            <Input
              id="interesse-instagram"
              name="instagram"
              value={instagram}
              onChange={(e) => {
                setError(null);
                setInstagram(e.target.value);
              }}
              placeholder="@suaempresa"
              className="lp-input h-auto"
              autoComplete="username"
            />
          </div>
          <div className="space-y-1.5 text-left">
            <Label
              htmlFor="interesse-whatsapp"
              className="text-base font-semibold uppercase tracking-wider text-orange-300/70"
            >
              WhatsApp
            </Label>
            <Input
              id="interesse-whatsapp"
              name="whatsapp"
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="(11) 99999-9999"
              className="lp-input h-auto"
              autoComplete="tel"
              inputMode="tel"
            />
          </div>
          <div className="space-y-1.5 text-left">
            <Label
              htmlFor="interesse-email"
              className="text-base font-semibold uppercase tracking-wider text-orange-300/70"
            >
              E-mail
            </Label>
            <Input
              id="interesse-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@empresa.com.br"
              className="lp-input h-auto"
              autoComplete="email"
              inputMode="email"
            />
          </div>
          {error ? (
            <p className="text-left text-base text-orange-300/90">{error}</p>
          ) : null}
          <Button
            id="interesse-submit"
            type="submit"
            disabled={!whatsappUrl}
            className="lp-btn-primary h-auto w-full"
          >
            {status === "ok" ? "Abrindo WhatsApp…" : "Quero o diagnóstico"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function PresencaVslLp({ whatsappUrl }: Props) {
  const reduce = useReducedMotion();
  const ctaHref = whatsappUrl || "#interesse";

  return (
    <div id="lp-presenca" className="lp-presenca">
      <div className="lp-presenca__atmosphere" aria-hidden>
        <div className="lp-presenca__orb" />
        <div className="lp-presenca__grid" />
        <div className="lp-presenca__grain" />
      </div>

      <PresencaMenubar />

      <div className="lp-scroll">
        <Section id="hero" hero reduce={reduce}>
          <PresencaHeroAb whatsappUrl={whatsappUrl} />
        </Section>

        <Section id="video" reduce={reduce}>
          <Frame
            center
            progress={1}
            kicker="Em 2 minutos"
            title="Veja como funciona"
          >
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

        <Section id="dor" reduce={reduce}>
          <Frame
            title="Não é falta de post."
            titleMuted="É não aparecer quando o cliente te procura."
          >
            <div className="lp-grid-3">
              {[
                {
                  text: "Você posta todo dia. Quando o cliente digita seu nome no Google, quase não te encontra.",
                  imgAlt: "Guia — Instagram × Google",
                },
                {
                  text: "Você paga anúncio pra trazer gente. A pessoa clica — e o site não fecha a venda. Dinheiro queimando.",
                  imgAlt: "Guia — anúncio × site",
                },
                {
                  text: "Tem concorrente que posta menos. Mesmo assim, ele aparece primeiro. O cliente que era seu vira dele — sem você saber.",
                  imgAlt: "Guia — concorrente",
                },
              ].map((item, i) => (
                <BlurBox
                  key={item.text}
                  index={BLUR_BODY_START + i}
                  direction="bottom"
                  className="h-full"
                >
                  <Card className={`${glassCard} h-full`}>
                    <div className="lp-img-guia" aria-label={item.imgAlt}>
                      <span className="lp-img-guia__label">Imagem guia</span>
                    </div>
                    <CardContent
                      className={`${glassPad} text-base leading-relaxed text-zinc-300`}
                    >
                      {item.text}
                    </CardContent>
                  </Card>
                </BlurBox>
              ))}
            </div>
          </Frame>
        </Section>

        <Section id="garantia" reduce={reduce}>
          <Frame
            center
            kicker="Nossa palavra"
            title="30 dias pra acompanhar."
            titleAccent="60 dias de garantia."
            sub="A nota sobe? Bom. Não sobe? Devolvemos o dinheiro."
          >
            <div className="lp-grid-2 mx-auto max-w-3xl">
              <BlurBox index={BLUR_BODY_START} direction="bottom" className="h-full">
                <Card className={`${glassCardHot} h-full`}>
                  <CardHeader className={`${glassPad} md:p-7`}>
                    <p className="text-5xl font-black tabular-nums text-orange-300 md:text-6xl">30</p>
                    <p className="lp-card-title mt-2">dias para ver o score melhorar</p>
                    <p className="lp-card-body text-zinc-400">
                      Você acompanha se está melhorando — não só o dia 1.
                    </p>
                  </CardHeader>
                </Card>
              </BlurBox>
              <BlurBox index={BLUR_BODY_START + 1} direction="bottom" className="h-full">
                <Card className={`${glassCard} h-full border-orange-400/40 bg-orange-600/90`}>
                  <CardHeader className={`${glassPad} md:p-7`}>
                    <p className="text-5xl font-black tabular-nums text-white md:text-6xl">60</p>
                    <p className="lp-card-title mt-2">dias de garantia</p>
                    <p
                      className="lp-card-body"
                      style={{ color: "rgba(255,247,237,0.92)" }}
                    >
                      Não melhorou? <strong>Devolvemos o dinheiro.</strong> Risco nosso.
                    </p>
                  </CardHeader>
                </Card>
              </BlurBox>
            </div>
          </Frame>
        </Section>

        <Section id="analisa" reduce={reduce}>
          <div className="lp-split lp-split--col">
            <Frame
              progress={2}
              kicker="O que a gente olha"
              title="Onde você some — e quem te passa"
              sub="Te acham? O que falta? Quem compete com você na web — e o que o cliente sente ao comparar."
              direction="row"
            >
              <div className="lp-grid-2 mt-1">
                {PONTOS.map((p, i) => (
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
              index={BLUR_BODY_START + PONTOS.length}
              direction="bottom"
              className="min-w-0"
            >
              <DashApresentacaoMock />
            </BlurBox>
          </div>
        </Section>

        <Section id="como" reduce={reduce}>
          <Frame
            kicker="Como funciona"
            title="Quatro passos"
            sub="Simples. Sem enrolação."
          >
            <div className="lp-grid-2">
              {PASSOS.map((s, i) => (
                <BlurBox
                  key={s.n}
                  index={BLUR_BODY_START + i}
                  direction="bottom"
                  className="h-full"
                >
                  <Card className={`${glassCard} h-full`}>
                    <CardHeader className={glassPad}>
                      <p className="lp-card-meta">{s.n}</p>
                      <p className="lp-card-title mt-1.5">{s.t}</p>
                      <p className="lp-card-body">{s.d}</p>
                    </CardHeader>
                  </Card>
                </BlurBox>
              ))}
            </div>
          </Frame>
        </Section>

        <Section id="depoimentos" reduce={reduce}>
          <Frame
            kicker="Quem já usou"
            title="Depoimentos"
            sub="Cases reais em breve."
          >
            <div className="lp-grid-3">
              {DEPOIMENTOS.map((d, i) => (
                <BlurBox
                  key={i}
                  index={BLUR_BODY_START + i}
                  direction="bottom"
                  className="h-full"
                >
                  <Card className={`${glassCard} h-full`}>
                    <CardContent className={glassPad}>
                      <blockquote>
                        <p className="text-base leading-relaxed text-zinc-200">
                          “{d.quote}”
                        </p>
                      </blockquote>
                    </CardContent>
                    <CardFooter className="mt-0 border-t border-white/10 bg-transparent px-(--card-spacing) pt-3 pb-(--card-spacing)">
                      <div>
                        <p className="text-base font-bold text-white">{d.nome}</p>
                        <p className="text-base text-zinc-500">{d.cargo}</p>
                      </div>
                    </CardFooter>
                  </Card>
                </BlurBox>
              ))}
            </div>
          </Frame>
        </Section>

        <Section id="blog" reduce={reduce}>
          <Frame kicker="Blog" title="Artigos" sub="Leituras rápidas.">
            <div className="lp-grid-3">
              {ARTIGOS.map((a, i) => (
                <BlurBox
                  key={i}
                  index={BLUR_BODY_START + i}
                  direction="bottom"
                  className="h-full"
                >
                  <Card className={`${glassCard} h-full`}>
                    <CardHeader className={glassPad}>
                      <Badge
                        variant="outline"
                        className="lp-card-meta h-auto rounded-md border-0 bg-transparent px-0 py-0 tracking-[0.06em] text-orange-400/90"
                      >
                        {a.tag}
                      </Badge>
                      <p className="lp-card-title mt-1.5">
                        <a href={a.href}>{a.titulo}</a>
                      </p>
                      <p className="lp-card-body">{a.resumo}</p>
                    </CardHeader>
                  </Card>
                </BlurBox>
              ))}
            </div>
          </Frame>
        </Section>

        <Section id="interesse" reduce={reduce}>
          <Frame
            center
            kicker="Começar"
            title="Peça o diagnóstico"
            sub="Site ou Instagram. A gente te mostra. 30 dias. 60 de garantia."
          >
            <BlurBox index={BLUR_BODY_START} direction="bottom">
              <FormInteresse whatsappUrl={whatsappUrl} />
            </BlurBox>
          </Frame>
        </Section>

        <Section id="faq" reduce={reduce}>
          <Frame kicker="Dúvidas" title="Perguntas rápidas">
            <BlurBox index={BLUR_BODY_START} direction="bottom">
              <Accordion
                defaultValue={["0"]}
                className="lp-glass mx-auto max-w-2xl p-5 md:p-7"
              >
                {FAQ.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={String(i)}
                    className="border-white/10"
                  >
                    <AccordionTrigger className="py-3.5 text-base font-bold text-white hover:no-underline **:data-[slot=accordion-trigger-icon]:text-orange-400/90">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-3.5 text-base leading-relaxed text-zinc-400">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </BlurBox>
            <p className="mt-8 text-center text-base text-zinc-500">
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
        style={{ zIndex: 25 }}
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
        style={{ zIndex: 25 }}
      />

      <div
        id="cta-sticky"
        className="pointer-events-none fixed bottom-4 left-4 right-4 z-40 flex justify-center pb-[env(safe-area-inset-bottom)]"
      >
        <a
          id="cta-sticky-btn"
          href={ctaHref}
          className="pointer-events-auto rounded-full px-5 py-3 text-base font-bold text-white shadow-[0_8px_28px_rgba(234,88,12,0.35)]"
          style={{
            background: "linear-gradient(180deg, #f97316, #c2410c)",
          }}
        >
          Quero o diagnóstico
        </a>
      </div>
    </div>
  );
}
