import CommercialCRM from "@/components/CommercialCRM";
import { getCommercialSnapshot } from "@/lib/comercial-store";

export const dynamic = "force-dynamic";

export default async function ComercialPage() {
  const snapshot = await getCommercialSnapshot();
  return <CommercialCRM initial={snapshot} />;
}
