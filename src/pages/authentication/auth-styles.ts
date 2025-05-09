import { makeStyles, tokens } from '@fluentui/react-components';

export const useAuthPageStyles = makeStyles({
    page: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: tokens.colorNeutralBackground2,
    },
    card: {
      display: 'flex',
      flexDirection: 'row',
      padding: '32px',
      columnGap: '32px',
      alignItems: 'flex-end',
    },
    formSection: {
      width: '300px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      gap: '12px',
    },
    buttonRow: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: 'auto',
    },
    googleButton: { width: '100%' },
    icon: {
      width: '384px',
      height: '384px',
      objectFit: 'contain',
    },
    signUpText: {
      marginTop: '16px',
      textAlign: 'center',
    },
  });
  