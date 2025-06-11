import { useState } from 'react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Text } from '@fluentui/react-components';
import { CheckmarkRegular, DismissRegular } from '@fluentui/react-icons';
import { constructMessage } from '../utils/string-util';
import {
  ConfirmationDialogProps,
  DialogContext,
  DiscardChangeDialogProps,
} from '../contexts/dialog-context';
import { Dialog, DialogProps } from '../components/dialog';

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogProps, setDialogProps] = useState<
    (DialogProps & { openTime: number; closeTime: number }) | undefined
  >(undefined);

  const handleShowConfirmationDialog = ({
    title,
    content,
    primaryButton,
    secondaryButton,
    tertiaryButton,
  }: ConfirmationDialogProps) => {
    const buttonList = [];
    if (tertiaryButton) {
      buttonList.push(tertiaryButton);
    }
    if (secondaryButton) {
      buttonList.push(secondaryButton);
    }
    buttonList.push({ ...primaryButton, isCta: true });
    setDialogProps({
      title: title.title ?? constructMessage(t, 'system.message.confirmAction', [title.confirmType]),
      content: content.form ?? <Text>{content.message}</Text>,
      buttons: buttonList,
      openTime: new Date().getTime(),
      closeTime: -1,
    });
  };

  const handleShowDiscardChangeDialog = (t: TFunction, dialogProps: DiscardChangeDialogProps) => {
    setDialogProps({
      title: t('system.message.discardChange'),
      content: <Text>t('system.message.doYouWantToDiscardChange')</Text>,
      buttons: [
        { label: t('system.message.no'), icon: <DismissRegular />, isCta: true },
        { label: t('system.message.yes'), icon: <CheckmarkRegular />, action: dialogProps.action },
      ],
      openTime: new Date().getTime(),
      closeTime: -1,
    });
  };

  const hideDialog = () => {
    if (dialogProps) {
      setDialogProps({ ...dialogProps, closeTime: new Date().getTime() });
    }
  };

  const { t } = useTranslation();
  return (
    <DialogContext.Provider
      value={{
        showConfirmationDialog: handleShowConfirmationDialog,
        showDiscardChangeDialog: (props) => handleShowDiscardChangeDialog(t, props),
      }}
    >
      {children}
      {dialogProps && (
        <Dialog
          buttons={dialogProps.buttons.map(({ action, ...others }) => {
            return {
              ...others,
              action: () => {
                hideDialog();
                if (action) {
                  action();
                }
              },
            };
          })}
          content={dialogProps.content}
          open={dialogProps.openTime > dialogProps.closeTime}
          title={dialogProps.title}
        ></Dialog>
      )}
    </DialogContext.Provider>
  );
};
