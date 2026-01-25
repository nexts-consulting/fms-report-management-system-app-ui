import { Meta, StoryFn } from "@storybook/react";
import { Heading } from "..";
import { HeadingProps } from "..";

export default {
  title: "Components/Heading",
  component: Heading,
} as Meta;

const Template: StoryFn<HeadingProps> = () => (
  <div>
    <Heading as="h1" level="h1">
      H1: Lorem ipsum.
    </Heading>
    <Heading as="h2" level="h2">
      H2: Lorem ipsum.
    </Heading>
    <Heading as="h3" level="h3">
      H3: Lorem ipsum.
    </Heading>
    <Heading as="h4" level="h4">
      H4: Lorem ipsum.
    </Heading>
    <Heading as="h5" level="h5">
      H5: Lorem ipsum.
    </Heading>
  </div>
);

export const Default = Template.bind({});
