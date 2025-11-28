import { Meta, StoryFn } from "@storybook/react";
import { RippleDotA, RippleDotAProps } from "..";

export default {
  title: "Components/RippleDotA",
  component: RippleDotA,
} as Meta;

const Template: StoryFn<RippleDotAProps> = (args) => <RippleDotA {...args} />;

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
