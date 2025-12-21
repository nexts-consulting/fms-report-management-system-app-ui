import type { Meta, StoryObj } from "@storybook/react";
import { NotificationProvider, useNotification } from "..";
import { Button } from "@/kits/components/button";

const meta: Meta = {
  title: "Components/Notification",
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj;

const ToastDemo = () => {
  const notification = useNotification();

  const showPending = () => {
    const id = notification.pending({
      title: "Uploading file...",
      description: "Please wait while we upload your file",
      options: {
        immortal: true,
      },
    });

    // Simulate async operation
    setTimeout(() => {
      notification.update(id, {
        title: "File uploaded",
        description: "Your file has been uploaded successfully",
        options: {
          duration: 3000,
        },
      });
    }, 2000);
  };

  const showSuccess = () => {
    notification.success({
      title: "Success",
      description: "Operation completed successfully",
    });
  };

  const showError = () => {
    notification.error({
      title: "Error",
      description: "Something went wrong. Please try again.",
    });
  };

  const showWarning = () => {
    notification.warning({
      title: "Warning",
      description: "This action cannot be undone",
    });
  };

  const showInfo = () => {
    notification.info({
      title: "Info",
      description: "New version available",
    });
  };

  const showImmortal = () => {
    notification.info({
      title: "Immortal Toast",
      description: "This toast will not auto-dismiss",
      options: {
        immortal: true,
      },
    });
  };

  const showLongDuration = () => {
    notification.info({
      title: "Long Duration",
      description: "This toast will stay for 10 seconds",
      options: {
        duration: 10000,
      },
    });
  };

  const showNotCloseable = () => {
    notification.info({
      title: "Not Closeable",
      description: "This toast cannot be closed",
      closeable: false,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button variant="tertiary" onClick={showPending}>
          Show Pending
        </Button>
        <Button variant="tertiary" onClick={showSuccess}>
          Show Success
        </Button>
        <Button variant="tertiary" onClick={showError}>
          Show Error
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="tertiary" onClick={showWarning}>
          Show Warning
        </Button>
        <Button variant="tertiary" onClick={showInfo}>
          Show Info
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="tertiary" onClick={showImmortal}>
          Show Immortal
        </Button>
        <Button variant="tertiary" onClick={showLongDuration}>
          Show Long Duration
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="tertiary" onClick={showNotCloseable}>
          Show Not Closeable
        </Button>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <NotificationProvider>
      <ToastDemo />
    </NotificationProvider>
  ),
};

export const TopLeft: Story = {
  render: () => (
    <NotificationProvider placement="top-left">
      <ToastDemo />
    </NotificationProvider>
  ),
};

export const TopRight: Story = {
  render: () => (
    <NotificationProvider placement="top-right">
      <ToastDemo />
    </NotificationProvider>
  ),
};

export const TopCenter: Story = {
  render: () => (
    <NotificationProvider placement="top-center">
      <ToastDemo />
    </NotificationProvider>
  ),
};

export const BottomRight: Story = {
  render: () => (
    <NotificationProvider placement="bottom-right">
      <ToastDemo />
    </NotificationProvider>
  ),
};

export const BottomLeft: Story = {
  render: () => (
    <NotificationProvider placement="bottom-left">
      <ToastDemo />
    </NotificationProvider>
  ),
};

export const BottomCenter: Story = {
  render: () => (
    <NotificationProvider placement="bottom-center">
      <ToastDemo />
    </NotificationProvider>
  ),
};

export const MultipleToasts: Story = {
  render: () => {
    const MultipleDemo = () => {
      const notification = useNotification();

      const showMultiple = () => {
        notification.info({ title: "First Toast" });
        notification.success({ title: "Second Toast" });
        notification.warning({ title: "Third Toast" });
        notification.error({ title: "Fourth Toast" });
      };

      return <Button onClick={showMultiple}>Show Multiple Toasts</Button>;
    };

    return (
      <NotificationProvider>
        <MultipleDemo />
      </NotificationProvider>
    );
  },
};

export const WithCustomContent: Story = {
  render: () => {
    const CustomDemo = () => {
      const notification = useNotification();

      const showCustom = () => {
        notification.info({
          title: <span className="font-bold text-blue-500">Custom Title</span>,
          description: (
            <div className="flex flex-col gap-2">
              <p>This is a custom description with:</p>
              <ul className="list-inside list-disc">
                <li>Custom styling</li>
                <li>Multiple lines</li>
                <li>And more!</li>
              </ul>
            </div>
          ),
        });
      };

      return <Button onClick={showCustom}>Show Custom Content</Button>;
    };

    return (
      <NotificationProvider>
        <CustomDemo />
      </NotificationProvider>
    );
  },
};
