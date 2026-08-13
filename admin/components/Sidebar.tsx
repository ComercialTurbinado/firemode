"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Activity, LogOut, CreditCard, UserPlus } from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: Activity },
  { href: "/planos", label: "Planos", icon: CreditCard },
  { href: "/leads", label: "Leads", icon: UserPlus },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside style={{
      width: 220, minHeight: "100vh", background: "var(--fm-surface)",
      borderRight: "1px solid var(--fm-border)", display: "flex",
      flexDirection: "column", padding: "24px 16px",
    }}>
      <div style={{ marginBottom: 32 }}>
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", color: "var(--fm-accent)" }}>
          FIREMODE
        </span>
        <span style={{ display: "block", fontSize: 11, color: "var(--fm-muted)", marginTop: 2, letterSpacing: "0.08em" }}>
          ADMIN
        </span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={active ? "" : "hover:bg-white/[0.04] hover:text-[var(--fm-text)]"}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, textDecoration: "none",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--fm-accent)" : "var(--fm-muted)",
                background: active ? "var(--fm-accent-soft)" : "transparent",
                transition: "background-color 0.15s, color 0.15s",
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <form action="/api/logout" method="POST">
        <button
          type="submit"
          className="hover:bg-white/[0.04] hover:text-[var(--fm-text)]"
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 8, width: "100%",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--fm-muted)", fontSize: 14,
            transition: "background-color 0.15s, color 0.15s",
          }}
        >
          <LogOut size={16} />
          Sair
        </button>
      </form>
    </aside>
  );
}
