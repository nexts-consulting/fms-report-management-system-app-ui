import { Meta, StoryFn } from "@storybook/react";
import { CheckboxGroupInput } from "..";

export default {
  title: "Components/CheckboxGroupInput",
  component: CheckboxGroupInput,
} as Meta;

const Template: StoryFn<typeof CheckboxGroupInput> = (args) => <CheckboxGroupInput {...args} />;

export const SingleSelection = Template.bind({});
SingleSelection.args = {
  label: "Chọn một lựa chọn",
  options: [
    { label: "Lựa chọn 1", value: "1" },
    { label: "Lựa chọn 2", value: "2" },
    { label: "Lựa chọn 3", value: "3" },
    { label: "Lựa chọn 4", value: "4" },
  ],
  multiple: false,
};

export const MultipleSelection = Template.bind({});
MultipleSelection.args = {
  label: "Chọn nhiều lựa chọn",
  options: [
    { label: "Lựa chọn 1", value: "1" },
    { label: "Lựa chọn 2", value: "2" },
    { label: "Lựa chọn 3", value: "3" },
    { label: "Lựa chọn 4", value: "4" },
  ],
  multiple: true,
};
