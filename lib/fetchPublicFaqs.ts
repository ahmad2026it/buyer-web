import { cache } from "react";
import type { PublicFaq } from "@/app/buyer/store/buyerFaqTypes";

const publicApiOrigin = (): string =>
  (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_ORIGIN ||
    "https://stage.whocan-app.com"
  ).replace(/\/$/, "");

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
};

const asText = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const asOrder = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
};

/** Accepts `{ data: { faqs: [] } }` or `{ data: [] }`. Skips incomplete or inactive rows. */
export function parsePublicFaqs(payload: unknown): PublicFaq[] {
  const data = asRecord(payload)?.data;
  const list = Array.isArray(data) ? data : asRecord(data)?.faqs;
  if (!Array.isArray(list)) return [];

  const rows: { faq: PublicFaq; order: number; index: number }[] = [];
  list.forEach((entry, index) => {
    const record = asRecord(entry);
    if (!record) return;

    const question = asText(record.question);
    const answer = asText(record.answer);
    if (!question || !answer) return;

    const status = asText(record.status).toLowerCase();
    if (record.is_active === false || (status && status !== "active" && status !== "published")) {
      return;
    }

    rows.push({
      faq: { id: String(record.id ?? index), question, answer },
      order: asOrder(record.sort_order ?? record.order ?? record.position),
      index,
    });
  });

  return rows
    .sort((a, b) => a.order - b.order || a.index - b.index)
    .map((row) => row.faq);
}

/** Local design preview only: needs FAQ_PREVIEW=1 and never runs in a production build. */
const PREVIEW_FAQS: PublicFaq[] = [
  { id: "preview-1", question: "How do I book a service on WhoCan?", answer: "Search for a favor, compare what is included, pick a date and time, and pay securely. Your payment is held in escrow until the work is completed." },
  { id: "preview-2", question: "What is escrow and how does it protect me?", answer: "When you pay, the amount stays in escrow and is only released to the provider after you confirm the favor is completed.\n\nIf something goes wrong you can open a dispute from your bookings." },
  { id: "preview-3", question: "Can I cancel a booking?", answer: "Yes. You can cancel from the Bookings page before the provider starts the work." },
  { id: "preview-4", question: "Which areas does WhoCan cover?", answer: "We are starting in Maryland, with more areas coming soon." },
];

const isPreviewEnabled = (): boolean =>
  process.env.NODE_ENV === "development" && process.env.FAQ_PREVIEW === "1";

export const fetchPublicFaqs = cache(async (): Promise<PublicFaq[]> => {
  try {
    const response = await fetch(`${publicApiOrigin()}/api/public/faqs`, {
      next: { revalidate: 3600 },
    });
    const faqs = response.ok ? parsePublicFaqs(await response.json()) : [];
    return faqs.length === 0 && isPreviewEnabled() ? PREVIEW_FAQS : faqs;
  } catch {
    return isPreviewEnabled() ? PREVIEW_FAQS : [];
  }
});
