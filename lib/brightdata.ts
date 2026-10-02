/**
 * Kicks off a Bright Data job whose results are POSTed back to /webhook.
 * `endpointQuery` is appended to the webhook URL so the webhook can tell
 * deliveries apart (e.g. "origin=submission").
 */
export async function triggerBrightData(
  inputs: Record<string, unknown>[],
  extraParams: Record<string, string> = {},
  endpointQuery = "",
): Promise<
  { ok: true; snapshotId: string } | { ok: false; status: number; body: string }
> {
  const params = new URLSearchParams({
    dataset_id: process.env.DATASET_ID!,
    format: "json",
    uncompressed_webhook: "true",
    notify: "true",
    endpoint: `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/webhook${endpointQuery ? `?${endpointQuery}` : ""}`,
    auth_header: `Bearer ${process.env.WEBHOOK_SECRET}`,
    ...extraParams,
  });

  const res = await fetch(`${process.env.BACKEND_URL}?${params}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(inputs),
  });

  const body = await res.text();
  if (!res.ok) return { ok: false, status: res.status, body };

  const { snapshot_id } = JSON.parse(body) as { snapshot_id: string };
  return { ok: true, snapshotId: snapshot_id };
}
