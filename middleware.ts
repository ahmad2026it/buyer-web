import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Old static articles that now live as published blog posts. */
const ARTICLE_REDIRECTS: Record<string, string> = {
  "/articles/how-it-works":
    "/blog/how-whocan-connects-you-with-the-right-handyman",
  "/articles/deep-home-cleaning":
    "/blog/deep-home-cleaning-a-complete-guide-for-homeowners",
};

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
  if (path === "/articles" || path.startsWith("/articles/")) {
    const destination = ARTICLE_REDIRECTS[path];
    if (destination) {
      const url = request.nextUrl.clone();
      url.pathname = destination;
      return NextResponse.redirect(url, 301);
    }
    return new NextResponse("Gone", {
      status: 410,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2)$).*)",
  ],
};
