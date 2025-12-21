import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import { css, keyframes } from "@emotion/css";
import React from "react";

const constants = {
  INSTANCE_NAME: "LoadingBar",
};

const variants = {
  size: {
    small: {
      height: 2,
    },
    medium: {
      height: 4,
    },
    large: {
      height: 6,
    },
  },
};

const animations = {
  slide: keyframes`
    0% {
      transform: translateX(-102%);
    }
    45% {
      transform: translateX(0);
    }
    55% {
      transform: translateX(0);
    }
    90% {
      transform: translateX(102%);
    }
    100% {
      transform: translateX(102%);
    }
  `,
};

const styles = {
  container: (thumbColor: string, slideBarColor: string, fxSlideId: string, active: boolean) =>
    StyleUtil.cn(
      "block relative w-full overflow-x-hidden before:content-[''] before:absolute before:block before:inset-0 before:w-[102%]",
      css`
        ${active ? `background-color: ${thumbColor};` : "background-color: transparent;"};
        &::before {
          ${active ? `background-color: ${slideBarColor};` : "background-color: transparent;"};
          animation: ${active
            ? `${fxSlideId} 1.5s cubic-bezier(0.5, 0.01, 0.51, 1) infinite`
            : "none"};
        }
      `,
    ),
};

export interface LoadingBarProps {
  color?: string;
  background?: string;
  size?: keyof typeof variants.size;
  active?: boolean;
}

export const LoadingBar = (props: LoadingBarProps) => {
  const { color = "#4589ff", background = "#E0E0E0", size = "medium", active = true } = props;

  const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

  const ids = React.useRef({
    container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
  });

  const sizeVariant = variants.size[size];

  return (
    <div
      id={ids.current.container}
      style={{
        height: sizeVariant.height,
      }}
      className={styles.container(color, background, animations.slide, active)}
    />
  );
};
