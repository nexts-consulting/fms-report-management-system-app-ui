"use client";

import { useResetOnRefresh } from "@/hooks/use-reset-on-refresh";
import { useSessionReset } from "@/hooks/use-session-reset";

interface SurveyResetOnRefreshProps {
  children: React.ReactNode;
}

export const SurveyResetOnRefresh = ({ children }: SurveyResetOnRefreshProps) => {
  // Sử dụng cả hai phương pháp để đảm bảo reset
  useSessionReset(); // Reset khi có session mới (reliable hơn)
  useResetOnRefresh(); // Reset khi beforeunload (backup)

  return <>{children}</>;
};
