"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  Inbox,
  LayoutGrid,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Send,
  Settings2,
  Users,
  Workflow,
  X,
} from "lucide-react";
import type {
  CommercialSnapshot,
  CrmContact,
  CrmDeal,
  CrmEmail,
  CrmSequenceStep,
} from "@/lib/comercial-types";
import "./commercial-crm.css";

type View = "pipeline" | "contacts" | "mail" | "sequences";
type Modal = "contact" | "deal" | "funnel" | "sequence" | "step" | "detail" | null;

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

function daysLabel(value: string | null, capturedAt: string) {
  if (!value) return "Sem próxima ação";
  const when = new Date(value);
  const late = when.getTime() < new Date(capturedAt).getTime();
  return { label: date.format(when), late };
}

function ModalShell({ title, subtitle, wide, close, children, footer }: {
  title: string;
  subtitle?: string;
  wide?: boolean;
  close: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="crm-modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <section className={`crm-dialog${wide ? " crm-dialog--wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="crm-dialog__head">
          <div><h2 className="crm-title" style={{ fontSize: 19 }}>{title}</h2>{subtitle ? <p className="crm-subtitle">{subtitle}</p> : null}</div>
          <button className="crm-btn" type="button" onClick={close} aria-label="Fechar"><X size={17} /></button>
        </header>
        <div className="crm-dialog__body">{children}</div>
        {footer ? <footer className="crm-dialog__foot">{footer}</footer> : null}
      </section>
    </div>
  );
}

