import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { isCanonicalProductionUrl, loadIndexableUrls } from "@/lib/indexableUrls";
import {
  INDEXNOW_HOST,
  INDEXNOW_KEY,
  INDEXNOW_KEY_LOCATION,
} from "@/lib/indexnowKey";
import { getSiteUrl } from "@/lib/seo";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const HOUR_MS = 60 * 60 * 1000;

type UrlRecord = {
  kind: "static" | "blog";
  revision: string;
};

type IndexNowState = {
  contentHash: string;
  urls: Record<string, UrlRecord>;
};

export type IndexNowSyncResult = {
  ok: boolean;
  skipped?: string;
  submitted: string[];
  status?: number;
  body?: string;
};

let running = false;
let schedulerStarted = false;

function stateFilePath(): string {
  const configured = process.env.INDEXNOW_STATE_PATH?.trim();
  if (configured) return configured;
  return path.join(process.cwd(), ".data", "indexnow-state.json");
}

export function isProductionIndexNowHost(): boolean {
  try {
    return new URL(getSiteUrl()).hostname === INDEXNOW_HOST;
  } catch {
    return false;
  }
}

async function readState(): Promise<IndexNowState | null> {
  try {
    const raw = await readFile(stateFilePath(), "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as Partial<IndexNowState>;
    if (typeof record.contentHash !== "string" || !record.urls || typeof record.urls !== "object") {
      return null;
    }
    return { contentHash: record.contentHash, urls: record.urls };
  } catch {
    return null;
  }
}

async function writeState(state: IndexNowState): Promise<void> {
  const filePath = stateFilePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(state), "utf8");
}

async function probeStatus(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
    return response.status;
  } catch {
    return null;
  }
}

export async function submitIndexNowUrls(urls: string[]): Promise<{
  ok: boolean;
  status: number;
  body: string;
}> {
  const urlList = [...new Set(urls)].filter(isCanonicalProductionUrl);
  if (urlList.length === 0) {
    return { ok: true, status: 0, body: "" };
  }
  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: INDEXNOW_HOST,
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList,
    }),
    signal: AbortSignal.timeout(20000),
  });
  const body = await response.text();
  const ok = response.status === 200 || response.status === 202;
  return { ok, status: response.status, body };
}

export async function runIndexNowSync(): Promise<IndexNowSyncResult> {
  if (!isProductionIndexNowHost()) {
    return { ok: false, skipped: "not-production-host", submitted: [] };
  }
  if (process.env.NODE_ENV !== "production") {
    return { ok: false, skipped: "not-production-runtime", submitted: [] };
  }
  if (running) {
    return { ok: false, skipped: "already-running", submitted: [] };
  }

  running = true;
  try {
    const current = await loadIndexableUrls({ fresh: true });
    const previous = await readState();
    const nextUrls: Record<string, UrlRecord> = {};
    const submitted: string[] = [];
    const staticChanged = !previous || previous.contentHash !== current.contentHash;

    for (const url of current.staticUrls) {
      nextUrls[url] = { kind: "static", revision: current.contentHash };
      if (staticChanged || !previous?.urls[url]) submitted.push(url);
    }

    for (const blog of current.blogs) {
      nextUrls[blog.url] = { kind: "blog", revision: blog.revision };
      const prior = previous?.urls[blog.url];
      if (!prior || prior.revision !== blog.revision) submitted.push(blog.url);
    }

    if (previous && !current.blogsOk) {
      for (const [url, record] of Object.entries(previous.urls)) {
        if (record.kind === "blog" && !nextUrls[url]) nextUrls[url] = record;
      }
    }

    if (previous && current.blogsOk) {
      for (const [url, record] of Object.entries(previous.urls)) {
        if (nextUrls[url]) continue;
        if (!isCanonicalProductionUrl(url)) continue;
        const status = await probeStatus(url);
        if (status === 404 || status === 410) {
          submitted.push(url);
          continue;
        }
        if (status === 301 || status === 308) continue;
        nextUrls[url] = record;
      }
    }

    const uniqueSubmitted = [...new Set(submitted)].filter(isCanonicalProductionUrl);
    if (uniqueSubmitted.length === 0) {
      await writeState({ contentHash: current.contentHash, urls: nextUrls });
      return { ok: true, submitted: [] };
    }

    const result = await submitIndexNowUrls(uniqueSubmitted);
    if (!result.ok) {
      return {
        ok: false,
        submitted: uniqueSubmitted,
        status: result.status,
        body: result.body,
      };
    }

    await writeState({ contentHash: current.contentHash, urls: nextUrls });
    return {
      ok: true,
      submitted: uniqueSubmitted,
      status: result.status,
      body: result.body,
    };
  } finally {
    running = false;
  }
}

export function startIndexNowScheduler(): void {
  if (schedulerStarted) return;
  if (process.env.NODE_ENV !== "production") return;
  if (!isProductionIndexNowHost()) return;
  schedulerStarted = true;

  const tick = () => {
    void runIndexNowSync().catch((error: unknown) => {
      console.error("[indexnow]", error);
    });
  };

  setTimeout(tick, 15_000);
  setInterval(tick, HOUR_MS);
}
