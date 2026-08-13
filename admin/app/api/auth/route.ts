import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const password = data.get("password") as string;

  if (password === process.env.ADMIN_PASSWORD) {
    const res = new NextResponse(null, { status: 303, headers: { Location: "/" } });
    res.cookies.set("admin_auth", password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    });
    return res;
  }

  return new NextResponse(null, { status: 303, headers: { Location: "/login?error=1" } });
}