export default function CommercialCRM({ initial }: { initial: CommercialSnapshot }) {
  const [data, setData] = useState(initial);
  const [view, setView] = useState<View>("pipeline");
  const [modal, setModal] = useState<Modal>(null);
  const [editingStep, setEditingStep] = useState<CrmSequenceStep | null>(null);
  const [selectedFunnel, setSelectedFunnel] = useState(initial.funnels.find((funnel) => funnel.padrao)?.id || initial.funnels[0]?.id || "");
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState(initial.emails[0]?.id || null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragDeal, setDragDeal] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);

  const contactsById = useMemo(() => new Map(data.contacts.map((contact) => [contact.id, contact])), [data.contacts]);
  const stages = useMemo(() => data.stages.filter((stage) => stage.funil_id === selectedFunnel).sort((a, b) => a.ordem - b.ordem), [data.stages, selectedFunnel]);
  const deals = useMemo(() => data.deals.filter((deal) => deal.funil_id === selectedFunnel && (deal.titulo + " " + (contactsById.get(deal.contato_id)?.empresa || "")).toLowerCase().includes(query.toLowerCase())), [data.deals, selectedFunnel, query, contactsById]);
  const openDeals = data.deals.filter((deal) => deal.status === "aberto");
  const wonDeals = data.deals.filter((deal) => deal.status === "ganho");
  const selectedDeal = data.deals.find((deal) => deal.id === selectedDealId) || null;
  const selectedContact = selectedDeal ? contactsById.get(selectedDeal.contato_id) || null : null;
  const selectedEmail = data.emails.find((email) => email.id === selectedEmailId) || data.emails[0] || null;
  const capturedAt = new Date(data.capturedAt).getTime();
  const lateActions = openDeals.filter((deal) => deal.proxima_acao_em && new Date(deal.proxima_acao_em).getTime() < capturedAt).length;
  const pipelineValue = openDeals.reduce((total, deal) => total + Number(deal.valor), 0);
  const weightedValue = openDeals.reduce((total, deal) => total + Number(deal.valor) * deal.probabilidade / 100, 0);

  async function mutate(action: string, payload: Record<string, unknown>) {
    setBusy(true); setError(""); setSuccess("");
    try {
      const normalized = { ...payload };
      if ("valor" in normalized) normalized.valor = Number(normalized.valor) || 0;
      if ("probabilidade" in normalized) {
        normalized.probabilidade = Number(normalized.probabilidade) || 0;
      }
      const response = await fetch("/api/comercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...normalized }),
      });
      const next = await response.json() as CommercialSnapshot & { error?: string };
      if (!response.ok) throw new Error(next.error || "Não foi possível salvar.");
      setData(next);
      setSuccess("Salvo.");
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar.");
      return false;
    } finally { setBusy(false); }
  }

  async function sendEmail(payload: { to: string; subject: string; text: string; contactId?: string; dealId?: string; inReplyTo?: string; messageId?: string }) {
    setBusy(true); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/comercial/mail", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Falha no envio.");
      const refresh = await fetch("/api/comercial", { cache: "no-store" });
      setData(await refresh.json() as CommercialSnapshot);
      setSuccess("E-mail enviado pelo Mailgun.");
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha no envio.");
      return false;
    } finally { setBusy(false); }
  }

  async function activateInbox() {
    setBusy(true); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/comercial/mail", { method: "PUT" });
      const result = await response.json() as { error?: string; hookUrl?: string };
      if (!response.ok) throw new Error(result.error || "Não foi possível ativar o recebimento.");
      setSuccess("Recebimento conectado ao Mailgun.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível ativar o recebimento.");
    } finally { setBusy(false); }
  }

  async function moveDeal(dealId: string, stageId: string) {
    if (!stageId || data.deals.find((deal) => deal.id === dealId)?.etapa_id === stageId) return;
    await mutate("move_deal", { dealId, stageId });
    setDragDeal(null); setOverStage(null);
  }

  function openDeal(deal: CrmDeal) { setSelectedDealId(deal.id); setModal("detail"); setError(""); setSuccess(""); }

  if (data.setupRequired) {
    return (
      <div className="crm-shell">
        <header className="crm-header"><div><h1 className="crm-title">Comercial</h1><p className="crm-subtitle">Pipeline, contatos, e-mails e cadências.</p></div></header>
        <div className="crm-alert"><strong>Banco pendente.</strong> Aplique a migration <code>20260908_comercial_crm.sql</code> no Supabase e recarregue esta página.</div>
      </div>
    );
  }

  return (
    <div className="crm-shell">
      <header className="crm-header">
        <div><h1 className="crm-title">Comercial</h1><p className="crm-subtitle">Da primeira evidência ao fechamento, com toda conversa no mesmo lugar.</p></div>
        <div className="crm-actions">
          <button className="crm-btn" onClick={() => setModal("funnel")}><Settings2 size={16} /> Novo funil</button>
          <button className="crm-btn" onClick={() => setModal("contact")}><Users size={16} /> Novo contato</button>
          <button className="crm-btn crm-btn--primary" onClick={() => setModal("deal")}><Plus size={16} /> Nova oportunidade</button>
        </div>
      </header>

      <div className="crm-kpis" aria-label="Resumo comercial">
        <article className="crm-kpi"><p className="crm-kpi__label">Pipeline aberto</p><p className="crm-kpi__value">{money.format(pipelineValue)}</p><p className="crm-kpi__hint">{openDeals.length} oportunidades abertas</p></article>
        <article className="crm-kpi"><p className="crm-kpi__label">Previsão ponderada</p><p className="crm-kpi__value">{money.format(weightedValue)}</p><p className="crm-kpi__hint">Valor × probabilidade</p></article>
        <article className="crm-kpi"><p className="crm-kpi__label">Receita ganha</p><p className="crm-kpi__value">{money.format(wonDeals.reduce((sum, deal) => sum + Number(deal.valor), 0))}</p><p className="crm-kpi__hint">{wonDeals.length} negócios ganhos</p></article>
        <article className="crm-kpi"><p className="crm-kpi__label">Ações vencidas</p><p className="crm-kpi__value" style={{ color: lateActions ? "var(--fm-red)" : undefined }}>{lateActions}</p><p className="crm-kpi__hint">Próximos passos que exigem atenção</p></article>
      </div>

      <div className="crm-toolbar">
        <div className="crm-tabs" role="tablist" aria-label="Áreas comerciais">
          {([
            ["pipeline", "Pipeline", LayoutGrid], ["contacts", "Contatos", Users], ["mail", "E-mails", Mail], ["sequences", "Cadências", Workflow],
          ] as const).map(([id, label, Icon]) => <button key={id} className="crm-tab" role="tab" aria-selected={view === id} onClick={() => setView(id)}><Icon size={15} /> {label}</button>)}
        </div>
        <div style={{ flex: 1 }} />
        {view === "pipeline" ? <select className="crm-select" aria-label="Funil ativo" value={selectedFunnel} onChange={(event) => setSelectedFunnel(event.target.value)}>{data.funnels.map((funnel) => <option key={funnel.id} value={funnel.id}>{funnel.nome}</option>)}</select> : null}
        {view === "mail" && data.mailgunConfigured ? <button className="crm-btn" disabled={busy} onClick={() => void activateInbox()}><Inbox size={15} /> Ativar recebimento</button> : null}
        {view === "pipeline" || view === "contacts" ? <label style={{ position: "relative" }}><Search size={15} style={{ position: "absolute", left: 11, top: 14, color: "var(--fm-muted)" }} /><input className="crm-input crm-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar empresa ou contato" style={{ paddingLeft: 34 }} /></label> : null}
      </div>

      {error ? <p className="crm-error" role="alert">{error}</p> : null}{success ? <p className="crm-success" aria-live="polite">{success}</p> : null}

      {view === "pipeline" ? (
        stages.length ? <div className="crm-board" aria-label="Quadro de oportunidades">
          {stages.map((stage) => {
            const stageDeals = deals.filter((deal) => deal.etapa_id === stage.id);
            return <section key={stage.id} className={`crm-column${overStage === stage.id ? " crm-column--over" : ""}`} onDragOver={(event) => { event.preventDefault(); setOverStage(stage.id); }} onDragLeave={() => setOverStage(null)} onDrop={(event) => { event.preventDefault(); if (dragDeal) void moveDeal(dragDeal, stage.id); }}>
              <header className="crm-column__head"><div><p className="crm-column__title"><span className="crm-dot" style={{ background: stage.cor }} />{stage.nome}<span className="crm-count">{stageDeals.length}</span></p><p className="crm-column__value">{money.format(stageDeals.reduce((sum, deal) => sum + Number(deal.valor), 0))}</p></div></header>
              <div className="crm-card-list">{stageDeals.map((deal) => {
                const contact = contactsById.get(deal.contato_id); const due = daysLabel(deal.proxima_acao_em, data.capturedAt);
                return <article key={deal.id} className="crm-deal" tabIndex={0} draggable onDragStart={() => setDragDeal(deal.id)} onDragEnd={() => { setDragDeal(null); setOverStage(null); }} onClick={() => openDeal(deal)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") openDeal(deal); }}>
                  <p className="crm-deal__title">{deal.titulo}</p><p className="crm-deal__company">{contact?.empresa || contact?.nome || "Contato"}</p>
                  <div className="crm-deal__meta"><span className="crm-deal__value">{money.format(deal.valor)}</span><span className={typeof due === "object" && due.late ? "crm-due crm-due--late" : "crm-due"}><CalendarClock size={13} />{typeof due === "string" ? due : due.label}</span></div>
                  <select className="crm-stage-select" value={deal.etapa_id} aria-label={`Mover ${deal.titulo}`} onClick={(event) => event.stopPropagation()} onChange={(event) => { event.stopPropagation(); void moveDeal(deal.id, event.target.value); }}>{stages.map((option) => <option key={option.id} value={option.id}>{option.nome}</option>)}</select>
                </article>;
              })}{stageDeals.length === 0 ? <div className="crm-empty">Arraste uma oportunidade para cá.</div> : null}</div>
            </section>;
          })}
        </div> : <div className="crm-empty">Crie um funil para começar.</div>
      ) : null}

      {view === "contacts" ? <ContactsView contacts={data.contacts} deals={data.deals} sequences={data.sequences} query={query} busy={busy} mutate={mutate} openDeal={openDeal} /> : null}
      {view === "mail" ? <MailView emails={data.emails} selected={selectedEmail} select={setSelectedEmailId} configured={data.mailgunConfigured} missing={data.mailgunMissing} busy={busy} send={sendEmail} /> : null}
      {view === "sequences" ? (
        <SequencesView
          data={data}
          openCreate={() => setModal("sequence")}
          openStep={(step) => {
            setEditingStep(step);
            setModal("step");
          }}
        />
      ) : null}

      {modal === "contact" ? <ContactModal close={() => setModal(null)} busy={busy} submit={async (payload) => { if (await mutate("create_contact", payload)) setModal(null); }} /> : null}
      {modal === "deal" ? <DealModal contacts={data.contacts} funnels={data.funnels} stages={data.stages} defaultFunnel={selectedFunnel} close={() => setModal(null)} busy={busy} submit={async (payload) => { if (await mutate("create_deal", payload)) setModal(null); }} /> : null}
      {modal === "funnel" ? <FunnelModal close={() => setModal(null)} busy={busy} submit={async (payload) => { if (await mutate("create_funnel", payload)) setModal(null); }} /> : null}
      {modal === "sequence" ? (
        <SequenceModal
          close={() => setModal(null)}
          busy={busy}
          submit={async (payload) => {
            if (await mutate("create_sequence", payload)) setModal(null);
          }}
        />
      ) : null}
      {modal === "step" && editingStep ? (
        <StepEditModal
          step={editingStep}
          close={() => {
            setEditingStep(null);
            setModal(null);
          }}
          busy={busy}
          submit={async (payload) => {
            if (await mutate("update_sequence_step", { stepId: editingStep.id, ...payload })) {
              setEditingStep(null);
              setModal(null);
            }
          }}
        />
      ) : null}
      {modal === "detail" && selectedDeal && selectedContact ? <DealDetail deal={selectedDeal} contact={selectedContact} stages={stages} activities={data.activities.filter((activity) => activity.negocio_id === selectedDeal.id || activity.contato_id === selectedContact.id)} sequences={data.sequences} close={() => setModal(null)} busy={busy} mutate={mutate} send={sendEmail} /> : null}
    </div>
  );
}

