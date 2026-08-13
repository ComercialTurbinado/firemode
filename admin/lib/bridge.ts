export type StepStatus = {
  done: boolean;
  skipped?: boolean;
  durationMs?: number;
  startedAt?: string;
};

export type JobPart = {
  baseName: string;
  stage: string;
  startedAt: string;
  completedAt?: string;
  finalPath?: string;
  enhancedWith?: string;
  trilha?: string;
  steps: Record<string, StepStatus>;
  error?: string;
};

export type JobStatus = {
  recordId: string;
  parts: JobPart[];
  mergedFinal?: string;
  totalParts: number;
  completedParts: number;
};

export async function fetchPipelineStatus(): Promise<JobStatus[]> {
  const url = process.env.BRIDGE_URL || "http://localhost:8091";
  const key = process.env.BRIDGE_API_KEY || "";
  try {
    const res = await fetch(`${url}/api/admin/status`, {
      headers: key ? { "x-api-key": key } : {},
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
