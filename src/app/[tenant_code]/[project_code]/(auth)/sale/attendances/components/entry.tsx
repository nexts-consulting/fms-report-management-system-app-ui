"use client";

import React, { useState } from "react";
import { Icons } from "@/kits/components/Icons";
import { useQueryAttendanceBySale } from "@/services/api/attendance/by-sale";
import moment from "moment";
import { useAuthContext } from "@/contexts/auth.context";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useRouter } from "next/navigation";
import { IOutlet, IStaffAttendance, IWorkingShift } from "@/types/model";
import { IconButton } from "@/kits/components/IconButton";
import { StyleUtil } from "@/kits/utils";
import { useTick } from "@/kits/hooks/use-tick";
import { useNotification } from "@/kits/components/Notification";
import { Modal } from "@/kits/components/Modal";
import { StaffCheckinMap } from "@/kits/widgets/StaffCheckinMap";
import { StaffCheckoutMap } from "@/kits/widgets/StaffCheckoutMap";
import { NotificationBanner } from "@/kits/components/NotificationBanner";

const leaveTypes = [
  { value: "LUNCH_BREAK", label: "Đi ăn trưa/tối" },
  { value: "RESTROOM", label: "Đi vệ sinh" },
  { value: "BREAK_TIME", label: "Giải lao" },
  { value: "GET_SUPPLIES", label: "Lấy hàng/vật dụng" },
  { value: "PRIVATE_TASK", label: "Công việc riêng" },
  { value: "QUICK_MEETING", label: "Họp nhanh với quản lý" },
  { value: "PHONE_CALL", label: "Nghe điện thoại khẩn" },
  { value: "OTHER_REASON", label: "Lý do khác" },
];

interface LeaveHistoryModalProps {
  attendance: IStaffAttendance;
  isOpen: boolean;
  onClose: () => void;
}

