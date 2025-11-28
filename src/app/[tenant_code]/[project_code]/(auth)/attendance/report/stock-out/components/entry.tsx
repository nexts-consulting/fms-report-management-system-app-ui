"use client";

import { ScreenHeader } from "@/components/ScreenHeader";
import { useNotification } from "@/kits/components/Notification";
import { useQueryReportItemsListByReportType } from "@/services/api/report-items/list-by-report-type";
import { IReportItem } from "@/types/model";
import { useRouter } from "next/navigation";
import { FieldErrors, useForm, useWatch } from "react-hook-form";
import React from "react";
import { Button } from "@/kits/components/Button";
import { StyleUtil } from "@/kits/utils";
import { NotificationBanner } from "@/kits/components/NotificationBanner";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { useGlobalContext } from "@/contexts/global.context";
import { useMutationCreateStockOutReport } from "@/services/api/reports/stock-out-report";
import { useQueryClient } from "react-query";

interface FormValues {
  items: {
    [sku: string]: {
      pcs: number;
    };
  };
}

interface ReportItem {
  sku: string;
  pcs: number;
}

export const Entry = () => {
  const globalStore = useGlobalContext();
  const currentAttendance = globalStore.use.currentAttendance();

  const router = useRouter();
  const notification = useNotification();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormValues>({
    defaultValues: React.useMemo(() => {
      if (!currentAttendance?.stockOutReport?.data) {
        return { items: {} };
      }

      // Transform array data to object format
      const items = currentAttendance.stockOutReport.data.reduce(
        (acc, item) => ({
          ...acc,
          [item.sku]: {
            pcs: item.pcs,
          },
        }),
        {},
      );

      return { items };
    }, [currentAttendance?.stockOutReport]),
  });

  const submitStatusNotifyIdRef = React.useRef<string | null>(null);

  // Watch all form values
  const formValues = useWatch({
    control,
  });

  const reportItemsQuery = useQueryReportItemsListByReportType({
    params: {
      reportType: "OOS",
    },
    config: {
      enabled: true,
      onError: (error) => {
        notification.error({
          title: "Lỗi hệ thống",
          description: "Không thể tải danh sách sản phẩm",
          options: {
            duration: 5000,
          },
        });
      },
    },  
  });

  const createOOSReportMutation = useMutationCreateStockOutReport({
    config: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["query/attendance/current-shift"],
          exact: false,
        });

        if (submitStatusNotifyIdRef.current) {
          notification.update(submitStatusNotifyIdRef.current, {
            type: "success",
            title: "Lưu thành công",
            description: "Báo cáo Tồn cuối ca đã được lưu thành công",
            options: {
              duration: 10000,
            },
          });
        }
      },
      onError: () => {
        if (submitStatusNotifyIdRef.current) {
          notification.update(submitStatusNotifyIdRef.current, {
            type: "error",
            title: "Lỗi hệ thống",
            description: "Không thể lưu báo cáo. Vui lòng thử lại sau.",
            options: {
              duration: 10000,
            },
          });
        }
      },
    },
  });

  // Group items by brand
  const groupedItems = React.useMemo(() => {
    if (!reportItemsQuery.data?.data) return {};

    return reportItemsQuery.data.data.reduce(
      (acc, item) => {
        if (!acc[item.brand]) {
          acc[item.brand] = [];
        }
        acc[item.brand].push(item);
        return acc;
      },
      {} as Record<string, IReportItem[]>,
    );
  }, [reportItemsQuery.data]);

  const onFormSubmit = (data: FormValues) => {
    if (!currentAttendance?.id) return;

    // Transform data to array format with additional properties
    const reportItems: ReportItem[] = Object.entries(data.items)
      .map(([sku, value]) => {
        const item = reportItemsQuery.data?.data.find((item) => item.skuCode === sku);
        if (!item) return null;

        return {
          sku: item.skuCode,
          pcs: value.pcs,
        };
      })
      .filter(Boolean) as ReportItem[];

    notification.clear();
    submitStatusNotifyIdRef.current = notification.pending({
      title: "Đang lưu báo cáo",
      description: "Vui lòng đợi trong giây lát",
      options: {
        immortal: true,
      },
    });

    createOOSReportMutation.mutate({
      attendanceId: currentAttendance.id,
      data: reportItems,
    });
  };

  const onFormError = (error: FieldErrors<FormValues>) => {
    // Get all error messages
    const errorMessages = Object.entries(error.items || {}).reduce(
      (acc: string[], [sku, itemError]) => {
        if (itemError?.pcs) {
          const item = reportItemsQuery.data?.data.find((item) => item.skuCode === sku);
          if (item) {
            acc.push(`${item.name} (${sku})`);
          }
        }
        return acc;
      },
      [],
    );

    if (errorMessages.length > 0) {
      notification.warning({
        title: "Cảnh báo",
        description: `Vui lòng nhập số lượng cho tẩt các sản phẩm (có thể nhập 0)`,
        options: {
          duration: 5000,
        },
      });
    }
  };

  React.useEffect(() => {
    return () => {
      notification.clear();
    };
  }, []);

  return (
    <>
      <LoadingOverlay active={createOOSReportMutation.isLoading} />

      <ScreenHeader
        title="Báo cáo tồn cuối ca"
        loading={reportItemsQuery.isLoading}
        onBack={() => router.back()}
      />

      <div className="mb-4 space-y-2 px-4">
        <NotificationBanner
          title="Tips"
          description="Bạn có thể cập nhật lại báo cáo, vui lòng kiểm tra kỹ lưỡng trước khi lưu."
          type="info"
        />
      </div>

      <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="flex h-full flex-col">
        <div className="mb-32">
          <div className="flex-1 overflow-auto p-4">
            {Object.entries(groupedItems).map(([brand, items]) => (
              <div key={brand} className="mb-6">
                <h3 className="mb-3 text-base font-semibold text-gray-800">{brand}</h3>
                <div className="bg-white">
                  <div className="divide-y divide-gray-200">
                    {items.map((item) => {
                      const hasValue =
                        formValues?.items?.[item.skuCode]?.pcs !== undefined &&
                        formValues?.items?.[item.skuCode]?.pcs !== null &&
                        !Number.isNaN(formValues?.items?.[item.skuCode]?.pcs);

                      return (
                        <div key={item.id} className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">SKU: {item.skuCode}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">{item.unit}</span>
                              <input
                                type="number"
                                min="0"
                                {...register(`items.${item.skuCode}.pcs`, {
                                  valueAsNumber: true,
                                  required: "Bắt buộc",
                                  min: 0,
                                  validate: (value) =>
                                    (value !== undefined && value !== null) ||
                                    "Bắt buộc nhập số lượng",
                                })}
                                className={StyleUtil.cn(
                                  "w-20 border px-3 py-2 font-medium text-green-50 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-primary-50",
                                  {
                                    "border-red-500": errors.items?.[item.skuCode]?.pcs,
                                    "border-gray-300": !errors.items?.[item.skuCode]?.pcs,
                                    "border-green-30 bg-green-10/10": hasValue,
                                  },
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {Object.keys(groupedItems).length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4">
            <Button
              type="submit"
              disabled={createOOSReportMutation.isLoading}
              variant={"primary"}
              className="w-full"
              centered
            >
              {createOOSReportMutation.isLoading ? "Đang lưu báo cáo" : "Lưu báo cáo"}
            </Button>
          </div>
        )}
      </form>
    </>
  );
};
