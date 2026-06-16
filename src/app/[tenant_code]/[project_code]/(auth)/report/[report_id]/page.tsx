"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { useGlobalContext } from "@/contexts/global.context";
import { useMutationDeleteReportEntry } from "@/services/api/application/report-entry/delete";
import { useNotification } from "@/kits/components/notification";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";

export default function ReportPage() {
  const router = useRouter();
  const globalStore = useGlobalContext();
  const notification = useNotification();
  const currentAttendance = globalStore.use.currentAttendance();

  const params = useParams();

  const INITIAL_PAGE_SIZE = 50;
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<ReportEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<ReportEntry | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [openActionEntryId, setOpenActionEntryId] = useState<string | null>(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preventClickRef = useRef(false);

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
  const {
    data: entriesData,
    isLoading: isLoadingEntries,
    refetch,
  } = useQueryReportEntries({
    params: {
      tableName: dataSourceConfig?.table_name || "",
      schema: dataSourceConfig?.schema || "public",
      date: dateString,
      attendanceId: currentAttendance?.id?.toString(),
      page: 0,
      size: pageSize,
    },
    config: {
      enabled:
        !!dataSourceConfig?.table_name &&
        reportDefinition?.data_source_type === "table" &&
        !!currentAttendance?.id,
    },
  });

  const entries = useMemo(() => {
    return entriesData?.data || [];
  }, [entriesData]);

  const totalEntries = entriesData?.total || 0;

  const deleteReportEntryMutation = useMutationDeleteReportEntry();

  // Generate label from entry data using entryLabelColumn
  const getEntryLabel = (entry: ReportEntry): string => {
    if (!formConfig?.entryLabelColumn || !entry.data) {
      return entry.entry_label || entry.unique_value || entry.id;
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
    refetch();
  };

  const clearLongPressTimer = () => {
    if (!longPressTimerRef.current) return;
    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  };

  const startLongPress = (entryId: string) => {
    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      preventClickRef.current = true;
      setOpenActionEntryId(entryId);
    }, 500);
  };

  const handleEntryClick = (entry: ReportEntry) => {
    if (preventClickRef.current) {
      preventClickRef.current = false;
      return;
    }

    if (openActionEntryId === entry.id) {
      setOpenActionEntryId(null);
      return;
    }

    setSelectedEntry(entry);
  };

  const handleTouchStart = (e: React.TouchEvent, entryId: string) => {
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    preventClickRef.current = false;
    startLongPress(entryId);
  };

  const handleTouchMove = (e: React.TouchEvent, entryId: string) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;

    // Stop long press detection if user starts moving.
    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
      clearLongPressTimer();
    }

    if (Math.abs(deltaX) < Math.abs(deltaY)) return;

    if (deltaX < -50) {
      preventClickRef.current = true;
      setOpenActionEntryId(entryId);
    } else if (deltaX > 40 && openActionEntryId === entryId) {
      preventClickRef.current = true;
      setOpenActionEntryId(null);
    }
  };

  const handleTouchEnd = () => {
    clearLongPressTimer();
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete || !dataSourceConfig?.table_name) return;

    try {
      await deleteReportEntryMutation.mutateAsync({
        tableName: dataSourceConfig.table_name,
        schema: dataSourceConfig.schema || "public",
        id: entryToDelete.id,
      });

      notification.success({
        title: "Thành công",
        description: "Đã xóa dữ liệu báo cáo.",
      });

      setEntryToDelete(null);
      setShowDeleteConfirmDialog(false);
      await refetch();
    } catch (deleteError) {
      notification.error({
        title: "Xóa thất bại",
        description:
          deleteError instanceof Error
            ? deleteError.message
            : "Không thể xóa dữ liệu báo cáo. Vui lòng thử lại.",
      });
    }
  };

  useEffect(() => {
    setPageSize(INITIAL_PAGE_SIZE);
  }, [dateString]);

  useEffect(() => {
    return () => clearLongPressTimer();
  }, []);

  return (
    <>
      <LoadingOverlay active={isLoading || isLoadingEntries} />
      <ScreenHeader title={`${reportDefinition?.name || ""}`} onBack={() => router.back()} />
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
                <Button variant="tertiary" size="medium" centered onClick={handleRefresh}>
                  Làm mới dữ liệu
                </Button>
              </div>
            </div>

            {/* Entries List */}
            {reportDefinition?.data_source_type === "table" && dataSourceConfig?.table_name && (
              <div className="flex flex-col gap-4">
                {entries.length === 0 && !isLoadingEntries && (
                  <div className="py-8 text-center text-gray-500">
                    Không có dữ liệu báo cáo cho ngày đã chọn
                  </div>
                )}

                {entries.map((entry) => {
                  const isActionOpen = openActionEntryId === entry.id;

                  return (
                    <div
                      key={entry.id}
                      className="relative overflow-hidden border bg-white"
                      onTouchStart={(e) => handleTouchStart(e, entry.id)}
                      onTouchMove={(e) => handleTouchMove(e, entry.id)}
                      onTouchEnd={handleTouchEnd}
                      onMouseDown={() => startLongPress(entry.id)}
                      onMouseUp={clearLongPressTimer}
                      onMouseLeave={clearLongPressTimer}
                    >
                      <div className="absolute inset-y-0 right-0 flex w-36">
                        <button
                          type="button"
                          className="flex-1 bg-gray-500 text-xs font-medium text-white"
                          onClick={() => router.push(buildPath(`/report/${reportId}/edit/${entry.id}`))}
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          type="button"
                          className="flex-1 bg-red-500 text-xs font-medium text-white"
                          onClick={() => {
                            setEntryToDelete(entry);
                            setShowDeleteConfirmDialog(true);
                            setOpenActionEntryId(null);
                          }}
                        >
                          Xóa
                        </button>
                      </div>

                      <div
                        className={`cursor-pointer bg-white p-4 transition-transform duration-200 hover:shadow-md ${
                          isActionOpen ? "-translate-x-36" : "translate-x-0"
                        }`}
                        onClick={() => handleEntryClick(entry)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setOpenActionEntryId(entry.id);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="mb-1 text-sm font-semibold text-gray-600">
                              {getEntryLabel(entry)}
                            </h3>
                            <p className="mb-2 text-xs text-gray-800">
                              Người tạo: {entry.user_full_name || entry.created_by}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-right">
                            <p className="text-xs text-gray-500">
                              {format(new Date(entry.created_at), "dd/MM/yyyy HH:mm")}
                            </p>
                            <Icons.ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Show total count */}
                {entries.length > 0 && (
                  <div className="py-2 text-center text-sm text-gray-500">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden bg-white">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900">Chi tiết báo cáo</h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <Icons.Close className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[calc(90vh-160px)] overflow-y-auto">
              <div className="space-y-4 p-4">
                {/* Thông tin báo cáo */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">Thông tin báo cáo</h4>
                  <div className="space-y-2 border border-gray-200 p-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Người tạo:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedEntry.user_full_name || selectedEntry.created_by}
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
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">Dữ liệu báo cáo</h4>
                  <ReportEntryDetailView data={selectedEntry.data} formConfig={formConfig} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-gray-200 p-4">
              <Button
                variant="danger"
                onClick={() => {
                  setEntryToDelete(selectedEntry);
                  setShowDeleteConfirmDialog(true);
                }}
                className="w-full"
                disabled={deleteReportEntryMutation.isLoading}
              >
                {deleteReportEntryMutation.isLoading ? "Đang xóa..." : "Xóa"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  router.push(buildPath(`/report/${reportId}/edit/${selectedEntry.id}`));
                  setSelectedEntry(null);
                }}
                className="w-full"
              >
                Sửa
              </Button>
              
              <Button variant="tertiary" onClick={() => setSelectedEntry(null)} className="w-full">
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
      <ConfirmationDialog
        isOpen={showDeleteConfirmDialog}
        title="Xác nhận xóa dữ liệu"
        description="Bạn có chắc chắn muốn xóa dữ liệu báo cáo này không?"
        confirmLabel="Xóa dữ liệu"
        cancelLabel="Hủy bỏ"
        loading={deleteReportEntryMutation.isLoading}
        onCancel={() => {
          setShowDeleteConfirmDialog(false);
          setEntryToDelete(null);
        }}
        onConfirm={handleDeleteEntry}
      />
    </>
  );
}
