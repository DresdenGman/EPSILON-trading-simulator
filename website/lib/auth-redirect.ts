const DEFAULT_AUTH_REDIRECT = "/dashboard";

export function getSafeAuthRedirect(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  try {
    const url = new URL(next, "https://epsilon.local");
    const isDashboardPath = url.pathname === "/dashboard" || url.pathname.startsWith("/dashboard/");

    if (url.origin !== "https://epsilon.local" || !isDashboardPath) {
      return DEFAULT_AUTH_REDIRECT;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_AUTH_REDIRECT;
  }
}

export function authRouteWithNext(route: "/auth/login" | "/auth/register", next: string): string {
  return `${route}?next=${encodeURIComponent(next)}`;
}
