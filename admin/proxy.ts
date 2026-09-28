import { NextRequest, NextResponse } from "next/server";
import { ADMIN_BASE } from "@/lib/admin-path";

const PUBLIC_PREFIXES = [
  "/_next",
  "/favicon",
  "/api/auth",
  "/api/webhooks",
  "/vender", // alias antigo da LP + assets em /vender/presenca/*
  "/api/vender",
  "/api/conteudo/presenca/cron",
  "/api/debug-env",
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true; // LP
  if (pathname === `${ADMIN_BASE}/login` || pathname.startsWith(`${ADMIN_BASE}/login/`)) {
    return true;
  }
  // login antigo
  if (pathname === "/login" || pathname.startsWith("/login/")) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function isLocalDev(req: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") return true;
  const host = (req.headers.get("host") || "").split(",")[0]?.trim() || "";
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host);
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  // Local: admin/CRM sem login (produção continua exigindo cookie)
  if (isLocalDev(req)) return NextResponse.next();

  const auth = req.cookies.get("admin_auth")?.value;
  if (auth === "ok") return NextResponse.next();

  // APIs do admin precisam de JSON — redirect HTML quebra o fetch do browser
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Não autenticado. Faça login de novo." },
      { status: 401 },
    );
  }

  // Qualquer outra rota (incl. /fireadmin/*) → login do admin
  const url = req.nextUrl.clone();
  url.pathname = `${ADMIN_BASE}/login`;
  if (pathname.startsWith(ADMIN_BASE)) {
    url.searchParams.set("next", pathname);
  }
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
