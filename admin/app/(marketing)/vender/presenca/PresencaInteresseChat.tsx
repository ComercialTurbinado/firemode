"use client";

import {
  getOrCreateBrowserKey,
  readChatCache,
  writeChatCache,
} from "@/lib/presenca-chat-cache";
import { openingDiscovery, type PresencaLeadChat } from "@/lib/presenca-sdr";
import {
  normalizeSiteUrl,
  parsePresenceOrInstagram,
} from "@/lib/vender-presenca-lead";
import { Send } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

type Props = {
  ctaHref: string;
  ctaLabel?: string;
  reduceMotion?: boolean | null;
};

type IntakeStep = "nome" | "presence" | "whatsapp" | "email" | "sdr";

type UiMsg = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sleep(ms: number) {
  return new Promise<void>((r) => window.setTimeout(r, ms));
}

function TypingDots() {
  return (
    <div className="lp-chat__row lp-chat__row--assistant">
      <div className="lp-chat__bubble lp-chat__bubble--typing" aria-label="Digitando">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function validateWhatsapp(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) {
    return "Inclua o DDD, por exemplo: 11 99999-8888.";
  }
  return null;
}

function validateEmail(raw: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim())) {
    return "Esse e-mail parece incompleto. Pode conferir?";
  }
  return null;
}

