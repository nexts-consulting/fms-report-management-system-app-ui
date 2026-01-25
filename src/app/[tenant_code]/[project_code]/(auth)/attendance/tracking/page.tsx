"use client";

import dynamic from "next/dynamic";

// Dynamic import to reduce initial bundle size
const Entry = dynamic(() => import("./components/entry").then((mod) => ({ default: mod.Entry })), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center">
      <div className="text-gray-500">Đang tải...</div>
    </div>
  ),
});

export default function TrackingPage() {
  return (
    <>
      <Entry />
    </>
  );
}
