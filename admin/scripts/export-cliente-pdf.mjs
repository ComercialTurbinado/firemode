#!/usr/bin/env node
/**
 * Exporta apresentação + conteúdo de um cliente (analises_web) para PDF.
 * Uso: node scripts/export-cliente-pdf.mjs [analise_web_id]
 */
import { config } from "dotenv";
import { mkdirSync, writeFileSync, readFileSync } from "fs";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: join(root, ".env.local") });
config({ path: join(root, ".env") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const id = process.argv[2] || "85087ee2-26be-415b-8fff-4d1cb68d8076";

if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}

async function sb(path) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) throw new Error(`${res.status} ${String(text).slice(0, 400)}`);
  return data;
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function txt(s, n = 700) {
  if (s == null || s === "") return "—";
  if (typeof s === "string") return s.slice(0, n);
  if (Array.isArray(s)) {
    return s
      .map((x) =>
        typeof x === "string"
          ? x
          : x?.titulo || x?.label || x?.nome || x?.texto || JSON.stringify(x),
      )
      .filter(Boolean)
      .join(" · ")
      .slice(0, n);
  }
  if (typeof s === "object") {
    return (
      s.texto ||
      s.resumo ||
      s.sintese ||
      s.titulo ||
      JSON.stringify(s)
    )
      .toString()
      .slice(0, n);
  }
  return String(s).slice(0, n);
}

function rows(pairs) {
  return pairs
    .filter(([, v]) => v != null && v !== "" && v !== "—")
    .map(
      ([k, v]) =>
        `<tr><td style="width:28%">${esc(k)}</td><td>${esc(txt(v, 900))}</td></tr>`,
    )
    .join("");
}

function table(headers, bodyRows) {
  return `<table><thead><tr>${headers
    .map((h) => `<th>${esc(h)}</th>`)
    .join("")}</tr></thead><tbody>${bodyRows}</tbody></table>`;
}

function pecaPreview(p) {
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
    payload.titulo_alternativo,
    Array.isArray(payload.cenas)
      ? payload.cenas.map((c) => c.texto || c.fala || c.narracao || c).join(" · ")
      : null,
    Array.isArray(payload.beats)
      ? payload.beats.map((b) => b.texto || b).join(" · ")
      : null,
  ].filter(Boolean);
  return txt(bits[0] || p.angulo || p.cunho || p.palavra_chave || "—", 500);
}

const [analise] = await sb(
  `analises_web?id=eq.${id}&select=id,cliente_handle,dominio,url,status,criado_em,diagnostico,presenca`,
);
if (!analise) {
  console.error("Análise não encontrada:", id);
  process.exit(1);
}

let concorrentes = [];
try {
  concorrentes = await sb(
    `concorrentes_web?analise_web_id=eq.${id}&select=dominio,nome,tipo,aparicoes,ranqueia_para,fonte,status&order=aparicoes.desc`,
  );
} catch {
  concorrentes = [];
}

let pecas = [];
try {
  pecas = await sb(
    `pecas_conteudo?analise_ref=eq.${id}&select=*&order=criado_em.desc&limit=40`,
  );
} catch {
  pecas = [];
}

const diag = analise.diagnostico || {};
const p = analise.presenca || {};
const sc = p.scorecard_atual || {};
const canais = sc.canais || {};
const plano = p.plano_impacto || {};
const movs = [...(plano.movimentos || [])].sort(
  (a, b) => (a.ordem ?? 99) - (b.ordem ?? 99),
);
const gmb = p.google_meu_negocio || {};
const perfil = gmb.perfil || {};
const perc = p.percepcao_valor || {};
const pos = p.posicionamento || {};
const aud = p.audiencia_ideal || {};
const tech = p.tech_seo || {};
const ai = p.ai_visibility || {};
const aut = p.autoridade_busca || {};
const ig = p.instagram || {};
const tt = p.tiktok || {};
const yt = p.youtube || {};
const ads = p.meta_ads || {};
const midia = p.midia_comparativo || {};
const blog = p.blog || {};
const empresa = diag.empresa || analise.dominio || "Cliente";
const slug = String(empresa)
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "")
  .slice(0, 40);

