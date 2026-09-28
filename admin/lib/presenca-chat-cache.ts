import type { PresencaLeadChat } from "@/lib/presenca-sdr";

const CACHE_KEY = "fm_presenca_chat_v1";

export type BrowserChatCache = {
  conversationId: string | null;
  browserKey: string;
  lead: PresencaLeadChat;
  messages: { role: "user" | "assistant"; content: string; at?: string }[];
  phase?: string;
  updatedAt: string;
  expiresAt: string;
};

export function getOrCreateBrowserKey(): string {
  if (typeof window === "undefined") return "";
  const k = "fm_presenca_browser_key";
  let v = localStorage.getItem(k);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(k, v);
  }
  return v;
}

export function readChatCache(): BrowserChatCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as BrowserChatCache;
    if (data.expiresAt && new Date(data.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function writeChatCache(data: Omit<BrowserChatCache, "updatedAt" | "expiresAt">) {
  if (typeof window === "undefined") return;
  const payload: BrowserChatCache = {
    ...data,
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

export function clearChatCache() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CACHE_KEY);
}
