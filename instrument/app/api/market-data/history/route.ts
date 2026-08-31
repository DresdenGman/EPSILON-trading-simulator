export const runtime = "edge";

// EPSILON exposes conclusions and reproducibility metadata, not a raw-data redistribution API.
export async function GET() {
  return Response.json(
    { error: "Not found." },
    { status: 404, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
  );
}
