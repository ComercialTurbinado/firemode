import { fetchPipelineStatus } from "@/lib/bridge";
import PipelineClient from "@/components/PipelineClient";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const jobs = await fetchPipelineStatus();
  return <PipelineClient initialJobs={jobs} />;
}
