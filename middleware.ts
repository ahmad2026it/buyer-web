import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Old WordPress and static URLs that now have a live equivalent.
 * Destinations are the current canonical paths (self-canonical, 200).
 */
const LEGACY_REDIRECTS: Record<string, string> = {
  "/articles/how-it-works":
    "/blog/how-whocan-connects-you-with-the-right-handyman",
  "/articles/deep-home-cleaning":
    "/blog/deep-home-cleaning-a-complete-guide-for-homeowners",
  "/privacy-policy-page": "/privacy-policy",
  "/terms-and-conditions-page": "/terms-and-conditions",
  "/terms-conditions": "/terms-and-conditions",
  "/download-now": "/#app",
};

/**
 * Indexed WordPress pages with no current equivalent.
 * 410 tells Google the URL is permanently gone.
 */
const GONE_PATHS = new Set([
  "/disclaimer",
  "/move-smarter",
  "/beyond-digital-friends-creating-meaningful-relationships-in-yourown-neighborhood",
  "/rediscovering-community-how-local-connections-can-transformyour-social-life",
  "/the-new-era-of-local-service-providers",
  "/whocan-app_-your-one-stop-solution-for-finding-local-services-quickly-and-easily",
  "/whocan-connecting-people-creating-possibilities",
  "/whocan-introduction",
  "/why-the-best-local-service-app-is-changing-the-way-we-get-things-done",
]);

function redirectTo(request: NextRequest, destination: string, status: 301 | 308 = 301) {
  const current = new URL(request.url);
  const hashIndex = destination.indexOf("#");
  const pathname = hashIndex === -1 ? destination : destination.slice(0, hashIndex);
  const url = new URL(pathname || "/", current.origin);
  url.search = current.search;
  if (hashIndex !== -1) url.hash = destination.slice(hashIndex + 1);
  return NextResponse.redirect(url, status);
}

function gone(request: NextRequest) {
  const url = new URL("/gone", request.url);
  return NextResponse.rewrite(url, { status: 410 });
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";

  if (hostname.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.hostname = hostname.slice(4);
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  const path = request.nextUrl.pathname.replace(/\/+$/, "") || "/";

  const destination = LEGACY_REDIRECTS[path];
  if (destination) return redirectTo(request, destination);

  if (GONE_PATHS.has(path)) return gone(request);

  if (path === "/articles" || path.startsWith("/articles/")) return gone(request);

  if (request.nextUrl.pathname.length > 1 && request.nextUrl.pathname.endsWith("/")) {
    return redirectTo(request, path, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2)$).*)",
  ],
};
