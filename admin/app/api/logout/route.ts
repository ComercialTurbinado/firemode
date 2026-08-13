import { NextResponse } from "next/server";

export async function POST() {
  const res = new NextResponse(null, { status: 303, headers: { Location: "/login" } });
  res.cookies.delete("admin_auth");
  return res;
}
