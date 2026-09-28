import { NextRequest, NextResponse } from "next/server";
import { analisarVideo } from "@/lib/content-machine";

export const maxDuration = 200;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | {
        analise_web_id?: string;
        video_id?: string;
        url?: string;
        legenda?: string;
        titulo?: string;
        rede?: string;
        views?: number;
        likes?: number;
        transcricao?: string;
      }
    | null;
  const analiseId = body?.analise_web_id?.trim();
  const videoId = body?.video_id?.trim();
  if (!analiseId || !videoId) {
    return NextResponse.json({ erro: "Informe analise_web_id e video_id." }, { status: 400 });
  }
  const r = await analisarVideo(analiseId, videoId, {
    url: body?.url,
    legenda: body?.legenda,
    titulo: body?.titulo,
    rede: body?.rede,
    views: body?.views,
    likes: body?.likes,
    transcricao: body?.transcricao,
  });
  if (r.erro || r.error) {
    return NextResponse.json({ erro: r.erro || r.error }, { status: 502 });
  }
  return NextResponse.json(r);
}
