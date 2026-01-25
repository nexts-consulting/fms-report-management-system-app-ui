import { Meta, StoryFn } from "@storybook/react";
import { Search, SearchProps } from "..";

export default {
  title: "Components/Search",
  component: Search,
} as Meta;

const Template: StoryFn<SearchProps> = (args) => <Search {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  placeholder: "Search something...",
};
