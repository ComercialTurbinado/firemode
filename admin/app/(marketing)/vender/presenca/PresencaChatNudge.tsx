"use client";

import {
  getOrCreateBrowserKey,
  readChatCache,
  writeChatCache,
} from "@/lib/presenca-chat-cache";
import { openingDiscovery, type PresencaLeadChat } from "@/lib/presenca-sdr";
import { MessageCircle, Send, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

type Props = {
  ctaHref: string;
  reduceMotion?: boolean | null;
};

type Phase = "nudge" | "queue" | "chat";

type UiMsg = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

const NUDGE_MSG =
  "Quer entender onde sua empresa pode estar perdendo contatos? Posso fazer algumas perguntas.";

function playBlip() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;

    const beep = (freq: number, start: number, dur: number, gain = 0.08) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + start);
      g.gain.setValueAtTime(0.0001, now + start);
      g.gain.exponentialRampToValueAtTime(gain, now + start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    };

    beep(880, 0, 0.09, 0.07);
    beep(1320, 0.1, 0.12, 0.055);

    window.setTimeout(() => {
      void ctx.close();
    }, 500);
  } catch {
    /* ignore */
  }
}

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

function validateContact(lead: Pick<PresencaLeadChat, "nome" | "email" | "whatsapp">) {
  if (lead.nome.trim().length < 2) return "Digite seu nome para continuarmos.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim())) {
    return "Confira se o e-mail foi digitado por completo.";
  }
  const digits = lead.whatsapp.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) {
    return "Inclua o DDD no WhatsApp. Ex.: 11999998888.";
  }
  return null;
}

