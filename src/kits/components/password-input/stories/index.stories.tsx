import { Meta, StoryFn } from "@storybook/react";
import { PasswordInput, PasswordInputProps } from "..";

export default {
  title: "Components/PasswordInput",
  component: PasswordInput,
} as Meta;

const Template: StoryFn<PasswordInputProps> = (args) => <PasswordInput {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: "Password",
  helperText: "A password can only contain letters, numbers and special characters.",
  placeholder: "Enter password",
};

export const WithoutHelperText = Template.bind({});
WithoutHelperText.args = {
  label: "Password",
  helperText: undefined,
};

export const WithError = Template.bind({});
WithError.args = {
  label: "Password",
  helperText: "A password can only contain letters, numbers and special characters.",
  placeholder: "Enter password",
  error: true,
};
