import { NextRequest, NextResponse } from "next/server";
import { getEnvVar } from "@/lib/ssm-env";
import { ADMIN_BASE, adminPath } from "@/lib/admin-path";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const password = data.get("password") as string;
  const nextRaw = (data.get("next") as string) || "";
  const adminPassword = await getEnvVar("ADMIN_PASSWORD");

  if (adminPassword && password === adminPassword) {
    const next =
      nextRaw.startsWith(ADMIN_BASE) && !nextRaw.includes("//")
        ? nextRaw
        : adminPath("/");
    const res = new NextResponse(null, { status: 303, headers: { Location: next } });
    res.cookies.set("admin_auth", "ok", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    });
    return res;
  }

  return new NextResponse(null, {
    status: 303,
    headers: { Location: `${ADMIN_BASE}/login?error=1` },
  });
}
