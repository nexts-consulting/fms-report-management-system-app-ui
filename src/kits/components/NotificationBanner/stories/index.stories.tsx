import { Meta, StoryFn } from "@storybook/react";
import { NotificationBanner, NotificationBannerProps } from "..";

export default {
  title: "Components/NotificationBanner",
  component: NotificationBanner,
} as Meta;

const Template: StoryFn<NotificationBannerProps> = (args) => <NotificationBanner {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const Pending = Template.bind({});
Pending.args = {
  type: "pending",
  title: "Pending",
  description: "This is a pending notification",
};

export const Info = Template.bind({});
Info.args = {
  type: "info",
  title: "Info",
  description: "This is a info notification",
};

export const Success = Template.bind({});
Success.args = {
  type: "success",
  title: "Success",
  description: "This is a success notification",
};

export const Warning = Template.bind({});
Warning.args = {
  type: "warning",
  title: "Warning",
  description: "This is a warning notification",
};

export const Error = Template.bind({});
Error.args = {
  type: "error",
  title: "Error",
  description: "This is a error notification",
};

export const WithNoCloseable = Template.bind({});
WithNoCloseable.args = {
  type: "info",
  title: "Info",
  description: "This is a info notification",
  closeable: false,
};

export const Inline = Template.bind({});
Inline.args = {
  type: "info",
  title: "Info",
  description: "This is a info notification",
  inline: true,
};
