import { Card, Body1, Button, tokens, Image, Link, makeStyles } from '@fluentui/react-components';
import { PersonPasskeyRegular } from '@fluentui/react-icons';
import React, { ReactNode } from 'react';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
    padding: '16px',
    boxSizing: 'border-box',

    '@media (max-width: 600px)': {
      height: 'auto',
      minHeight: '100vh',
      paddingTop: '24px',
      paddingBottom: '24px',
    },
  },

  card: {
    display: 'flex',
    flexDirection: 'row',
    padding: '32px',
    columnGap: '32px',
    alignItems: 'flex-start',
    maxWidth: '750px',
    width: '100%',
    boxSizing: 'border-box',

    '@media (max-width: 600px)': {
      flexDirection: 'column-reverse',
      alignItems: 'center',
      padding: '24px 16px',
      rowGap: '20px',
    },
  },

  formSection: {
    width: '500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',

    '@media (max-width: 600px)': {
      width: '100%',
      minHeight: 'auto',
      gap: '12px',
    },
  },

  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',

    '@media (max-width: 600px)': {
      justifyContent: 'center',
      marginTop: '8px',
    },
  },

  signInButton: {
    '@media (max-width: 600px)': {
      width: '100%',
    },
  },

  icon: {
    width: '384px',
    height: '384px',
    objectFit: 'contain',

    '@media (max-width: 600px)': {
      width: '80%',
      height: 'auto',
      marginBottom: tokens.spacingVerticalM,
      display: 'flex',
      justifyContent: 'center',
      alignSelf: 'center',
    },
  },

  signUpText: {
    marginTop: '16px',
    textAlign: 'center',
    padding: '0 12px',
  },

});

type SwitchLinkProps = {
  prefix: string;
  linkText: string;
  linkAction: () => void;
  suffix?: string;
};

type AuthPageProps = {
  greetingKey: string;
  submitLabelKey: string;
  onSubmit?: () => void;
  children: ReactNode;
  switchLink?: SwitchLinkProps;
};

export const AuthPage: React.FC<AuthPageProps> = ({
  greetingKey,
  submitLabelKey,
  onSubmit,
  children,
  switchLink,
}) => {
  const styles = useStyles();
  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <div className={styles.formSection}>
          <Body1>
            {greetingKey} <b>{import.meta.env.VITE_REACT_APP_NAME}</b>
          </Body1>
          <form noValidate onSubmit={onSubmit} style={{ margin: 0 }}>
            {children}
            <div className={styles.buttonRow}>
              <Button
                appearance="primary"
                className={styles.signInButton}
                disabled={onSubmit === undefined}
                icon={<PersonPasskeyRegular />}
                type="submit"
              >
                {submitLabelKey}
              </Button>
            </div>
          </form>
        </div>
        <div className={styles.icon}>
          <Image
            alt="Login Icon"
            className={styles.icon}
            src="https://linkedup-web-app-media-bucket.s3.eu-west-2.amazonaws.com/logo384.png"
          />
        </div>
      </Card>
      {switchLink && (
        <div className={styles.signUpText}>
          {/* \u00A0 = nbsp; */}
          {`${switchLink.prefix}\u00A0`}
          <Link inline onClick={switchLink.linkAction}>
            {switchLink.linkText}
          </Link>
          {switchLink.suffix ? `\u00A0${switchLink.suffix}` : null}
        </div>
      )}
    </div>
  );
};
