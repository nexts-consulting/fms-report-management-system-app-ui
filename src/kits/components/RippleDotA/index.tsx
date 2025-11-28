import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import { css, keyframes } from "@emotion/css";
import { colord } from "colord";
import React from "react";

const constants = {
  INSTANCE_NAME: "RippleDotA",
};

const variants = {
  size: {
    small: {
      size: 8,
      ratio: 2,
    },
    medium: {
      size: 12,
      ratio: 2,
    },
    large: {
      size: 16,
      ratio: 2,
    },
    xlarge: {
      size: 24,
      ratio: 2,
    },
  },
};

const createRippleAnimation = (shadowColor: string, size: number, ratio: number) => keyframes`
  0% {
    box-shadow: 0 0 0 0.1rem ${shadowColor};
  }
  100% {
    box-shadow: 0 0 0 ${size * ratio}px rgba(255, 255, 255, 0);
  }
`;

const styles = {
  rippleDot: (params: {
    size: number;
    color: string;
    shadowColor: string;
    speed: number;
    ratio: number;
  }) =>
    StyleUtil.cn(
      "relative rounded-full",
      css`
        width: ${params.size}px;
        height: ${params.size}px;
        background-color: ${params.color};
        animation: ${createRippleAnimation(params.shadowColor, params.size, params.ratio)}
          ${params.speed}s linear infinite;

        &::before,
        &::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
        }

        &::before {
          animation: ${createRippleAnimation(params.shadowColor, params.size, params.ratio)}
            ${params.speed}s linear infinite ${params.speed * 0.35}s;
        }

        &::after {
          animation: ${createRippleAnimation(params.shadowColor, params.size, params.ratio)}
            ${params.speed}s linear infinite ${params.speed * 0.65}s;
        }
      `,
    ),
};

export interface RippleDotAProps {
  size?: keyof typeof variants.size;
  color?: string;
  speed?: number;
  customSize?: number;
  customRatio?: number;
}

export const RippleDotA = React.memo((props: RippleDotAProps) => {
  const { size = "medium", color = "#4589ff", speed = 1, customSize, customRatio } = props;

  const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

  const ids = React.useRef({
    container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
  });

  const sizeVariant = variants.size[size];
  const finalSize = customSize ?? sizeVariant.size;
  const finalRatio = customRatio ?? sizeVariant.ratio;

  const shadowColor = React.useMemo(() => {
    try {
      const parsedColor = colord(color);
      if (parsedColor.isValid()) {
        return parsedColor.alpha(0.5).toRgbString();
      }

      return "#4589ff80";
    } catch {
      return "#4589ff80";
    }
  }, [color]);

  return (
    <div
      id={ids.current.container}
      className={styles.rippleDot({
        size: finalSize,
        color,
        shadowColor,
        speed,
        ratio: finalRatio,
      })}
    />
  );
});

RippleDotA.displayName = constants.INSTANCE_NAME;
