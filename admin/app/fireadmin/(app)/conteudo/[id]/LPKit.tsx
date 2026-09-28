"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ movimento */

/** Revela ao entrar na viewport. `once` para não re-animar no scroll de volta. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className="fm-reveal"
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

/** Cascata: cada filho entra com um atraso incremental. */
export function RevealStagger({
  children,
  step = 0.07,
}: {
  children: React.ReactNode[];
  step?: number;
}) {
  return (
    <>
      {children.map((c, i) => (
        <Reveal key={i} delay={i * step}>
          {c}
        </Reveal>
      ))}
    </>
  );
}

/** Número que conta ao aparecer. rAF puro — sem depender de API instável. */
export function Contador({
  para,
  duracao = 1100,
  sufixo = "",
  decimais = 0,
}: {
  para: number;
  duracao?: number;
  sufixo?: string;
  decimais?: number;
}) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const rodou = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || rodou.current) return;
        rodou.current = true;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min((t - t0) / duracao, 1);
          // easeOutCubic: rápido no começo, assenta no fim
          setV(para * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [para, duracao]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      {v.toFixed(decimais)}
      {sufixo}
    </span>
  );
}

/* ------------------------------------------------------------------ gráficos */

function corDaNota(n: number) {
  if (n >= 80) return "#22c55e";
  if (n >= 60) return "#84cc16";
  if (n >= 40) return "#eab308";
  return "#ef4444";
}

/** Medidor circular da nota geral. SVG puro, arco animado. */
export function Medidor({
  nota,
  tamanho = 168,
  label,
}: {
  nota: number;
  tamanho?: number;
  label?: string;
}) {
  const r = (tamanho - 18) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, nota)) / 100;
  const cor = corDaNota(nota);

  return (
    <div style={{ position: "relative", width: tamanho, height: tamanho }}>
      <svg width={tamanho} height={tamanho} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={tamanho / 2} cy={tamanho / 2} r={r}
          fill="none" stroke="var(--fm-border)" strokeWidth={10}
        />
        <motion.circle
          className="fm-medidor-arco"
          cx={tamanho / 2} cy={tamanho / 2} r={r}
          fill="none" stroke={cor} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          whileInView={{ strokeDashoffset: circ * (1 - pct) }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ ["--fm-medidor-final" as string]: circ * (1 - pct) }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: tamanho * 0.28, fontWeight: 800, color: cor, lineHeight: 1 }}>
          <Contador para={nota} />
        </span>
        {label ? (
          <span style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 4 }}>{label}</span>
        ) : null}
      </div>
    </div>
  );
}

