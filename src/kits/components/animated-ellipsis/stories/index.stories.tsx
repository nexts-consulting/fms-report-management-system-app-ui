import { Meta, StoryFn } from "@storybook/react";
import { AnimatedEllipsis, AnimatedEllipsisProps } from "..";

export default {
  title: "Components/AnimatedEllipsis",
  component: AnimatedEllipsis,
} as Meta;

const Template: StoryFn<AnimatedEllipsisProps> = () => <AnimatedEllipsis />;

export const Default = Template.bind({});
