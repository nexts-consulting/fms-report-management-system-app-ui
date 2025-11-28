import { Meta, StoryFn } from "@storybook/react";
import { Button, ButtonProps } from "..";
import { Icons } from "@/kits/components/Icons";

export default {
  title: "Components/Button",
  component: Button,
} as Meta;

const Template: StoryFn<ButtonProps> = (args) => <Button {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: "Button",
};

export const Small = Template.bind({});
Small.args = {
  children: "Button",
  size: "small",
};

export const Medium = Template.bind({});
Medium.args = {
  children: "Button",
  size: "medium",
};

export const Large = Template.bind({});
Large.args = {
  children: "Button",
  size: "large",
};

export const XLarge = Template.bind({});
XLarge.args = {
  children: "Button",
  size: "xlarge",
};

export const Primary = Template.bind({});
Primary.args = {
  children: "Button",
  variant: "primary",
};

export const Secondary = Template.bind({});
Secondary.args = {
  children: "Button",
  variant: "secondary",
};

export const Tertiary = Template.bind({});
Tertiary.args = {
  children: "Button",
  variant: "tertiary",
};

export const Danger = Template.bind({});
Danger.args = {
  children: "Button",
  variant: "danger",
};

export const DangerTertiary = Template.bind({});
DangerTertiary.args = {
  children: "Button",
  variant: "danger-tertiary",
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  children: "Button",
  variant: "primary",
  icon: Icons.Information,
};

export const WithIconLarge = Template.bind({});
WithIconLarge.args = {
  children: "Button",
  variant: "primary",
  size: "large",
  icon: Icons.Information,
};

export const WithFullWidth = Template.bind({});
WithFullWidth.args = {
  children: "Button",
  variant: "primary",
  className: "w-full",
  icon: Icons.Information,
};

export const Disabled = Template.bind({});
Disabled.args = {
  children: "Button",
  variant: "primary",
  disabled: true,
};
