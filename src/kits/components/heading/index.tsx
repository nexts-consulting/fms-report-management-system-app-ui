import { cva, VariantProps } from "class-variance-authority";
import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";

const constants = {
  INSTANCE_NAME: "Heading",
};

const variants = cva("", {
  variants: {
    level: {
      h1: "text-3xl",
      h2: "text-2xl",
      h3: "text-xl",
      h4: "text-lg",
      h5: "text-base",
    },
  },
});

const styles = {
  container: (level: VariantProps<typeof variants>["level"]) => StyleUtil.cn(variants({ level })),
};

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof variants> {
  as?: keyof JSX.IntrinsicElements;
}

export const Heading = (props: HeadingProps) => {
  const { as: Component = "h1", children, className, level, ...rest } = props;

  const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

  const ids = React.useRef({
    heading: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
  });

  return (
    <Component
      id={ids.current.heading}
      className={StyleUtil.cn(styles.container(level), className)}
      {...(rest as any)}
    >
      {children}
    </Component>
  );
};

Heading.displayName = constants.INSTANCE_NAME;
