"use client";
import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ErrorBoundary } from "react-error-boundary";
import { NotificationProvider } from "@/kits/components/Notification";
import { AuthContextProvider } from "@/contexts/auth.context";
import { GlobalContextProvider } from "@/contexts/global.context";
import { Content } from "./content";
import { ProjectThemeProvider } from "@/components/shared/project-theme-provider";
import moment from "moment";
import "moment/locale/vi";

moment.locale("vi");

const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = (props: ProvidersProps) => {
  const { children } = props;

  return (
    <Suspense>
      <ErrorBoundary FallbackComponent={() => <></>}>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider placement="top-center">
            <AuthContextProvider>
              <GlobalContextProvider>
                <ProjectThemeProvider>
                  <Content>{children}</Content>
                </ProjectThemeProvider>
              </GlobalContextProvider>
            </AuthContextProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </Suspense>
  );
};

export default Providers;
