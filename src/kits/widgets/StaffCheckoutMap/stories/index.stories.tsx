import { Meta, StoryFn } from "@storybook/react";
import { StaffCheckoutMap, StaffCheckoutMapProps } from "..";

export default {
  title: "Widgets/StaffCheckoutMap",
  component: StaffCheckoutMap,
} as Meta;

const Template: StoryFn<StaffCheckoutMapProps> = (args) => (
  <div className="h-[500px] w-[500px]">
    <StaffCheckoutMap {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  user: {
    avatar: "/avatar-3.png",
    gps: { lat: 10.823553418004595, lng: 106.6935899631407 },
  },
  outlet: {
    gps: { lat: 10.823553418004595, lng: 106.6935899631407 },
    radius: 100,
  },
  image: "/placeholder-image.webp",
};
