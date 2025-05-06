import React, { useRef, useState } from 'react';
import { ToastMessage } from '../types/toast';
import {
  Toast,
  Spinner,
  ToastTitle,
  makeStyles,
  useToastController,
  useId,
  Toaster,
  Link,
  ToastTrigger,
  ToastBody,
} from '@fluentui/react-components';
import { MessageContext } from '../contexts/message-context';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
});

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);

  const { t } = useTranslation();
  const styles = useStyles();

  const [isShowSpinner, setIsShowSpinner] = useState(false);
  const spinnerCount = useRef(0);

  const handleShowSpinner = () => {
    spinnerCount.current += 1;
    if (!isShowSpinner) {
      setIsShowSpinner(true);
    }
  };

  const handleStopSpinner = () => {
    const stopSpinner = spinnerCount.current === 1;
    spinnerCount.current = Math.max(spinnerCount.current - 1, 0);
    if (stopSpinner) {
      setIsShowSpinner(false);
    }
  };

  const handleDispatchMessage = (message: Omit<ToastMessage, 'id'>) => {
    dispatchToast(
      <Toast appearance="inverted">
        <ToastTitle
          action={
            <ToastTrigger>
              <Link>{t('system.message.dismiss')}</Link>
            </ToastTrigger>
          }
        >
          {message.type === 'error' ? t('system.message.error') : t('system.message.success')}
        </ToastTitle>
        <ToastBody>{message.text}</ToastBody>
      </Toast>,
      { intent: message.type, position: 'top-end', timeout: message.type === 'error' ? -1 : 3000 },
    );
  };

  return (
    <MessageContext.Provider
      value={{
        showSpinner: handleShowSpinner,
        stopSpinner: handleStopSpinner,
        dispatchMessage: handleDispatchMessage,
      }}
    >
      {children}
      {isShowSpinner && (
        <div className={styles.overlay}>
          <Spinner />
        </div>
      )}
      <Toaster toasterId={toasterId} />
    </MessageContext.Provider>
  );
};
