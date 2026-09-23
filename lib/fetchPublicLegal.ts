import { cache } from "react";
import type { BuyerLegalDocument } from "@/app/buyer/store/buyerLegalTypes";

const publicApiOrigin = (): string =>
  (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_ORIGIN ||
    "https://stage.whocan-app.com"
  ).replace(/\/$/, "");

function parseLegalDocument(payload: unknown): BuyerLegalDocument | null {
  if (!payload || typeof payload !== "object") return null;
  const data = (payload as { data?: unknown }).data;
  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const content = typeof record.content === "string" ? record.content.trim() : "";
  const lastUpdated =
    typeof record.lastUpdated === "string" ? record.lastUpdated : "";

  if (!title || !content) return null;
  return { title, content, lastUpdated };
}

async function fetchLegalDocument(path: string): Promise<BuyerLegalDocument | null> {
  try {
    const response = await fetch(`${publicApiOrigin()}${path}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    return parseLegalDocument(await response.json());
  } catch {
    return null;
  }
}

export const fetchPublicPrivacyPolicy = cache(() =>
  fetchLegalDocument("/api/public/privacy-policy?audience=buyer"),
);

export const fetchPublicTermsAndConditions = cache(() =>
  fetchLegalDocument("/api/public/terms-and-conditions"),
);
