import {
  DismissRegular,
  SaveRegular,
  SearchRegular,
} from '@fluentui/react-icons';
import { FuiButton, useDialog } from 'handy-fluentui';
import type { FuiButtonProps } from 'handy-fluentui';
import { useTranslation } from 'react-i18next';

type JrVcButtonProps = Omit<FuiButtonProps, 'children' | 'appearance' | 'icon'>;

const SearchButton = (props: JrVcButtonProps) => {
  const { t } = useTranslation();
  return (
    <FuiButton {...props} appearance="primary" icon={<SearchRegular />}>
      {t('general.text.search')}
    </FuiButton>
  );
};

const CancelButton = (props: JrVcButtonProps) => {
  const { t } = useTranslation();
  return (
    <FuiButton {...props} icon={<DismissRegular />}>
      {t('general.text.cancel')}
    </FuiButton>
  );
};

const SaveButton = ({ onClick, ...props }: JrVcButtonProps) => {
  const { t } = useTranslation();
  const dialog = useDialog();

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    dialog.openDialog({
      content: t('general.text.confirmSaveContent'),
      primaryButton: {
        action: () => onClick?.(e),
        icon: <SaveRegular />,
        label: t('general.text.save'),
      },
      secondaryButton: {
        action: () => {},
        icon: <DismissRegular />,
        label: t('general.text.cancel'),
      },
      title: t('general.text.confirmSave'),
    });
  };

  return (
    <FuiButton
      {...props}
      appearance="primary"
      icon={<SaveRegular />}
      onClick={handleClick}
    >
      {t('general.text.save')}
    </FuiButton>
  );
};

export { CancelButton, SaveButton, SearchButton };
