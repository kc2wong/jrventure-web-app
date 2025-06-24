import { Card, Body1, Button, tokens, Image, Link, makeStyles } from '@fluentui/react-components';
import React, { ReactNode } from 'react';
import { ReactElement } from 'react';

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
      justifyContent: 'flex-start',
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
    height: '384px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '12px',

    '@media (max-width: 600px)': {
      width: '100%',
      height: 'unset',
      justifyContent: 'flex-start',
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

type SubmitButtonProps = {
  label: string;
  icon: ReactElement;
  action?: () => void;
};

type SwitchLinkProps = {
  prefix: string;
  linkText: string;
  linkAction: () => void;
  suffix?: string;
};

type AuthPageProps = {
  greetingMessage: string;
  submitButton: SubmitButtonProps;
  children: ReactNode;
  switchLink?: SwitchLinkProps;
  spaceEvenly: boolean; // Optional prop to control spacing between elements in formSection
};

export const AuthPage: React.FC<AuthPageProps> = ({
  greetingMessage,
  submitButton: { label: submitButtonLabelKey, icon: submitButtonIcon, action: submitAction },
  children,
  switchLink,
  spaceEvenly,
}) => {
  const styles = useStyles();
  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <div className={styles.formSection} style={spaceEvenly ? {} : { justifyContent: 'unset' }}>
          <Body1>
            {greetingMessage} <b>{import.meta.env.VITE_REACT_APP_NAME}</b>
          </Body1>
          <form noValidate onSubmit={submitAction} style={{ margin: 0 }}>
            {children}
            <div className={styles.buttonRow}>
              <Button
                appearance="primary"
                className={styles.signInButton}
                disabled={submitAction === undefined}
                icon={submitButtonIcon}
                type="submit"
              >
                {submitButtonLabelKey}
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
