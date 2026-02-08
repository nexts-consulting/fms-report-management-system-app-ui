"use client";

import React from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { LoadingOverlay } from "@/kits/components/loading-overlay";
import { useParams, useRouter } from "next/navigation";
import { useFormDefinition } from "@/contexts/form-definition.context";
import { useGlobalContext } from "@/contexts/global.context";
import { IframeFormViewer } from "@/components/IframeFormViewer";

export default function FormPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params?.form_id as string;

  // Get form definition
  const { data: formDefinition, isLoading, error } = useFormDefinition(formId);

  // Get current attendance from global store
  const globalStore = useGlobalContext();
  const currentAttendance = globalStore.use.currentAttendance();

  const hasError = !!error;
  const hasData = !!formDefinition;

  return (
    <>
      <LoadingOverlay active={isLoading} />
      <ScreenHeader
        title={formDefinition?.name || "Form"}
        onBack={() => router.back()}
      />
      <div className="flex flex-col h-[calc(100vh-60px)]">
        {hasError && (
          <div className="flex items-center justify-center h-full p-4">
            <div className="max-w-md text-center">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không thể tải form
              </h3>
              <p className="text-sm text-gray-600">
                {error?.message || "Đã xảy ra lỗi khi tải cấu hình form"}
              </p>
            </div>
          </div>
        )}

        {hasData && !hasError && formDefinition.app_url && (
          <IframeFormViewer
            appUrl={formDefinition.app_url}
            currentAttendance={currentAttendance}
            formName={formDefinition.name}
          />
        )}

        {hasData && !hasError && !formDefinition.app_url && (
          <div className="flex items-center justify-center h-full p-4">
            <div className="max-w-md text-center">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Thiếu cấu hình
              </h3>
              <p className="text-sm text-gray-600">
                Form chưa được cấu hình app_url. Vui lòng liên hệ quản trị viên.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