function ContactsView({ contacts, deals, sequences, query, busy, mutate, openDeal }: {
  contacts: CrmContact[]; deals: CrmDeal[]; sequences: CommercialSnapshot["sequences"]; query: string; busy: boolean;
  mutate: (action: string, payload: Record<string, unknown>) => Promise<boolean>; openDeal: (deal: CrmDeal) => void;
}) {
  const filtered = contacts.filter((contact) => [contact.nome, contact.empresa, contact.email].join(" ").toLowerCase().includes(query.toLowerCase()));
  return <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Contato</th><th>Empresa</th><th>Origem</th><th>Oportunidades</th><th>Cadência</th></tr></thead><tbody>{filtered.map((contact) => {
    const contactDeals = deals.filter((deal) => deal.contato_id === contact.id);
    return <tr key={contact.id}><td><p className="crm-contact-name">{contact.nome}</p><p className="crm-contact-sub">{contact.email || contact.whatsapp || "Sem canal cadastrado"}</p></td><td>{contact.empresa || "—"}</td><td><span className="crm-pill">{contact.origem}</span></td><td>{contactDeals.length ? contactDeals.map((deal) => <button key={deal.id} className="crm-btn" style={{ minHeight: 32, marginRight: 5 }} onClick={() => openDeal(deal)}>{money.format(deal.valor)}</button>) : "—"}</td><td>{sequences.length ? <select className="crm-select" style={{ minHeight: 34, maxWidth: 180 }} defaultValue="" disabled={busy} onChange={(event) => { if (event.target.value) void mutate("enroll_sequence", { sequenceId: event.target.value, contactId: contact.id, dealId: contactDeals[0]?.id }); event.currentTarget.value = ""; }}><option value="">Adicionar...</option>{sequences.map((sequence) => <option key={sequence.id} value={sequence.id}>{sequence.nome}</option>)}</select> : <span className="crm-contact-sub">Crie uma cadência</span>}</td></tr>;
  })}</tbody></table>{!filtered.length ? <div className="crm-empty">Nenhum contato encontrado.</div> : null}</div>;
}

