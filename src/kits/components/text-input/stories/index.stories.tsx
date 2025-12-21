import { Meta, StoryFn } from "@storybook/react";
import { TextInput, TextInputProps } from "..";

export default {
  title: "Components/TextInput",
  component: TextInput,
} as Meta;

const Template: StoryFn<TextInputProps> = (args) => <TextInput {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: "Workspace name",
  helperText: "A name can only contain letters, numbers and spaces.",
  placeholder: "Placeholder text",
  name: "workspace-name",
};

export const WithoutHelperText = Template.bind({});
WithoutHelperText.args = {
  label: "Workspace name",
  helperText: undefined,
  name: "workspace-name",
};

export const WithError = Template.bind({});
WithError.args = {
  label: "Workspace name",
  helperText: "A name can only contain letters, numbers and spaces.",
  placeholder: "Placeholder text",
  name: "workspace-name",

  error: true,
};
