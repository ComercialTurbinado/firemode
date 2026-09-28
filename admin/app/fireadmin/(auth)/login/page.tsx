"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ADMIN_BASE } from "@/lib/admin-path";

function LoginForm() {
  const search = useSearchParams();
  const next = search.get("next") || "";
  const error = search.get("error");

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--fm-bg)",
    }}>
      <div style={{
        background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
        borderRadius: 16, padding: "40px 36px", width: 360,
      }}>
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontWeight: 800, fontSize: 20, color: "var(--fm-accent)" }}>FIREMODE</span>
          <p style={{ color: "var(--fm-muted)", marginTop: 6, fontSize: 13 }}>Acesso restrito — Admin</p>
        </div>

        <form action="/api/auth" method="POST" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {next.startsWith(ADMIN_BASE) ? (
            <input type="hidden" name="next" value={next} />
          ) : null}
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--fm-muted)", marginBottom: 6, fontWeight: 500 }}>
              Senha
            </label>
            <input
              name="password"
              type="password"
              autoFocus
              required
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 8,
                background: "var(--fm-inset)", border: "1px solid var(--fm-border)",
                color: "var(--fm-text)", fontSize: 14, outline: "none",
              }}
            />
          </div>

          {error ? (
            <p style={{ color: "var(--fm-red)", fontSize: 13, margin: 0 }}>Senha incorreta.</p>
          ) : null}

          <button type="submit" style={{
            padding: "11px", borderRadius: 8, background: "var(--fm-accent)",
            color: "#fff", fontWeight: 700, fontSize: 14, border: "none",
            cursor: "pointer", marginTop: 4,
          }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
