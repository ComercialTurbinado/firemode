import type { CSSProperties, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const controlStyle: CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  background: "#1a1a1a", border: "1px solid var(--fm-border)",
  color: "var(--fm-text)", fontSize: 14, outline: "none",
};

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, color: "var(--fm-muted)", marginBottom: 6, fontWeight: 500 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...controlStyle, ...props.style }} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ ...controlStyle, resize: "vertical", ...props.style }} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...controlStyle, ...props.style }} />;
}

export function SubmitButton({ children, variant = "primary" }: { children: React.ReactNode; variant?: "primary" | "danger" | "ghost" }) {
  const styles: Record<string, CSSProperties> = {
    primary: { background: "var(--fm-accent)", color: "#fff" },
    danger: { background: "rgba(239,68,68,0.12)", color: "var(--fm-red)" },
    ghost: { background: "transparent", color: "var(--fm-muted)", border: "1px solid var(--fm-border)" },
  };
  return (
    <button type="submit" style={{
      padding: "10px 18px", borderRadius: 8, fontWeight: 700, fontSize: 14,
      border: "none", cursor: "pointer", ...styles[variant],
    }}>
      {children}
    </button>
  );
}

export function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div style={{
      background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
      color: "var(--fm-red)", padding: "10px 14px", borderRadius: 8, fontSize: 13,
    }}>
      {message}
    </div>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
      borderRadius: 12, padding: 24, ...style,
    }}>
      {children}
    </div>
  );
}
