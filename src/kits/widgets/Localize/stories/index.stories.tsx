import moment from "moment";
import { Meta, StoryFn } from "@storybook/react";
import { Localize, LocalizeProps } from "..";
import { fn } from "@storybook/test";

export default {
  title: "Widgets/Localize",
  component: Localize,
  args: {
    onUpdateGps: fn(),
  },
} as Meta;

const Template: StoryFn<LocalizeProps> = (args) => (
  <div className="flex h-[680px] w-[390px]">
    <Localize {...args} />
  </div>
);

export const Default = Template.bind({});

Default.args = {
  location: {
    name: "Aeon Maill Ha Dong",
    province: "Ha Noi",
    address: "Phuong Duong Noi, Quan Ha Dong, Ha Noi",
    gps: {
      lat: 20.98953790623694,
      lng: 105.75070494741689,
    },
    radius: 200,
  },
  shift: {
    name: "CA 1",
    startTime: moment().set({ hour: 15, minute: 30 }).toDate(),
    endTime: moment().set({ hour: 24, minute: 0 }).toDate(),
  },
  user: {
    id: "USR000",
    avatar: "./avatar.png",
    gps: {
      lat: 20.98437134014586,
      lng: 105.74926154054444,
    },
  },
};

export const WithUserOutsideLocationScope = Template.bind({});

WithUserOutsideLocationScope.args = {
  ...Default.args,
  user: {
    ...Default.args.user!,
    gps: {
      lat: 20.98437134014586,
      lng: 105.74926154054444,
    },
  },
};

export const WithUserInsideLocationScope = Template.bind({});

WithUserInsideLocationScope.args = {
  ...Default.args,
  user: {
    ...Default.args.user!,
    gps: {
      lat: 20.98943790623694,
      lng: 105.75050494741689,
    },
  },
};

export const WithUserLazyLoading = Template.bind({});

WithUserLazyLoading.args = {
  ...Default.args,
  user: null,
};
