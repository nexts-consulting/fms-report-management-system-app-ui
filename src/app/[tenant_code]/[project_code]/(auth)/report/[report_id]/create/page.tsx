"use client";

import React from "react";
import { DynamicForm } from "@/components/DynamicForm";
import { FormConfig } from "@/components/DynamicForm/types";
import { ScreenHeader } from "@/components/ScreenHeader";
import { LoadingOverlay } from "@/kits/components/loading-overlay";
import { useRouter, useParams } from "next/navigation";
import { hydrateFormConfig } from "@/components/DynamicForm/formConfigSerializer";
import { useReportDefinition } from "@/contexts/report-definition.context";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";
import { useAuthContext } from "@/contexts/auth.context";
import { useNotification } from "@/kits/components/notification";
import { httpRequestCreateReportEntry } from "@/services/api/application/report-entry/create";

export default function ReportPage() {
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [submittedData, setSubmittedData] = React.useState<Record<string, any> | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const params = useParams();
  const reportId = params?.report_id as string;
  const authStore = useAuthContext();
  const user = authStore.use.user();
  const notification = useNotification();
  
  const { data: reportDefinition, isLoading, error } = useReportDefinition(reportId);

  // Hydrate form config from report definition
  const hydratedFormConfig = React.useMemo(() => {
    if (!reportDefinition?.form_definition) {
      return null;
    }
    return hydrateFormConfig(reportDefinition.form_definition);
  }, [reportDefinition?.form_definition]);

 
  const formConfig = hydratedFormConfig || null;

  const handleSubmit = async (data: Record<string, any>) => {
    if (!reportDefinition || !user?.username) {
      notification.error({
        title: "Lỗi",
        description: "Kiểm tra lại các lỗi",
      });
      return;
    }

    // Check if data_source_type is 'table'
    if (reportDefinition.data_source_type !== "table") {
      notification.error({
        title: "Lỗi",
        description: "Báo cáo này không hỗ trợ lưu dữ liệu. Kiểm tra lại data_source_type",
      });
      return;
    }

    // Get table name from data_source_config
    const dataSourceConfig = reportDefinition.data_source_config as {
      schema?: string;
      table_name: string;
      primary_key?: string;
    } | null;

    if (!dataSourceConfig?.table_name) {
      notification.error({
        title: "Lỗi",
        description: "Không tìm thấy cấu hình bảng dữ liệu. Vui lòng kiểm tra lại cấu hình báo cáo.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await httpRequestCreateReportEntry({
        tableName: dataSourceConfig.table_name,
        schema: dataSourceConfig.schema || "public",
        data,
        createdBy: user.username,
      });

      setSubmittedData(data);
      
      notification.success({
        title: "Thành công",
        description: "Báo cáo đã được lưu thành công",
      });

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err: any) {
      console.error("Error saving report entry:", err);
      
      const errorMessage =
        err?.message || "Có lỗi xảy ra khi lưu báo cáo. Vui lòng thử lại.";
      
      notification.error({
        title: "Lỗi",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (data: Record<string, any>, fieldName: string, value: any) => {
    setFormData(data);
  };

  const handleCancel = () => {
    setFormData({});
    setSubmittedData(null);
  };

  const hasError = !!error;
  const hasData = !!formConfig;

  return (
    <>
      <LoadingOverlay active={isLoading || isSubmitting} />

      <ScreenHeader
        title={`${reportDefinition?.name || ''}`}
        onBack={() => router.back()}
      />
      
      <div className="flex flex-col gap-4 p-4 pt-8">
        {hasData && !hasError && (
          <DynamicForm
            config={formConfig}
            initialValues={formData}
            showErrors={true}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            disabled={isSubmitting}
          />
        )}
      </div>
    </>
  );
}

