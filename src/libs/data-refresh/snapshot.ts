import { AUTH_STORAGE_KEY, MAX_SNAPSHOT_TOTAL_CHARS, MAX_SNAPSHOT_VALUE_CHARS } from "./constants";
import { listLocalStorageKeys } from "./local-storage";
import { getUserAgentParsed } from "@/utils/session.util";

const SENSITIVE_KEY = /(token|password|secret|passwd|authorization|cookie|apikey|api[-_]?key)/i;

const redactUnknown = (value: unknown, depth: number): unknown => {
  if (depth > 3) return "[Truncated]";
  if (value == null) return value;
  if (typeof value === "string") {
    return value.length > MAX_SNAPSHOT_VALUE_CHARS
      ? `${value.slice(0, MAX_SNAPSHOT_VALUE_CHARS)}…[truncated]`
      : value;
  }
  if (typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => redactUnknown(item, depth + 1));
  }

  const output: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    output[key] = SENSITIVE_KEY.test(key) ? "[REDACTED]" : redactUnknown(nested, depth + 1);
  }
  return output;
};

const parseStorageValue = (raw: string | null): unknown => {
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

export const buildRedactedLocalStorageSnapshot = (): {
  keys: string[];
  snapshot: Record<string, unknown>;
  snapshotTruncated: boolean;
} => {
  const keys = listLocalStorageKeys();
  const snapshot: Record<string, unknown> = {};
  let usedChars = 0;
  let snapshotTruncated = false;

  for (const key of keys) {
    if (usedChars >= MAX_SNAPSHOT_TOTAL_CHARS) {
      snapshotTruncated = true;
      snapshot[key] = "[Omitted: snapshot size limit]";
      continue;
    }

    const parsed = parseStorageValue(localStorage.getItem(key));
    const redacted =
      key === AUTH_STORAGE_KEY
        ? redactUnknown(parsed, 0)
        : SENSITIVE_KEY.test(key)
          ? "[REDACTED]"
          : redactUnknown(parsed, 0);

    const encodedLength = JSON.stringify(redacted)?.length ?? 0;
    if (usedChars + encodedLength > MAX_SNAPSHOT_TOTAL_CHARS) {
      snapshotTruncated = true;
      snapshot[key] = "[Omitted: snapshot size limit]";
      continue;
    }

    snapshot[key] = redacted;
    usedChars += encodedLength;
  }

  return { keys, snapshot, snapshotTruncated };
};

export const getDevicePlatform = (): string => {
  if (typeof navigator === "undefined") return "unknown";

  try {
    const parsed = getUserAgentParsed();
    const device = [parsed.device.vendor, parsed.device.model, parsed.device.type]
      .filter(Boolean)
      .join(" ");
    const os = [parsed.os.name, parsed.os.version].filter(Boolean).join(" ");
    const browser = [parsed.browser.name, parsed.browser.version].filter(Boolean).join(" ");
    return [device || "Web", os, browser].filter(Boolean).join(" · ");
  } catch {
    return navigator.platform || "unknown";
  }
};
