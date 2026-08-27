"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { selectIsAuthenticated } from "@/app/auth/store/authSlice";
import { POST_LOGIN_FLAG, isGuestOnlyAuthPath } from "@/lib/authNavigation";
import { useAppSelector } from "@/store/hooks";

export default function AuthHistoryGuard() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticatedRef = useRef(isAuthenticated);
  const lockBackRef = useRef(false);

  isAuthenticatedRef.current = isAuthenticated;

  useEffect(() => {
    if (!isAuthenticated || !isGuestOnlyAuthPath(pathname)) return;
    router.replace("/");
  }, [isAuthenticated, pathname, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      lockBackRef.current = false;
      return;
    }

    if (sessionStorage.getItem(POST_LOGIN_FLAG) === "1") {
      sessionStorage.removeItem(POST_LOGIN_FLAG);
      lockBackRef.current = true;
      window.history.pushState({ postLogin: true }, "", window.location.href);
    }

    if (lockBackRef.current && pathname !== "/") {
      lockBackRef.current = false;
    }

    const onPopState = () => {
      if (!isAuthenticatedRef.current) return;

      if (lockBackRef.current) {
        window.history.pushState({ postLogin: true }, "", window.location.href);
        return;
      }

      if (!isGuestOnlyAuthPath(window.location.pathname)) return;
      window.history.pushState(null, "", "/");
      router.replace("/");
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) onPopState();
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [isAuthenticated, pathname, router]);

  return null;
}
