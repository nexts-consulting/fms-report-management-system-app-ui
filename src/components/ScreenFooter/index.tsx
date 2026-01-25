import React from "react";
import { StyleUtil } from "@/kits/utils";

const constants = {
  INSTANCE_NAME: "ScreenFooter",
  DEFAULT_SPACING: "mb-24",
} as const;

interface ScreenFooterProps {
  /** Custom spacing (overrides default mb-24) */
  spacing?: string;
  /** Additional className */
  className?: string;
}

export const ScreenFooter = React.memo((props: ScreenFooterProps) => {
  const { spacing = constants.DEFAULT_SPACING, className } = props;

  return <div className={StyleUtil.cn(spacing, className)} />;
});

ScreenFooter.displayName = constants.INSTANCE_NAME;
