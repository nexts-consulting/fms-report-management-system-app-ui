import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import { Spinner } from "@/kits/components/Spinner";
import React from "react";

const constants = {
  INSTANCE_NAME: "LoadingOverlay",
};

const styles = {
  container: StyleUtil.cn(
    "fixed inset-0 z-[10000] h-dvh flex items-center justify-center bg-black/30",
  ),
};

export interface LoadingOverlayProps {
  active?: boolean;
}

export const LoadingOverlay = (props: LoadingOverlayProps) => {
  const { active = true } = props;

  const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

  const ids = React.useRef({
    loadingOverlay: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
  });

  if (!active) return <></>;

  return (
    <div id={ids.current.loadingOverlay} className={styles.container}>
      <Spinner color="#FFFFFF" size="xlarge" withoutBackground />
    </div>
  );
};

LoadingOverlay.displayName = constants.INSTANCE_NAME;
