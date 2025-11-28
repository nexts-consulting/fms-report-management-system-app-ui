import { Meta, StoryFn } from "@storybook/react";
import { Spinner, SpinnerProps } from "..";

export default {
  title: "Components/Spinner",
  component: Spinner,
} as Meta;

const Template: StoryFn<SpinnerProps> = (args) => <Spinner {...args} />;

export const Default = Template.bind({});

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

export const XLarge = Template.bind({});
XLarge.args = {
  size: "xlarge",
};

export const WithoutBackground = Template.bind({});
WithoutBackground.args = {
  withoutBackground: true,
};
