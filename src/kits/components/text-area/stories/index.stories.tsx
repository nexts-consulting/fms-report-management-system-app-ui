import type { Meta, StoryObj } from "@storybook/react";
import { TextArea } from "../index";

const meta = {
  title: "Components/TextArea",
  component: TextArea,
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Description",
    placeholder: "Enter your description here...",
    helperText: "This is a helper text",
  },
};

export const WithError: Story = {
  args: {
    label: "Description",
    placeholder: "Enter your description here...",
    helperText: "This field is required",
    error: true,
  },
};

export const WithoutHelperText: Story = {
  args: {
    label: "Description",
    placeholder: "Enter your description here...",
  },
};

export const WithMoreLines: Story = {
  args: {
    label: "Description",
    placeholder: "Enter your description here...",
    rows: 5,
  },
};
