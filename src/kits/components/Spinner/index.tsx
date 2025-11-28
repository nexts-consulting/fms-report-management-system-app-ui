import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import { css, keyframes } from "@emotion/css";
import React from "react";

const constants = {
  INSTANCE_NAME: "Spinner",
};

const variants = {
  size: {
    small: {
      size: 16,
      strokeWidth: 2,
    },
    medium: {
      size: 20,
      strokeWidth: 2,
    },
    large: {
      size: 32,
      strokeWidth: 4,
    },
    xlarge: {
      size: 64,
      strokeWidth: 6,
    },
  },
};

const animations = {
  spin: keyframes`
    from {
      stroke-dashoffset: var(--circumference);
      stroke: var(--color);
      transform: rotateZ(0deg);
    }
    to {
      stroke-dashoffset: calc(var(--circumference) * -1px);
      stroke: var(--color);
      transform: rotateZ(720deg);
    }
  `,
};

const styles = {
  container: StyleUtil.cn("flex justify-center items-center relative"),
  backgroundCircle: (background: string) =>
    StyleUtil.cn(
      "absolute",
      css`
        stroke: ${background};
        fill: transparent;
      `,
    ),
  spinnerCircle: (radius: number, color: string) =>
    StyleUtil.cn(
      "fill-transparent origin-center absolute",
      css`
        --circumference: ${2 * Math.PI * radius};
        --color: ${color};
        stroke-dasharray: var(--circumference);
        animation: ${animations.spin} 2.5s ease-out infinite;
      `,
    ),
};

export interface SpinnerProps {
  color?: string;
  background?: string;
  withoutBackground?: boolean;
  size?: keyof typeof variants.size;
}

export const Spinner = (props: SpinnerProps) => {
  const {
    color = "#4589ff",
    background = "#E0E0E0",
    withoutBackground = false,
    size = "medium",
  } = props;

  const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

  const ids = React.useRef({
    container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
  });

  const sizeVariant = variants.size[size];
  const radius = sizeVariant.size / 2.5;

  return (
    <div id={ids.current.container} className={styles.container}>
      <svg
        height={sizeVariant.size}
        width={sizeVariant.size}
        viewBox={`0 0 ${sizeVariant.size} ${sizeVariant.size}`}
      >
        {!withoutBackground && (
          <circle
            cx={"50%"}
            cy={"50%"}
            r={radius}
            strokeWidth={sizeVariant.strokeWidth}
            className={styles.backgroundCircle(background)}
          />
        )}

        {/* Spinner circle */}
        <circle
          cx={"50%"}
          cy={"50%"}
          r={radius}
          strokeWidth={sizeVariant.strokeWidth}
          className={styles.spinnerCircle(radius, color)}
        />
      </svg>
    </div>
  );
};

Spinner.displayName = constants.INSTANCE_NAME;
