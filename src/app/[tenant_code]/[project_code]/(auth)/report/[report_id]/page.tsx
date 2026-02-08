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
import { ReportEntryDetailView } from "@/components/ReportEntryDetailView";
import { Icons } from "@/kits/components/icons";

export default function ReportPage() {
  const router = useRouter();
  
  const params = useParams();

  const INITIAL_PAGE_SIZE = 50;
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<ReportEntry | null>(null);

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
        title={`${reportDefinition?.name || ''}`}
        onBack={() => router.back()}
      />
      <div className="flex flex-col gap-4 p-4 pt-8">
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
                    className="border 200 p-4 bg-white cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-600 mb-1">
                          {getEntryLabel(entry)}
                        </h3>
                        <p className="text-xs text-gray-800 mb-2">
                          Người tạo: {entry.created_by}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <p className="text-xs text-gray-500">
                          {format(new Date(entry.created_at), "dd/MM/yyyy HH:mm")}
                        </p>
                        <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
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

      {/* Modal chi tiết báo cáo */}
      {selectedEntry && formConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-gray-900 font-semibold">Chi tiết báo cáo</h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icons.Close className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
              <div className="p-4 space-y-4">
                {/* Thông tin báo cáo */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Thông tin báo cáo
                  </h4>
                  <div className="space-y-2 border border-gray-200 p-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Người tạo:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedEntry.created_by}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Thời gian tạo:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {format(new Date(selectedEntry.created_at), "dd/MM/yyyy HH:mm")}
                      </span>
                    </div>
                    {selectedEntry.updated_by && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Người cập nhật:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedEntry.updated_by}
                        </span>
                      </div>
                    )}
                    {selectedEntry.updated_at && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Thời gian cập nhật:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {format(new Date(selectedEntry.updated_at), "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dữ liệu báo cáo */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Dữ liệu báo cáo
                  </h4>
                  <ReportEntryDetailView data={selectedEntry.data} formConfig={formConfig} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4">
              <Button
                variant="tertiary"
                onClick={() => setSelectedEntry(null)}
                className="w-full"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}