function MailView({ emails, selected, select, configured, missing, busy, send }: {
  emails: CrmEmail[]; selected: CrmEmail | null; select: (id: string) => void; configured: boolean; missing: string[]; busy: boolean;
  send: (payload: { to: string; subject: string; text: string; inReplyTo?: string; messageId?: string }) => Promise<boolean>;
}) {
  const [to, setTo] = useState(selected?.direcao === "entrada" ? selected.de_email : selected?.para_email || "");
  const [subject, setSubject] = useState(selected ? (selected.assunto.match(/^re:/i) ? selected.assunto : `Re: ${selected.assunto}`) : "");
  const [body, setBody] = useState("");
  function choose(mail: CrmEmail) { select(mail.id); setTo(mail.direcao === "entrada" ? mail.de_email : mail.para_email); setSubject(mail.assunto.match(/^re:/i) ? mail.assunto : `Re: ${mail.assunto}`); setBody(""); }
  return <>{!configured ? <div className="crm-alert">Configure {missing.join(", ")} no servidor para liberar envio e recebimento.</div> : null}<div className="crm-mail"><aside className="crm-mail__list">{emails.map((mail) => <button key={mail.id} className={`crm-mail-item${selected?.id === mail.id ? " crm-mail-item--active" : ""}${mail.direcao === "entrada" && !mail.lido ? " crm-mail-item--unread" : ""}`} onClick={() => choose(mail)}><p className="crm-mail-item__from">{mail.direcao === "entrada" ? mail.de_nome || mail.de_email : `Para ${mail.para_email}`}</p><p className="crm-mail-item__subject">{mail.assunto}</p><p className="crm-mail-item__preview">{mail.corpo_texto || "Sem prévia"}</p></button>)}{!emails.length ? <div className="crm-empty"><Inbox size={23} style={{ margin: "0 auto 8px" }} />A caixa está vazia.</div> : null}</aside><section className="crm-mail__reader">{selected ? <><div className="crm-mail__body"><h2 style={{ fontSize: 18, fontWeight: 800 }}>{selected.assunto}</h2><p className="crm-subtitle">{selected.de_email} → {selected.para_email} · {date.format(new Date(selected.criado_em))}</p><div style={{ marginTop: 24 }}>{selected.corpo_texto || "Mensagem sem conteúdo em texto."}</div></div></> : <div className="crm-empty" style={{ margin: 20 }}>Selecione uma mensagem ou escreva uma nova.</div>}<form className="crm-mail__compose" onSubmit={async (event) => { event.preventDefault(); if (await send({ to, subject, text: body, inReplyTo: selected?.message_id || selected?.mailgun_id || undefined, messageId: selected?.message_id || undefined })) setBody(""); }}><input className="crm-input" type="email" required value={to} onChange={(event) => setTo(event.target.value)} placeholder="destinatario@empresa.com" aria-label="Destinatário" /><input className="crm-input" required value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Assunto" aria-label="Assunto" /><textarea className="crm-textarea" required value={body} onChange={(event) => setBody(event.target.value)} placeholder="Escreva a mensagem" aria-label="Mensagem" /><div><button className="crm-btn crm-btn--primary" disabled={busy || !configured}><Send size={15} />{busy ? "Enviando..." : "Enviar"}</button></div></form></section></div></>;
}

