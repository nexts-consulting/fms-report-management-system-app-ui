"use client";

import { useResetOnRefresh } from "@/hooks/use-reset-on-refresh";
import { useGiftSessionReset } from "@/hooks/use-gift-session-reset";

interface GiftResetOnRefreshProps {
  children: React.ReactNode;
}

export const GiftResetOnRefresh = ({ children }: GiftResetOnRefreshProps) => {
  // Sử dụng cả hai phương pháp để đảm bảo reset
  useGiftSessionReset(); // Reset khi có session mới (reliable hơn)
  useResetOnRefresh(); // Reset khi beforeunload (backup)

  return <>{children}</>;
};
