"use client";

import React from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { LoadingOverlay } from "@/kits/components/loading-overlay";
import { useParams, useRouter } from "next/navigation";
import { useReportDefinition } from "@/contexts/report-definition.context";
import { Button } from "@/kits/components/button";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";

export default function ReportPage() {
  const router = useRouter();
  
  const params = useParams();
  const reportId = params?.report_id as string;
  const { buildPath } = useTenantProjectPath();
  
  const { data: reportDefinition, isLoading, error } = useReportDefinition(reportId);

  const hasError = !!error;
  const hasData = !!reportDefinition;

  return (
    <>
      <LoadingOverlay active={isLoading} />
      <ScreenHeader
        title={`Báo cáo ${reportDefinition?.name || ''}`}
        onBack={() => router.back()}
      />
      <div className="flex flex-col gap-4 p-4 pt-0">
        {hasData && !hasError && (
          <div>
            <Button
              onClick={() => router.push(buildPath(`/report/${reportId}/create`))}
              variant="primary"
              size="medium"
              centered
            >
              Thêm dữ liệu
            </Button>
          </div>
        )}
      </div>
    </>
  );
}