const canalLabels = {
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
    ${m.evidencia || m.kpi ? `<p class="muted">${esc(txt(m.evidencia || m.kpi, 300))}</p>` : ""}
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

const pecaCards = (pecas || [])
  .map(
    (pc) => `
  <div class="card">
    <div class="t">${esc(pc.titulo || "Sem título")}</div>
    <p>
      <span class="badge">${esc(pc.tipo || "—")}</span>
      <span class="badge">${esc(pc.status || "—")}</span>
      ${pc.plataforma ? `<span class="badge">${esc(pc.plataforma)}</span>` : ""}
      ${pc.etapa_funil ? `<span class="badge">${esc(pc.etapa_funil)}</span>` : ""}
    </p>
    ${pc.angulo ? `<p><strong>Ângulo:</strong> ${esc(txt(pc.angulo, 280))}</p>` : ""}
    ${pc.cunho ? `<p><strong>Cunho:</strong> ${esc(txt(pc.cunho, 200))}</p>` : ""}
    <p class="muted">${esc(pecaPreview(pc))}</p>
  </div>`,
  )
  .join("");

const gerado = new Date().toLocaleString("pt-BR");

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
h3 { font-size:11px; margin:10px 0 4px; page-break-after:avoid; }
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
    ["Presença digital (diag)", diag.presenca_digital],
  ]),
)}

<h2>2. Scorecard (onde some)</h2>
${table(["Canal", "Nota"], canalTable || `<tr><td colspan="2">Sem scorecard</td></tr>`)}
<p class="muted">Snapshot em ${esc(sc.em || "—")}</p>

<h2>3. Plano de impacto — 3 movimentos</h2>
${
  plano.diagnostico_executivo
    ? `<div class="callout"><strong>Diagnóstico executivo</strong>${esc(txt(plano.diagnostico_executivo, 900))}</div>`
    : ""
}
${movCards || "<p class='muted'>Sem movimentos gerados.</p>"}
${
  plano.nao_fazer_agora
    ? `<div class="callout warn"><strong>Não fazer agora</strong>${esc(txt(plano.nao_fazer_agora, 600))}</div>`
    : ""
}
${
  plano.oferta_agencia
    ? `<div class="callout ok"><strong>Oferta / próximo passo</strong>${esc(txt(plano.oferta_agencia, 600))}</div>`
    : ""
}

<h2>4. Reputação (GMB / reviews / RA)</h2>
${table(
  ["Campo", "Valor"],
  rows([
    ["Score GMB", gmb.score ?? gmb.nota_interna],
    ["Nome perfil", perfil.nome || perfil.name || perfil.title],
    ["Rating", perfil.rating || perfil.nota],
    ["Reviews", perfil.user_ratings_total || perfil.reviews],
    ["Place ID", gmb.place_id_fixado || perfil.place_id],
    ["Alerta múltiplos", gmb.alerta_multiplos ? "sim" : null],
    ["Total perfis", gmb.total_perfis],
    ["Resumo", gmb.resumo],
    ["NPS", gmb.nps],
    ["Reclame Aqui", gmb.reclame_aqui],
  ]),
)}

<h2>5. Site / Tech SEO · Busca · IA</h2>
<div class="two">
  <div>
    <h3>Tech SEO</h3>
    ${table(
      ["Campo", "Valor"],
      rows([
        ["Score", tech.score || tech.nota],
        ["Resumo", tech.resumo || tech.sintese],
        ["Prioridade", tech.prioridade],
        ["AI prep / llms", tech.ai_prep || tech.llms_txt],
      ]),
    )}
  </div>
  <div>
    <h3>Autoridade de busca</h3>
    ${table(
      ["Campo", "Valor"],
      rows([
        ["Score", aut.score || aut.nota],
        ["Resumo", aut.resumo || aut.sintese],
        ["Prioridade", aut.prioridade],
      ]),
    )}
    <h3>Visibilidade em IA</h3>
    ${table(
      ["Campo", "Valor"],
      rows([
        ["Score", ai.score || ai.nota],
        ["Resumo", ai.resumo || ai.sintese],
        ["Cita marca", perc.ia_cita_marca],
      ]),
    )}
  </div>
</div>

