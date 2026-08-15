import {
  Card,
  Link,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FuiBody1,
  FuiButton,
  FuiDivider,
  FuiInputText,
  FuiTitle2,
  useIsMobile,
  useToast,
} from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { authActionAtom, authStateAtom } from '../../stores/auth/auth-bloc';


type LoginFormValues = {
  username: string;
  password: string;
};

const useStyles = makeStyles({
  layout: {
    display: 'flex',
    minHeight: '100svh',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colorNeutralBackground3,
  },
  card: {
    display: 'flex',
    flexDirection: 'row',
    width: '50%',
    minWidth: '640px',
    minHeight: '480px',
    padding: '0',
    overflow: 'hidden',
  },
  cardMobile: {
    flexDirection: 'column',
    width: '100%',
    minWidth: 'unset',
    minHeight: '100svh',
    borderRadius: '0',
    boxShadow: 'none',
  },
  imagePanel: {
    flex: '1',
    position: 'relative',
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  imagePanelMobile: {
    flex: 'none',
    minHeight: '220px',
    marginTop: '64px',
  },
  heroImg: {
    position: 'absolute',
    top: '24px',
    right: '8px',
    bottom: '24px',
    left: '40px',
    width: 'calc(100% - 48px)',
    height: 'calc(100% - 48px)',
    objectFit: 'contain',
    objectPosition: 'center',
    display: 'block',
  },
  heroImgMobile: {
    top: '0',
    right: '24px',
    bottom: '0',
    left: '24px',
    width: 'calc(100% - 48px)',
    height: '100%',
  },
  formPanel: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '48px',
    paddingBottom: '48px',
    paddingLeft: '8px',
    paddingRight: '32px',
  },
  formPanelMobile: {
    paddingTop: '24px',
    paddingBottom: '48px',
    paddingLeft: '24px',
    paddingRight: '24px',
  },
  formContainer: {
    width: '100%',
    maxWidth: '360px',
  },
  header: {
    marginBottom: '36px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  forgot: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  signInButton: {
    width: '100%',
  },
  googleButton: {
    width: '100%',
  },
  googleIcon: {
    width: '18px',
    height: '18px',
    flexShrink: '0',
  },
});

export const LoginPage = () => {
  const styles = useStyles();
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const dispatch = useSetAtom(authActionAtom);
  const { error } = useAtomValue(authStateAtom);
  const toast = useToast();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const loginSchema = useMemo(
    () =>
      z.object({
        username: z.email({ error: t('validation.invalidEmail') }),
        password: z.string().min(1, t('validation.required')),
      }),
    [t],
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    await dispatch({ type: 'LOGIN', payload: { email: data.username, password: data.password } });
  };

  return (
    <div className={styles.layout}>
      <Card
        className={mergeClasses(styles.card, isMobile && styles.cardMobile)}
      >
        <div
          className={mergeClasses(
            styles.imagePanel,
            isMobile && styles.imagePanelMobile,
          )}
        >
          <img
            alt=""
            className={mergeClasses(
              styles.heroImg,
              isMobile && styles.heroImgMobile,
            )}
            src="/logo384.png"
          />
        </div>

        <div
          className={mergeClasses(
            styles.formPanel,
            isMobile && styles.formPanelMobile,
          )}
        >
          <div className={styles.formContainer}>
            <div className={styles.header}>
              <FuiTitle2 block text={t('login.title')} />
              <FuiBody1 text={t('login.subtitle')} />
            </div>

            <form
              className={styles.form}
              noValidate
              onSubmit={handleSubmit(onSubmit)}
            >
              <Controller
                control={control}
                name="username"
                render={({ field }) => (
                  <FuiInputText
                    {...field}
                    autoComplete="email"
                    errorMessage={errors.username?.message}
                    label={t('login.email')}
                    placeholder={t('login.emailPlaceholder')}
                    required
                    type="email"
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <FuiInputText
                    {...field}
                    autoComplete="current-password"
                    errorMessage={errors.password?.message}
                    label={t('login.password')}
                    placeholder={t('login.passwordPlaceholder')}
                    required
                    type="password"
                  />
                )}
              />

              <FuiButton
                appearance="primary"
                className={styles.signInButton}
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? t('login.signingIn') : t('login.signIn')}
              </FuiButton>

              <div className={styles.forgot}>
                <Link href="#">{t('login.forgotPassword')}</Link>
              </div>

              <FuiDivider>or</FuiDivider>

              <FuiButton
                className={styles.googleButton}
                icon={
                  <svg
                    aria-hidden="true"
                    className={styles.googleIcon}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                }
                type="button"
              >
                {t('login.loginWithGoogle')}
              </FuiButton>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}
