import { NextRequest, NextResponse } from "next/server";

const PUBLIC = [
  "/login",
  "/_next",
  "/favicon",
  "/api/auth",
  "/api/webhooks",
  "/vender", // LP comercial pública (VSL)
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const auth = req.cookies.get("admin_auth")?.value;
  if (auth === process.env.ADMIN_PASSWORD) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
