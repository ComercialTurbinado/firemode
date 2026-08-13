import { fetchPipelineStatus } from "@/lib/bridge";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const jobs = await fetchPipelineStatus();
  return NextResponse.json(jobs);
}
