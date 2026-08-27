export const POST_LOGIN_FLAG = "whoCan_postLogin";

export function isAuthPath(pathname: string): boolean {
  return pathname === "/auth" || pathname.startsWith("/auth/");
}

// Reachable from the signed-in Security screen, so it must not be treated as a
// guest-only route.
const SIGNED_IN_AUTH_PATHS = ["/auth/forgot-password"];

export function isGuestOnlyAuthPath(pathname: string): boolean {
  if (!isAuthPath(pathname)) return false;
  return !SIGNED_IN_AUTH_PATHS.some(
    (allowed) => pathname === allowed || pathname.startsWith(`${allowed}/`),
  );
}

export function goHomeAfterAuth(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(POST_LOGIN_FLAG, "1");
  window.location.replace("/");
}