function SequencesView({
  data,
  openCreate,
  openStep,
}: {
  data: CommercialSnapshot;
  openCreate: () => void;
  openStep: (step: CrmSequenceStep) => void;
}) {
  return (
    <>
      <div className="crm-toolbar">
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 800 }}>Cadências de contato</h2>
          <p className="crm-subtitle">Clique em um e-mail para editar. Cadências param quando o contato responde.</p>
        </div>
        <div style={{ flex: 1 }} />
        <button className="crm-btn crm-btn--primary" onClick={openCreate}>
          <Plus size={15} /> Nova cadência
        </button>
      </div>
      <div className="crm-sequences">
        {data.sequences.map((sequence) => {
          const steps = data.sequenceSteps
            .filter((step) => step.cadencia_id === sequence.id)
            .sort((a, b) => a.ordem - b.ordem);
          const enrollments = data.enrollments.filter((item) => item.cadencia_id === sequence.id);
          return (
            <article key={sequence.id} className="crm-sequence">
              <div className="crm-sequence__top">
                <div>
                  <p className="crm-sequence__name">{sequence.nome}</p>
                  <p className="crm-sequence__objective">{sequence.objetivo || "Sem objetivo descrito."}</p>
                </div>
                <span className="crm-pill">{enrollments.filter((item) => item.status === "ativa").length} ativos</span>
              </div>
              {steps.map((step) => (
                <button
                  type="button"
                  className="crm-step crm-step--clickable"
                  key={step.id}
                  onClick={() => openStep(step)}
                  aria-label={`Editar etapa ${step.ordem}: ${step.assunto || step.canal}`}
                >
                  <span className="crm-step__n">{step.ordem}</span>
                  <div>
                    <strong>{step.assunto || step.canal}</strong>
                    <p className="crm-contact-sub">
                      {step.corpo.slice(0, 80)}
                      {step.corpo.length > 80 ? "…" : ""}
                    </p>
                  </div>
                  <span className="crm-pill">+{step.atraso_dias}d</span>
                </button>
              ))}
            </article>
          );
        })}
        {!data.sequences.length ? <div className="crm-empty">Crie a primeira cadência de prospecção.</div> : null}
      </div>
    </>
  );
}

function ContactModal({ close, busy, submit }: { close: () => void; busy: boolean; submit: (payload: Record<string, unknown>) => Promise<void> }) {
  return <ModalShell title="Novo contato" subtitle="Crie também a primeira oportunidade em um único passo." close={close}><form id="contact-form" className="crm-form-grid" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void submit(Object.fromEntries(form)); }}><label className="crm-field"><span className="crm-label">Nome *</span><input className="crm-input" name="nome" required autoFocus /></label><label className="crm-field"><span className="crm-label">Empresa</span><input className="crm-input" name="empresa" /></label><label className="crm-field"><span className="crm-label">E-mail</span><input className="crm-input" name="email" type="email" /></label><label className="crm-field"><span className="crm-label">WhatsApp</span><input className="crm-input" name="whatsapp" type="tel" /></label><label className="crm-field"><span className="crm-label">Site</span><input className="crm-input" name="site" type="url" /></label><label className="crm-field"><span className="crm-label">Origem</span><select className="crm-select" name="origem" defaultValue="outbound"><option value="outbound">Outbound</option><option value="indicacao">Indicação</option><option value="landing-page">Landing page</option><option value="email">E-mail</option><option value="evento">Evento</option><option value="manual">Manual</option></select></label><label className="crm-field crm-field--full"><span className="crm-label">Criar oportunidade</span><input className="crm-input" name="titulo" placeholder="Empresa · Sprint Presença" /></label><label className="crm-field"><span className="crm-label">Valor</span><input className="crm-input" name="valor" type="number" defaultValue="3900" min="0" /></label><div className="crm-field" style={{ alignContent: "end" }}><button className="crm-btn crm-btn--primary" disabled={busy}>{busy ? "Salvando..." : "Salvar contato"}</button></div></form></ModalShell>;
}

