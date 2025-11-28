import { Meta, StoryFn } from "@storybook/react";
import { ImageCaptureInput, ImageCaptureInputProps } from "..";

export default {
  title: "Components/ImageCaptureInput",
  component: ImageCaptureInput,
} as Meta;

const Template: StoryFn<ImageCaptureInputProps> = (args) => <ImageCaptureInput {...args} />;

export const Default = Template.bind({});
