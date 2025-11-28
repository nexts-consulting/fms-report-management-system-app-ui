import { customAlphabet } from "nanoid";

export class CommonUtil {
  static nanoid(
    type: "digest" | "alpha" | "alphaLower" | "alphaUpper" | "mix" = "mix",
    length: number = 10,
  ) {
    const characterSets = {
      digest: "1234567890",
      alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
      alphaLower: "abcdefghijklmnopqrstuvwxyz",
      alphaUpper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      mix: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890",
    };

    const alphabet = characterSets[type] || characterSets.mix;
    return customAlphabet(alphabet, length)();
  }

  static wait(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  static startAsyncFn(fn: () => Promise<any>) {
    (async () => {
      try {
        await fn();
      } catch (error) {}
    })();
  }

  static getRandomItems<T>(array: T[], n: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  }
}

import { twMerge } from "tailwind-merge";
import { ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Breakpoint = "sm" | "md" | "lg" | "xl";

export function cssClamp(
  minSize: number,
  maxSize: number,
  minWidth: number | Breakpoint,
  maxWidth: number | Breakpoint,
): string {
  const breakpoints: Record<Breakpoint, number> = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1440,
  };

  const minWidthPx = typeof minWidth === "string" ? breakpoints[minWidth] : minWidth;
  const maxWidthPx = typeof maxWidth === "string" ? breakpoints[maxWidth] : maxWidth;

  if (!minWidthPx || !maxWidthPx) {
    throw new Error(
      `Invalid breakpoints. Use breakpoints: ${Object.keys(breakpoints).join(", ")}.`,
    );
  }

  if (minSize < maxSize) {
    const slope = (maxSize - minSize) / (maxWidthPx - minWidthPx);
    return `clamp(${minSize}px, calc(${minSize}px + ${slope} * (100vw - ${minWidthPx}px)), ${maxSize}px)`;
  } else {
    const slope = (minSize - maxSize) / (maxWidthPx - minWidthPx);
    return `clamp(${maxSize}px, calc(${minSize}px - ${slope} * (100vw - ${minWidthPx}px)), ${minSize}px)`;
  }
}
