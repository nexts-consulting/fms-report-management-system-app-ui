"use client";

import React, { useEffect } from "react";
import { DynamicForm } from "@/components/DynamicForm";
import { ScreenHeader } from "@/components/ScreenHeader";
import { LoadingOverlay } from "@/kits/components/loading-overlay";
import { hydrateFormConfig } from "@/components/DynamicForm/formConfigSerializer";
import { useParams } from "next/navigation";
import { useQueryReportDefinitionPreviewById } from "@/services/api/application/report-definition/get-preview-by-id";

export default function ReportPage() {
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [submittedData, setSubmittedData] = React.useState<Record<string, any> | null>(null);

  const params = useParams();
  const reportId = params?.report_id as string;

  const reportDefinitionPreviewQuery = useQueryReportDefinitionPreviewById({
    params: {
      id: reportId || "",
    },
    config: {
      enabled: !!reportId,
    },
  });

  // Listen for messages from parent (admin UI)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "FORM_UPDATED") {
        refetchForm();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const refetchForm = () => {
    reportDefinitionPreviewQuery.refetch();
  };

  const hydratedJsonConfig = React.useMemo(() => {
    if (!reportDefinitionPreviewQuery.data?.data) {
      return null;
    }
    return hydrateFormConfig(reportDefinitionPreviewQuery.data.data.form_preview_definition);
  }, [reportDefinitionPreviewQuery.data?.data?.form_preview_definition]);

  const formConfig = hydratedJsonConfig;

  const handleSubmit = (data: Record<string, any>) => {
    console.log("Form submitted with data:", data);
    setSubmittedData(data);
  };

  const handleChange = (data: Record<string, any>, fieldName: string, value: any) => {
    setFormData(data);
  };

  const handleCancel = () => {
    setFormData({});
    setSubmittedData(null);
  };

  const isLoading =
    reportDefinitionPreviewQuery.isLoading || reportDefinitionPreviewQuery.isFetching;
  const hasError = reportDefinitionPreviewQuery.isError;
  const hasData = !!formConfig;

  return (
    <>
      <LoadingOverlay active={isLoading} />

      <ScreenHeader title="Preview Mode" />
      <div className="flex flex-col gap-4 p-4 pt-6">
        {hasData && !hasError && (
          <DynamicForm
            config={formConfig}
            initialValues={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
        {submittedData && (
          <div className="mt-4 border bg-white p-4">
            <h3 className="mb-4 text-lg font-semibold">Submitted Data:</h3>
            <pre className="overflow-auto text-sm">{JSON.stringify(submittedData, null, 2)}</pre>
          </div>
        )}
      </div>
    </>
  );
}
