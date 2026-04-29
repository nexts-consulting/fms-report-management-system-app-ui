import { Button } from "@/kits/components/button";
import { Icons } from "@/kits/components/icons";
import React from "react";

interface ConfirmationButtonsProps {
  onCancel: () => void;
  onConfirm: () => void;
  confirmIcon: typeof Icons.Login;
  confirmLabel: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
}

export const ConfirmationButtons = React.memo((props: ConfirmationButtonsProps) => {
  const { onCancel, onConfirm, confirmIcon, confirmLabel, cancelLabel = "Hủy bỏ", confirmDisabled } = props;

  return (
    <div className="grid grid-cols-2">
      <Button
        variant="secondary"
        size="large"
        icon={Icons.Close}
        className="w-full"
        onClick={onCancel}
      >
        {cancelLabel}
      </Button>
      <Button
        icon={confirmIcon}
        size="large"
        className="w-full"
        onClick={onConfirm}
        disabled={confirmDisabled}
      >
        {confirmLabel}
      </Button>
    </div>
  );
});

ConfirmationButtons.displayName = "ConfirmationButtons";

