import { Meta, StoryFn } from "@storybook/react";
import { MultipleImagesCaptureInput, MultipleImagesCaptureInputProps } from "..";

export default {
  title: "Components/MultipleImagesCaptureInput",
  component: MultipleImagesCaptureInput,
} as Meta;

const Template: StoryFn<MultipleImagesCaptureInputProps> = (args) => (
  <MultipleImagesCaptureInput {...args} />
);

export const Default = Template.bind({});
Default.args = {
  label: "Chụp nhiều ảnh",
  helperText: "Tối thiểu 1 ảnh, tối đa 3 ảnh",
  min: 1,
  max: 3,
};

export const WithMin = Template.bind({});
WithMin.args = {
  label: "Chụp nhiều ảnh",
  helperText: "Yêu cầu 3 ảnh",
  min: 3,
  max: 3,
};

export const Error = Template.bind({});
Error.args = {
  label: "Chụp nhiều ảnh",
  helperText: "Helper text",
  min: 1,
  max: 3,
  error: true,
};

export const WithDefaultFacingMode = Template.bind({});
WithDefaultFacingMode.args = {
  label: "Chụp nhiều ảnh",
  helperText: "Tối thiểu 1 ảnh, tối đa 3 ảnh",
  min: 1,
  max: 3,
  defaultFacingMode: "environment",
};