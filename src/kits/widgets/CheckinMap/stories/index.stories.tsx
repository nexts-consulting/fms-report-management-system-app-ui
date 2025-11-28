import { Meta, StoryFn } from "@storybook/react";
import { CheckinMap, CheckinMapProps } from "..";

export default {
  title: "Widgets/CheckinMap",
  component: CheckinMap,
} as Meta;

const Template: StoryFn<CheckinMapProps> = (args) => (
  <div className="h-[500px] w-[500px]">
    <CheckinMap {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  gps: { lat: 10.823553418004595, lng: 106.6935899631407 },
};
