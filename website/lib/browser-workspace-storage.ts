/**
 * Persists non-sensitive simulated workspace data on this device.
 * Authentication tokens and secrets must never use this storage layer.
 */
export function readWorkspaceItem(key: string) {
  if (typeof window === "undefined") return null;

  try {
    const persisted = window.localStorage.getItem(key);
    if (persisted !== null) return persisted;

    // One-time migration from the earlier tab-scoped workspace.
    const legacy = window.sessionStorage.getItem(key);
    if (legacy !== null) {
      window.localStorage.setItem(key, legacy);
      window.sessionStorage.removeItem(key);
    }
    return legacy;
  } catch {
    return null;
  }
}

export function writeWorkspaceItem(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable in private or constrained browser contexts.
  }
}

export function removeWorkspaceItem(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  } catch {
    // Reset remains best-effort when browser storage is unavailable.
  }
}
