"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { LoadingOverlay } from "@/kits/components/loading-overlay";
import { useParams, useRouter } from "next/navigation";
import { useReportDefinition } from "@/contexts/report-definition.context";
import { Button } from "@/kits/components/button";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";
import { TextInput } from "@/kits/components/text-input";
import { format } from "date-fns";

export default function ReportPage() {
  const router = useRouter();
  
  const params = useParams();

  const INITIAL_PAGE_SIZE = 10;
  const PAGE_SIZE_INCREMENT = 10;
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE);
  const [selectedDate, setSelectedDate] = useState(new Date());
  

  const reportId = params?.report_id as string;
  const { buildPath } = useTenantProjectPath();
  
  const { data: reportDefinition, isLoading, error } = useReportDefinition(reportId);

  const hasError = !!error;
  
  const hasData = !!reportDefinition;


  const dateString = useMemo(() => {
    return format(selectedDate, "yyyy-MM-dd");
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setSelectedDate(date);
    setPageSize(INITIAL_PAGE_SIZE);
  };

  useEffect(() => {
    setPageSize(INITIAL_PAGE_SIZE);
  }, [dateString]);

  return (
    <>
      <LoadingOverlay active={isLoading} />
      <ScreenHeader
        title={`Báo cáo ${reportDefinition?.name || ''}`}
        onBack={() => router.back()}
      />
      <div className="flex flex-col gap-4 p-4 pt-0">
        {hasData && !hasError && (
          <>
            <div className="flex items-center justify-end">
              <Button
                className="w-full"
                onClick={() => router.push(buildPath(`/report/${reportId}/create`))}
                variant="primary"
                size="medium"
                centered
              >
                Tạo báo cáo
              </Button>
            </div>
            <div className="flex w-full items-center gap-4">
              <div className="flex-1">
                <TextInput
                  type="date"
                  value={dateString}
                  onChange={handleDateChange}
                  className="w-full border border-gray-200"
                />
              </div>
              <div className="shrink-0">
                <Button
                  variant="tertiary"
                  size="medium"
                  centered
                  // onClick={() => fetchCustomerList()}
                >
                  Làm mới dữ liệu
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      
    </>
  );
}