import { makeStyles, tokens } from '@fluentui/react-components';

export const useAuthPageStyles = makeStyles({
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
    alignItems: 'flex-end',
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

  googleButton: {
    width: '100%',
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

  formSpacer: {
    height: '120px',

    '@media (min-width: 601px)': {
      height: '0px',
    },
  },
});
