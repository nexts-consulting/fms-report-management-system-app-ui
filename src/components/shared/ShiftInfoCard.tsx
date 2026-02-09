import { Icons } from "@/kits/components/icons";
import { StringUtil } from "@/kits/utils";
import moment from "moment";
import React from "react";

interface ShiftInfoCardProps {
  name: string;
  startTime: Date | string;
  endTime: Date | string;
}

export const ShiftInfoCard = React.memo((props: ShiftInfoCardProps) => {
  const { name, startTime, endTime } = props;

  return (
    <div className="flex items-center justify-start gap-4 bg-white p-4">
      <Icons.TaskLocation className="shrink-0 text-gray-50" />
      <div>
        <p className="line-clamp-1 text-sm font-medium text-gray-100">{name}</p>
        <p className="line-clamp-1 text-xs text-gray-50">
          <span>
            {`${StringUtil.toTitleCase(moment(startTime).format("dddd, "))}${moment(startTime).format("DD/MM/YYYY")}`}
          </span>
          <span className="px-1">•</span>
          <span>{moment(startTime).format("HH:mm A")}</span>
          <span> → </span>
          <span>{moment(endTime).format("HH:mm A")}</span>
        </p>
      </div>
    </div>
  );
});

ShiftInfoCard.displayName = "ShiftInfoCard";