function DealModal({ contacts, funnels, stages, defaultFunnel, close, busy, submit }: { contacts: CrmContact[]; funnels: CommercialSnapshot["funnels"]; stages: CommercialSnapshot["stages"]; defaultFunnel: string; close: () => void; busy: boolean; submit: (payload: Record<string, unknown>) => Promise<void> }) {
  const [funnel, setFunnel] = useState(defaultFunnel);
  return <ModalShell title="Nova oportunidade" close={close}><form className="crm-form-grid" onSubmit={(event) => { event.preventDefault(); void submit(Object.fromEntries(new FormData(event.currentTarget))); }}><label className="crm-field crm-field--full"><span className="crm-label">Contato *</span><select className="crm-select" name="contactId" required autoFocus defaultValue=""><option value="" disabled>Selecione</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.nome}{contact.empresa ? ` · ${contact.empresa}` : ""}</option>)}</select></label><label className="crm-field crm-field--full"><span className="crm-label">Título *</span><input className="crm-input" name="titulo" required placeholder="Empresa · Sprint Presença" /></label><label className="crm-field"><span className="crm-label">Funil</span><select className="crm-select" name="funnelId" value={funnel} onChange={(event) => setFunnel(event.target.value)}>{funnels.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label><label className="crm-field"><span className="crm-label">Etapa</span><select className="crm-select" name="stageId">{stages.filter((stage) => stage.funil_id === funnel && stage.tipo === "aberta").map((stage) => <option key={stage.id} value={stage.id}>{stage.nome}</option>)}</select></label><label className="crm-field"><span className="crm-label">Produto</span><input className="crm-input" name="produto" defaultValue="Sprint Presença" /></label><label className="crm-field"><span className="crm-label">Valor</span><input className="crm-input" name="valor" type="number" defaultValue="3900" /></label><label className="crm-field crm-field--full"><span className="crm-label">Próxima ação</span><input className="crm-input" name="proximaAcao" placeholder="Enviar mini-auditoria" /></label><label className="crm-field"><span className="crm-label">Data</span><input className="crm-input" name="proximaAcaoEm" type="datetime-local" /></label><div className="crm-field" style={{ alignContent: "end" }}><button className="crm-btn crm-btn--primary" disabled={busy}>Criar oportunidade</button></div></form></ModalShell>;
}

function FunnelModal({ close, busy, submit }: { close: () => void; busy: boolean; submit: (payload: Record<string, unknown>) => Promise<void> }) {
  const [stages, setStages] = useState("Mapeado\nAbordado\nRespondeu\nCall\nProposta\nGanho\nPerdido");
  return <ModalShell title="Novo funil" subtitle="Uma etapa por linha. Ganho e Perdido recebem status final automaticamente." close={close}><form className="crm-form-grid" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void submit({ nome: form.get("nome"), descricao: form.get("descricao"), stages: stages.split("\n").map((item) => item.trim()).filter(Boolean) }); }}><label className="crm-field crm-field--full"><span className="crm-label">Nome *</span><input className="crm-input" name="nome" required autoFocus placeholder="Outbound · Assessorias de imigração" /></label><label className="crm-field crm-field--full"><span className="crm-label">Descrição</span><input className="crm-input" name="descricao" /></label><label className="crm-field crm-field--full"><span className="crm-label">Etapas</span><textarea className="crm-textarea" value={stages} onChange={(event) => setStages(event.target.value)} /></label><div className="crm-field crm-field--full"><button className="crm-btn crm-btn--primary" disabled={busy}>Criar funil</button></div></form></ModalShell>;
}

