/**
 * Thin fetch wrapper around the SmartMed REST API.
 * - Same-origin `/api` (proxied to Express by next.config rewrites) so httpOnly cookies just work
 * - Transparently refreshes an expired access token once, then retries
 * - Normalises every error into `ApiError`
 */
import { getLang } from "./i18n";

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: { field: string; message: string }[];

  constructor(status: number, message: string, code?: string, errors?: { field: string; message: string }[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Query;
  signal?: AbortSignal;
}

const BASE = "/api";
const NO_REFRESH = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];

let refreshing: Promise<boolean> | null = null;

/** Single-flight refresh so parallel 401s trigger only one refresh call. */
function refreshSession() {
  refreshing ??= fetch(`${BASE}/auth/refresh`, { method: "POST", credentials: "include", headers: { "x-lang": getLang() } })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => setTimeout(() => (refreshing = null), 0));
  return refreshing;
}

function buildUrl(path: string, query?: Query) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  const s = qs.toString();
  return `${BASE}${path}${s ? `?${s}` : ""}`;
}

async function request<T>(path: string, opts: RequestOptions = {}, retried = false): Promise<ApiEnvelope<T>> {
  const isForm = typeof FormData !== "undefined" && opts.body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), {
      method: opts.method ?? "GET",
      credentials: "include",
      signal: opts.signal,
      headers: { "x-lang": getLang(), ...(opts.body && !isForm ? { "Content-Type": "application/json" } : {}) },
      body: opts.body ? (isForm ? (opts.body as FormData) : JSON.stringify(opts.body)) : undefined,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError(
      0,
      getLang() === "en" ? "Cannot reach the server. Please check your internet connection." : "সার্ভারে সংযোগ করা যাচ্ছে না। ইন্টারনেট সংযোগ দেখুন।",
    );
  }

  if (res.status === 401 && !retried && !NO_REFRESH.some((p) => path.startsWith(p))) {
    if (await refreshSession()) return request<T>(path, opts, true);
  }

  const json = (await res.json().catch(() => null)) as (ApiEnvelope<T> & { code?: string; errors?: ApiError["errors"] }) | null;
  if (!res.ok || !json?.success) {
    throw new ApiError(res.status, json?.message ?? `Request failed (${res.status})`, json?.code, json?.errors);
  }
  return json;
}

export const api = {
  get: <T>(path: string, query?: Query, signal?: AbortSignal) => request<T>(path, { query, signal }),
  post: <T>(path: string, body?: unknown, query?: Query) => request<T>(path, { method: "POST", body, query }),
  patch: <T>(path: string, body?: unknown, query?: Query) => request<T>(path, { method: "PATCH", body, query }),
  delete: <T>(path: string, body?: unknown, query?: Query) => request<T>(path, { method: "DELETE", body, query }),
};

export const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : getLang() === "en" ? "Something went wrong. Please try again." : "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।";
