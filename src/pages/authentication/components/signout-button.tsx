import { Button } from '@fluentui/react-components';
import { DoorArrowLeftRegular, CheckmarkRegular, DismissRegular } from '@fluentui/react-icons';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useFormDirtiness } from '@hooks/use-form-dirtiness';
import { useNavigationHelpers } from '../../../hooks/use-delay-navigate';
import { useDialog } from '../../../hooks/use-dialog';
import { useMessage } from '../../../hooks/use-message';
import { authenticationAtom } from '../../../states/authentication';
import { FC } from 'react';

type SignoutButtonProps = {
  showCaption: boolean;
};

export const SignoutButton: FC<SignoutButtonProps> = ({ showCaption }: SignoutButtonProps) => {
  const action = useSetAtom(authenticationAtom);
  const { t } = useTranslation();
  const { showConfirmationDialog } = useDialog();
  const { isDirty } = useFormDirtiness();
  const { showSpinner, stopSpinner } = useMessage();
  const { navigateWithSpinner } = useNavigationHelpers();

  const confirmAndSignOut = () => {
    showSpinner();
    setTimeout(() => {
      stopSpinner();
      action({ signOut: {} });
      navigateWithSpinner('/');
    }, 500);
  };

  return (
    <Button
      icon={<DoorArrowLeftRegular />}
      onClick={() =>
        showConfirmationDialog({
          title: { confirmType: t('system.message.signOut') },
          content: {
            message: isDirty()
              ? t('userProfile.discardChangeAndSignOut')
              : t('userProfile.doYouWantToSignOut'),
          },
          primaryButton: {
            label: t('userProfile.signOut'),
            icon: <CheckmarkRegular />,
            action: confirmAndSignOut,
          },
          secondaryButton: {
            label: t('system.message.cancel'),
            icon: <DismissRegular />,
          },
        })
      }
    >
      {showCaption ? t('userProfile.signOut') : ''}
    </Button>
  );
};
