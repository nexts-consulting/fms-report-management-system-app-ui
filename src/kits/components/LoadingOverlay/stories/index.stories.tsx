import { Meta, StoryFn } from "@storybook/react";
import { LoadingOverlay, LoadingOverlayProps } from "..";

export default {
  title: "Components/LoadingOverlay",
  component: LoadingOverlay,
} as Meta;

const Template: StoryFn<LoadingOverlayProps> = (args) => <LoadingOverlay {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const Active = Template.bind({});
Active.args = {
  active: true,
};
