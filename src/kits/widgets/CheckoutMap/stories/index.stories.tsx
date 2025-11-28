import { Meta, StoryFn } from "@storybook/react";
import { CheckoutMap, CheckoutMapProps } from "..";

export default {
  title: "Widgets/CheckoutMap",
  component: CheckoutMap,
} as Meta;

const Template: StoryFn<CheckoutMapProps> = (args) => (
  <div className="h-[500px] w-[500px]">
    <CheckoutMap {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  gps: { lat: 10.823553418004595, lng: 106.6935899631407 },
};
