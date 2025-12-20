import React from "react";
import { CheckoutMap } from "@/kits/widgets/CheckoutMap";
import { LoadingBar } from "@/kits/components/LoadingBar";
import { AnimatedEllipsis } from "@/kits/components/AnimatedEllipsis";
import type { IAttendance } from "@/types/model";
import { CHECKOUT_TIPS } from "../common/config";

interface CheckoutSubmitStepProps {
  attendance: IAttendance;
  currentTipIndex: number;
  isSubmitting: boolean;
  isUploadingPhoto: boolean;
}

/**
 * Submit step component for check-out process
 */
export const CheckoutSubmitStep: React.FC<CheckoutSubmitStepProps> = ({
  attendance,
  currentTipIndex,
  isSubmitting,
  isUploadingPhoto,
}) => {
  const outlet = attendance.shift?.outlet;

  return (
    <div className="fixed left-0 right-0 top-1/2 -translate-y-2/3 p-4">
      <div className="bg-white p-4">
        <div className="aspect-[3/2] w-full flex-1">
          <CheckoutMap
            gps={{
              lat: outlet?.latitude ?? 0,
              lng: outlet?.longitude ?? 0,
            }}
          />
        </div>
      </div>
      <LoadingBar active={isSubmitting || isUploadingPhoto} size="medium" />
      <div className="mt-4">
        <p className="text-center text-sm font-medium text-gray-50">
          <span dangerouslySetInnerHTML={{ __html: CHECKOUT_TIPS[currentTipIndex] }} />
          {currentTipIndex === 0 && <AnimatedEllipsis className="inline-block" />}
        </p>
      </div>
    </div>
  );
};
