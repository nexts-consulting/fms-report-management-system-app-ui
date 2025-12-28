"use client";
import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ErrorBoundary } from "react-error-boundary";
import { NotificationProvider } from "@/kits/components/notification";
import { AuthContextProvider } from "@/contexts/auth.context";
import { GlobalContextProvider } from "@/contexts/global.context";
import { ProjectConfigProvider } from "@/contexts/project-config.context";
import { ReportDefinitionContextProvider } from "@/contexts/report-definition.context";
import { AppMenuProvider } from "@/contexts/app-menu.context";
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
            <GlobalContextProvider>
              <AuthContextProvider>
                <ProjectConfigProvider>
                  <AppMenuProvider>
                    <ReportDefinitionContextProvider>
                      <ProjectThemeProvider>
                        <Content>{children}</Content>
                      </ProjectThemeProvider>
                    </ReportDefinitionContextProvider>
                  </AppMenuProvider>
                </ProjectConfigProvider>
              </AuthContextProvider>
            </GlobalContextProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </Suspense>
  );
};

export default Providers;
