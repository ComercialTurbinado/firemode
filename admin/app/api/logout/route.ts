import { NextResponse } from "next/server";
import { ADMIN_BASE } from "@/lib/admin-path";

export async function POST() {
  const res = new NextResponse(null, {
    status: 303,
    headers: { Location: `${ADMIN_BASE}/login` },
  });
  res.cookies.delete("admin_auth");
  return res;
}
