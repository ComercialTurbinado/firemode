"use client";

import {
  buildPresencaLeadWhatsappMsg,
  parsePresenceOrInstagram,
} from "@/lib/vender-presenca-lead";
import { useRef, useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success";

export type WaitlistHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  ctaLabel?: string;
  successLabel?: string;
  placeholder?: string;
  /** Se informado, após sucesso abre o WhatsApp (lead comercial). */
  whatsappUrl?: string | null;
  brandSrc?: string;
  className?: string;
  /** Campo principal: e-mail, URL do site, ou site/Instagram (presença). */
  field?: "email" | "website" | "presence";
  /** ID da variante A/B (vai na mensagem do WhatsApp). */
  abVariant?: string | null;
  /** Texto abaixo do formulário (pode ter \\n\\n para parágrafos). */
  formFooter?: string | null;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
};

const DEFAULT_BRAND =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80";

export function WaitlistHero({
  title = "Veja a apresentação que o seu site gera.",
  subtitle = "Nota por canal, o que está furado, o que corrigir primeiro — e a prova na tela. Coloque o site e conheça a ferramenta pelo resultado.",
  eyebrow = "Firemode · Diagnóstico de presença",
  ctaLabel = "Gerar apresentação",
  successLabel = "Abrindo o WhatsApp",
  placeholder = "seusite.com.br",
  whatsappUrl = null,
  brandSrc = DEFAULT_BRAND,
  className = "",
  field = "website",
  abVariant = null,
  formFooter = null,
}: WaitlistHeroProps) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isWebsite = field === "website";
  const isPresence = field === "presence";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const raw = value.trim();
    if (!raw || status === "loading" || status === "success") return;
    setError(null);

    if (isPresence) {
      const parsed = parsePresenceOrInstagram(raw);
      const msg = buildPresencaLeadWhatsappMsg({
        site: parsed.site ?? undefined,
        instagram: parsed.instagram ?? undefined,
        abVariant,
      });
      if (!msg) {
        setError("Manda o site (empresa.com.br) ou o Instagram (@perfil).");
        return;
      }
      setStatus("loading");
      window.setTimeout(() => {
        setStatus("success");
        fireConfetti();
        setValue("");
        if (whatsappUrl) {
          const sep = whatsappUrl.includes("?") ? "&" : "?";
          const withLead = `${whatsappUrl}${sep}text=${encodeURIComponent(msg)}`;
          const openUrl = whatsappUrl.includes("text=") ? whatsappUrl : withLead;
          window.setTimeout(() => {
            window.open(openUrl, "_blank", "noopener,noreferrer");
          }, 700);
        }
      }, 1200);
      return;
    }

    setStatus("loading");

    window.setTimeout(() => {
      setStatus("success");
      fireConfetti();
      setValue("");

      if (whatsappUrl) {
        const site = isWebsite
          ? raw.match(/^https?:\/\//i)
            ? raw
            : `https://${raw}`
          : raw;
        const abTag = abVariant ? `\n[AB:${abVariant}]` : "";
        const msg = isWebsite
          ? `Olá. Quero o relatório Firemode — como o mercado me enxerga.\nSite: ${site}${abTag}`
          : `Olá. Quero o relatório Firemode.\nE-mail: ${raw}${abTag}`;
        const sep = whatsappUrl.includes("?") ? "&" : "?";
        const withLead = `${whatsappUrl}${sep}text=${encodeURIComponent(msg)}`;
        const openUrl = whatsappUrl.includes("text=") ? whatsappUrl : withLead;
        window.setTimeout(() => {
          window.open(openUrl, "_blank", "noopener,noreferrer");
        }, 700);
      }
    }, 1200);
  }

  function fireConfetti() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = [];
    const palette = ["#ea580c", "#fb923c", "#10b981", "#fbbf24", "#fff"];

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const createParticle = (): Particle => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 2) * 10,
      life: 100,
      color: palette[Math.floor(Math.random() * palette.length)]!,
      size: Math.random() * 4 + 2,
    });

    for (let i = 0; i < 50; i++) particles.push(createParticle());

    const animate = () => {
      if (particles.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5;
        p.life -= 2;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / 100);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) {
          particles.splice(i, 1);
          i--;
        }
      }

      requestAnimationFrame(animate);
    };

    animate();
  }

  const colors = {
    textMain: "#ffffff",
    textSecondary: "#94a3b8",
    bluePrimary: "#ea580c",
    success: "#10b981",
    inputBg: "#27272a",
    baseBg: "#09090b",
    inputShadow: "rgba(255, 255, 255, 0.1)",
  };

  return (
    <div className={`w-full min-h-[100svh] bg-black flex items-center justify-center ${className}`}>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 60s linear infinite;
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 60s linear infinite;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes success-pulse {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes success-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 60px rgba(16, 185, 129, 0.8), 0 0 100px rgba(16, 185, 129, 0.4); }
        }
        @keyframes checkmark-draw {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes celebration-ring {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        .animate-success-pulse {
          animation: success-pulse 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .animate-success-glow {
          animation: success-glow 2s ease-in-out infinite;
        }
        .animate-checkmark {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
          animation: checkmark-draw 0.4s ease-out 0.3s forwards;
        }
        .animate-ring {
          animation: celebration-ring 0.8s ease-out forwards;
        }
      `}</style>

      <div
        className="relative w-full h-[100svh] overflow-hidden shadow-2xl"
        style={{
          backgroundColor: colors.baseBg,
          fontFamily: "var(--font-body), system-ui, sans-serif",
        }}
      >
        {/* Background Decorative Layer */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            perspective: "1200px",
            transform: "perspective(1200px) rotateX(15deg)",
            transformOrigin: "center bottom",
            opacity: 1,
          }}
        >
          <div className="absolute inset-0 animate-spin-slow">
            <div
              className="absolute top-1/2 left-1/2"
              style={{
                width: "2000px",
                height: "2000px",
                transform: "translate(-50%, -50%) rotate(279.05deg)",
                zIndex: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://framerusercontent.com/images/oqZEqzDEgSLygmUDuZAYNh2XQ9U.png?scale-down-to=2048"
                alt=""
                className="w-full h-full object-cover opacity-50"
              />
            </div>
          </div>

          <div className="absolute inset-0 animate-spin-slow-reverse">
            <div
              className="absolute top-1/2 left-1/2"
              style={{
                width: "1000px",
                height: "1000px",
                transform: "translate(-50%, -50%) rotate(304.42deg)",
                zIndex: 1,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://framerusercontent.com/images/UbucGYsHDAUHfaGZNjwyCzViw8.png?scale-down-to=1024"
                alt=""
                className="w-full h-full object-cover opacity-60"
              />
            </div>
          </div>

          <div className="absolute inset-0 animate-spin-slow">
            <div
              className="absolute top-1/2 left-1/2"
              style={{
                width: "800px",
                height: "800px",
                transform: "translate(-50%, -50%) rotate(48.33deg)",
                zIndex: 2,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://framerusercontent.com/images/Ans5PAxtJfg3CwxlrPMSshx2Pqc.png"
                alt=""
                className="w-full h-full object-cover opacity-80"
              />
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${colors.baseBg} 10%, rgba(9, 9, 11, 0.8) 40%, transparent 100%)`,
          }}
        />

        <div className="relative z-20 w-full h-full flex flex-col items-center justify-end pb-12 md:pb-16 gap-5 px-4">
          <div className="w-16 h-16 rounded-2xl shadow-lg overflow-hidden mb-1 ring-1 ring-white/10 bg-zinc-900 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brandSrc} alt="Firemode" className="w-full h-full object-cover" />
          </div>

          <p
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-center"
            style={{ color: colors.bluePrimary }}
          >
            {eyebrow}
          </p>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-center tracking-tight max-w-3xl leading-[1.05]"
            style={{
              color: colors.textMain,
              fontFamily: "var(--font-display), Georgia, serif",
              fontWeight: 600,
            }}
          >
            {title}
          </h1>

          <p
            className="text-base md:text-lg font-medium text-center max-w-xl leading-relaxed"
            style={{ color: colors.textSecondary }}
          >
            {subtitle}
          </p>

          <div className="w-full max-w-md px-1 mt-3 h-[60px] relative perspective-1000">
            <canvas
              ref={canvasRef}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none z-50"
            />

            <div
              className={`absolute inset-0 flex items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                status === "success"
                  ? "opacity-100 scale-100 animate-success-pulse animate-success-glow"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
              style={{ backgroundColor: colors.success }}
            >
              {status === "success" && (
                <>
                  <div className="absolute top-1/2 left-1/2 w-full h-full rounded-full border-2 border-emerald-400 animate-ring" />
                  <div
                    className="absolute top-1/2 left-1/2 w-full h-full rounded-full border-2 border-emerald-300 animate-ring"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <div
                    className="absolute top-1/2 left-1/2 w-full h-full rounded-full border-2 border-emerald-200 animate-ring"
                    style={{ animationDelay: "0.3s" }}
                  />
                </>
              )}
              <div
                className={`flex items-center gap-2 text-white font-semibold text-base md:text-lg ${
                  status === "success" ? "animate-bounce-in" : ""
                }`}
              >
                <div className="bg-white/20 p-1 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      className={status === "success" ? "animate-checkmark" : ""}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>{successLabel}</span>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className={`relative w-full h-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                status === "success"
                  ? "opacity-0 scale-95 pointer-events-none"
                  : "opacity-100 scale-100"
              }`}
            >
              <input
                type="text"
                required
                inputMode={isPresence || isWebsite ? "url" : "email"}
                autoComplete={isPresence || isWebsite ? "url" : "email"}
                placeholder={placeholder}
                value={value}
                disabled={status === "loading"}
                onChange={(e) => {
                  setError(null);
                  setValue(e.target.value);
                }}
                className="w-full h-[60px] pl-6 pr-[168px] rounded-full outline-none transition-all duration-200 placeholder-zinc-500 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: colors.inputBg,
                  color: colors.textMain,
                  boxShadow: `inset 0 0 0 1px ${error ? "#f97316" : colors.inputShadow}`,
                }}
              />

              <div className="absolute top-[6px] right-[6px] bottom-[6px]">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="h-full px-5 rounded-full font-medium text-white transition-all active:scale-95 hover:brightness-110 disabled:hover:brightness-100 disabled:active:scale-100 disabled:cursor-wait flex items-center justify-center min-w-[130px] text-sm"
                  style={{ backgroundColor: colors.bluePrimary }}
                >
                  {status === "loading" ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    ctaLabel
                  )}
                </button>
              </div>
            </form>
          </div>

          {error ? (
            <p className="mt-3 text-base text-orange-300/90 text-center px-2">{error}</p>
          ) : null}

          {formFooter ? (
            <div className="w-full max-w-xl px-2 mt-5 space-y-3 text-center">
              {formFooter.split(/\n\n+/).map((p, i) => (
                <p
                  key={i}
                  className="text-sm md:text-[15px] leading-relaxed"
                  style={{ color: "rgba(148, 163, 184, 0.95)" }}
                >
                  {p}
                </p>
              ))}
            </div>
          ) : null}

          <a
            href="#como"
            className="mt-3 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Conhecer o método ↓
          </a>
        </div>
      </div>
    </div>
  );
}
