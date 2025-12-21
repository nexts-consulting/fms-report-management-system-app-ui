import { Meta, StoryFn } from "@storybook/react";
import { LoadingBar, LoadingBarProps } from "..";

export default {
  title: "Components/LoadingBar",
  component: LoadingBar,
} as Meta;

const Template: StoryFn<LoadingBarProps> = (args) => <LoadingBar {...args} />;

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
