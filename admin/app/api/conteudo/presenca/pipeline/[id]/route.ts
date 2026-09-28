import { NextRequest, NextResponse } from "next/server";
import { statusPresencaPipeline } from "@/lib/content-machine";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const jobId = id?.trim();
  if (!jobId) {
    return NextResponse.json({ error: "job_id obrigatório" }, { status: 400 });
  }

  try {
    const job = await statusPresencaPipeline(jobId);
    return NextResponse.json(job);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Job não encontrado" },
      { status: 404 },
    );
  }
}
