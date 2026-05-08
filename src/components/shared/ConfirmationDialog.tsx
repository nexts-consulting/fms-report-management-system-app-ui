"use client";

import React from "react";
import { Dialog } from "@/kits/components/dialog";
import { Button } from "@/kits/components/button";

type ConfirmationDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ConfirmationDialog = React.memo((props: ConfirmationDialogProps) => {
  const {
    isOpen,
    title,
    description,
    confirmLabel = "Xác nhận",
    cancelLabel = "Hủy",
    loading = false,
    onCancel,
    onConfirm,
  } = props;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      actions={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Đang xử lý..." : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-700">{description}</p>
    </Dialog>
  );
});

ConfirmationDialog.displayName = "ConfirmationDialog";
