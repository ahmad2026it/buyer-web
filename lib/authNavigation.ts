export const POST_LOGIN_FLAG = "whoCan_postLogin";

export function isAuthPath(pathname: string): boolean {
  return pathname === "/auth" || pathname.startsWith("/auth/");
}

export function goHomeAfterAuth(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(POST_LOGIN_FLAG, "1");
  window.location.replace("/");
}
