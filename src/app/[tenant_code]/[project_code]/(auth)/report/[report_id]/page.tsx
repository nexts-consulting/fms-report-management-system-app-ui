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
import { useQueryReportEntries, ReportEntry } from "@/services/api/application/report-entry/list";
import { FormConfig } from "@/components/DynamicForm/types";

export default function ReportPage() {
  const router = useRouter();
  
  const params = useParams();

  const INITIAL_PAGE_SIZE = 50;
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

  // Get data source config
  const dataSourceConfig = useMemo(() => {
    if (!reportDefinition?.data_source_config) return null;
    return reportDefinition.data_source_config as {
      schema?: string;
      table_name: string;
      primary_key?: string;
    };
  }, [reportDefinition?.data_source_config]);

  // Get form config to access entryLabelColumn
  const formConfig = useMemo(() => {
    if (!reportDefinition?.form_definition) return null;
    return reportDefinition.form_definition as FormConfig;
  }, [reportDefinition?.form_definition]);

  // Query report entries
  const { data: entriesData, isLoading: isLoadingEntries, isFetching } = useQueryReportEntries({
    params: {
      tableName: dataSourceConfig?.table_name || "",
      schema: dataSourceConfig?.schema || "public",
      date: dateString,
      page: 0,
      size: pageSize,
    },
    config: {
      enabled: !!dataSourceConfig?.table_name && reportDefinition?.data_source_type === "table",
    },
  });

  const entries = useMemo(() => {
    return entriesData?.data || [];
  }, [entriesData]);

  const totalEntries = entriesData?.total || 0;

  // Generate label from entry data using entryLabelColumn
  const getEntryLabel = (entry: ReportEntry): string => {
    if (!formConfig?.entryLabelColumn || !entry.data) {
      return entry.unique_value || entry.id;
    }

    const labelColumns = formConfig.entryLabelColumn;
    const labelParts: string[] = [];

    for (const column of labelColumns) {
      const value = entry.data[column];
      if (value !== null && value !== undefined && value !== "") {
        labelParts.push(String(value));
      }
    }

    return labelParts.length > 0 ? labelParts.join(" - ") : entry.unique_value || entry.id;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setSelectedDate(date);
    setPageSize(INITIAL_PAGE_SIZE);
  };

  const handleRefresh = () => {
    setPageSize(INITIAL_PAGE_SIZE);
  };

  useEffect(() => {
    setPageSize(INITIAL_PAGE_SIZE);
  }, [dateString]);

  return (
    <>
      <LoadingOverlay active={isLoading || isLoadingEntries} />
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
                  onClick={handleRefresh}
                >
                  Làm mới dữ liệu
                </Button>
              </div>
            </div>

            {/* Entries List */}
            {reportDefinition?.data_source_type === "table" && dataSourceConfig?.table_name && (
              <div className="flex flex-col gap-4">
                {entries.length === 0 && !isLoadingEntries && (
                  <div className="text-center text-gray-500 py-8">
                    Không có dữ liệu báo cáo cho ngày đã chọn
                  </div>
                )}

                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-gray-200 p-4 shadow-sm bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">
                          {getEntryLabel(entry)}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">
                          Người tạo: {entry.created_by}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {format(new Date(entry.created_at), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Show total count */}
                {entries.length > 0 && (
                  <div className="text-center text-sm text-gray-500 py-2">
                    Hiển thị {entries.length} / {totalEntries} bản ghi
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}