import React, { useEffect } from 'react';
import { makeStyles, tokens, Subtitle2, Avatar, Title3 } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { useBreadcrumb } from '../../hooks/use-breadcrumb';
import { MobileRoot } from '../../components/Container';
import { useNameInPreferredLanguage } from '../../hooks/use-preferred-language';
import { useTimezone } from '../../hooks/use-timezone';
import { useAtomValue } from 'jotai';
import { authenticationAtom } from '../../states/authentication';
import { SignoutButton } from '../../components/signout-button';

const useStyles = makeStyles({
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: tokens.spacingVerticalXXL,
    paddingBottom: tokens.spacingVerticalXXL,
    gap: tokens.spacingVerticalM,
  },
  name: {
    marginBottom: tokens.spacingVerticalXS,
  },
  lastLogin: {
    marginBottom: tokens.spacingVerticalL,
    color: tokens.colorNeutralForeground3,
  },
});

export const MobileUserProfilePage: React.FC = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { setNavgiateToParentOnly } = useBreadcrumb();
  const { formatDatetime } = useTimezone();
  const login = useAtomValue(authenticationAtom).login;

  useEffect(() => {
    setNavgiateToParentOnly(true);
  }, []);

  const name = useNameInPreferredLanguage(login?.user);
  return (
    <MobileRoot>
      <div className={styles.content}>
        <Avatar name={name} size={96} style={{ fontSize: 48 }} />
        <Title3 className={styles.name}>{name}</Title3>
        <Subtitle2 className={styles.lastLogin}>
          {`${t('userProfile.lastLogin')}: ${login?.user.lastLoginDatetime ? formatDatetime(new Date(login.user.lastLoginDatetime)) : ''}`}
        </Subtitle2>
        <SignoutButton showCaption={true} />
      </div>
    </MobileRoot>
  );
};
