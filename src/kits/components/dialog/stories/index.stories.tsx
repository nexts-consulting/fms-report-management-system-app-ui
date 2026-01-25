import type { Meta, StoryObj } from "@storybook/react";
import { Dialog } from "../index";
import { Button } from "@/kits/components/button";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Dialog closed"),
    title: "Dialog Title",
    description: "This is a dialog description",
    children: (
      <div>
        <p>This is the main content of the dialog.</p>
        <p>You can put any content here.</p>
      </div>
    ),
    actions: (
      <>
        <Button variant="secondary" onClick={() => console.log("Cancel clicked")}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => console.log("Confirm clicked")}>
          Confirm
        </Button>
      </>
    ),
  },
};

export const WithoutActions: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Dialog closed"),
    title: "Simple Dialog",
    children: (
      <div>
        <p>This is a simple dialog without actions.</p>
      </div>
    ),
  },
};
