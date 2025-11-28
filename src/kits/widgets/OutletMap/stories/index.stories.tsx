import { Meta, StoryFn } from "@storybook/react";
import { OutletMap, OutletMapProps } from "..";

export default {
  title: "Widgets/OutletMap",
  component: OutletMap,
} as Meta;

const Template: StoryFn<OutletMapProps> = (args) => (
  <div className="h-[500px] w-[500px]">
    <OutletMap {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  gps: { lat: 10.823553418004595, lng: 106.6935899631407 },
  radius: 200,
};