const LeaveHistoryModal = React.memo((props: LeaveHistoryModalProps) => {
  const { attendance, isOpen, onClose } = props;

  const [now, controls] = useTick({ unit: "minute" });

  const leaves = React.useMemo(() => {
    if (!attendance?.staffLeaves?.length) return [];
    return [...attendance.staffLeaves].reverse();
  }, [attendance?.staffLeaves]);

  const calculateDuration = (startTime: string, endTime?: string) => {
    const start = moment(startTime);
    const end = endTime ? moment(endTime) : now;
    const duration = moment.duration(end.diff(start));

    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes()) % 60;

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    if (minutes > 0) {
      return `${minutes} phút`;
    }
    return `1 phút`;
  };

  React.useEffect(() => {
    if (isOpen) {
      controls.on();
    } else {
      controls.off();
    }

    return () => {
      controls.off();
    };
  }, [controls, isOpen]);

  if (!leaves.length) {
    return <></>;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <p className="line-clamp-1">
          <span className="mr-3 inline-block h-3 w-3 bg-primary-40" />
          <span>Lịch sử tạm rời vị trí ({leaves.length})</span>
        </p>
      }
      description={
        <div className="mt-2 space-y-1">
          <p className="line-clamp-1 text-sm text-gray-70">
            {attendance.shift.outlet.name}{" "}
            <span className="text-xs text-gray-50">({attendance.shift.outlet.address})</span>
          </p>
          <p className="line-clamp-1 text-sm text-gray-70">
            {attendance.shift.name}{" "}
            <span className="text-xs text-gray-50">
              ({moment(attendance.shift.startTime).format("DD/MM/YYYY")})
            </span>
          </p>
          <p className="line-clamp-1 text-sm text-gray-70">
            {attendance.staff.fullName}{" "}
            <span className="text-xs text-gray-50">[{attendance.staff.staffCode}]</span>
          </p>
        </div>
      }
    >
      <div className="max-h-[60dvh] space-y-2 overflow-y-auto bg-gray-10 p-4">
        {leaves.map((leave) => (
          <div key={leave.id}>
            <div className="bg-white p-4">
              <div className="mb-3 flex items-center justify-start gap-3 bg-white">
                <div className="inline-block h-2 w-2 shrink-0 bg-primary-40" />
                <p className="line-clamp-1 text-sm font-medium">
                  <span>{leaveTypes.find((type) => type.value === leave.leaveType)?.label}</span>{" "}
                  <span className="text-xs text-gray-50">
                    ({calculateDuration(leave.startTime, leave.endTime)})
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-2 divide-x divide-gray-30 text-sm">
                <div className="bg-gray-10 p-2">
                  <p className="mb-1 line-clamp-1 text-xs text-gray-50">Bắt đầu</p>
                  <p className="line-clamp-1 text-sm font-medium">
                    {moment(leave.startTime).format("HH:mm:ss A")}
                  </p>
                </div>
                <div className="bg-gray-10 p-2">
                  <p className="mb-1 line-clamp-1 text-xs text-gray-50">Kết thúc</p>
                  <p className="line-clamp-1 text-sm font-medium">
                    {leave.endTime ? moment(leave.endTime).format("HH:mm:ss A") : "Đang diễn ra"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
});

LeaveHistoryModal.displayName = "LeaveHistoryModal";

interface CheckinModalProps {
  attendance: IStaffAttendance;
  isOpen: boolean;
  onClose: () => void;
}

const CheckinModal = React.memo((props: CheckinModalProps) => {
  const { attendance, isOpen, onClose } = props;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <p className="line-clamp-1">
          <span className="mr-3 inline-block h-3 w-3 bg-green-40" />
          Check in ({moment(attendance.checkinTime).format("HH:mm A")})
        </p>
      }
      description={
        <div className="mt-2 space-y-1">
          <p className="line-clamp-1 text-sm text-gray-70">
            {attendance.shift.outlet.name}{" "}
            <span className="text-xs text-gray-50">({attendance.shift.outlet.address})</span>
          </p>
          <p className="line-clamp-1 text-sm text-gray-70">
            {attendance.shift.name}{" "}
            <span className="text-xs text-gray-50">
              ({moment(attendance.shift.startTime).format("DD/MM/YYYY")})
            </span>
          </p>
          <p className="line-clamp-1 text-sm text-gray-70">
            {attendance.staff.fullName}{" "}
            <span className="text-xs text-gray-50">[{attendance.staff.staffCode}]</span>
          </p>
        </div>
      }
    >
      <div className="h-[60dvh] w-full">
        <StaffCheckinMap
          user={{
            avatar: attendance.staff.profileImage,
            gps: { lat: attendance.checkinLocation.lat, lng: attendance.checkinLocation.lng },
          }}
          outlet={{
            gps: {
              lat: attendance.shift.outlet.latitude,
              lng: attendance.shift.outlet.longitude,
            },
            radius: attendance.shift.outlet.checkinRadiusMeters,
          }}
          image={attendance.checkinImage}
        />
      </div>
    </Modal>
  );
});

CheckinModal.displayName = "CheckinModal";

interface CheckoutModalProps {
  attendance: IStaffAttendance;
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutModal = React.memo((props: CheckoutModalProps) => {
  const { attendance, isOpen, onClose } = props;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <p className="line-clamp-1">
          <span className="mr-3 inline-block h-3 w-3 bg-red-40" />
          Check out ({moment(attendance.checkoutTime).format("HH:mm A")})
        </p>
      }
      description={
        <div className="mt-2 space-y-1">
          <p className="line-clamp-1 text-sm text-gray-70">
            {attendance.shift.outlet.name}{" "}
            <span className="text-xs text-gray-50">({attendance.shift.outlet.address})</span>
          </p>
          <p className="line-clamp-1 text-sm text-gray-70">
            {attendance.shift.name}{" "}
            <span className="text-xs text-gray-50">
              ({moment(attendance.shift.startTime).format("DD/MM/YYYY")})
            </span>
          </p>
          <p className="line-clamp-1 text-sm text-gray-70">
            {attendance.staff.fullName}{" "}
            <span className="text-xs text-gray-50">[{attendance.staff.staffCode}]</span>
          </p>
        </div>
      }
    >
      <div className="h-[60dvh] w-full">
        <StaffCheckoutMap
          user={{
            avatar: attendance.staff.profileImage,
            gps: {
              lat: attendance.checkoutLocation?.lat ?? 0,
              lng: attendance.checkoutLocation?.lng ?? 0,
            },
          }}
          outlet={{
            gps: {
              lat: attendance.shift.outlet.latitude,
              lng: attendance.shift.outlet.longitude,
            },
            radius: attendance.shift.outlet.checkinRadiusMeters,
          }}
          image={attendance.checkoutImage ?? ""}
        />
      </div>
    </Modal>
  );
});

