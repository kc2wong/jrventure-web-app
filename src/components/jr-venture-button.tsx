import { Button } from '@fluentui/react-components';
import type { ButtonProps } from '@fluentui/react-components';
import {
  DismissRegular,
  SaveRegular,
  SearchRegular,
} from '@fluentui/react-icons';
import { useDialog } from 'handy-fluentui';
import { useTranslation } from 'react-i18next';

type JrVcButtonProps = Omit<
  Extract<ButtonProps, { as?: 'button' }>,
  'children' | 'appearance' | 'icon'
>;

const SearchButton = (props: JrVcButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button {...props} appearance="primary" icon={<SearchRegular />}>
      {t('general.text.search')}
    </Button>
  );
};

const CancelButton = (props: JrVcButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button {...props} icon={<DismissRegular />}>
      {t('general.text.cancel')}
    </Button>
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
    <Button
      {...props}
      appearance="primary"
      icon={<SaveRegular />}
      onClick={handleClick}
    >
      {t('general.text.save')}
    </Button>
  );
};

export { CancelButton, SaveButton, SearchButton };
