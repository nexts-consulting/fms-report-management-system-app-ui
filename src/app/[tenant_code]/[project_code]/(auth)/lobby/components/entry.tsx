"use client";

import { ScreenFooter } from "@/components/ScreenFooter";
import { UserHeader } from "@/components/UserHeader";
import { useAuthContext } from "@/contexts/auth.context";
import { useGlobalContext } from "@/contexts/global.context";
import { Icons } from "@/kits/components/Icons";
import { StyleUtil } from "@/kits/utils";
import { EUserAccountRole } from "@/types/model";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";

export const Entry = () => {
  const authStore = useAuthContext();
  const user = authStore.use.user();

  const globalStore = useGlobalContext();
  const selectedAdminDivision = globalStore.use.selectedAdminDivision();
  const selectedLocation = globalStore.use.selectedLocation();
  const currentAttendance = globalStore.use.currentAttendance();

  const searchParams = useSearchParams();

  const router = useRouter();
  const { buildPath } = useTenantProjectPath();

  React.useEffect(() => {
    if (searchParams.get("force") === "true") {
      globalStore.setState({
        selectedWorkingShift: null,
        currentAttendance: null,
      });
      return;
    }

    if (currentAttendance) {
      router.replace(buildPath("/attendance/tracking"));
    }
  }, [currentAttendance]);

  React.useEffect(() => {
    if (!selectedAdminDivision || !selectedLocation) {
      router.replace(buildPath("/outlet"));
    }
  }, [selectedAdminDivision, selectedLocation]);

  return (
    <>
      <UserHeader
        name={user?.fullName ?? ""}
        code={user?.staffCode ?? ""}
        avatar={user?.profileImage ?? ""}
      />

      <div className="px-4">
        {/* Location Info Card */}
        {selectedAdminDivision && selectedLocation && (
          <div className="mt-4 w-full bg-white px-4 py-3">
            <div className="space-y-2 divide-y divide-gray-30">
              <div className="flex items-start gap-3 pb-2">
                <Icons.Location className="mt-0.5 h-4 w-4 shrink-0 text-gray-50" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-50">Địa điểm</p>
                  <p className="mt-0.5 line-clamp-2 text-sm font-medium text-gray-100">
                    {selectedLocation?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 pt-2">
                <Icons.Map className="mt-0.5 h-4 w-4 shrink-0 text-gray-50" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-50">Địa chỉ</p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-gray-70">
                    {selectedLocation?.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tile */}
        <div className="mt-4 w-full bg-white px-4 py-6">
          <button
            type="button"
            className={StyleUtil.cn(
              "block w-full bg-white p-4 text-left hover:bg-gray-10",
              "outline outline-1 -outline-offset-1 outline-gray-30",
              "focus:bg-gray-10 focus:outline-primary-60",
            )}
            onClick={() => router.push(buildPath("/shift"))}
          >
            <div className="mb-8">
              <p className="text-sm">Bắt đầu ca làm việc</p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Icons.TaskLocation className="h-6 w-6 shrink-0 text-gray-50" />
              <Icons.ArrowRight className="h-6 w-6 shrink-0 text-primary-60" />
            </div>
          </button>
          <button
            type="button"
            className={StyleUtil.cn(
              "block w-full bg-white p-4 text-left hover:bg-gray-10",
              "outline outline-1 -outline-offset-1 outline-gray-30",
              "focus:bg-gray-10 focus:outline-primary-60",
            )}
            onClick={() => router.push(buildPath("/outlet"))}
          >
            <div className="mb-8">
              <p className="text-sm">Thay đổi địa điểm</p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Icons.Location className="h-6 w-6 shrink-0 text-gray-50" />
              <Icons.ArrowRight className="h-6 w-6 shrink-0 text-primary-60" />
            </div>
          </button>
        </div>
      </div>

      <ScreenFooter />
    </>
  );
};
