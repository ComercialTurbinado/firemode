import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main
        className="fm-app-main"
        style={{
        flex: 1, padding: "36px 40px", overflowY: "auto", maxHeight: "100vh",
      }}>
        {children}
      </main>
      <style>{`
        @media print {
          .fm-no-print { display: none !important; }
          .flex.min-h-screen { display: block !important; }
          .fm-app-main {
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            padding: 12px 16px !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
