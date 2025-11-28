import { Meta, StoryFn } from "@storybook/react";
import { Tooltip, TooltipProps } from "@/kits/components/Tooltip";
import React from "react";
import { CommonUtil } from "@/kits/utils/common.util";
import { IconButton } from "@/kits/components/IconButton";
import { Icons } from "@/kits/components/Icons";

export default {
  title: "Components/Tooltip",
  component: Tooltip,
} as Meta;

const Template: StoryFn<TooltipProps> = (args) => {
  const triggerIdRef = React.useRef(CommonUtil.nanoid("alphaLower"));

  return (
    <div className="flex items-center justify-center p-12">
      <IconButton id={triggerIdRef.current} icon={Icons.Information} />
      <Tooltip {...args} triggerId={triggerIdRef.current} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  content: "This is a tooltip",
  placement: "bottom",
};

export const Small = Template.bind({});
Small.args = {
  content: "This is a tooltip",
  placement: "bottom",
  size: "small",
};

export const Medium = Template.bind({});
Medium.args = {
  content: "This is a tooltip",
  placement: "bottom",
  size: "medium",
};

export const Top = Template.bind({});
Top.args = {
  content: "This is a tooltip",
  placement: "top",
};

export const Right = Template.bind({});
Right.args = {
  content: "This is a tooltip",
  placement: "right",
};

export const Bottom = Template.bind({});
Bottom.args = {
  content: "This is a tooltip",
  placement: "bottom",
};

export const Left = Template.bind({});
Left.args = {
  content: "This is a tooltip",
  placement: "left",
};
