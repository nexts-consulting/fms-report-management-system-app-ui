import { Meta, StoryFn } from "@storybook/react";
import { IconButton, IconButtonProps } from "..";
import { Icons } from "@/kits/components/icons";

export default {
  title: "Components/IconButton",
  component: IconButton,
} as Meta;

const Template: StoryFn<IconButtonProps> = (args) => <IconButton {...args} />;

export const Default = Template.bind({});
Default.args = {
  icon: Icons.Information,
};

export const Small = Template.bind({});
Small.args = {
  icon: Icons.Information,
  size: "small",
};

export const Medium = Template.bind({});
Medium.args = {
  icon: Icons.Information,
  size: "medium",
};

export const Large = Template.bind({});
Large.args = {
  icon: Icons.Information,
  size: "large",
};

export const XLarge = Template.bind({});
XLarge.args = {
  icon: Icons.Information,
  size: "xlarge",
};

export const WithTooltip = Template.bind({});
WithTooltip.args = {
  icon: Icons.Information,
  tooltip: "This is a tooltip",
};
