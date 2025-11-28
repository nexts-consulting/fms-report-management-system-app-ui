import { twMerge } from "tailwind-merge";
import { ClassValue, clsx } from "clsx";

export class StyleUtil {
  static cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
}
