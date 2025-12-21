import { IconButton } from "@/kits/components/icon-button";
import { Icons } from "@/kits/components/icons";
import React from "react";
import { motion } from "framer-motion";

export interface AttendanceMenuProps {}

export const AttendanceMenu = React.memo((props: AttendanceMenuProps) => {
  const {} = props;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
      className="fixed right-0 top-[154px] z-50 flex -translate-y-full items-center justify-center"
    >
      <div className="flex w-fit flex-col items-center justify-center divide-y divide-gray-30 bg-white p-2 shadow-lg outline outline-1 outline-gray-30">
        <IconButton icon={Icons.Report} variant="white" size="xlarge" />
        <IconButton icon={Icons.Pedestrian} variant="white" size="xlarge" />
        <IconButton icon={Icons.Logout} variant="white" size="xlarge" />
      </div>
    </motion.div>
  );
});

AttendanceMenu.displayName = "AttendanceMenu";
