import styles from "./report-v2.module.css";

export default function ReportV2Loading() {
  return (
    <main
      className={`${styles.reportShell} ${styles.loadingShell}`}
      aria-label="Carregando relatório V2"
      aria-busy="true"
    >
      <div className={styles.loadingTopbar}>
        <span className={styles.loadingMark} />
        <span className={styles.loadingLineSmall} />
      </div>
      <div className={styles.loadingReport}>
        <div className={styles.loadingEyebrow} />
        <div className={styles.loadingLineMedium} />
        <div className={styles.loadingTitle} />
        <div className={styles.loadingTitleShort} />
        <div className={styles.loadingParagraph} />
        <div className={styles.loadingParagraphShort} />
      </div>
      <span className={styles.srOnly}>Organizando evidências, prioridades e próximos passos.</span>
    </main>
  );
}
