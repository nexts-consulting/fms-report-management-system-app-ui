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
  const selectedProvince = globalStore.use.selectedProvince();
  const selectedOutlet = globalStore.use.selectedOutlet();
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
    if (!selectedProvince || !selectedOutlet) {
      router.replace(buildPath("/outlet"));
    }
  }, [selectedProvince, selectedOutlet]);

  return (
    <>
      <UserHeader
        name={user?.fullName ?? ""}
        code={user?.staffCode ?? ""}
        avatar={user?.profileImage ?? ""}
      />

      <div className="px-4">
        {/* Tile */}
        <div className="mt-4 w-full bg-white px-4 py-12">
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