/** Barras horizontais por canal — a leitura mais rápida de onde está o buraco. */
export function BarrasCanais({
  itens,
}: {
  itens: { label: string; nota: number | null }[];
}) {
  const validos = itens.filter((i) => typeof i.nota === "number");
  if (!validos.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {validos.map((c, i) => {
        const n = c.nota as number;
        return (
          <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              width: 132, fontSize: 12, color: "var(--fm-muted)",
              textAlign: "right", flexShrink: 0,
            }}>
              {c.label}
            </span>
            <div style={{
              flex: 1, height: 10, background: "var(--fm-inset, #0d0d0d)",
              borderRadius: 20, overflow: "hidden",
            }}>
              <motion.div
                className="fm-barra"
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.max(2, n)}%` }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.9, delay: i * 0.06, ease: "easeOut" }}
                style={{
                  height: "100%",
                  background: corDaNota(n),
                  borderRadius: 20,
                  ["--fm-barra-w" as string]: `${Math.max(2, n)}%`,
                }}
              />
            </div>
            <span style={{
              width: 34, fontSize: 12, fontWeight: 700, textAlign: "right",
              color: corDaNota(n), fontVariantNumeric: "tabular-nums", flexShrink: 0,
            }}>
              {Math.round(n)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ mídia */

export type AnalisePost = {
  resumo?: string | null;
  acertou?: string[];
  errou?: string[];
  estrategia?: {
    leitura?: string | null;
    proximos?: string[];
  } | null;
  gancho?: { nota?: number; leitura?: string };
  cta?: string | null;
  estrutura?: { acertos?: string[]; melhorias?: string[] };
  legenda?: { acertos?: string[]; melhorias?: string[] };
};

export type ItemMidia = {
  id?: string;
  url?: string;
  titulo?: string | null;
  legenda?: string | null;
  thumbnail?: string | null;
  views?: number | null;
  likes?: number | null;
  comentarios?: number | null;
  tipo?: string | null;
  transcricao?: string | null;
  /** Análise post a post já cacheada (se existir). */
  analise?: AnalisePost | Record<string, unknown> | null;
  rede?: "instagram" | "youtube" | "tiktok";
};

function num(n?: number | null) {
  if (n == null) return null;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/** Thumb com fallback: se a imagem não carrega, mostra o logo da empresa. */
function Thumb({
  src, alt, vertical, logo, empresa,
}: {
  src?: string | null; alt: string; vertical: boolean;
  logo?: string | null; empresa?: string | null;
}) {
  const [falhou, setFalhou] = useState(false);
  const ratio = vertical ? "9 / 16" : "16 / 9";
  const mostraImg = src && !falhou;

  if (mostraImg) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFalhou(true)}
        style={{ width: "100%", aspectRatio: ratio, objectFit: "cover", display: "block" }}
      />
    );
  }
  // Fallback: logo da empresa centralizado sobre fundo neutro.
  return (
    <div style={{
      width: "100%", aspectRatio: ratio, display: "grid", placeItems: "center",
      background: "var(--fm-surface)", borderBottom: "1px solid var(--fm-border)",
    }}>
      {logo && !falhou ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo} alt={empresa ?? "logo"} loading="lazy"
          onError={() => setFalhou(true)}
          style={{ width: "42%", maxWidth: 72, opacity: 0.85, objectFit: "contain" }}
        />
      ) : (
        <span style={{ fontSize: 22, fontWeight: 800, color: "var(--fm-muted)", opacity: 0.6 }}>
          {(empresa ?? "?").trim().charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

/** Grade de posts/vídeos reais analisados. Thumbnail é a prova de que olhamos mesmo. */
export function GradeMidia({
  itens,
  vertical = false,
  logo,
  empresa,
  aoClicar,
}: {
  itens: ItemMidia[];
  vertical?: boolean;
  logo?: string | null;
  empresa?: string | null;
  /** Se passado, clicar abre o popup de análise em vez de ir ao link. */
  aoClicar?: (item: ItemMidia) => void;
}) {
  if (!itens.length) return null;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
      gap: 12,
    }}>
      {itens.map((it, i) => {
        const comum = {
          initial: { opacity: 0, scale: 0.94 },
          whileInView: { opacity: 1, scale: 1 },
          whileHover: { y: -4 },
          viewport: { once: true, amount: 0.15 },
          transition: { duration: 0.4, delay: Math.min(i * 0.04, 0.5) },
          style: {
            display: "block", textDecoration: "none", color: "inherit", cursor: "pointer",
            background: "var(--fm-inset, #0d0d0d)", borderRadius: 10,
            overflow: "hidden", border: "1px solid var(--fm-border)", textAlign: "left" as const,
            width: "100%", padding: 0,
          },
        };
        const miolo = (
          <>
            <div style={{ position: "relative" }}>
              <Thumb src={it.thumbnail} alt={it.titulo ?? "mídia analisada"} vertical={vertical}
                     logo={logo} empresa={empresa} />
              {it.analise ? (
                <span style={{
                  position: "absolute", top: 8, left: 8, fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.04em", textTransform: "uppercase",
                  background: "var(--fm-accent)", color: "#fff",
                  padding: "3px 7px", borderRadius: 6,
                }}>
                  Analisado
                </span>
              ) : aoClicar ? (
                <span style={{
                  position: "absolute", top: 8, left: 8, fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.04em", textTransform: "uppercase",
                  background: "rgba(0,0,0,0.65)", color: "#fff",
                  padding: "3px 7px", borderRadius: 6,
                }}>
                  Ver análise
                </span>
              ) : null}
            </div>
            <div style={{ padding: "8px 10px 10px" }}>
              <p style={{
                fontSize: 11.5, lineHeight: 1.4, display: "-webkit-box",
                WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {it.titulo || it.legenda || "—"}
              </p>
              <div style={{
                display: "flex", gap: 10, marginTop: 6,
                fontSize: 10.5, color: "var(--fm-muted)",
              }}>
                {num(it.views) ? <span>{num(it.views)} views</span> : null}
                {num(it.likes) ? <span>{num(it.likes)} likes</span> : null}
                {num(it.comentarios) ? <span>{num(it.comentarios)} com.</span> : null}
              </div>
            </div>
          </>
        );

        // Com aoClicar: botão que abre o popup. Sem: link para o post original.
        return aoClicar ? (
          <motion.button key={it.id ?? i} type="button" onClick={() => aoClicar(it)} {...comum}>
            {miolo}
          </motion.button>
        ) : (
          <motion.a key={it.id ?? i} href={it.url ?? "#"} target="_blank" rel="noopener noreferrer" {...comum}>
            {miolo}
          </motion.a>
        );
      })}
    </div>
  );
}
