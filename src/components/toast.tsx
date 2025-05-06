import React from 'react';
import {
  Button,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarGroup,
  ToastIntent,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import { ToastMessage } from '../types/toast';
import { makeStyles } from '@fluentui/react-components';

const useStyles = makeStyles({
  toastOverlay: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
  },
});

type ToastProps = {
  message: ToastMessage;
  animate: boolean;
  onDimiss: () => void;
};

export const Toast: React.FC<ToastProps> = ({ message, animate, onDimiss }) => {
  const styles = useStyles();
  let intent: ToastIntent = 'info';
  let timeout = 3000;

  switch (message.type) {
    case 'success':
      intent = 'success';
      break;
    case 'info':
      intent = 'info';
      break;
    case 'warning':
      intent = 'warning';
      break;
    case 'error':
      intent = 'error';
      timeout = -1;
      break;
  }

  if (timeout > 0) {
    setTimeout(onDimiss, timeout);
  }

  return (
    <div className={styles.toastOverlay}>
      <MessageBarGroup animate={animate ? 'both' : 'exit-only'}>
        <MessageBar intent={intent}>
          <MessageBarBody>
            <span>{message.text}</span>
          </MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button
                appearance="transparent"
                icon={<DismissRegular />}
                onClick={onDimiss}
                size="small"
              />
            }
          />
        </MessageBar>
      </MessageBarGroup>
    </div>
  );
};
