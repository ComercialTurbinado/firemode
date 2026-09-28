"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import styles from "./report-v2.module.css";

export default function ReportActions({ id }: { id: string }) {
  return (
    <div className={`${styles.actions} fm-no-print`} aria-label="Ações do relatório">
      <Link className={styles.secondaryButton} href={`/fireadmin/conteudo/${id}`}>
        <ArrowLeft aria-hidden="true" size={17} strokeWidth={2} />
        Voltar ao diagnóstico
      </Link>
      <button className={styles.primaryButton} type="button" onClick={() => window.print()}>
        <Printer aria-hidden="true" size={17} strokeWidth={2} />
        Imprimir / salvar PDF
      </button>
    </div>
  );
}

