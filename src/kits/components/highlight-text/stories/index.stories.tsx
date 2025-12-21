import { Meta, StoryFn } from "@storybook/react";
import { HighlightText, HighlightTextProps } from "..";

export default {
  title: "Components/HighlightText",
  component: HighlightText,
} as Meta;

const Template: StoryFn<HighlightTextProps> = (args) => (
  <p className="text-sm">
    <HighlightText {...args} />
  </p>
);

export const Default = Template.bind({});
Default.args = {
  text: "Hello World",
  highlightValue: "llo w",
};
