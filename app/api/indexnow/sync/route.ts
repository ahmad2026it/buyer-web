import { NextResponse } from "next/server";
import { isProductionIndexNowHost, runIndexNowSync } from "@/lib/indexnowSync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ ok: false }, { status: 401 });
}

export async function POST(request: Request) {
  const secret = process.env.INDEXNOW_SYNC_SECRET?.trim();
  const header = request.headers.get("authorization") ?? "";
  if (!secret || header !== `Bearer ${secret}`) return unauthorized();

  if (!isProductionIndexNowHost() || process.env.NODE_ENV !== "production") {
    return NextResponse.json({
      ok: false,
      skipped: "not-production",
      submitted: [],
    });
  }

  const result = await runIndexNowSync();
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
