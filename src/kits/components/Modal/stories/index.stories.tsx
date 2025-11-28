import { Meta, StoryFn } from "@storybook/react";
import { Modal, ModalProps } from "..";
import React from "react";

export default {
  title: "Components/Modal",
  component: Modal,
} as Meta;

const Template: StoryFn<ModalProps> = (args) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)} className="text-sm">
        Open Modal
      </button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  title: "Modal Title",
  children: <div>Modal Content</div>,
};
