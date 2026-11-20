import { createHmac } from "node:crypto";

if (process.env.VERCEL_ENV === "production" && process.env.COLLECTION_ENABLED === "true") {
  const url = process.env.GOOGLE_SCRIPT_URL || "";
  const secret = process.env.GOOGLE_SCRIPT_SECRET || "";
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url) || secret.length < 32) {
    throw new Error("Missing production intake configuration.");
  }

  // Apps Script verifies the signature before rejecting a missing request ID.
  // This probe cannot reach the spreadsheet write or create an application.
  const payload = "{}";
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload, signature }),
    signal: AbortSignal.timeout(25_000),
  });
  const result = response.ok ? await response.json().catch(() => null) : null;
  if (result?.ok !== false || result.code !== "BAD_REQUEST") {
    throw new Error(`Intake signature check failed (HTTP ${response.status}).`);
  }
  console.log("Verified the production intake signature without submitting an application.");
}
