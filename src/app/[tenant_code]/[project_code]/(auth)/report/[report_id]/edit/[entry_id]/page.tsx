"use client";

import React from "react";
import { DynamicForm } from "@/components/DynamicForm";
import { ScreenHeader } from "@/components/ScreenHeader";
import { LoadingOverlay } from "@/kits/components/loading-overlay";
import { useRouter, useParams } from "next/navigation";
import { hydrateFormConfig } from "@/components/DynamicForm/formConfigSerializer";
import { useReportDefinition } from "@/contexts/report-definition.context";
import { useAuthContext } from "@/contexts/auth.context";
import { useNotification } from "@/kits/components/notification";
import { useMutationUpdateReportEntry } from "@/services/api/application/report-entry/update";
import { useQueryReportEntryById } from "@/services/api/application/report-entry/get";

export default function EditReportEntryPage() {
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [isReady, setIsReady] = React.useState(false);
  const router = useRouter();
  const params = useParams();
  const reportId = params?.report_id as string;
  const entryId = params?.entry_id as string;
  const authStore = useAuthContext();
  const user = authStore.use.user();
  const notification = useNotification();

  const { data: reportDefinition, isLoading, error } = useReportDefinition(reportId);

  const dataSourceConfig = React.useMemo(() => {
    if (!reportDefinition?.data_source_config) return null;

    return reportDefinition.data_source_config as {
      schema?: string;
      table_name: string;
      primary_key?: string;
    };
  }, [reportDefinition?.data_source_config]);

  const reportEntryQuery = useQueryReportEntryById({
    params: {
      tableName: dataSourceConfig?.table_name || "",
      schema: dataSourceConfig?.schema || "public",
      id: entryId || "",
    },
    config: {
      enabled: !!dataSourceConfig?.table_name && !!entryId,
    },
  });

  const updateReportEntryMutation = useMutationUpdateReportEntry();

  const hydratedFormConfig = React.useMemo(() => {
    if (!reportDefinition?.form_definition) {
      return null;
    }
    return hydrateFormConfig(reportDefinition.form_definition);
  }, [reportDefinition?.form_definition]);

  React.useEffect(() => {
    if (reportEntryQuery.data?.data) {
      setFormData(reportEntryQuery.data.data);
      setIsReady(true);
    }
  }, [reportEntryQuery.data?.data]);

  const handleSubmit = async (data: Record<string, any>) => {
    if (!reportDefinition || !dataSourceConfig?.table_name || !user?.username) {
      notification.error({
        title: "Lỗi",
        description: "Không đủ dữ liệu để cập nhật báo cáo.",
      });
      return;
    }

    try {
      await updateReportEntryMutation.mutateAsync({
        tableName: dataSourceConfig.table_name,
        schema: dataSourceConfig.schema || "public",
        id: entryId,
        data,
        updatedBy: user.username,
      });

      notification.success({
        title: "Thành công",
        description: "Đã cập nhật dữ liệu báo cáo.",
      });

      router.back();
    } catch (err: any) {
      const errorMessage = err?.message || "Không thể cập nhật báo cáo. Vui lòng thử lại.";
      notification.error({
        title: "Cập nhật thất bại",
        description: errorMessage,
      });
    }
  };

  const handleChange = (data: Record<string, any>) => {
    setFormData(data);
  };

  const handleCancel = () => {
    if (reportEntryQuery.data?.data) {
      setFormData(reportEntryQuery.data.data);
    }
  };

  const hasError = !!error || reportEntryQuery.isError;
  const hasData = !!hydratedFormConfig && isReady;

  return (
    <>
      <LoadingOverlay
        active={isLoading || reportEntryQuery.isLoading || updateReportEntryMutation.isLoading}
      />

      <ScreenHeader title={`${reportDefinition?.name || ""} - Chỉnh sửa`} onBack={() => router.back()} />

      <div className="flex flex-col gap-4 p-4 pt-8">
        {hasError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Không thể tải dữ liệu để chỉnh sửa. Vui lòng thử lại.
          </div>
        )}

        {hasData && !hasError && (
          <DynamicForm
            config={hydratedFormConfig}
            values={formData}
            showErrors={true}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            disabled={updateReportEntryMutation.isLoading}
          />
        )}
      </div>
    </>
  );
}
