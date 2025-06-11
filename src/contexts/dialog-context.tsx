import React, { createContext, ReactNode } from 'react';
import { OneOnly } from '../utils/object-util';

type BaseDialogButton = { label: string; icon?: React.ReactElement };

type PositiveDialogButton = BaseDialogButton & { action: () => void };

type NegativeDialogButton = BaseDialogButton & { action?: () => void };

type DialogTitle = OneOnly<{
  confirmType: string;
  title: string;
}>;

type DialogContent = OneOnly<{
  message: string;
  form: ReactNode;
}>;

type ConfirmationDialogProps = {
  title: DialogTitle;
  content: DialogContent;
  primaryButton: PositiveDialogButton;
  secondaryButton?: NegativeDialogButton;
  tertiaryButton?: NegativeDialogButton;
};

type DiscardChangeDialogProps = { action: () => void };

interface DialogContextType {
  showConfirmationDialog: (dialogProps: ConfirmationDialogProps) => void;
  showDiscardChangeDialog: (dialogProps: DiscardChangeDialogProps) => void;
}

const DialogContext = createContext<DialogContextType>({
  showConfirmationDialog: () => {},
  showDiscardChangeDialog: () => {},
});

export type { DiscardChangeDialogProps, ConfirmationDialogProps, DialogContextType };
export { DialogContext };
