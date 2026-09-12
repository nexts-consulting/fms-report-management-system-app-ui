import "@/styles/globals.scss";
import { Metadata, Viewport } from "next";
import { fontVariables } from "@/fonts";
import { ProvidersWrapper } from "@/layouts/providers-wrapper";

export const metadata: Metadata = {
  title: "Nexts System - FMS Report",
  description: "Provided by Nexts",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout(props: RootLayoutProps) {
  const { children } = props;

  return (
    <html lang="en">
      <body
        id="root"
        className={`min-h-dvh select-none bg-gray-10 text-gray-100 ${fontVariables.join(" ")}`}
      >
        <ProvidersWrapper>{children}</ProvidersWrapper>
      </body>
    </html>
  );
}
