/**
 * HTML + PDF da apresentação/conteúdo do cliente (analises_web).
 * Usado pela API "Salvar PDF" e pelo script CLI.
 */

import { spawnSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ClientePdfPayload = {
  id: string;
  empresa: string;
  html: string;
  filename: string;
};

function esc(s: unknown) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function txt(s: unknown, n = 700): string {
  if (s == null || s === "") return "—";
  if (typeof s === "string") return s.slice(0, n);
  if (Array.isArray(s)) {
    return s
      .map((x) =>
        typeof x === "string"
          ? x
          : (x as { titulo?: string; label?: string; nome?: string; texto?: string })?.titulo ||
            (x as { label?: string }).label ||
            (x as { nome?: string }).nome ||
            (x as { texto?: string }).texto ||
            JSON.stringify(x),
      )
      .filter(Boolean)
      .join(" · ")
      .slice(0, n);
  }
  if (typeof s === "object") {
    const o = s as Record<string, unknown>;
    return String(o.texto || o.resumo || o.sintese || o.titulo || JSON.stringify(s)).slice(0, n);
  }
  return String(s).slice(0, n);
}

function rows(pairs: [string, unknown][]) {
  return pairs
    .filter(([, v]) => v != null && v !== "" && v !== "—")
    .map(
      ([k, v]) =>
        `<tr><td style="width:28%">${esc(k)}</td><td>${esc(txt(v, 900))}</td></tr>`,
    )
    .join("");
}

function table(headers: string[], body: string) {
  return `<table><thead><tr>${headers
    .map((h) => `<th>${esc(h)}</th>`)
    .join("")}</tr></thead><tbody>${body}</tbody></table>`;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "cliente";
}

function pecaPreview(p: { payload?: Record<string, unknown>; angulo?: string | null; cunho?: string | null; palavra_chave?: string | null }) {
  const payload = p.payload || {};
  const bits = [
    payload.roteiro,
    payload.script,
    payload.texto,
    payload.hook,
    payload.gancho,
    payload.legenda,
    payload.caption,
    payload.outline,
    payload.resumo,
    Array.isArray(payload.cenas)
      ? (payload.cenas as { texto?: string; fala?: string }[])
          .map((c) => c.texto || c.fala || c)
          .join(" · ")
      : null,
  ].filter(Boolean);
  return txt(bits[0] || p.angulo || p.cunho || p.palavra_chave || "—", 500);
}

function chromeBin(): string | null {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean) as string[];
  return candidates.find((p) => existsSync(p)) || null;
}

