type RateEntry = { count: number; resetAt: number };
type RateStore = Map<string, RateEntry>;

const runtimeState = globalThis as typeof globalThis & { epsilonRateStores?: Map<string, RateStore> };
const stores = runtimeState.epsilonRateStores ?? new Map<string, RateStore>();
runtimeState.epsilonRateStores = stores;

export function clientKey(request: Request) {
  return (request.headers.get("cf-connecting-ip") ?? "anonymous").slice(0, 64);
}

export function checkRateLimit(request: Request, bucket: string, limit: number, windowMs = 60_000) {
  const now = Date.now();
  const store = stores.get(bucket) ?? new Map<string, RateEntry>();
  stores.set(bucket, store);
  if (store.size > 1_000) {
    for (const [key, entry] of store) if (entry.resetAt <= now) store.delete(key);
    while (store.size > 1_000) store.delete(store.keys().next().value as string);
  }
  const key = clientKey(request);
  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfter: 0 };
  }
  entry.count += 1;
  return { limited: entry.count > limit, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1_000)) };
}
