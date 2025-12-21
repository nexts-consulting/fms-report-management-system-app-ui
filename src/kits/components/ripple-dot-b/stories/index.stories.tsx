import { Meta, StoryFn } from "@storybook/react";
import { RippleDotB, RippleDotBProps } from "..";

export default {
  title: "Components/RippleDotB",
  component: RippleDotB,
} as Meta;

const Template: StoryFn<RippleDotBProps> = (args) => <RippleDotB {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const Small = Template.bind({});
Small.args = {
  size: "small",
};

export const Medium = Template.bind({});
Medium.args = {
  size: "medium",
};

export const Large = Template.bind({});
Large.args = {
  size: "large",
};
