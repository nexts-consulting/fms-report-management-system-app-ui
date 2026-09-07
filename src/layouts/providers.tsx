"use client";
import React, { Suspense } from "react";
import { QueryClientProvider } from "react-query";
import { ErrorBoundary } from "react-error-boundary";
import { AxiosError } from "axios";
import { NotificationProvider } from "@/kits/components/notification";
import { AuthContextProvider } from "@/contexts/auth.context";
import { GlobalContextProvider } from "@/contexts/global.context";
import { ProjectConfigProvider } from "@/contexts/project-config.context";
import { ReportDefinitionContextProvider } from "@/contexts/report-definition.context";
import { FormDefinitionContextProvider } from "@/contexts/form-definition.context";
import { AppMenuProvider } from "@/contexts/app-menu.context";
import { DataRefreshProvider } from "@/components/data-refresh/DataRefreshProvider";
import { Content } from "./content";
import { ProjectThemeProvider } from "@/contexts/project-theme.context";
import { queryClient } from "@/libs/react-query/react-query";
import { initObservability, logRenderError } from "@/libs/observability";
import moment from "moment";
import "moment/locale/vi";

moment.locale("vi");

initObservability({ service: "fms-app-ui" });

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = (props: ProvidersProps) => {
  const { children } = props;

  return (
    <Suspense>
      <ErrorBoundary
        FallbackComponent={() => <></>}
        onError={(error, errorInfo) => {
          const isApiErr =
            error instanceof AxiosError ||
            (error &&
              typeof error === "object" &&
              (("code" in error && typeof error.code === "string") ||
                ("message" in error && typeof error.message === "string")));
          
          if (isApiErr) {
            console.log("[ErrorBoundary] Ignoring API error - handled by onError callbacks");
            return;
          }
          console.error("[ErrorBoundary] Unhandled error:", error, errorInfo);
          logRenderError(error, errorInfo);
        }}
      >
        <QueryClientProvider client={queryClient}>
          <NotificationProvider placement="top-center">
            <GlobalContextProvider>
              <AuthContextProvider>
                <DataRefreshProvider>
                  <ProjectConfigProvider>
                    <AppMenuProvider>
                      <ReportDefinitionContextProvider>
                        <FormDefinitionContextProvider>
                          <ProjectThemeProvider>
                            <Content>{children}</Content>
                          </ProjectThemeProvider>
                        </FormDefinitionContextProvider>
                      </ReportDefinitionContextProvider>
                    </AppMenuProvider>
                  </ProjectConfigProvider>
                </DataRefreshProvider>
              </AuthContextProvider>
            </GlobalContextProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </Suspense>
  );
};

export default Providers;
