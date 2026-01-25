import { Icons } from "@/kits/components/icons";
import React from "react";

interface TimeInfoCardProps {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  label: string;
  time: string;
}

export const TimeInfoCard = React.memo((props: TimeInfoCardProps) => {
  const { icon: Icon, iconColor, label, time } = props;

  return (
    <div className="flex items-center justify-start gap-4 bg-white p-4">
      <Icon className={`shrink-0 ${iconColor}`} />
      <div>
        <p className="line-clamp-1 text-sm font-medium text-gray-100">{label}</p>
        <p className="line-clamp-1 text-xs text-gray-50">{time}</p>
      </div>
    </div>
  );
});

TimeInfoCard.displayName = "TimeInfoCard";



