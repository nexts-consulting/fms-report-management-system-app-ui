import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import { css, keyframes } from "@emotion/css";
import React from "react";

const constants = {
  INSTANCE_NAME: "RippleDotB",
};

const variants = {
  size: {
    small: {
      size: 8,
      ratio: 2.5,
    },
    medium: {
      size: 12,
      ratio: 3,
    },
    large: {
      size: 16,
      ratio: 3,
    },
    xlarge: {
      size: 24,
      ratio: 3,
    },
  },
};

const createRippleAnimation = (ratio: number) => keyframes`
  0% {
    opacity: 1;
    transform: scale(0);
  }
  50% {
    opacity: 0;
    transform: scale(${ratio});
  }
  100% {
    opacity: 0;
    transform: scale(${ratio});
  }
`;

const styles = {
  rippleDot: (params: { size: number; color: string; speed: number; ratio: number }) =>
    StyleUtil.cn(
      "inline-block relative z-[2] rounded-full",
      css`
        width: ${params.size}px;
        height: ${params.size}px;
        background-color: ${params.color};

        &::before {
          content: "";
          position: absolute;
          inset: 0;
          background-color: inherit;
          border-radius: 50%;
          z-index: 1;
          animation: ${createRippleAnimation(params.ratio)} ${params.speed}s ease-out infinite;
        }
      `,
    ),
};

export interface RippleDotBProps {
  size?: keyof typeof variants.size;
  color?: string;
  speed?: number;
  customSize?: number;
  customRatio?: number;
}

export const RippleDotB = React.memo((props: RippleDotBProps) => {
  const { size = "medium", color = "#4589ff", speed = 2, customSize, customRatio } = props;

  const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

  const ids = React.useRef({
    container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
  });

  const sizeVariant = variants.size[size];
  const finalSize = customSize ?? sizeVariant.size;
  const finalRatio = customRatio ?? sizeVariant.ratio;

  return (
    <div
      id={ids.current.container}
      className={styles.rippleDot({
        size: finalSize,
        color,
        speed,
        ratio: finalRatio,
      })}
    />
  );
});

RippleDotB.displayName = constants.INSTANCE_NAME;
