import React from "react";
import { CheckinMap } from "@/kits/widgets/CheckinMap";
import { LoadingBar } from "@/kits/components/LoadingBar";
import { AnimatedEllipsis } from "@/kits/components/animated-ellipsis";
import type { IWorkingShiftLocation } from "@/types/model";
import { CHECKIN_TIPS } from "../common/config";

interface CheckinSubmitStepProps {
  workingShift: IWorkingShiftLocation;
  currentTipIndex: number;
  isSubmitting: boolean;
  isUploadingPhoto: boolean;
}

/**
 * Submit step component for check-in process
 */
export const CheckinSubmitStep: React.FC<CheckinSubmitStepProps> = ({
  workingShift,
  currentTipIndex,
  isSubmitting,
  isUploadingPhoto,
}) => {
  return (
    <div className="fixed left-0 right-0 top-1/2 -translate-y-2/3 p-4">
      <div className="bg-white p-4">
        <div className="aspect-[3/2] w-full flex-1">
          <CheckinMap
            gps={{
              lat: workingShift.location.latitude ?? 0,
              lng: workingShift.location.longitude ?? 0,
            }}
          />
        </div>
      </div>
      <LoadingBar active={isSubmitting || isUploadingPhoto} size="medium" />
      <div className="mt-4">
        <p className="text-center text-sm font-medium text-gray-50">
          <span dangerouslySetInnerHTML={{ __html: CHECKIN_TIPS[currentTipIndex] }} />
          {currentTipIndex === 0 && <AnimatedEllipsis className="inline-block" />}
        </p>
      </div>
    </div>
  );
};
