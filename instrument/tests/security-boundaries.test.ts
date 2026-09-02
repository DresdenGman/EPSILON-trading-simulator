import assert from "node:assert/strict";
import test from "node:test";
import { readBoundedJson, RequestBodyError } from "../lib/http.ts";
import { isClientImpactEvent, normalizeImpactSource } from "../lib/impact-contract.ts";
import { missingProviderSymbols } from "../lib/provider-cache.ts";

void test("bounded JSON reader accepts a legitimate request", async () => {
  const request = new Request("https://epsilon.test/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ claim: "test" }),
  });
  assert.deepEqual(await readBoundedJson(request, 128), { claim: "test" });
});

void test("bounded JSON reader rejects streamed bodies without relying on Content-Length", async () => {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(`{"value":"${"x".repeat(256)}"}`));
      controller.close();
    },
  });
  const request = new Request("https://epsilon.test/api", { method: "POST", body, duplex: "half" } as RequestInit & { duplex: "half" });
  await assert.rejects(() => readBoundedJson(request, 64), (error: unknown) => error instanceof RequestBodyError && error.status === 413);
});

void test("client telemetry cannot assert verified research use", () => {
  assert.equal(isClientImpactEvent("lab_opened"), true);
  assert.equal(isClientImpactEvent("verified_historical_run"), false);
  assert.equal(isClientImpactEvent("evidence_completed"), false);
});

void test("campaign sources collapse to coarse non-identifying categories", () => {
  assert.equal(normalizeImpactSource("github"), "github");
  assert.equal(normalizeImpactSource("student@example.com"), "other");
  assert.equal(normalizeImpactSource("recipient-12345"), "other");
});

void test("provider budget is calculated only from cache misses", () => {
  const cached = new Set(["SPY", "QQQ"]);
  assert.deepEqual(missingProviderSymbols(["SPY", "QQQ"], (symbol) => cached.has(symbol)), []);
  assert.deepEqual(missingProviderSymbols(["SPY", "IWM"], (symbol) => cached.has(symbol)), ["IWM"]);
});