<h2>6. Redes e ads</h2>
${table(
  ["Canal", "Handle / info", "Nota / métrica"],
  `
  <tr><td>Instagram</td><td>${esc(ig.handle || ig.username || ig.perfil || "—")}</td><td>${esc(txt({ seguidores: ig.seguidores || ig.followers, score: ig.score || canais.instagram }, 200))}</td></tr>
  <tr><td>TikTok</td><td>${esc(tt.handle || tt.username || "—")}</td><td>${esc(txt({ seguidores: tt.seguidores || tt.followers, score: tt.score || canais.tiktok }, 200))}</td></tr>
  <tr><td>YouTube</td><td>${esc(yt.handle || yt.channel || yt.titulo || "—")}</td><td>${esc(txt({ inscritos: yt.inscritos || yt.subscribers, score: yt.score || canais.youtube }, 200))}</td></tr>
  <tr><td>Meta Ads</td><td>${esc(txt(ads.sintese || ads.resumo || (ads.ads ? `${ads.ads.length} ads` : null), 200))}</td><td>${esc(ads.score ?? "—")}</td></tr>
  <tr><td>Blog</td><td>${esc(txt(blog.resumo || blog.sintese || blog.url, 200))}</td><td>${esc(blog.score ?? "—")}</td></tr>
`,
)}

<h2>7. Concorrentes</h2>
${
  concRows
    ? table(["Nome", "Domínio", "Aparições", "Tipo"], concRows)
    : "<p class='muted'>Sem concorrentes listados.</p>"
}

<h2>8. Posicionamento e audiência</h2>
${table(
  ["Campo", "Valor"],
  rows([
    ["Headline / bio", pos.headline || pos.bio || pos.proposta],
    ["CTA", pos.cta],
    ["Síntese", pos.sintese || pos.resumo],
    ["Vs rivais", pos.vs_rivais || pos.comparativo],
    ["Audiência ICP", aud.sintese || aud.resumo || aud.personas],
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
    ["O que reforçar", perc.o_que_reforcar],
    ["O que corrigir", perc.o_que_corrigir],
    ["Gaps", perc.gaps],
    ["Pitch agência", perc.pitch_agencia],
  ]),
)}

${
  midia.sintese || midia.resumo
    ? `<h2>10. Conteúdo vs rivais (mídia)</h2><div class="callout"><strong>Síntese</strong>${esc(txt(midia.sintese || midia.resumo, 900))}</div>`
    : ""
}

<h2>11. Peças de conteúdo (${pecas.length})</h2>
${pecaCards || "<p class='muted'>Nenhuma peça gerada ainda.</p>"}

<div class="footer">
  Firemode · ${esc(empresa)} · análise ${esc(id)} · apresentação + conteúdo · ${esc(gerado)}
  · LP: /conteudo/${esc(id)}/apresentacao
</div>
</body>
</html>`;

const outDir = join(root, "tmp/pdfs/cliente");
mkdirSync(outDir, { recursive: true });
const htmlPath = join(outDir, `${slug}-apresentacao-conteudo.html`);
const pdfPath = join(outDir, `${slug}-apresentacao-conteudo.pdf`);
const desktopPdf = join(
  process.env.HOME || "",
  "Desktop",
  `${slug}-apresentacao-conteudo.pdf`,
);
const docsPdf = join(
  root,
  "docs/comercial",
  `${slug}-apresentacao-conteudo.pdf`,
);

writeFileSync(htmlPath, html);
writeFileSync(join(outDir, `${slug}-raw.json`), JSON.stringify(analise.presenca ? {
  meta: { id, empresa, handle: analise.cliente_handle, url: analise.url },
  diagnostico: diag,
  scorecard: sc,
  plano,
  pecas: pecas.map((x) => ({ id: x.id, tipo: x.tipo, titulo: x.titulo, status: x.status })),
} : {}, null, 2));

const chrome =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const r = spawnSync(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--print-to-pdf=${pdfPath}`,
    `file://${htmlPath}`,
  ],
  { encoding: "utf8" },
);

if (r.status !== 0) {
  console.error(r.stderr || r.stdout || "chrome failed");
  process.exit(r.status || 1);
}

try {
  writeFileSync(docsPdf, readFileSync(pdfPath));
} catch (e) {
  console.warn("docs copy failed", e.message);
}
try {
  writeFileSync(desktopPdf, readFileSync(pdfPath));
} catch (e) {
  console.warn("desktop copy failed", e.message);
}

console.log(JSON.stringify({
  empresa,
  id,
  pecas: pecas.length,
  concorrentes: concorrentes.length,
  pdf: pdfPath,
  docs: docsPdf,
  desktop: desktopPdf,
}, null, 2));
