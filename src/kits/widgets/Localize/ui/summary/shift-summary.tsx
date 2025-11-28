import React from "react";
import moment from "moment";
import { useLocalContext } from "../../contexts/local.context";
import { Icons } from "@/kits/components/Icons";
import { constants } from "../../constants";

export interface ShiftSummaryProps {}

export const ShiftSummary = React.memo((props: ShiftSummaryProps) => {
  const {} = props;

  const localContext = useLocalContext();
  const localStore = localContext.store;

  const shift = localStore.use.shift();

  const startTimeFormated = React.useMemo(() => {
    return moment(shift?.startTime ?? "").format("HH:mm A");
  }, [shift?.startTime]);

  const endTimeFormated = React.useMemo(() => {
    return moment(shift?.endTime ?? "").format("HH:mm A");
  }, [shift?.endTime]);

  if (!shift) {
    return <></>;
  }

  return (
    <div className="space-y-2">
      <div className="bg-gray-10 p-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-gray-100">{shift.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-gray-30">
        {[
          {
            title: "Bắt đầu ca",
            time: startTimeFormated,
            icon: <Icons.Login className="h-4 w-4 text-green-50" />,
          },
          {
            title: "Kết thúc ca",
            time: endTimeFormated,
            icon: <Icons.Logout className="h-4 w-4 text-red-50" />,
          },
        ].map((item) => (
          <div key={item.title} className="flex items-center justify-start gap-4 bg-gray-10 p-4">
            {item.icon}
            <div>
              <p className="line-clamp-1 text-sm font-medium text-gray-100">{item.title}</p>
              <p className="line-clamp-1 text-xs text-gray-50">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

ShiftSummary.displayName = `${constants.INSTANCE_NAME}.Summary.ShiftSummary`;
