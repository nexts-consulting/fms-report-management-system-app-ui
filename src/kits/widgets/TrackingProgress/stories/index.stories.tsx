import { Meta, StoryFn } from "@storybook/react";
import { TrackingProgress, TrackingProgressProps } from "..";
import moment from "moment";
export default {
  title: "Widgets/TrackingProgress",
  component: TrackingProgress,
} as Meta;

const Template: StoryFn<TrackingProgressProps> = (args) => (
  <div className="w-[390px]">
    <TrackingProgress {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  startTime: moment().toDate(),
  endTime: moment().add(10, "seconds").toDate(),
};

export const With10Seconds = Template.bind({});
With10Seconds.args = {
  startTime: moment().toDate(),
  endTime: moment().add(10, "seconds").toDate(),
};

export const With1Minute = Template.bind({});
With1Minute.args = {
  startTime: moment().toDate(),
  endTime: moment().add(1, "minute").toDate(),
};

export const With1Hour = Template.bind({});
With1Hour.args = {
  startTime: moment().toDate(),
  endTime: moment().add(1, "hour").toDate(),
};

export const With5Seconds = Template.bind({});
With5Seconds.args = {
  startTime: moment().toDate(),
  endTime: moment().add(5, "seconds").toDate(),
};

export const NotStarted = Template.bind({});
NotStarted.args = {
  startTime: moment().add(1, "minute").toDate(),
  endTime: moment().add(2, "minutes").toDate(),
};

export const Ended = Template.bind({});
Ended.args = {
  startTime: moment().subtract(1, "minute").toDate(),
  endTime: moment().subtract(30, "seconds").toDate(),
};

export const WithCustomTrackingStart = Template.bind({});
WithCustomTrackingStart.args = {
  startTime: moment().toDate(),
  endTime: moment().add(15, "seconds").toDate(),
  startTrackingTime: moment().subtract(15, "seconds").toDate(),
};
