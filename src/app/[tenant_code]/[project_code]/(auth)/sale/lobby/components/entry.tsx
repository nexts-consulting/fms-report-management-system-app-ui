"use client";

import { UserHeader } from "@/components/UserHeader";
import { useAuthContext } from "@/contexts/auth.context";
import { Icons } from "@/kits/components/Icons";
import { StyleUtil } from "@/kits/utils";
import { useRouter } from "next/navigation";

export const Entry = () => {
  const authStore = useAuthContext();
  const user = authStore.use.user();

  const router = useRouter();

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
            onClick={() => router.push("/sale/attendances")}
          >
            <div className="mb-8">
              <p className="text-sm">Theo dõi ca làm việc</p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Icons.Credentials className="h-6 w-6 shrink-0 text-gray-50" />
              <Icons.ArrowRight className="h-6 w-6 shrink-0 text-primary-60" />
            </div>
          </button>
        </div>
      </div>
    </>
  );
};
