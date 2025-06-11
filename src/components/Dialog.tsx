import {
  Dialog as FluentUiDialog,
  Button,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@fluentui/react-components';
import React, { ReactNode } from 'react';

type DialogButton = {
  label: string;
  icon?: React.ReactElement;
  disabled?: boolean;
  isCta?: boolean;
  action?: () => void;
};

export type DialogProps = {
  title: string;
  content: ReactNode;
  buttons: DialogButton[];
};

type HideShowDialogProps = DialogProps & {
  open: boolean;
};
export const Dialog: React.FC<HideShowDialogProps> = ({
  title,
  content,
  open,
  buttons,
}: HideShowDialogProps) => {
  return (
    <FluentUiDialog modalType="alert" open={open}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{content}</DialogContent>
          <DialogActions>
            {buttons.map((b, index) => {
              return (
                <Button
                  key={index}
                  appearance={(b.isCta ?? false) ? 'primary' : 'secondary'}
                  disabled={b.disabled}
                  icon={b.icon}
                  onClick={b.action}
                >
                  {b.label}
                </Button>
              );
            })}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </FluentUiDialog>
  );
};
