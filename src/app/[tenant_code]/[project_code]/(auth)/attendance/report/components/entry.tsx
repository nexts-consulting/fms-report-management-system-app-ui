"use client";

import { ScreenHeader } from "@/components/ScreenHeader";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";
import { Icons } from "@/kits/components/Icons";
import { StyleUtil } from "@/kits/utils";
import { useRouter } from "next/navigation";

export const Entry = () => {
  const router = useRouter();
  const { buildPath } = useTenantProjectPath();

  return (
    <>
      <ScreenHeader
        title="Tạo báo cáo"
        loading={false}
        onBack={() => router.replace(buildPath("/attendance/tracking"))}
      />

      <div className="px-4">
        {/* Tile */}
        <div className="mt-4 w-full bg-white px-4 py-12">
          {/* OOS Report */}
          <button
            type="button"
            className={StyleUtil.cn(
              "block w-full bg-white p-4 text-left hover:bg-gray-10",
              "outline outline-1 -outline-offset-1 outline-gray-30",
              "focus:bg-gray-10 focus:outline-primary-60",
            )}
            onClick={() => router.push("/attendance/report/stock-in")}
          >
            <div className="mb-8">
              <p className="text-sm">Báo cáo Tồn đầu ca</p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Icons.TaskAdd className="h-6 w-6 shrink-0 text-gray-50" />
              <Icons.ArrowRight className="h-6 w-6 shrink-0 text-primary-60" />
            </div>
          </button>
          {/* Sales Report */}
          <button
            type="button"
            className={StyleUtil.cn(
              "block w-full bg-white p-4 text-left hover:bg-gray-10",
              "outline outline-1 -outline-offset-1 outline-gray-30",
              "focus:bg-gray-10 focus:outline-primary-60",
            )}
            onClick={() => router.push("/attendance/report/sales")}
          >
            <div className="mb-8">
              <p className="text-sm">Báo cáo bán hàng</p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Icons.TaskAdd className="h-6 w-6 shrink-0 text-gray-50" />
              <Icons.ArrowRight className="h-6 w-6 shrink-0 text-primary-60" />
            </div>
          </button>
          {/* Sampling Report */}
          <button
            type="button"
            className={StyleUtil.cn(
              "block w-full bg-white p-4 text-left hover:bg-gray-10",
              "outline outline-1 -outline-offset-1 outline-gray-30",
              "focus:bg-gray-10 focus:outline-primary-60",
            )}
            onClick={() => router.push("/attendance/report/sampling")}
          >
            <div className="mb-8">
              <p className="text-sm">Báo cáo sampling</p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Icons.TaskAdd className="h-6 w-6 shrink-0 text-gray-50" />
              <Icons.ArrowRight className="h-6 w-6 shrink-0 text-primary-60" />
            </div>
          </button>
        </div>
      </div>
    </>
  );
};
