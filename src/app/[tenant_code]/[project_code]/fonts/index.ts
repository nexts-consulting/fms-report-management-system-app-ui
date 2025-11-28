import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import { Inter } from "next/font/google";
import { Chakra_Petch } from "next/font/google";
import localFont from "next/font/local";

export const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-chakra-petch",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const vnmSansDisplay = localFont({
  src: "../../../../../public/fonts/VNM Sans Display Regular.otf",
  variable: "--font-vnm-sans-display",
  display: "swap",
});

const fonts: NextFontWithVariable[] = [chakraPetch, inter, vnmSansDisplay];

export const fontVariables: string[] = fonts.map((font) => font.variable);
