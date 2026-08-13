import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { createTeleprompterClient } from "@/lib/teleprompter";

const FEATURE_SLUG = "edicao_video";

type RecordingRow = {
  id: string;
  session_id: string | null;
  status: string | null;
};

type DbWebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: RecordingRow;
  old_record: RecordingRow | null;
};

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.TELEPROMPTER_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as DbWebhookPayload;

  if (payload.table !== "recordings" || payload.record.status !== "completed") {
    return NextResponse.json({ skipped: true });
  }
  if (payload.old_record?.status === "completed") {
    return NextResponse.json({ skipped: true, reason: "already completed" });
  }

  const recording = payload.record;
  if (!recording.session_id) {
    return NextResponse.json({ skipped: true, reason: "no session_id" });
  }

  const teleprompter = createTeleprompterClient();

  const { data: session } = await teleprompter
    .from("sessions")
    .select("client_id")
    .eq("id", recording.session_id)
    .single();

  if (!session?.client_id) {
    return NextResponse.json({ skipped: true, reason: "session/client not found" });
  }

  const { data: client } = await teleprompter
    .from("clients")
    .select("external_ref")
    .eq("id", session.client_id)
    .single();

  if (!client?.external_ref) {
    return NextResponse.json({ skipped: true, reason: "client not linked to firemode (external_ref vazio)" });
  }

  const firemode = createClient();
  const { data, error } = await firemode.rpc("debitar_creditos_teleprompter", {
    p_cliente_handle: client.external_ref,
    p_feature_slug: FEATURE_SLUG,
    p_referencia_id: recording.id,
    p_descricao: `Edição de vídeo - gravação ${recording.id}`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
