import { EVIDENCE_FORMAT } from "@/lib/evidence-artifact";
import { historicalProviderStatus } from "@/lib/server/market-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const historical = historicalProviderStatus();
  return Response.json({
    status: "operational",
    product: "EPSILON",
    evidenceFormat: EVIDENCE_FORMAT,
    publicDataMode: "controlled-synthetic",
    guestCritic: "evidence-aware-local",
    hostedCriticConfigured: Boolean(process.env.DEEPSEEK_API_KEY?.trim()),
    historicalProviderConfigured: Boolean(historical.provider),
    historicalPublicEnabled: historical.publicEnabled,
    checkedAt: new Date().toISOString(),
  }, { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