export default function PresencaInteresseChat({
  ctaHref,
  ctaLabel = "Continuar no WhatsApp",
  reduceMotion,
}: Props) {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState<IntakeStep>("nome");
  const [lead, setLead] = useState<PresencaLeadChat>({
    nome: "",
    email: "",
    whatsapp: "",
    presence: "",
  });
  const [messages, setMessages] = useState<UiMsg[]>([]);
  const [salesHistory, setSalesHistory] = useState<UiMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCloser, setIsCloser] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const leadRef = useRef(lead);
  const conversationIdRef = useRef<string | null>(null);
  const stepRef = useRef<IntakeStep>("nome");
  const salesHistoryRef = useRef<UiMsg[]>([]);
  const startedRef = useRef(false);
  const reduceRef = useRef(reduceMotion);

  leadRef.current = lead;
  conversationIdRef.current = conversationId;
  stepRef.current = step;
  salesHistoryRef.current = salesHistory;
  reduceRef.current = reduceMotion;

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, typing, busy]);

  useEffect(() => {
    window.setTimeout(() => inputRef.current?.focus(), 80);
  }, [step, typing, busy, started]);

  /** Ao entrar em #interesse: inicia o chat e avisa o FAB flutuante pra sumir */
  useEffect(() => {
    const section = document.getElementById("interesse");
    if (!section) return;

    const startIfNeeded = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      setStarted(true);
      void bootConversation();
    };

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.28);
        window.dispatchEvent(
          new CustomEvent("lp-presenca-interesse-visible", { detail: { visible: hit } }),
        );
        if (hit) startIfNeeded();
      },
      { threshold: [0.28, 0.45] },
    );
    io.observe(section);

    // Deep link / clique em Começar com #interesse já na tela
    if (window.location.hash === "#interesse") {
      window.dispatchEvent(
        new CustomEvent("lp-presenca-interesse-visible", { detail: { visible: true } }),
      );
      startIfNeeded();
    }

    return () => {
      io.disconnect();
      window.dispatchEvent(
        new CustomEvent("lp-presenca-interesse-visible", { detail: { visible: false } }),
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- boot uma vez
  }, []);

  async function delayTyping(ms = 1600) {
    const wait = reduceRef.current ? 120 : ms;
    setTyping(true);
    await sleep(wait);
    setTyping(false);
  }

  async function pushAssistant(content: string, delayMs = 1600) {
    await delayTyping(delayMs);
    const msg: UiMsg = { id: uid(), role: "assistant", content };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }

  async function pushAssistantParts(parts: string[], baseDelay = 1400) {
    const out: UiMsg[] = [];
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      const delay = reduceRef.current
        ? 100
        : baseDelay + Math.min(800, part.length * 16) + (i === 0 ? 200 : 500);
      out.push(await pushAssistant(part, delay));
    }
    return out;
  }

  async function persistSession(
    nextLead: PresencaLeadChat,
    history: UiMsg[],
    phaseLabel?: string,
  ) {
    const browserKey = getOrCreateBrowserKey();
    const payloadMessages = history.map((m) => ({
      role: m.role,
      content: m.content,
      at: new Date().toISOString(),
    }));

    writeChatCache({
      conversationId: conversationIdRef.current,
      browserKey,
      lead: nextLead,
      messages: payloadMessages,
      phase: phaseLabel,
    });

    // Só grava no banco quando já tem WhatsApp (chave da conversa)
    if (!nextLead.whatsapp.replace(/\D/g, "")) return;

    try {
      const res = await fetch("/api/vender/presenca/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          conversationIdRef.current
            ? {
                action: "save_messages",
                conversationId: conversationIdRef.current,
                messages: payloadMessages,
                phase: phaseLabel,
                lead: nextLead,
              }
            : {
                action: "upsert",
                lead: nextLead,
                messages: payloadMessages,
                phase: phaseLabel,
                browserKey,
              },
        ),
      });
      const data = (await res.json()) as { conversation?: { id: string } };
      if (data.conversation?.id) {
        setConversationId(data.conversation.id);
        conversationIdRef.current = data.conversation.id;
        writeChatCache({
          conversationId: data.conversation.id,
          browserKey,
          lead: nextLead,
          messages: payloadMessages,
          phase: phaseLabel,
        });
      }
    } catch {
      /* cache local */
    }
  }

  function maybeStartPipeline(presence: string) {
    const { site, instagram } = parsePresenceOrInstagram(presence);
    const siteNorm = site || normalizeSiteUrl(presence);
    if (!siteNorm) return;
    void fetch("/api/vender/presenca/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        site: siteNorm,
        instagram: instagram || undefined,
      }),
    }).catch(() => {});
  }

  async function bootConversation() {
    const cache = readChatCache();
    if (cache?.lead.whatsapp && cache.messages.length >= 2) {
      setLead({
        nome: cache.lead.nome || "",
        email: cache.lead.email || "",
        whatsapp: cache.lead.whatsapp || "",
        presence: cache.lead.presence || "",
      });
      if (cache.conversationId) {
        setConversationId(cache.conversationId);
        conversationIdRef.current = cache.conversationId;
      }
      const restored = cache.messages.map((m) => ({
        id: uid(),
        role: m.role,
        content: m.content,
      }));
      setMessages(restored);
      setSalesHistory(restored);
      salesHistoryRef.current = restored;
      setStep("sdr");
      stepRef.current = "sdr";
      const welcome = await pushAssistantParts(
        [
          `Oi, ${(cache.lead.nome || "").trim().split(/\s+/)[0] || "tudo bem"}. Retomei nossa conversa.`,
          "O que você gostaria de esclarecer?",
        ],
        1200,
      );
      const full = [...restored, ...welcome];
      setSalesHistory(full);
      salesHistoryRef.current = full;
      await persistSession(
        {
          nome: cache.lead.nome || "",
          email: cache.lead.email || "",
          whatsapp: cache.lead.whatsapp || "",
          presence: cache.lead.presence || "",
        },
        full,
        "discovery",
      );
      return;
    }

    setStep("nome");
    stepRef.current = "nome";
    const opening = await pushAssistantParts(
      [
        "Oi. Antes de falarmos sobre o projeto, como posso chamar você?",
      ],
      1300,
    );
    setSalesHistory(opening);
    salesHistoryRef.current = opening;
  }

  async function sendToSdr(nextLead: PresencaLeadChat, history: UiMsg[]) {
    setBusy(true);
    setError(null);
    setTyping(true);
    try {
      const res = await fetch("/api/vender/presenca/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: nextLead,
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await res.json()) as {
        replies?: string[];
        reply?: string;
        error?: string;
        phase?: "discovery" | "pitch" | "closer";
      };
      if (!res.ok) throw new Error(data.error || "Falha no atendimento");
      const parts = data.replies?.filter(Boolean) ?? (data.reply ? [data.reply] : []);
      if (!parts.length) throw new Error("Resposta vazia");

      setTyping(false);
      if (data.phase === "closer") setIsCloser(true);

      const assistantMsgs = await pushAssistantParts(parts, 1400);
      const full = [...history, ...assistantMsgs];
      setSalesHistory(full);
      salesHistoryRef.current = full;
      await persistSession(nextLead, full, data.phase);
    } catch {
      setTyping(false);
      setError("Não consegui responder agora. Você pode tentar novamente ou continuar no WhatsApp.");
      await pushAssistantParts(
        [
          "Não consegui processar sua última mensagem.",
          "Pode enviá-la novamente ou continuar no WhatsApp pelo botão abaixo.",
        ],
        1000,
      );
    } finally {
      setBusy(false);
      setTyping(false);
    }
  }

  async function enterSdr(nextLead: PresencaLeadChat, history: UiMsg[]) {
    setStep("sdr");
    stepRef.current = "sdr";
    maybeStartPipeline(nextLead.presence || "");

    const browserKey = getOrCreateBrowserKey();
    try {
      const res = await fetch("/api/vender/presenca/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          lead: nextLead,
          messages: history.map((m) => ({
            role: m.role,
            content: m.content,
            at: new Date().toISOString(),
          })),
          browserKey,
          phase: "discovery",
        }),
      });
      const data = (await res.json()) as { conversation?: { id: string } };
      if (data.conversation?.id) {
        setConversationId(data.conversation.id);
        conversationIdRef.current = data.conversation.id;
      }
    } catch {
      /* ok */
    }

    const opening = openingDiscovery(nextLead);
    const openingMsgs = await pushAssistantParts(opening, 1500);
    const full = [...history, ...openingMsgs];
    setSalesHistory(full);
    salesHistoryRef.current = full;
    await persistSession(nextLead, full, "discovery");
  }

  async function handleIntakeReply(text: string) {
    const userMsg: UiMsg = { id: uid(), role: "user", content: text };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setDraft("");
    setError(null);

    const current = stepRef.current;

    if (current === "nome") {
      if (text.trim().length < 2) {
        await pushAssistant("Qual nome você prefere que eu use?", 900);
        return;
      }
      const nextLead = { ...leadRef.current, nome: text.trim() };
      setLead(nextLead);
      leadRef.current = nextLead;
      setStep("presence");
      stepRef.current = "presence";
      const parts = await pushAssistantParts(
        [
          `${text.trim().split(/\s+/)[0]}, envie o site ou o Instagram da empresa. Um dos dois é suficiente.`,
        ],
        1200,
      );
      const hist = [...nextMsgs, ...parts];
      setSalesHistory(hist);
      salesHistoryRef.current = hist;
      return;
    }

    if (current === "presence") {
      const parsed = parsePresenceOrInstagram(text);
      if (!parsed.site && !parsed.instagram) {
        await pushAssistant(
          "Não consegui identificar o endereço. Pode enviar como seusite.com.br ou @suaempresa?",
          900,
        );
        return;
      }
      const presence =
        parsed.site ||
        (parsed.instagram ? `@${parsed.instagram}` : text.trim());
      const nextLead = { ...leadRef.current, presence };
      setLead(nextLead);
      leadRef.current = nextLead;
      setStep("whatsapp");
      stepRef.current = "whatsapp";
      const parts = await pushAssistantParts(
        ["Qual número de WhatsApp devemos usar? Inclua o DDD."],
        1100,
      );
      const hist = [...nextMsgs, ...parts];
      setSalesHistory(hist);
      salesHistoryRef.current = hist;
      return;
    }

    if (current === "whatsapp") {
      const err = validateWhatsapp(text);
      if (err) {
        await pushAssistant(err, 900);
        return;
      }
      const nextLead = { ...leadRef.current, whatsapp: text.trim() };
      setLead(nextLead);
      leadRef.current = nextLead;
      setStep("email");
      stepRef.current = "email";
      // Já persiste com WA — cria/atualiza conversa
      await persistSession(nextLead, nextMsgs, "intake");
      const parts = await pushAssistantParts(
        ["Qual e-mail devemos associar à conversa?"],
        1100,
      );
      const hist = [...nextMsgs, ...parts];
      setSalesHistory(hist);
      salesHistoryRef.current = hist;
      await persistSession(nextLead, hist, "intake");
      return;
    }

    if (current === "email") {
      const err = validateEmail(text);
      if (err) {
        await pushAssistant(err, 900);
        return;
      }
      const nextLead = { ...leadRef.current, email: text.trim() };
      setLead(nextLead);
      leadRef.current = nextLead;
      const confirm = await pushAssistantParts(
        [
          "Obrigado. Agora quero entender o que levou você a procurar este trabalho.",
        ],
        1200,
      );
      const hist = [...nextMsgs, ...confirm];
      setSalesHistory(hist);
      salesHistoryRef.current = hist;
      await persistSession(nextLead, hist, "intake_done");
      await enterSdr(nextLead, hist);
    }
  }

  async function handleSend(e?: FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || busy || typing || !started) return;

    if (stepRef.current !== "sdr") {
      setBusy(true);
      try {
        await handleIntakeReply(text);
      } finally {
        setBusy(false);
      }
      return;
    }

    const userMsg: UiMsg = { id: uid(), role: "user", content: text };
    const nextSales = [...salesHistoryRef.current, userMsg];
    setMessages((prev) => [...prev, userMsg]);
    setSalesHistory(nextSales);
    salesHistoryRef.current = nextSales;
    setDraft("");
    await sendToSdr(leadRef.current, nextSales);
  }

  function onKeyDown(ev: KeyboardEvent<HTMLInputElement>) {
    if (ev.key === "Enter" && !ev.shiftKey) {
      ev.preventDefault();
      void handleSend();
    }
  }

  const placeholder =
    step === "nome"
      ? "Seu nome"
      : step === "presence"
        ? "site.com.br ou @instagram"
        : step === "whatsapp"
          ? "(11) 99999-9999"
          : step === "email"
            ? "voce@empresa.com.br"
            : "Escreva sua mensagem…";

  const waHref = (() => {
    if (!ctaHref.includes("wa.me") && !ctaHref.includes("whatsapp")) return ctaHref;
    const msg = [
      "Olá. Quero o pacote Firemode de presença.",
      `Nome: ${lead.nome || "—"}`,
      `E-mail: ${lead.email || "—"}`,
      `WhatsApp: ${lead.whatsapp || "—"}`,
      `Site/Instagram: ${lead.presence || "—"}`,
      "[via chat #interesse]",
    ].join("\n");
    const sep = ctaHref.includes("?") ? "&" : "?";
    return `${ctaHref}${sep}text=${encodeURIComponent(msg)}`;
  })();

  const composerLocked = busy || typing;

  return (
    <div
      ref={rootRef}
      id="form-interesse"
      className="lp-interesse-chat"
      role="region"
      aria-label="Atendimento Firemode"
    >
      <div className="lp-interesse-chat__panel">
        <div className="lp-chat__head">
          <div className="lp-chat__who">
            <span className="lp-chat__avatar" aria-hidden>
              F
            </span>
            <div>
              <p className="lp-chat__name">Firemode</p>
              <p className="lp-chat__status">
                {!started
                  ? "aguardando você…"
                  : typing || busy
                    ? "digitando…"
                    : step === "sdr"
                      ? "em atendimento"
                      : "primeiro atendimento"}
              </p>
            </div>
          </div>
        </div>

        <div ref={listRef} className="lp-interesse-chat__thread lp-chat__thread">
          {!started ? (
            <div className="lp-chat__waiting">
              <p>Rolando até aqui já abre o atendimento…</p>
            </div>
          ) : null}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`lp-chat__row lp-chat__row--${m.role}`}
            >
              <div className="lp-chat__bubble">
                <p>{m.content}</p>
              </div>
            </div>
          ))}
          {typing ? <TypingDots /> : null}
        </div>

        {error ? <p className="lp-chat__error">{error}</p> : null}

        {step === "sdr" && lead.whatsapp ? (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`lp-chat__wa${isCloser ? " lp-chat__wa--hot" : ""}`}
          >
            {ctaLabel}
          </a>
        ) : null}

        <form className="lp-chat__composer" onSubmit={handleSend}>
          <input
            ref={inputRef}
            type="text"
            className="lp-chat__input"
            value={draft}
            disabled={composerLocked || !started}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            inputMode={
              step === "whatsapp"
                ? "tel"
                : step === "email"
                  ? "email"
                  : step === "presence"
                    ? "url"
                    : "text"
            }
            autoComplete={
              step === "nome"
                ? "name"
                : step === "whatsapp"
                  ? "tel"
                  : step === "email"
                    ? "email"
                    : "off"
            }
            aria-label="Mensagem"
          />
          <button
            type="submit"
            className="lp-chat__send"
            disabled={composerLocked || !started || !draft.trim()}
            aria-label="Enviar"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