export async function carregarPayloadClientePdf(
  supabase: SupabaseClient,
  id: string,
): Promise<ClientePdfPayload> {
  const { data: analise, error } = await supabase
    .from("analises_web")
    .select("id,cliente_handle,dominio,url,status,criado_em,diagnostico,presenca")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!analise) throw new Error("Análise não encontrada");

  const { data: concorrentes } = await supabase
    .from("concorrentes_web")
    .select("dominio,nome,tipo,aparicoes,ranqueia_para,fonte,status")
    .eq("analise_web_id", id)
    .order("aparicoes", { ascending: false });

  const { data: pecas } = await supabase
    .from("pecas_conteudo")
    .select("*")
    .eq("analise_ref", id)
    .order("criado_em", { ascending: false })
    .limit(40);

  const diag = (analise.diagnostico || {}) as Record<string, unknown>;
  const p = (analise.presenca || {}) as Record<string, unknown>;
  const sc = (p.scorecard_atual || {}) as { geral?: number; em?: string; canais?: Record<string, number> };
  const canais = sc.canais || {};
  const plano = (p.plano_impacto || {}) as Record<string, unknown>;
  const movs = [...((plano.movimentos as Record<string, unknown>[]) || [])].sort(
    (a, b) => Number(a.ordem ?? 99) - Number(b.ordem ?? 99),
  );
  const gmb = (p.google_meu_negocio || {}) as Record<string, unknown>;
  const perfil = (gmb.perfil || {}) as Record<string, unknown>;
  const perc = (p.percepcao_valor || {}) as Record<string, unknown>;
  const pos = (p.posicionamento || {}) as Record<string, unknown>;
  const aud = (p.audiencia_ideal || {}) as Record<string, unknown>;
  const tech = (p.tech_seo || {}) as Record<string, unknown>;
  const ai = (p.ai_visibility || {}) as Record<string, unknown>;
  const aut = (p.autoridade_busca || {}) as Record<string, unknown>;
  const ig = (p.instagram || {}) as Record<string, unknown>;
  const tt = (p.tiktok || {}) as Record<string, unknown>;
  const yt = (p.youtube || {}) as Record<string, unknown>;
  const ads = (p.meta_ads || {}) as Record<string, unknown>;
  const midia = (p.midia_comparativo || {}) as Record<string, unknown>;
  const blog = (p.blog || {}) as Record<string, unknown>;
  const empresa = String(diag.empresa || analise.dominio || "Cliente");
  const slug = slugify(empresa);
  const gerado = new Date().toLocaleString("pt-BR");

  const canalLabels: Record<string, string> = {
    site: "Site",
    busca: "Busca",
    gmb: "GMB",
    reviews: "Reviews",
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    ia: "IA",
    ads: "Ads",
  };

  const canalTable = Object.entries(canais)
    .map(
      ([k, v]) =>
        `<tr><td>${esc(canalLabels[k] || k)}</td><td class="num">${esc(v)}</td></tr>`,
    )
    .join("");

  const movCards = movs
    .map(
      (m) => `
  <div class="card">
    <div class="t">#${esc(m.ordem ?? "")} · ${esc(m.titulo || "Movimento")}</div>
    <p><span class="badge">${esc(m.canal || "—")}</span></p>
    <p><strong>Gap:</strong> ${esc(txt(m.gap, 400))}</p>
    <p><strong>Ação:</strong> ${esc(txt(m.acao_principal || m.acao, 400))}</p>
  </div>`,
    )
    .join("");

  const concRows = (concorrentes || [])
    .slice(0, 12)
    .map(
      (c) =>
        `<tr><td>${esc(c.nome || c.dominio)}</td><td>${esc(c.dominio)}</td><td class="num">${esc(c.aparicoes ?? "—")}</td><td>${esc(c.tipo || c.fonte || "—")}</td></tr>`,
    )
    .join("");

  const listaPecas = pecas || [];
  const pecaCards = listaPecas
    .map((pc) => {
      const row = pc as {
        titulo?: string;
        tipo?: string;
        status?: string;
        plataforma?: string;
        etapa_funil?: string;
        angulo?: string;
        cunho?: string;
        payload?: Record<string, unknown>;
        palavra_chave?: string;
      };
      return `
  <div class="card">
    <div class="t">${esc(row.titulo || "Sem título")}</div>
    <p>
      <span class="badge">${esc(row.tipo || "—")}</span>
      <span class="badge">${esc(row.status || "—")}</span>
      ${row.plataforma ? `<span class="badge">${esc(row.plataforma)}</span>` : ""}
    </p>
    ${row.angulo ? `<p><strong>Ângulo:</strong> ${esc(txt(row.angulo, 280))}</p>` : ""}
    <p class="muted">${esc(pecaPreview(row))}</p>
  </div>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<title>Firemode · ${esc(empresa)} — Apresentação + Conteúdo</title>
<style>
@page { size: A4; margin: 12mm 11mm; }
* { box-sizing: border-box; }
body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color:#1a1a1a; font-size:10px; line-height:1.4; max-width:760px; margin:0 auto; }
h1 { font-size:18px; margin:0 0 4px; }
h2 { font-size:13px; margin:16px 0 6px; border-bottom:1px solid #ddd; padding-bottom:3px; page-break-after:avoid; }
h3 { font-size:11px; margin:10px 0 4px; }
p { margin:0 0 6px; }
.eyebrow { font-size:8.5px; text-transform:uppercase; letter-spacing:.06em; color:#555; }
.muted { color:#555; }
.stats { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; margin:10px 0; }
.stat { border:1px solid #e2e2e2; padding:8px 6px; text-align:center; }
.stat .v { font-size:16px; font-weight:700; }
.stat .l { font-size:8px; color:#555; margin-top:2px; }
.callout { background:#f4f6f8; border-left:3px solid #2a6f9e; padding:8px 10px; margin:8px 0; }
.callout.warn { border-left-color:#b45309; background:#faf6f0; }
.callout.ok { border-left-color:#2a7a4b; background:#f2f7f4; }
.callout strong { display:block; margin-bottom:3px; }
.quote { border:1px solid #e2e2e2; padding:10px; font-weight:600; font-size:11px; line-height:1.45; margin:8px 0; }
table { width:100%; border-collapse:collapse; margin:4px 0 8px; font-size:9.5px; }
th,td { border-bottom:1px solid #e8e8e8; padding:4px 5px; text-align:left; vertical-align:top; }
th { font-size:8.5px; color:#555; }
td.num, th.num { text-align:right; }
.card { border:1px solid #e2e2e2; padding:8px; margin:6px 0; page-break-inside:avoid; }
.card .t { font-weight:700; font-size:11px; margin-bottom:3px; }
.footer { margin-top:14px; font-size:8px; color:#777; border-top:1px solid #ddd; padding-top:6px; }
.two { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.badge { display:inline-block; font-size:8px; border:1px solid #ccc; padding:1px 5px; margin-right:4px; }
</style>
</head>
<body>
<div class="eyebrow">Firemode · entrega do cliente · apresentação + conteúdo</div>
<h1>${esc(empresa)}</h1>
<p class="muted">${esc(analise.url || analise.dominio)} · @${esc(analise.cliente_handle)} · ${esc(analise.status)} · gerado ${esc(gerado)}</p>

<div class="stats">
  <div class="stat"><div class="v">${esc(sc.geral ?? "—")}</div><div class="l">nota geral</div></div>
  <div class="stat"><div class="v">${esc(canais.busca ?? "—")}</div><div class="l">busca</div></div>
  <div class="stat"><div class="v">${esc(canais.gmb ?? "—")}</div><div class="l">GMB</div></div>
  <div class="stat"><div class="v">${esc(canais.instagram ?? "—")}</div><div class="l">Instagram</div></div>
</div>

<div class="quote">${esc(plano.tese || "Diagnóstico de presença digital Firemode.")}</div>

<h2>1. Retrato da marca</h2>
${table(
  ["Campo", "Valor"],
  rows([
    ["Empresa", empresa],
    ["Nicho", diag.nicho],
    ["Oferta", diag.oferta],
    ["Público-alvo", diag.publico_alvo],
    ["Tom de voz", diag.tom_de_voz],
    ["Diferenciais", diag.diferenciais_aparentes],
    ["Temas", diag.principais_temas],
    ["Queries comerciais", diag.queries_comerciais],
  ]),
)}

<h2>2. Scorecard</h2>
${table(["Canal", "Nota"], canalTable || `<tr><td colspan="2">Sem scorecard</td></tr>`)}

<h2>3. Plano de impacto</h2>
${
  plano.diagnostico_executivo
    ? `<div class="callout"><strong>Diagnóstico executivo</strong>${esc(txt(plano.diagnostico_executivo, 900))}</div>`
    : ""
}
${movCards || "<p class='muted'>Sem movimentos.</p>"}
${
  plano.oferta_agencia
    ? `<div class="callout ok"><strong>Próximo passo</strong>${esc(txt(plano.oferta_agencia, 600))}</div>`
    : ""
}

<h2>4. Reputação (GMB)</h2>
${table(
  ["Campo", "Valor"],
  rows([
    ["Score", gmb.score ?? gmb.nota_interna],
    ["Nome", perfil.nome || perfil.name],
    ["Rating", perfil.rating],
    ["Resumo", gmb.resumo],
    ["NPS", gmb.nps],
    ["Reclame Aqui", gmb.reclame_aqui],
  ]),
)}

<h2>5. Site · Busca · IA</h2>
<div class="two">
  <div>
    <h3>Tech SEO</h3>
    ${table(["Campo", "Valor"], rows([["Score", tech.score || tech.nota], ["Resumo", tech.resumo || tech.sintese]]))}
  </div>
  <div>
    <h3>Autoridade / IA</h3>
    ${table(
      ["Campo", "Valor"],
      rows([
        ["Busca", aut.score || aut.nota],
        ["IA", ai.score || ai.nota],
        ["Resumo busca", aut.resumo || aut.sintese],
        ["Resumo IA", ai.resumo || ai.sintese],
      ]),
    )}
  </div>
</div>

<h2>6. Redes e ads</h2>
${table(
  ["Canal", "Info", "Métrica"],
  `
  <tr><td>Instagram</td><td>${esc(ig.handle || ig.username || "—")}</td><td>${esc(canais.instagram ?? "—")}</td></tr>
  <tr><td>TikTok</td><td>${esc(tt.handle || tt.username || "—")}</td><td>${esc(canais.tiktok ?? "—")}</td></tr>
  <tr><td>YouTube</td><td>${esc(yt.handle || yt.channel || "—")}</td><td>${esc(canais.youtube ?? "—")}</td></tr>
  <tr><td>Meta Ads</td><td>${esc(txt(ads.sintese || ads.resumo, 200))}</td><td>${esc(ads.score ?? "—")}</td></tr>
  <tr><td>Blog</td><td>${esc(txt(blog.resumo || blog.sintese, 200))}</td><td>${esc(blog.score ?? "—")}</td></tr>
`,
)}

<h2>7. Concorrentes</h2>
${concRows ? table(["Nome", "Domínio", "Aparições", "Tipo"], concRows) : "<p class='muted'>Sem concorrentes.</p>"}

<h2>8. Posicionamento e audiência</h2>
${table(
  ["Campo", "Valor"],
  rows([
    ["Headline / bio", pos.headline || pos.bio || pos.proposta],
    ["CTA", pos.cta],
    ["Síntese", pos.sintese || pos.resumo],
    ["Audiência", aud.sintese || aud.resumo || aud.personas],
  ]),
)}

<h2>9. Percepção de valor</h2>
${table(
  ["Campo", "Valor"],
  rows([
    ["Declarado", perc.proposta_valor_declarada || perc.produto_declarado],
    ["Percebido", perc.proposta_valor_percebida || perc.produto_percebido || perc.percepcao_real_marca],
    ["Em IA", perc.percepcao_em_ia],
    ["Síntese", perc.sintese],
    ["Corrigir", perc.o_que_corrigir],
    ["Reforçar", perc.o_que_reforcar],
  ]),
)}

${
  midia.sintese || midia.resumo
    ? `<h2>10. Conteúdo vs rivais</h2><div class="callout"><strong>Síntese</strong>${esc(txt(midia.sintese || midia.resumo, 900))}</div>`
    : ""
}

<h2>11. Peças de conteúdo (${listaPecas.length})</h2>
${pecaCards || "<p class='muted'>Nenhuma peça gerada.</p>"}

<div class="footer">Firemode · ${esc(empresa)} · ${esc(id)} · ${esc(gerado)}</div>
</body>
</html>`;

  return {
    id,
    empresa,
    html,
    filename: `${slug}-apresentacao-conteudo.pdf`,
  };
}

/** Gera PDF via Chrome headless. Retorna buffer ou null se Chrome indisponível. */
export function htmlParaPdfBuffer(html: string, filenameHint = "export"): Buffer | null {
  const chrome = chromeBin();
  if (!chrome) return null;

  const dir = join(/*turbopackIgnore: true*/ tmpdir(), "firemode-pdf");
  mkdirSync(dir, { recursive: true });
  const stamp = `${filenameHint}-${Date.now()}`;
  const htmlPath = join(dir, `${stamp}.html`);
  const pdfPath = join(dir, `${stamp}.pdf`);
  writeFileSync(htmlPath, html, "utf8");

  const r = spawnSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      `--print-to-pdf=${pdfPath}`,
      `file://${htmlPath}`,
    ],
    { encoding: "utf8", timeout: 60_000 },
  );

  try {
    unlinkSync(htmlPath);
  } catch {
    /* ignore */
  }

  if (r.status !== 0 || !existsSync(pdfPath)) {
    return null;
  }

  const buf = readFileSync(pdfPath);
  try {
    unlinkSync(pdfPath);
  } catch {
    /* ignore */
  }
  return buf;
}
