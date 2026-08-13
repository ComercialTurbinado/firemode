import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { updateCliente, deactivateCliente, ajustarCredito, addConcorrente, removeConcorrente } from "../actions";
import { Field, TextInput, SelectInput, SubmitButton, ErrorBanner, Card } from "@/components/AdminForm";

export const dynamic = "force-dynamic";

const BACKEND = process.env.RADAR_BACKEND_URL ?? "";
const TIPO_LABEL: Record<string, string> = {
  misto: "Misto", mista: "Misto", proprio: "Próprio", concorrente: "Concorrente",
};
const STATUS_COLOR: Record<string, string> = {
  concluido: "#22c55e", processando: "#3b82f6", pendente: "#eab308", erro: "#ef4444",
};
function fmt(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

export default async function ClienteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { handle } = await params;
  const { error } = await searchParams;
  const supabase = createClient();

  const [
    { data: cliente },
    { data: creditos },
    { data: transacoes },
    { data: concorrentesVinculados },
    { data: analises },
    { data: planosData },
    { data: roteiros },
  ] = await Promise.all([
    supabase.from("clientes").select("*").eq("handle", handle).maybeSingle(),
    supabase.from("creditos_clientes").select("*").eq("cliente_handle", handle).maybeSingle(),
    supabase
      .from("transacoes_creditos")
      .select("id, tipo, feature_slug, quantidade, saldo_apos, descricao, criado_em")
      .eq("cliente_handle", handle)
      .order("criado_em", { ascending: false })
      .limit(20),
    supabase
      .from("cliente_concorrentes")
      .select("concorrente_handle, concorrentes(handle, nome_completo, site_externo)")
      .eq("cliente_handle", handle)
      .order("criado_em", { ascending: false }),
    supabase
      .from("analises")
      .select("id, handle_auditado, tipo_auditoria, status_auditoria, nicho, criado_em")
      .eq("cliente_handle", handle)
      .order("criado_em", { ascending: false })
      .limit(20),
    supabase
      .from("planos_diretores")
      .select("id, posicionamento_atual, diagnostico_identidade, tom_de_voz, pilares_conteudo, criado_em")
      .eq("cliente_handle", handle)
      .order("criado_em", { ascending: false })
      .limit(1),
    supabase
      .from("roteiros_virais")
      .select("id, roteiros, criado_em")
      .eq("cliente_handle", handle)
      .order("criado_em", { ascending: false })
      .limit(10),
  ]);

  const planoDiretor = planosData?.[0] ?? null;

  if (!cliente) notFound();

  const updateClienteWithHandle = updateCliente.bind(null, handle);
  const deactivateClienteWithHandle = deactivateCliente.bind(null, handle);
  const ajustarCreditoWithHandle = ajustarCredito.bind(null, handle);
  const addConcorrenteWithHandle = addConcorrente.bind(null, handle);

  type ConcorrenteRow = { handle: string; nome_completo: string | null; site_externo: string | null };
  const concorrentes = (concorrentesVinculados ?? [])
    .map((c) => c.concorrentes as unknown as ConcorrenteRow | null)
    .filter((c): c is ConcorrenteRow => c !== null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 720 }}>
      <div>
        <Link href="/clientes" style={{ color: "var(--fm-muted)", fontSize: 13, textDecoration: "none" }}>
          ← Clientes
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 8 }}>
          {cliente.nome_completo ?? cliente.handle}
        </h1>
        <p style={{ color: "var(--fm-muted)", marginTop: 4, fontSize: 13 }}>@{cliente.handle}</p>
      </div>

      <ErrorBanner message={error} />

      <Card>
        <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: 14 }}>Dados do cliente</h2>
        <form action={updateClienteWithHandle} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Handle (@instagram — identificador único)">
            <TextInput name="handle" required defaultValue={cliente.handle} />
          </Field>
          <Field label="Nome completo">
            <TextInput name="nome_completo" defaultValue={cliente.nome_completo ?? ""} />
          </Field>
          <Field label="WhatsApp">
            <TextInput name="whatsapp" defaultValue={cliente.whatsapp ?? ""} />
          </Field>
          <Field label="Email">
            <TextInput name="email" type="email" defaultValue={cliente.email ?? ""} />
          </Field>
          <Field label="Nicho">
            <TextInput name="nicho" defaultValue={cliente.nicho ?? ""} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Plano">
              <SelectInput name="plano" defaultValue={cliente.plano}>
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="agency">Agency</option>
              </SelectInput>
            </Field>
            <Field label="Status">
              <SelectInput name="status" defaultValue={cliente.status}>
                <option value="trial">Trial</option>
                <option value="ativo">Ativo</option>
                <option value="pausado">Pausado</option>
                <option value="inadimplente">Inadimplente</option>
                <option value="cancelado">Cancelado</option>
              </SelectInput>
            </Field>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8, justifyContent: "space-between" }}>
            <SubmitButton>Salvar alterações</SubmitButton>
          </div>
        </form>

        <form action={deactivateClienteWithHandle} style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--fm-border)" }}>
          <SubmitButton variant="danger">Cancelar cliente</SubmitButton>
        </form>
      </Card>

      <Card>
        <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: 14 }}>Créditos</h2>
        <div style={{ display: "flex", gap: 32, marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 26, fontWeight: 800 }}>{creditos?.saldo_atual ?? 0}</p>
            <p style={{ fontSize: 12, color: "var(--fm-muted)" }}>saldo atual</p>
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 700 }}>{creditos?.total_consumido ?? 0}</p>
            <p style={{ fontSize: 12, color: "var(--fm-muted)" }}>total consumido</p>
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 700 }}>{creditos?.total_recarregado ?? 0}</p>
            <p style={{ fontSize: 12, color: "var(--fm-muted)" }}>total recarregado</p>
          </div>
        </div>

        <form action={ajustarCreditoWithHandle} style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap", marginBottom: 24 }}>
          <Field label="Tipo">
            <SelectInput name="tipo" defaultValue="bonus" style={{ width: 140 }}>
              <option value="bonus">Bônus</option>
              <option value="recarga">Recarga</option>
              <option value="estorno">Estorno</option>
            </SelectInput>
          </Field>
          <Field label="Quantidade (+/-)">
            <TextInput name="quantidade" type="number" placeholder="20" style={{ width: 120 }} />
          </Field>
          <Field label="Descrição">
            <TextInput name="descricao" placeholder="Motivo do ajuste" style={{ width: 240 }} />
          </Field>
          <SubmitButton>Aplicar</SubmitButton>
        </form>

        <h3 style={{ fontWeight: 600, fontSize: 12, color: "var(--fm-muted)", marginBottom: 12 }}>HISTÓRICO</h3>
        {!transacoes?.length ? (
          <p style={{ color: "var(--fm-muted)", fontSize: 13 }}>Nenhuma transação ainda.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {transacoes.map((t) => (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                <div>
                  <p>{t.descricao ?? t.feature_slug ?? t.tipo}</p>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 2 }}>
                    {new Date(t.criado_em).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span style={{ fontWeight: 700, color: t.quantidade < 0 ? "var(--fm-red)" : "var(--fm-green)" }}>
                  {t.quantidade > 0 ? "+" : ""}{t.quantidade}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>Concorrentes monitorados</h2>
        <p style={{ color: "var(--fm-muted)", fontSize: 12, marginBottom: 16 }}>
          Usados na ronda diária de acompanhamento deste cliente.
        </p>

        <form action={addConcorrenteWithHandle} style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap", marginBottom: 20 }}>
          <Field label="Handle (@instagram)">
            <TextInput name="handle" required placeholder="concorrente" style={{ width: 160 }} />
          </Field>
          <Field label="Nome">
            <TextInput name="nome_completo" placeholder="Nome do concorrente" style={{ width: 200 }} />
          </Field>
          <Field label="Site">
            <TextInput name="site_externo" placeholder="https://..." style={{ width: 200 }} />
          </Field>
          <SubmitButton>Adicionar</SubmitButton>
        </form>

        {!concorrentes.length ? (
          <p style={{ color: "var(--fm-muted)", fontSize: 13 }}>Nenhum concorrente adicionado ainda.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {concorrentes.map((c) => {
              const removeThisConcorrente = removeConcorrente.bind(null, handle, c.handle);
              return (
                <div key={c.handle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                  <div>
                    <p style={{ fontWeight: 500 }}>{c.nome_completo ?? c.handle}</p>
                    <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 2 }}>
                      @{c.handle}{c.site_externo ? ` · ${c.site_externo}` : ""}
                    </p>
                  </div>
                  <form action={removeThisConcorrente}>
                    <button type="submit" style={{
                      background: "none", border: "none", color: "var(--fm-red)",
                      fontSize: 12, cursor: "pointer", padding: 0,
                    }}>
                      Remover
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Análises */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontWeight: 700, fontSize: 14 }}>Análises</h2>
          <Link href="/analises" style={{ fontSize: 12, color: "var(--fm-accent)", textDecoration: "none" }}>
            Ver todas ↗
          </Link>
        </div>
        {!analises?.length ? (
          <p style={{ color: "var(--fm-muted)", fontSize: 13 }}>Nenhuma análise ainda.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {analises.map((a) => (
              <div key={a.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", background: "#0d0d0d", borderRadius: 8,
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ fontWeight: 600, fontSize: 13 }}>@{a.handle_auditado}</p>
                    <span style={{ fontSize: 11, color: "var(--fm-muted)", background: "#ffffff0a", padding: "1px 7px", borderRadius: 4 }}>
                      {TIPO_LABEL[a.tipo_auditoria] ?? a.tipo_auditoria}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 2 }}>
                    {fmt(a.criado_em)}{a.nicho ? ` · ${a.nicho}` : ""}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
                    background: `${STATUS_COLOR[a.status_auditoria ?? "concluido"]}18`,
                    color: STATUS_COLOR[a.status_auditoria ?? "concluido"],
                  }}>
                    {a.status_auditoria ?? "concluido"}
                  </span>
                  {BACKEND && (a.status_auditoria === "concluido" || !a.status_auditoria) && (
                    <a
                      href={`${BACKEND}/dashboard?handle=${handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 6,
                        background: "var(--fm-accent-soft)", color: "var(--fm-accent)",
                        textDecoration: "none",
                      }}
                    >
                      Abrir relatório ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Plano Diretor */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontWeight: 700, fontSize: 14 }}>Plano Diretor</h2>
          {planoDiretor && BACKEND && (
            <a
              href={`${BACKEND}/dashboard?handle=${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, fontWeight: 600, color: "var(--fm-accent)", textDecoration: "none" }}
            >
              Abrir relatório completo ↗
            </a>
          )}
        </div>
        {!planoDiretor ? (
          <p style={{ color: "var(--fm-muted)", fontSize: 13 }}>Nenhum plano diretor gerado ainda.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 13 }}>
            <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>Gerado em {fmt(planoDiretor.criado_em)}</p>
            {planoDiretor.posicionamento_atual && (
              <div>
                <p style={{ fontWeight: 600, fontSize: 12, color: "var(--fm-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Posicionamento</p>
                <p style={{ color: "var(--fm-text)", lineHeight: 1.6 }}>{planoDiretor.posicionamento_atual}</p>
              </div>
            )}
            {planoDiretor.tom_de_voz && (
              <div>
                <p style={{ fontWeight: 600, fontSize: 12, color: "var(--fm-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tom de voz</p>
                <p style={{ color: "var(--fm-text)", lineHeight: 1.6 }}>{planoDiretor.tom_de_voz}</p>
              </div>
            )}
            {planoDiretor.pilares_conteudo && (
              <div>
                <p style={{ fontWeight: 600, fontSize: 12, color: "var(--fm-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Pilares de conteúdo</p>
                <p style={{ color: "var(--fm-text)", lineHeight: 1.6 }}>
                  {Array.isArray(planoDiretor.pilares_conteudo)
                    ? planoDiretor.pilares_conteudo.join(" · ")
                    : planoDiretor.pilares_conteudo}
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Roteiros */}
      <Card>
        <h2 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Roteiros virais</h2>
        {!roteiros?.length ? (
          <p style={{ color: "var(--fm-muted)", fontSize: 13 }}>Nenhum roteiro gerado ainda.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {roteiros.map((r, i) => {
              const lista = Array.isArray(r.roteiros) ? r.roteiros : [];
              return (
                <div key={r.id} style={{
                  background: "#0d0d0d", borderRadius: 8, padding: "12px 16px",
                }}>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)", marginBottom: 8 }}>
                    Geração #{roteiros.length - i} · {fmt(r.criado_em)} · {lista.length} roteiro(s)
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {lista.slice(0, 3).map((rot: { titulo?: string; gancho?: string }, idx: number) => (
                      <div key={idx} style={{ borderLeft: "2px solid var(--fm-accent-soft)", paddingLeft: 10 }}>
                        <p style={{ fontWeight: 600, fontSize: 13 }}>{rot.titulo ?? `Roteiro ${idx + 1}`}</p>
                        {rot.gancho && (
                          <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 2 }}>{rot.gancho}</p>
                        )}
                      </div>
                    ))}
                    {lista.length > 3 && (
                      <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 4 }}>
                        +{lista.length - 3} roteiros nesta geração
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