export default function PresencaChatNudge({ ctaHref, reduceMotion }: Props) {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(true);
  const [showMsg, setShowMsg] = useState(false);
  const [hideForInteresse, setHideForInteresse] = useState(false);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<Phase>("nudge");
  const [lead, setLead] = useState<PresencaLeadChat>({
    nome: "",
    email: "",
    whatsapp: "",
    presence: "",
  });
  const [contactSaved, setContactSaved] = useState(false);
  const [openInSec, setOpenInSec] = useState<number | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMsg[]>([]);
  const [salesHistory, setSalesHistory] = useState<UiMsg[]>([]);
  const [isCloser, setIsCloser] = useState(false);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endingInSec, setEndingInSec] = useState<number | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [endedToast, setEndedToast] = useState(false);
  const blipped = useRef(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const contactOkRef = useRef(false);
  const enteredChatRef = useRef(false);
  const conversationIdRef = useRef<string | null>(null);
  const abandonTimersRef = useRef<number[]>([]);
  const abandonActiveRef = useRef(false);
  const salesHistoryRef = useRef<UiMsg[]>([]);
  const phaseRef = useRef<Phase>("nudge");
  const sessionEndedRef = useRef(false);
  const leadRef = useRef(lead);
  leadRef.current = lead;
  conversationIdRef.current = conversationId;
  salesHistoryRef.current = salesHistory;
  phaseRef.current = phase;
  sessionEndedRef.current = sessionEnded;
  const reduceRef = useRef(reduceMotion);
  reduceRef.current = reduceMotion;

  useEffect(() => {
    const unlock = () => {
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        void ctx.resume().then(() => ctx.close());
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("pointerdown", unlock, { once: true });

    const onInteresse = (ev: Event) => {
      const detail = (ev as CustomEvent<{ visible?: boolean }>).detail;
      setHideForInteresse(!!detail?.visible);
      if (detail?.visible) setOpen(false);
    };
    window.addEventListener("lp-presenca-interesse-visible", onInteresse);

    const tShow = window.setTimeout(() => setVisible(true), 2000);
    const tMsg = window.setTimeout(() => {
      setShowMsg(true);
      setOpen(true);
      if (!reduceMotion && !blipped.current) {
        blipped.current = true;
        playBlip();
      }
    }, 10000);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("lp-presenca-interesse-visible", onInteresse);
      window.clearTimeout(tShow);
      window.clearTimeout(tMsg);
    };
  }, [reduceMotion]);

  useEffect(() => {
    return () => {
      for (const id of abandonTimersRef.current) window.clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    if (!showMsg || phase !== "nudge") return;
    if (reduceMotion) {
      setTyped(NUDGE_MSG);
      return;
    }
    setTyped("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(NUDGE_MSG.slice(0, i));
      if (i >= NUDGE_MSG.length) window.clearInterval(id);
    }, 22);
    return () => window.clearInterval(id);
  }, [showMsg, reduceMotion, phase]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, typing, busy, phase]);

  useEffect(() => {
    if (phase === "chat") {
      window.setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [phase, typing, busy]);

  async function delayTyping(ms = 2200) {
    const wait = reduceRef.current ? 180 : ms;
    setTyping(true);
    await sleep(wait);
    setTyping(false);
  }

  async function pushAssistant(content: string, delayMs = 2200) {
    await delayTyping(delayMs);
    const msg: UiMsg = { id: uid(), role: "assistant", content };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }

  async function pushAssistantParts(parts: string[], baseDelay = 1600) {
    const out: UiMsg[] = [];
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      const delay =
        reduceRef.current
          ? 120
          : baseDelay + Math.min(900, part.length * 18) + (i === 0 ? 400 : 700);
      const msg = await pushAssistant(part, delay);
      out.push(msg);
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
      const data = (await res.json()) as {
        conversation?: { id: string };
      };
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
      /* cache local já salva */
    }
  }

  async function tryEnterChat() {
    if (!contactOkRef.current || enteredChatRef.current) return;
    enteredChatRef.current = true;
    setOpenInSec(null);
    setPhase("chat");
    setMessages([]);

    const currentLead = leadRef.current;
    const browserKey = getOrCreateBrowserKey();

    // Carrega histórico do banco (WhatsApp) ou do cache do browser
    let restored: UiMsg[] = [];
    try {
      const res = await fetch("/api/vender/presenca/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "load",
          whatsapp: currentLead.whatsapp,
        }),
      });
      const data = (await res.json()) as {
        conversation?: {
          id: string;
          messages?: { role: "user" | "assistant"; content: string }[];
        };
      };
      if (data.conversation?.id) {
        setConversationId(data.conversation.id);
        conversationIdRef.current = data.conversation.id;
      }
      if (data.conversation?.messages?.length) {
        restored = data.conversation.messages.map((m) => ({
          id: uid(),
          role: m.role,
          content: m.content,
        }));
      }
    } catch {
      /* ignore */
    }

    if (!restored.length) {
      const cache = readChatCache();
      if (
        cache?.lead.whatsapp.replace(/\D/g, "") ===
          currentLead.whatsapp.replace(/\D/g, "") &&
        cache.messages.length
      ) {
        restored = cache.messages.map((m) => ({
          id: uid(),
          role: m.role,
          content: m.content,
        }));
        if (cache.conversationId) {
          setConversationId(cache.conversationId);
          conversationIdRef.current = cache.conversationId;
        }
      }
    }

    if (restored.length) {
      setMessages(restored);
      setSalesHistory(restored);
      const welcome = await pushAssistantParts(
        [
          `${currentLead.nome.trim().split(/\s+/)[0] || "Oi"}, bem-vindo de volta.`,
          "Podemos continuar de onde paramos — o que ficou em aberto pra você?",
        ],
        1500,
      );
      const full = [...restored, ...welcome];
      setSalesHistory(full);
      await persistSession(currentLead, full, "discovery");
      return;
    }

    // Sessão nova no banco
    try {
      const res = await fetch("/api/vender/presenca/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          lead: currentLead,
          messages: [],
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

    const opening = openingDiscovery(currentLead);
    const openingMsgs = await pushAssistantParts(opening, 1700);
    setSalesHistory(openingMsgs);
    await persistSession(currentLead, openingMsgs, "discovery");
  }

  function startAtendimento() {
    contactOkRef.current = false;
    enteredChatRef.current = false;
    clearAbandonCountdown();
    setSessionEnded(false);
    sessionEndedRef.current = false;
    setEndedToast(false);
    setContactSaved(false);
    setOpenInSec(null);
    setContactError(null);
    setConversationId(null);
    conversationIdRef.current = null;
    setPhase("queue");
    setMessages([]);
    setSalesHistory([]);
    salesHistoryRef.current = [];
    setIsCloser(false);
    setError(null);
    setDraft("");
    setOpen(true);
    // Continuidade: se já tem cache deste browser, preenche dados
    const cache = readChatCache();
    if (cache?.lead.nome) {
      setLead((l) => ({
        ...l,
        nome: cache.lead.nome || l.nome,
        email: cache.lead.email || l.email,
        whatsapp: cache.lead.whatsapp || l.whatsapp,
      }));
    }
  }

  async function saveContact(e: FormEvent) {
    e.preventDefault();
    const err = validateContact(lead);
    if (err) {
      setContactError(err);
      return;
    }
    setContactError(null);
    setContactSaved(true);
    contactOkRef.current = true;
    leadRef.current = lead;

    // Salva lead no banco já (antes do chat)
    void persistSession(lead, [], "discovery");

    // 3 segundos e abre o chat (independente da contagem de pessoas)
    setOpenInSec(3);
    for (let s = 3; s >= 1; s--) {
      setOpenInSec(s);
      await sleep(1000);
    }
    setOpenInSec(0);
    await tryEnterChat();
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
      if (!res.ok) {
        throw new Error(data.error || "Falha no atendimento");
      }
      const parts =
        data.replies?.filter(Boolean) ??
        (data.reply ? [data.reply] : []);
      if (!parts.length) throw new Error("Resposta vazia");

      setTyping(false);
      if (data.phase === "closer") setIsCloser(true);

      const assistantMsgs = await pushAssistantParts(parts, 1500);
      const full = [...history, ...assistantMsgs];
      setSalesHistory(full);
      await persistSession(nextLead, full, data.phase);
    } catch {
      setTyping(false);
      setError("Não consegui responder agora. Você pode tentar novamente ou continuar no WhatsApp.");
      await pushAssistantParts(
        [
          "Não consegui processar sua última mensagem.",
          "Pode enviá-la novamente ou continuar no WhatsApp pelo botão abaixo.",
        ],
        1200,
      );
    } finally {
      setBusy(false);
      setTyping(false);
    }
  }

  async function handleSend(e?: FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || busy || typing || phase !== "chat" || sessionEnded) return;

    // Se estava no timer de encerrar e mandou mensagem com o painel aberto, cancela
    if (abandonActiveRef.current) clearAbandonCountdown();

    const userMsg: UiMsg = { id: uid(), role: "user", content: text };
    const nextSales = [...salesHistory, userMsg];
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

  function firstNameOf(name: string) {
    return name.trim().split(/\s+/)[0] || "Oi";
  }

  function clearAbandonCountdown() {
    for (const id of abandonTimersRef.current) window.clearTimeout(id);
    abandonTimersRef.current = [];
    abandonActiveRef.current = false;
    setEndingInSec(null);
  }

  function hasLiveConversation() {
    return (
      phaseRef.current === "chat" &&
      !sessionEndedRef.current &&
      salesHistoryRef.current.some((m) => m.role === "user")
    );
  }

  function finishAbandon() {
    if (!abandonActiveRef.current) return;
    abandonActiveRef.current = false;
    setEndingInSec(null);
    setSessionEnded(true);
    sessionEndedRef.current = true;
    setEndedToast(true);

    const bye: UiMsg = {
      id: uid(),
      role: "assistant",
      content:
        "Esta conversa foi encerrada por inatividade. Você pode abrir o chat novamente quando quiser.",
    };
    setMessages((prev) => [...prev, bye]);
    setSalesHistory((prev) => {
      const next = [...prev, bye];
      salesHistoryRef.current = next;
      void persistSession(leadRef.current, next, "ended");
      return next;
    });

    if (!reduceRef.current) playBlip();

    const hideToast = window.setTimeout(() => setEndedToast(false), 8000);
    abandonTimersRef.current.push(hideToast);
  }

  function startAbandonCountdown() {
    if (abandonActiveRef.current || !hasLiveConversation()) return;
    abandonActiveRef.current = true;

    const name = firstNameOf(leadRef.current.nome);
    const warn: UiMsg = {
      id: uid(),
      role: "assistant",
      content: `${name}, a conversa será encerrada em 10 segundos por inatividade.`,
    };
    setMessages((prev) => [...prev, warn]);
    setSalesHistory((prev) => {
      const next = [...prev, warn];
      salesHistoryRef.current = next;
      void persistSession(leadRef.current, next, "abandon_warn");
      return next;
    });

    setEndingInSec(10);
    for (let s = 9; s >= 0; s--) {
      const id = window.setTimeout(() => {
        if (!abandonActiveRef.current) return;
        if (s > 0) {
          setEndingInSec(s);
          return;
        }
        finishAbandon();
      }, (10 - s) * 1000);
      abandonTimersRef.current.push(id);
    }
  }

  /** X / fechar = só minimizar; se já houve mensagem no atendimento, inicia o timer de 10s */
  function handleMinimize() {
    setOpen(false);
    if (hasLiveConversation() && !abandonActiveRef.current) {
      startAbandonCountdown();
    }
  }

  function handleFabClick() {
    if (open) {
      handleMinimize();
      return;
    }
    // Voltou a tempo → cancela encerramento
    if (abandonActiveRef.current && !sessionEndedRef.current) {
      clearAbandonCountdown();
      const back: UiMsg = {
        id: uid(),
        role: "assistant",
        content: "A conversa continua disponível. Pode seguir de onde parou.",
      };
      setMessages((prev) => [...prev, back]);
      setSalesHistory((prev) => {
        const next = [...prev, back];
        salesHistoryRef.current = next;
        void persistSession(leadRef.current, next);
        return next;
      });
    }
    setOpen(true);
    setEndedToast(false);
  }

  const waHref = (() => {
    if (!ctaHref.includes("wa.me") && !ctaHref.includes("whatsapp")) return ctaHref;
    const msg = [
      "Olá. Quero o pacote Firemode de presença.",
      `Nome: ${lead.nome || "—"}`,
      `E-mail: ${lead.email || "—"}`,
      `WhatsApp: ${lead.whatsapp || "—"}`,
      `Site/Instagram: ${lead.presence || "—"}`,
      "[via chat LP]",
    ].join("\n");
    const sep = ctaHref.includes("?") ? "&" : "?";
    return `${ctaHref}${sep}text=${encodeURIComponent(msg)}`;
  })();

  if (!visible || hideForInteresse) return null;

  const inThread = phase === "chat";
  const showPanelExpanded = phase !== "nudge";
  const firstName = firstNameOf(lead.nome);
  const composerLocked = busy || typing || sessionEnded;

  return (
    <div className="lp-chat" role="complementary" aria-label="Atendimento Firemode">
      {!open && endingInSec !== null ? (
        <button
          type="button"
          className="lp-chat__mini-toast"
          role="status"
          aria-live="polite"
          onClick={handleFabClick}
        >
          <p>
            {firstName}, ainda está aí? O atendimento irá encerrar em{" "}
            <strong>{endingInSec}s</strong>…
          </p>
        </button>
      ) : null}

      {!open && endedToast && sessionEnded ? (
        <button
          type="button"
          className="lp-chat__mini-toast lp-chat__mini-toast--bye"
          role="status"
          onClick={handleFabClick}
        >
          <p>
            A conversa foi encerrada por inatividade. Abra o chat novamente quando quiser.
          </p>
        </button>
      ) : null}

      {open ? (
        <div className={`lp-chat__panel${showPanelExpanded ? " lp-chat__panel--tall" : ""}`}>
          <div className="lp-chat__head">
            <div className="lp-chat__who">
              <span className="lp-chat__avatar" aria-hidden>
                F
              </span>
              <div>
                <p className="lp-chat__name">Firemode</p>
                <p className="lp-chat__status">
                  {endingInSec !== null
                    ? `encerrando em ${endingInSec}s…`
                    : sessionEnded
                      ? "atendimento encerrado"
                      : typing || busy
                        ? "digitando…"
                        : phase === "queue"
                          ? "aguardando atendimento"
                          : isCloser
                            ? "próximo passo disponível"
                            : "atendimento online"}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="lp-chat__icon-btn"
              aria-label="Minimizar chat"
              onClick={handleMinimize}
            >
              <X size={16} />
            </button>
          </div>

          {phase === "nudge" ? (
            <div className="lp-chat__body">
              {!showMsg ? (
                <p className="lp-chat__waiting">Abrindo a conversa…</p>
              ) : (
                <>
                  <div className="lp-chat__bubble" aria-live="polite">
                    <p>
                      {typed}
                      {typed.length < NUDGE_MSG.length ? (
                        <span className="lp-chat__caret" aria-hidden>
                          |
                        </span>
                      ) : null}
                    </p>
                  </div>
                <p className="lp-chat__note">A conversa leva cerca de dois minutos.</p>
                  <button type="button" className="lp-chat__cta" onClick={startAtendimento}>
                    Analisar meu caso
                  </button>
                </>
              )}
            </div>
          ) : null}

          {phase === "queue" ? (
            <div className="lp-chat__body lp-chat__queue">
              <div className="lp-chat__queue-card">
                <p className="lp-chat__queue-label">Antes de começar</p>
                <p className="lp-chat__queue-count" aria-live="polite">
                  Conte um pouco sobre você e sua empresa.
                </p>
                <p className="lp-chat__queue-eta">
                  {openInSec !== null && openInSec > 0
                    ? `Dados salvos. A conversa abre em ${openInSec}s…`
                    : openInSec === 0
                      ? "Abrindo a conversa…"
                      : "Preencha os dados para iniciar a conversa."}
                </p>
              </div>

              <p className="lp-chat__note" style={{ marginTop: "0.15rem" }}>
                Deixe nome, WhatsApp e e-mail para continuarmos por aqui ou entrarmos
                em contato depois.
              </p>

              <form className="lp-chat__contact" onSubmit={saveContact}>
                <label className="lp-chat__field">
                  <span>Nome</span>
                  <input
                    value={lead.nome}
                    onChange={(e) => setLead((l) => ({ ...l, nome: e.target.value }))}
                    placeholder="Como te chamamos"
                    autoComplete="name"
                    disabled={contactSaved}
                  />
                </label>
                <label className="lp-chat__field">
                  <span>WhatsApp</span>
                  <input
                    value={lead.whatsapp}
                    onChange={(e) => setLead((l) => ({ ...l, whatsapp: e.target.value }))}
                    placeholder="11999998888"
                    autoComplete="tel"
                    inputMode="tel"
                    disabled={contactSaved}
                  />
                </label>
                <label className="lp-chat__field">
                  <span>E-mail</span>
                  <input
                    value={lead.email}
                    onChange={(e) => setLead((l) => ({ ...l, email: e.target.value }))}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    inputMode="email"
                    disabled={contactSaved}
                  />
                </label>
                {contactError ? <p className="lp-chat__error">{contactError}</p> : null}
                {contactSaved ? (
                  <p className="lp-chat__contact-ok">
                    {openInSec !== null && openInSec > 0
                      ? `Dados salvos. Abrindo chat em ${openInSec}s…`
                      : "Dados salvos. Você já pode continuar."}
                  </p>
                ) : (
                  <button type="submit" className="lp-chat__cta">
                    Continuar conversa
                  </button>
                )}
              </form>

              {openInSec !== null && openInSec <= 1 ? <TypingDots /> : null}
            </div>
          ) : null}

          {inThread ? (
            <>
              <div className="lp-chat__thread" ref={listRef}>
                {messages.map((m) => (
                  <div key={m.id} className={`lp-chat__row lp-chat__row--${m.role}`}>
                    <div className="lp-chat__bubble">
                      <p>{m.content}</p>
                    </div>
                  </div>
                ))}
                {typing ? <TypingDots /> : null}
              </div>

              {error ? <p className="lp-chat__error">{error}</p> : null}

              {phase === "chat" ? (
                <a
                  href={waHref}
                  className={`lp-chat__wa${isCloser || sessionEnded ? " lp-chat__wa--hot" : ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {sessionEnded
                    ? "Falar no WhatsApp"
                    : isCloser
                      ? "Continuar no WhatsApp"
                      : "Continuar no WhatsApp"}
                </a>
              ) : null}

              {sessionEnded ? (
                <button
                  type="button"
                  className="lp-chat__cta"
                  style={{ margin: "0 0.85rem 0.65rem" }}
                  onClick={() => {
                    clearAbandonCountdown();
                    setSessionEnded(false);
                    sessionEndedRef.current = false;
                    setEndedToast(false);
                    startAtendimento();
                  }}
                >
                  Chamar de novo
                </button>
              ) : (
                <form className="lp-chat__composer" onSubmit={(e) => void handleSend(e)}>
                  <input
                    ref={inputRef}
                    className="lp-chat__input"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Pode falar — estou te ouvindo…"
                    disabled={composerLocked}
                    autoComplete="off"
                    aria-label="Mensagem"
                  />
                  <button
                    type="submit"
                    className="lp-chat__send"
                    disabled={composerLocked || !draft.trim()}
                    aria-label="Enviar"
                  >
                    <Send size={16} />
                  </button>
                </form>
              )}
            </>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        className={`lp-chat__fab${
          (showMsg && !open) || endingInSec !== null ? " lp-chat__fab--ping" : ""
        }`}
        aria-label={open ? "Minimizar chat" : "Abrir chat"}
        onClick={handleFabClick}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {(showMsg && !open) || endingInSec !== null ? (
          <span className="lp-chat__badge" aria-hidden />
        ) : null}
      </button>
    </div>
  );
}