CheckoutModal.displayName = "CheckoutModal";

type AttendanceCardProps = {
  attendance: IStaffAttendance;
};

const AttendanceCard = (props: AttendanceCardProps) => {
  const { attendance } = props;

  const isCheckedOut = !!attendance.checkoutTime;

  const [now, controls] = useTick({ unit: "minute" });

  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showLeaveHistoryModal, setShowLeaveHistoryModal] = useState(false);

  const lastIncompleteLeave = React.useMemo(() => {
    if (!attendance?.staffLeaves?.length) return null;
    return attendance.staffLeaves.find((leave) => !leave.endTime);
  }, [attendance?.staffLeaves]);

  // Calculate elapsed time
  const elapsedTime = React.useMemo(() => {
    if (!lastIncompleteLeave) return "";
    const start = moment(lastIncompleteLeave.startTime);
    const duration = moment.duration(now.diff(start));

    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes()) % 60;

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    if (minutes > 0) {
      return `${minutes} phút`;
    }
    return `1 phút`;
  }, [lastIncompleteLeave, now]);

  const handleCheckinModalClose = React.useCallback(() => {
    setShowCheckinModal(false);
  }, []);

  const handleCheckoutModalClose = React.useCallback(() => {
    setShowCheckoutModal(false);
  }, []);

  const handleLeaveHistoryModalClose = React.useCallback(() => {
    setShowLeaveHistoryModal(false);
  }, []);

  React.useEffect(() => {
    if (lastIncompleteLeave) {
      controls.on();
    } else {
      controls.off();
    }

    return () => {
      controls.off();
    };
  }, [controls, lastIncompleteLeave]);

  return (
    <>
      <div className="flex flex-col space-y-2 bg-primary-10/20 p-4 outline outline-1 outline-primary-30">
        <div className="flex items-center justify-between">
          <p className="line-clamp-1 text-sm font-medium text-gray-100">
            {attendance.staff.fullName}{" "}
            <span className="text-xs font-normal text-gray-50">[{attendance.staff.staffCode}]</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 py-2">
          {/* Checkin  */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="inline-block h-2 w-2 bg-green-40" />
              <p className="line-clamp-1 text-xs font-medium text-cool-gray-70">
                {moment(attendance.checkinTime).format("HH:mm A")}
              </p>
            </div>
            <button
              type="button"
              className="line-clamp-1 text-xs text-primary-60 hover:text-primary-70 focus:underline active:underline"
              onClick={() => setShowCheckinModal(true)}
            >
              Xem hình ảnh, vị trí
            </button>
          </div>
          {/* Checkout */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span
                className={StyleUtil.cn("inline-block h-2 w-2 bg-red-40", {
                  "bg-gray-40": !isCheckedOut,
                })}
              />
              {isCheckedOut ? (
                <>
                  <p className="line-clamp-1 text-xs font-medium text-cool-gray-70">
                    {moment(attendance.checkoutTime).format("HH:mm A")}
                  </p>
                </>
              ) : (
                <p className="line-clamp-1 text-xs font-medium text-gray-40">Đang trong ca</p>
              )}
            </div>
            {isCheckedOut && (
              <button
                type="button"
                className="line-clamp-1 text-xs text-primary-60 hover:text-primary-70 focus:underline active:underline"
                onClick={() => setShowCheckoutModal(true)}
              >
                Xem hình ảnh, vị trí
              </button>
            )}
          </div>
        </div>

        <div className="h-[1px] bg-gray-20" />

        {/* Leave Info */}
        <div className="space-y-1">
          {lastIncompleteLeave && (
            <div className="flex items-center space-x-2">
              <span className="inline-block h-2 w-2 bg-primary-40" />
              <p className="line-clamp-1 text-xs font-medium text-cool-gray-70">
                Đang tạm rời vị trí{" "}
                <span className="font-normal text-gray-50">({elapsedTime})</span>
              </p>
            </div>
          )}

          <button
            type="button"
            className={StyleUtil.cn(
              "line-clamp-1 text-xs text-primary-60 enabled:hover:text-primary-70 enabled:focus:underline enabled:active:underline",
              { "cursor-not-allowed text-gray-50 opacity-50": !attendance.staffLeaves.length },
            )}
            disabled={!attendance.staffLeaves.length}
            onClick={() => setShowLeaveHistoryModal(true)}
          >
            {attendance.staffLeaves.length > 0
              ? `Xem lịch sử tạm rời vị trí (${attendance.staffLeaves.length})`
              : "Không có lịch sử tạm rời vị trí"}
          </button>
        </div>
      </div>

      {/* Checkin Modal */}
      <CheckinModal
        attendance={attendance}
        isOpen={showCheckinModal}
        onClose={handleCheckinModalClose}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        attendance={attendance}
        isOpen={showCheckoutModal}
        onClose={handleCheckoutModalClose}
      />

      <LeaveHistoryModal
        attendance={attendance}
        isOpen={showLeaveHistoryModal}
        onClose={handleLeaveHistoryModalClose}
      />
    </>
  );
};

type ShiftCardProps = {
  outletId: number;
  shiftId: number;
  shift: any;
  attendances: any[];
  isExpanded: boolean;
  onToggle: (outletId: number, shiftId: number) => void;
};

const ShiftCard = (props: ShiftCardProps) => {
  const { outletId, shiftId, shift, attendances, isExpanded, onToggle } = props;

  return (
    <div className="bg-white">
      <div
        className="flex cursor-pointer items-center justify-between gap-2 bg-cool-gray-10 p-3 outline outline-1 outline-cool-gray-20"
        onClick={() => onToggle(outletId, shiftId)}
      >
        <div className="flex-1">
          <h4 className="mb-2 line-clamp-1 text-sm font-medium text-cool-gray-80">
            {shift.name}{" "}
            <span className="text-xs font-normal text-cool-gray-50">
              ({moment(shift.startTime).format("DD/MM/YYYY")})
            </span>
          </h4>
          <div className="flex items-center space-x-4">
            <p className="bg-cool-gray-20 px-2 py-1 text-xs font-medium text-cool-gray-70">
              {attendances.length} ca
            </p>

            <div className="flex items-center space-x-2">
              <Icons.Login className="text-green-40" />
              <p className="line-clamp-1 text-xs font-medium text-cool-gray-70">
                {moment(shift.startTime).format("HH:mm A ")}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Icons.Logout className="text-red-50" />
              <p className="line-clamp-1 text-xs font-medium text-cool-gray-70">
                {moment(shift.endTime).format("HH:mm A")}
              </p>
            </div>
          </div>
        </div>
        <IconButton
          icon={isExpanded ? Icons.ChevronUp : Icons.ChevronDown}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(outletId, shiftId);
          }}
        />
      </div>
      {isExpanded && (
        <div className="grid gap-2 p-2 outline outline-1 outline-cool-gray-20">
          {attendances.map((attendance, index) => (
            <AttendanceCard key={index} attendance={attendance} />
          ))}
        </div>
      )}
    </div>
  );
};

