import { CommonUtil } from "@/kits/utils";
import { DEVICE_ID_KEY } from "./constants";

export const getOrCreateDeviceId = (): string => {
  if (typeof window === "undefined") return "";

  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const deviceId = `dev_${CommonUtil.nanoid("mix", 16)}`;
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
};