function SequenceModal({
  close,
  busy,
  submit,
}: {
  close: () => void;
  busy: boolean;
  submit: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const [steps, setSteps] = useState<Array<Pick<CrmSequenceStep, "canal" | "atraso_dias" | "assunto" | "corpo">>>([{
    canal: "email",
    atraso_dias: 0,
    assunto: "Uma observação sobre a {{empresa}}",
    corpo: "Oi, {{primeiro_nome}}. Procurei a {{empresa}} como um cliente novo faria e notei um ponto específico: [descreva o que você viu e inclua o link]. Isso pode dificultar [explique a consequência observável]. Se for útil, envio a leitura completa deste ponto por aqui.",
  }]);
  return (
    <ModalShell
      title="Nova cadência"
      subtitle="Use {{primeiro_nome}}, {{nome}} e {{empresa}}. Antes de ativar, troque os trechos entre colchetes por uma observação real."
      close={close}
      wide
    >
      <form
        className="crm-form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void submit({
            nome: form.get("nome"),
            objetivo: form.get("objetivo"),
            steps: steps.map((step) => ({
              canal: step.canal,
              atrasoDias: step.atraso_dias,
              assunto: step.assunto,
              corpo: step.corpo,
            })),
          });
        }}
      >
        <label className="crm-field">
          <span className="crm-label">Nome *</span>
          <input className="crm-input" name="nome" required autoFocus placeholder="Prospecção por diagnóstico · 7 dias" />
        </label>
        <label className="crm-field">
          <span className="crm-label">Objetivo</span>
          <input className="crm-input" name="objetivo" placeholder="Obter resposta sobre o ponto observado" />
        </label>
        <div className="crm-field crm-field--full">
          {steps.map((step, index) => (
            <div className="crm-panel" key={index} style={{ marginBottom: 10 }}>
              <div className="crm-toolbar">
                <strong>Etapa {index + 1}</strong>
                <div style={{ flex: 1 }} />
                {steps.length > 1 ? (
                  <button
                    className="crm-btn crm-btn--danger"
                    type="button"
                    onClick={() => setSteps((current) => current.filter((_, item) => item !== index))}
                  >
                    Remover
                  </button>
                ) : null}
              </div>
              <div className="crm-form-grid" style={{ marginTop: 12 }}>
                <label className="crm-field">
                  <span className="crm-label">Canal</span>
                  <select
                    className="crm-select"
                    value={step.canal}
                    onChange={(event) =>
                      setSteps((current) =>
                        current.map((item, i) =>
                          i === index ? { ...item, canal: event.target.value as CrmSequenceStep["canal"] } : item,
                        ),
                      )
                    }
                  >
                    <option value="email">E-mail</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="ligacao">Ligação</option>
                    <option value="tarefa">Tarefa</option>
                  </select>
                </label>
                <label className="crm-field">
                  <span className="crm-label">Esperar após a etapa anterior</span>
                  <input
                    className="crm-input"
                    type="number"
                    min="0"
                    value={step.atraso_dias}
                    onChange={(event) =>
                      setSteps((current) =>
                        current.map((item, i) =>
                          i === index ? { ...item, atraso_dias: Number(event.target.value) } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="crm-field crm-field--full">
                  <span className="crm-label">Assunto / tarefa</span>
                  <input
                    className="crm-input"
                    value={step.assunto || ""}
                    onChange={(event) =>
                      setSteps((current) =>
                        current.map((item, i) =>
                          i === index ? { ...item, assunto: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="crm-field crm-field--full">
                  <span className="crm-label">Mensagem *</span>
                  <textarea
                    className="crm-textarea"
                    required
                    value={step.corpo}
                    onChange={(event) =>
                      setSteps((current) =>
                        current.map((item, i) =>
                          i === index ? { ...item, corpo: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
        <button
          className="crm-btn"
          type="button"
          onClick={() =>
            setSteps((current) => [
              ...current,
              {
                canal: "email",
                atraso_dias: 3,
                assunto: "Sobre o ponto que enviei da {{empresa}}",
                corpo: "Oi, {{primeiro_nome}}. Você conseguiu verificar o ponto que enviei? Se isso não for prioridade agora, encerro por aqui.",
              },
            ])
          }
        >
          <Plus size={15} /> Adicionar etapa
        </button>
        <div style={{ flex: 1 }} />
        <button className="crm-btn crm-btn--primary" disabled={busy}>
          {busy ? "Salvando..." : "Salvar cadência"}
        </button>
      </form>
    </ModalShell>
  );
}

function StepEditModal({
  step,
  close,
  busy,
  submit,
}: {
  step: CrmSequenceStep;
  close: () => void;
  busy: boolean;
  submit: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const [canal, setCanal] = useState(step.canal);
  const [atraso, setAtraso] = useState(step.atraso_dias);
  const [assunto, setAssunto] = useState(step.assunto || "");
  const [corpo, setCorpo] = useState(step.corpo);
  return (
    <ModalShell
      title={`Editar e-mail · etapa ${step.ordem}`}
      subtitle="Use {{primeiro_nome}}, {{nome}} e {{empresa}}."
      close={close}
      wide
    >
      <form
        className="crm-form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          void submit({ canal, atrasoDias: atraso, assunto, corpo });
        }}
      >
        <label className="crm-field">
          <span className="crm-label">Canal</span>
          <select
            className="crm-select"
            value={canal}
            onChange={(event) => setCanal(event.target.value as CrmSequenceStep["canal"])}
          >
            <option value="email">E-mail</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="ligacao">Ligação</option>
            <option value="tarefa">Tarefa</option>
          </select>
        </label>
        <label className="crm-field">
          <span className="crm-label">Esperar após a etapa anterior (dias)</span>
          <input
            className="crm-input"
            type="number"
            min="0"
            value={atraso}
            onChange={(event) => setAtraso(Number(event.target.value))}
          />
        </label>
        <label className="crm-field crm-field--full">
          <span className="crm-label">Assunto</span>
          <input className="crm-input" value={assunto} onChange={(event) => setAssunto(event.target.value)} autoFocus />
        </label>
        <label className="crm-field crm-field--full">
          <span className="crm-label">Mensagem *</span>
          <textarea className="crm-textarea" required value={corpo} onChange={(event) => setCorpo(event.target.value)} rows={12} />
        </label>
        <div className="crm-field crm-field--full">
          <button className="crm-btn crm-btn--primary" disabled={busy || !corpo.trim()}>
            {busy ? "Salvando..." : "Salvar e-mail"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function DealDetail({ deal, contact, stages, activities, sequences, close, busy, mutate, send }: { deal: CrmDeal; contact: CrmContact; stages: CommercialSnapshot["stages"]; activities: CommercialSnapshot["activities"]; sequences: CommercialSnapshot["sequences"]; close: () => void; busy: boolean; mutate: (action: string, payload: Record<string, unknown>) => Promise<boolean>; send: (payload: { to: string; subject: string; text: string; contactId?: string; dealId?: string }) => Promise<boolean> }) {
  const [note, setNote] = useState(""); const [mailBody, setMailBody] = useState(""); const [mailSubject, setMailSubject] = useState(`Uma evidência sobre ${contact.empresa || contact.nome}`);
  return <ModalShell title={deal.titulo} subtitle={`${contact.nome}${contact.empresa ? ` · ${contact.empresa}` : ""}`} close={close} wide><div className="crm-detail-grid"><div style={{ display: "grid", gap: 12 }}><div className="crm-panel"><p className="crm-panel__title">Oportunidade</p><div className="crm-form-grid"><label className="crm-field"><span className="crm-label">Etapa</span><select className="crm-select" value={deal.etapa_id} onChange={(event) => void mutate("move_deal", { dealId: deal.id, stageId: event.target.value })}>{stages.map((stage) => <option value={stage.id} key={stage.id}>{stage.nome}</option>)}</select></label><label className="crm-field"><span className="crm-label">Valor</span><input className="crm-input" type="number" defaultValue={deal.valor} onBlur={(event) => void mutate("update_deal", { dealId: deal.id, valor: Number(event.target.value), titulo: deal.titulo, produto: deal.produto, probabilidade: deal.probabilidade, proximaAcao: deal.proxima_acao, proximaAcaoEm: deal.proxima_acao_em })} /></label><label className="crm-field crm-field--full"><span className="crm-label">Próxima ação</span><input className="crm-input" defaultValue={deal.proxima_acao || ""} onBlur={(event) => void mutate("update_deal", { dealId: deal.id, titulo: deal.titulo, produto: deal.produto, valor: deal.valor, probabilidade: deal.probabilidade, proximaAcao: event.target.value, proximaAcaoEm: deal.proxima_acao_em })} /></label></div></div><div className="crm-panel"><p className="crm-panel__title">Contato</p><p><strong>{contact.email || "Sem e-mail"}</strong></p><p className="crm-contact-sub">{contact.whatsapp || "Sem WhatsApp"}</p><p className="crm-contact-sub">{contact.site || "Sem site"}</p></div><div className="crm-panel"><p className="crm-panel__title">Adicionar à cadência</p><select className="crm-select" style={{ width: "100%" }} defaultValue="" onChange={(event) => { if (event.target.value) void mutate("enroll_sequence", { sequenceId: event.target.value, contactId: contact.id, dealId: deal.id }); event.currentTarget.value=""; }}><option value="">Selecione...</option>{sequences.map((sequence) => <option key={sequence.id} value={sequence.id}>{sequence.nome}</option>)}</select></div></div><div style={{ display: "grid", gap: 12 }}><div className="crm-panel"><p className="crm-panel__title">Enviar e-mail</p><input className="crm-input" style={{ width: "100%", marginBottom: 8 }} value={mailSubject} onChange={(event) => setMailSubject(event.target.value)} /><textarea className="crm-textarea" value={mailBody} onChange={(event) => setMailBody(event.target.value)} placeholder="Mensagem personalizada" /><button className="crm-btn crm-btn--primary" style={{ marginTop: 8 }} disabled={busy || !contact.email || !mailBody} onClick={async () => { if (contact.email && await send({ to: contact.email, subject: mailSubject, text: mailBody, contactId: contact.id, dealId: deal.id })) setMailBody(""); }}><Send size={15} /> Enviar</button></div><div className="crm-panel"><p className="crm-panel__title">Nota ou tarefa</p><textarea className="crm-textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Registre o próximo contexto..." /><button className="crm-btn" style={{ marginTop: 8 }} disabled={busy || !note} onClick={async () => { if (await mutate("add_activity", { contactId: contact.id, dealId: deal.id, tipo: "nota", titulo: "Nota comercial", descricao: note })) setNote(""); }}><MessageSquare size={15} /> Registrar</button></div><div className="crm-panel"><p className="crm-panel__title">Histórico</p><div className="crm-timeline">{activities.map((activity) => <div className="crm-event" key={activity.id}><p className="crm-event__title">{activity.titulo}</p>{activity.descricao ? <p className="crm-event__desc">{activity.descricao}</p> : null}<p className="crm-contact-sub">{date.format(new Date(activity.criado_em))}</p></div>)}{!activities.length ? <p className="crm-contact-sub">Nenhuma atividade ainda.</p> : null}</div></div></div></div></ModalShell>;
}
