import { Meta, StoryFn } from "@storybook/react";
import { SelectModal, SelectModalProps } from "..";

export default {
  title: "Components/SelectModal",
  component: SelectModal,
} as Meta;

const Template: StoryFn<SelectModalProps> = (args) => <SelectModal {...args} />;

export const Default = Template.bind({});
Default.args = {
  options: [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ],
  label: "Select an option",
  helperText: "Select an option from the list",
};

export const WithNoneOption = Template.bind({});
WithNoneOption.args = {
  options: [],
  label: "Select an option",
  helperText: "Select an option from the list",
};

export const WithLargeOptions = Template.bind({});
WithLargeOptions.args = {
  options: Array.from({ length: 100 }, (_, index) => ({
    label: `Option ${index + 1}`,
    value: `option${index + 1}`,
  })),
  label: "Select an option",
  helperText: "Select an option from the list",
};

export const WithLoading = Template.bind({});
WithLoading.args = {
  options: [],
  label: "Select an option",
  helperText: "Select an option from the list",
  loading: true,
};
