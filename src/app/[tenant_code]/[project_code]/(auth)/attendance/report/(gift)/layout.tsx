"use client";

import { SurveyProgressContextProvider } from "@/contexts/survey-progress.context";
import { GiftResetOnRefresh } from "@/components/GiftResetOnRefresh";

interface GuestLayoutProps {
  children: React.ReactNode;
}

export default function GuestLayout(props: GuestLayoutProps) {
  const { children } = props;

  return (
    <SurveyProgressContextProvider defaultStep="gift-check-phone" storeName="gift-progress-storage">
      <GiftResetOnRefresh>{children}</GiftResetOnRefresh>
    </SurveyProgressContextProvider>
  );
}
