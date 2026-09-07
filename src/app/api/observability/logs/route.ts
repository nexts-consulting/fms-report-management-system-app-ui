import { NextResponse } from "next/server";
import { OPENOBSERVE_DEFAULTS } from "@/libs/observability/config";

const MAX_BATCH = 50;
const MAX_BODY_BYTES = 256 * 1024;
const DEFAULT_STREAM = "fms_app_ui";

const getServerConfig = () => {
  const url = (process.env.OPENOBSERVE_URL || OPENOBSERVE_DEFAULTS.url).replace(/\/$/, "");
  const org = process.env.OPENOBSERVE_ORG || process.env.NEXT_PUBLIC_OPENOBSERVE_ORG || OPENOBSERVE_DEFAULTS.org;
  const stream = process.env.OPENOBSERVE_STREAM || DEFAULT_STREAM;
  const user = process.env.OPENOBSERVE_USER;
  const password = process.env.OPENOBSERVE_PASSWORD;
  const authorizationHeader = process.env.OPENOBSERVE_AUTHORIZATION;
  return { url, org, stream, user, password, authorizationHeader };
};

const resolveAuthorization = (
  user?: string,
  password?: string,
  authorizationHeader?: string,
): string | null => {
  if (authorizationHeader?.trim()) {
    return authorizationHeader.trim();
  }
  if (password?.trim().toLowerCase().startsWith("basic ")) {
    return password.trim();
  }
  if (user && password) {
    return `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;
  }
  return null;
};

export async function GET() {
  const { url, org, stream, user, password, authorizationHeader } = getServerConfig();
  const authorization = resolveAuthorization(user, password, authorizationHeader);
  return NextResponse.json({
    ok: Boolean(url && org && stream && authorization),
    url,
    org,
    stream,
    hasAuth: Boolean(authorization),
    hint: authorization
      ? `Ingest configured. Open OpenObserve → Logs → stream ${stream} (last 15 minutes).`
      : "Missing OPENOBSERVE_PASSWORD or OPENOBSERVE_AUTHORIZATION.",
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ ok: false }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
  }

  const { url, org, stream, user, password, authorizationHeader } = getServerConfig();
  const authorization = resolveAuthorization(user, password, authorizationHeader);

  if (!url || !authorization) {
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, reason: "payload_too_large" }, { status: 413 });
  }

  let events: unknown;
  try {
    events = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_json" }, { status: 400 });
  }

  if (!Array.isArray(events) || events.length === 0 || events.length > MAX_BATCH) {
    return NextResponse.json({ ok: false, reason: "invalid_batch" }, { status: 400 });
  }

  const ingestUrl = `${url}/api/${encodeURIComponent(org)}/${encodeURIComponent(stream)}/_json`;

  try {
    const upstream = await fetch(ingestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify(events),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      console.error("[O2 ingest] upstream failed", upstream.status, detail.slice(0, 300));
      return NextResponse.json(
        { ok: false, reason: "upstream_error", status: upstream.status },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, ingested: events.length, stream });
  } catch (error) {
    console.error("[O2 ingest] network failed", error);
    return NextResponse.json({ ok: false, reason: "network_error" }, { status: 502 });
  }
}