type OutletCardProps = {
  outletId: number;
  outlet: IOutlet;
  shifts: Record<number, { shift: IWorkingShift; attendances: IStaffAttendance[] }>;
  isExpanded: boolean;
  expandedShifts: { outletId: number; shiftId: number }[];
  onToggleOutlet: (outletId: number) => void;
  onToggleShift: (outletId: number, shiftId: number) => void;
};

const OutletCard = (props: OutletCardProps) => {
  const { outletId, outlet, shifts, isExpanded, expandedShifts, onToggleOutlet, onToggleShift } =
    props;

  return (
    <div>
      <div
        className={StyleUtil.cn(
          "flex cursor-pointer items-center justify-between gap-2 bg-white p-4 outline outline-1 outline-cool-gray-20",
          { "outline-primary-50": isExpanded },
        )}
        onClick={() => onToggleOutlet(outletId)}
      >
        <div className="flex-1">
          <h3 className="mb-1 line-clamp-1 text-sm font-medium text-gray-100">{outlet.name}</h3>
          <p className="line-clamp-1 text-xs text-cool-gray-70">{outlet.address}</p>
        </div>
        <IconButton
          icon={isExpanded ? Icons.ChevronUp : Icons.ChevronDown}
          onClick={(e) => {
            e.stopPropagation();
            onToggleOutlet(outletId);
          }}
        />
      </div>
      {isExpanded && (
        <div
          className={StyleUtil.cn("bg-white p-2 outline outline-1 outline-cool-gray-20", {
            "outline-primary-50": isExpanded,
          })}
        >
          <div className="space-y-2">
            {Object.entries(shifts).map(([shiftId, shiftGroup]) => (
              <ShiftCard
                key={shiftId}
                outletId={outletId}
                shiftId={Number(shiftId)}
                shift={shiftGroup.shift}
                attendances={shiftGroup.attendances}
                isExpanded={expandedShifts.some(
                  (item) => item.outletId === outletId && item.shiftId === Number(shiftId),
                )}
                onToggle={onToggleShift}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const Entry = () => {
  const [expandedOutlets, setExpandedOutlets] = useState<number[]>([]);
  const [expandedShifts, setExpandedShifts] = useState<{ outletId: number; shiftId: number }[]>([]);

  const authStore = useAuthContext();
  const user = authStore.use.user();

  const router = useRouter();
  const notification = useNotification();

  const attendanceBySaleQuery = useQueryAttendanceBySale({
    params: {
      saleProfileId: user?.id ?? 0,
      fromDate: moment().format("YYYY-MM-DD"),
      toDate: moment().format("YYYY-MM-DD"),
    },
    config: {
      enabled: !!user?.id,
      onError: (error) => {
        notification.error({
          title: "Lỗi hệ thống",
          description: "Không thể tải dữ liệu. Vui lòng thử lại sau!",
        });
      },
    },
  });

  // Group attendance by outlet and shift
  const groupedAttendance = React.useMemo(() => {
    if (!attendanceBySaleQuery.data?.data) return {};

    return attendanceBySaleQuery.data.data.reduce(
      (acc, attendance) => {
        const outletId = attendance.shift.outlet.id;
        const shiftId = attendance.shift.id;

        if (!acc[outletId]) {
          acc[outletId] = {
            outlet: attendance.shift.outlet,
            shifts: {},
          };
        }

        if (!acc[outletId].shifts[shiftId]) {
          acc[outletId].shifts[shiftId] = {
            shift: attendance.shift,
            attendances: [],
          };
        }

        acc[outletId].shifts[shiftId].attendances.push(attendance);
        return acc;
      },
      {} as Record<
        number,
        {
          outlet: any;
          shifts: Record<
            number,
            {
              shift: any;
              attendances: typeof attendanceBySaleQuery.data.data;
            }
          >;
        }
      >,
    );
  }, [attendanceBySaleQuery.data]);

  const toggleOutlet = (outletId: number) => {
    setExpandedOutlets((prev) =>
      prev.includes(outletId) ? prev.filter((id) => id !== outletId) : [...prev, outletId],
    );
  };

  const toggleShift = (outletId: number, shiftId: number) => {
    setExpandedShifts((prev) => {
      const isExpanded = prev.some(
        (item) => item.outletId === outletId && item.shiftId === shiftId,
      );
      if (isExpanded) {
        return prev.filter((item) => !(item.outletId === outletId && item.shiftId === shiftId));
      }
      return [...prev, { outletId, shiftId }];
    });
  };

  return (
    <>
      <ScreenHeader
        title="Theo dõi ca làm việc"
        loading={attendanceBySaleQuery.isLoading || attendanceBySaleQuery.isRefetching}
        onBack={() => router.back()}
      />

      <div className="px-4">
        {attendanceBySaleQuery.isSuccess &&
          (attendanceBySaleQuery.data?.data.length ?? 0) === 0 && (
            <NotificationBanner
              type="warning"
              title="Nhàn rỗi"
              description="Không có ca làm việc nào được tìm thấy..."
            />
          )}
      </div>

      <div className="mb-32 mt-8 px-4">
        <div className="w-full space-y-4">
          {Object.entries(groupedAttendance).map(([outletId, group]) => (
            <OutletCard
              key={outletId}
              outletId={Number(outletId)}
              outlet={group.outlet}
              shifts={group.shifts}
              isExpanded={expandedOutlets.includes(Number(outletId))}
              expandedShifts={expandedShifts}
              onToggleOutlet={toggleOutlet}
              onToggleShift={toggleShift}
            />
          ))}
        </div>
      </div>
    </>
  );
};
