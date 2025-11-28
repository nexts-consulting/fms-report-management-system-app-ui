"use client";

import { useAuthContext } from "@/contexts/auth.context";
import { SurveyProgressContextProvider } from "@/contexts/survey-progress.context";
import { SurveyResetOnRefresh } from "@/components/SurveyResetOnRefresh";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";

interface GuestLayoutProps {
  children: React.ReactNode;
}

export default function GuestLayout(props: GuestLayoutProps) {
  const { children } = props;

  return (
    <SurveyProgressContextProvider defaultStep="info" storeName="survey-progress-storage">
      <SurveyResetOnRefresh>{children}</SurveyResetOnRefresh>
    </SurveyProgressContextProvider>
  );
}
