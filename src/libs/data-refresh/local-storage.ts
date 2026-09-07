import { AUTH_STORAGE_KEY, DEVICE_ID_KEY } from "./constants";

export const listLocalStorageKeys = (): string[] => {
  const keys: string[] = [];
  if (typeof window === "undefined") return keys;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) keys.push(key);
  }
  return keys;
};

export const PRESERVED_STORAGE_KEYS = [AUTH_STORAGE_KEY, DEVICE_ID_KEY] as const;

export type ClearLocalStorageResult = {
  keysBefore: string[];
  keysCleared: string[];
  preservedAuth: boolean;
  preservedDeviceId: boolean;
};

export const clearLocalStorageKeepAuth = (): ClearLocalStorageResult => {
  const keysBefore = listLocalStorageKeys();
  const preserved = new Map<string, string>();

  for (const key of PRESERVED_STORAGE_KEYS) {
    const value = localStorage.getItem(key);
    if (value) preserved.set(key, value);
  }

  localStorage.clear();

  preserved.forEach((value, key) => {
    localStorage.setItem(key, value);
  });

  return {
    keysBefore,
    keysCleared: keysBefore.filter(
      (key) => !PRESERVED_STORAGE_KEYS.includes(key as (typeof PRESERVED_STORAGE_KEYS)[number]),
    ),
    preservedAuth: preserved.has(AUTH_STORAGE_KEY),
    preservedDeviceId: preserved.has(DEVICE_ID_KEY),
  };
};
