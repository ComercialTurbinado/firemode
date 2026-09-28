"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, Activity, LogOut, CreditCard, UserPlus, BarChart2, FileText,
  BriefcaseBusiness,
} from "lucide-react";
import { ADMIN_BASE, adminPath } from "@/lib/admin-path";

const nav = [
  { href: adminPath("/"), label: "Dashboard", icon: LayoutDashboard },
  { href: adminPath("/comercial"), label: "Comercial", icon: BriefcaseBusiness },
  { href: adminPath("/clientes"), label: "Clientes", icon: Users },
  { href: adminPath("/analises"), label: "Análises", icon: BarChart2 },
  { href: adminPath("/conteudo"), label: "Conteúdo", icon: FileText },
  { href: adminPath("/pipeline"), label: "Produção", icon: Activity },
  { href: adminPath("/planos"), label: "Planos", icon: CreditCard },
  { href: adminPath("/leads"), label: "Leads", icon: UserPlus },
];

/** Submenus da análise de conteúdo — âncoras da página /fireadmin/conteudo/[id] */
const conteudoSections = [
  { id: "scorecard", label: "Scorecard" },
  { id: "evolucao", label: "Evolução" },
  { id: "site", label: "Site" },
  { id: "tech-seo", label: "Tech SEO" },
  { id: "busca", label: "Busca" },
  { id: "ia", label: "IA / LLM" },
  { id: "gmb", label: "GMB" },
  { id: "blog", label: "Blog" },
  { id: "ads", label: "Ads" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "concorrentes", label: "Concorrentes" },
  { id: "posicionamento", label: "Posicionamento" },
  { id: "audiencia", label: "Audiência" },
  { id: "percepcao", label: "Percepção" },
  { id: "impacto", label: "Impacto" },
  { id: "interesses-apresentacao", label: "Interesses" },
  { id: "pecas", label: "Peças" },
];

const APRESENTACAO_HREF = (id: string) => adminPath(`/conteudo/${id}/apresentacao`);

function scrollToSection(sectionId: string) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  try {
    history.replaceState(null, "", `#${sectionId}`);
  } catch {
    /* ignore */
  }
}

export default function Sidebar() {
  const path = usePathname();
  const analiseMatch = path.match(new RegExp(`^${ADMIN_BASE}/conteudo/([^/]+)`));
  const analiseId = analiseMatch?.[1] ?? null;
  const naAnalise = Boolean(analiseId);
  const naApresentacao = Boolean(analiseId && path.endsWith("/apresentacao"));
  const baseAnalise = analiseId ? adminPath(`/conteudo/${analiseId}`) : null;
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const sync = () => setActiveHash(window.location.hash.replace(/^#/, ""));
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [path]);

  useEffect(() => {
    if (!naAnalise) return;
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    const t = window.setTimeout(() => scrollToSection(id), 80);
    return () => window.clearTimeout(t);
  }, [naAnalise, path]);

  return (
    <aside
      className="fm-no-print"
      style={{
      width: 232, minHeight: "100vh", background: "var(--fm-surface)",
      borderRight: "1px solid var(--fm-border)", display: "flex",
      flexDirection: "column", padding: "28px 16px 20px",
      boxShadow: "4px 0 24px rgba(28,37,51,0.04)",
    }}>
      <div style={{ marginBottom: 36, paddingInline: 8 }}>
        <span style={{
          fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em",
          color: "var(--fm-accent)",
        }}>
          FIREMODE
        </span>
        <span style={{
          display: "block", fontSize: 11, color: "var(--fm-muted)",
          marginTop: 4, letterSpacing: "0.12em", fontWeight: 600,
        }}>
          ADMIN
        </span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, overflowY: "auto" }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === ADMIN_BASE || href === `${ADMIN_BASE}/`
            ? path === ADMIN_BASE || path === `${ADMIN_BASE}/`
            : path.startsWith(href);
          const isConteudo = href === adminPath("/conteudo");

          return (
            <div key={href}>
              <Link
                href={href}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 10, textDecoration: "none",
                  fontWeight: active ? 650 : 500, fontSize: 14,
                  color: active ? "var(--fm-accent)" : "var(--fm-muted)",
                  background: active ? "var(--fm-accent-soft)" : "transparent",
                  transition: "background-color 0.15s ease-out, color 0.15s ease-out",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "var(--fm-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon size={16} strokeWidth={active ? 2.25 : 1.75} />
                {label}
              </Link>

              {isConteudo && naAnalise && analiseId && baseAnalise && (
                <div style={{
                  display: "flex", flexDirection: "column", gap: 1,
                  margin: "4px 0 8px 12px",
                  paddingLeft: 12,
                  borderLeft: "1px solid var(--fm-border)",
                }}>
                  <Link
                    href={APRESENTACAO_HREF(analiseId)}
                    style={{
                      display: "block",
                      padding: "6px 10px",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontSize: 12,
                      fontWeight: naApresentacao ? 650 : 500,
                      color: naApresentacao ? "var(--fm-accent)" : "var(--fm-muted)",
                      background: naApresentacao ? "var(--fm-accent-soft)" : "transparent",
                      transition: "background-color 0.12s ease-out, color 0.12s ease-out",
                    }}
                    onMouseEnter={(e) => {
                      if (!naApresentacao) e.currentTarget.style.background = "var(--fm-hover)";
                    }}
                    onMouseLeave={(e) => {
                      if (!naApresentacao) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Apresentação
                  </Link>
                  {conteudoSections.map((s) => {
                    const subActive = !naApresentacao && activeHash === s.id;
                    return (
                      <Link
                        key={s.id}
                        href={`${baseAnalise}#${s.id}`}
                        onClick={(e) => {
                          if (naApresentacao) return;
                          e.preventDefault();
                          setActiveHash(s.id);
                          scrollToSection(s.id);
                        }}
                        style={{
                          display: "block",
                          padding: "6px 10px",
                          borderRadius: 8,
                          textDecoration: "none",
                          fontSize: 12,
                          fontWeight: subActive ? 650 : 500,
                          color: subActive ? "var(--fm-accent)" : "var(--fm-muted)",
                          background: subActive ? "var(--fm-accent-soft)" : "transparent",
                          transition: "background-color 0.12s ease-out, color 0.12s ease-out",
                        }}
                        onMouseEnter={(e) => {
                          if (!subActive) e.currentTarget.style.background = "var(--fm-hover)";
                        }}
                        onMouseLeave={(e) => {
                          if (!subActive) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {s.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <form action="/api/logout" method="POST">
        <button
          type="submit"
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 10, width: "100%",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--fm-muted)", fontSize: 14, fontWeight: 500,
            transition: "background-color 0.15s ease-out",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--fm-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <LogOut size={16} />
          Sair
        </button>
      </form>
    </aside>
  );
}
