import React, { useEffect } from 'react';
import {
  makeStyles,
  tokens,
  Body1Strong,
  List,
  ListItem,
  Persona,
  Button,
} from '@fluentui/react-components';
import { PeopleAddRegular } from '@fluentui/react-icons';

import { useTranslation } from 'react-i18next';
import { useBreadcrumb } from '../../hooks/use-breadcrumb';
import { MobileRoot } from '../../components/Container';
import { useNameInPreferredLanguage } from '../../hooks/use-preferred-language';
import { useAtomValue } from 'jotai';
import { authenticationAtom } from '../../states/authentication';
import { useNavigationHelpers } from '../../hooks/use-delay-navigate';

const useStyles = makeStyles({
  content: {
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: tokens.spacingVerticalXXL,
    marginRight: tokens.spacingHorizontalXXL,
    marginLeft: tokens.spacingHorizontalXXL,
    gap: tokens.spacingVerticalM,
  },
});

export const MobileParentUserPage: React.FC = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { navigateWithSpinner } = useNavigationHelpers();
  const { setNavgiateToParentOnly } = useBreadcrumb();
  const login = useAtomValue(authenticationAtom).login;

  useEffect(() => {
    setNavgiateToParentOnly(true);
  }, []);

  const parentUser = login?.parentUser ?? [];
  
  return (
    <MobileRoot>
      <div className={styles.content}>
        <Body1Strong>
          {parentUser.length > 0 ? t('userProfile.parentUser') : t('userProfile.noParentUser')}
        </Body1Strong>
        <List style={{ marginTop: tokens.spacingHorizontalS }}>
          {parentUser.map((u) => (
            <ListItem key={u.id}>
              <Persona name={useNameInPreferredLanguage(u)} secondaryText={u.email} />
            </ListItem>
          ))}
        </List>
        <Button
          icon={<PeopleAddRegular />}
          onClick={() => {
            navigateWithSpinner('/user/add-parent');
          }}
        >
          {t('userProfile.addParentUser')}
        </Button>
      </div>
    </MobileRoot>
  );
};
