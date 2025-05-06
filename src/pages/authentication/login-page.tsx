import {
  Body1,
  Button,
  Divider,
  Input,
  Link,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { PersonPasskeyRegular } from '@fluentui/react-icons';
import { Card, CardHeader, CardPreview } from '@fluentui/react-components';
import { useGoogleLogin } from '@react-oauth/google';
import { useAtom } from 'jotai';
import { ButtonPanel } from '../../components/ButtonPanel';
import {
  authenticationAtom,
  AuthenticationStateFail,
  AuthenticationStateProgress,
  AuthenticationStateSuccess,
} from '../../states/authentication';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field } from '../../components/Field';
import { hasMissingRequiredField } from '../../utils/form-util';
import { logger } from '../../utils/logging-util';
import { constructErrorMessage } from '../../utils/string-util';
import { useContext, useEffect } from 'react';
import { useMessage } from '../../hooks/use-message';
import { FcGoogle } from 'react-icons/fc'; // Google "G" icon
import { MessageType } from '../../models/system';
import { zodEmail, zodString } from '../../types/zod';
import { TimezoneContext } from '../../contexts/timezone-context';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center', // Centers horizontally
    alignItems: 'center', // Centers vertically
    height: '100vh', // Full height of the viewport
  },
  card: { maxWidth: '400px', width: '30%' },
  box: { backgroundColor: tokens.colorNeutralBackground2 },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    margin: '0 20px 0 20px',
    padding: '10px 0 0 0',
  },
  buttonPanel: { margin: '20px 20px 20px 0' },
});

const schema = z.object({
  email: zodEmail(),
  password: zodString(),
});

type FormData = z.infer<typeof schema>;
type LoginPageProps = { onNavigateToSignup: () => void };

function GoogleSignInButton() {
  const { t } = useTranslation();
  const [, action] = useAtom(authenticationAtom);
  const { dispatchMessage } = useMessage();

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      action({ googleAuthenticate: { idToken: tokenResponse.access_token } });
    },
    onError: (errorResponse) => {
      dispatchMessage({
        type: MessageType.Error,
        text: errorResponse.error_description ?? errorResponse.error ?? 'Unknown Error',
      });
    },
  });

  return (
    <Button icon={<FcGoogle size={20} />} onClick={() => login()} style={{ width: '100%' }}>
      {t('login.signInWithGoogle')}
    </Button>
  );
}

export const LoginPage = (props: LoginPageProps) => {
  const styles = useStyles();
  const { showSpinner, stopSpinner, dispatchMessage } = useMessage();
  const { t } = useTranslation();
  const [authenticationState, action] = useAtom(authenticationAtom);
  const timezoneContext = useContext(TimezoneContext);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (authenticationState instanceof AuthenticationStateProgress) {
      showSpinner();
    } else if (
      authenticationState instanceof AuthenticationStateSuccess &&
      authenticationState.login === undefined
    ) {
      timezoneContext.setTimezone('HongKong');
      stopSpinner();
    } else if (authenticationState instanceof AuthenticationStateFail) {
      stopSpinner();
      const failure = authenticationState.failure;
      dispatchMessage({
        type: failure.type,
        text: constructErrorMessage(t, failure.key, failure.parameters)!,
      });
    }
  }, [authenticationState]);

  const formValues = watch();
  const getErrorMessage = (key?: string) => (key ? constructErrorMessage(t, key) : undefined);

  const handleLogin = async (data: FormData) => {
    logger.info(`Start sign in for user ${data.email}`);
    await action({ signIn: { email: data.email, password: data.password } });
  };

  return (
    <div className={styles.container}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <Card className={styles.card}>
          <CardHeader
            header={
              <Body1>
                {t('login.greeting')} <b>{process.env.REACT_APP_NAME}</b>
              </Body1>
            }
          />
          <CardPreview className={styles.box}>
            <div>
              <div className={styles.form}>
                <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                  <GoogleSignInButton />
                  <Divider style={{ marginTop: '20px' }}>
                    {t('system.message.or').toUpperCase()}
                  </Divider>
                </div>
                <Field
                  label={t('login.email')}
                  labelHint={t('login.emailHint')}
                  required
                  validationMessage={getErrorMessage(errors.email?.message)}
                >
                  <Input type="email" {...register('email')} />
                </Field>
                <Field
                  label={t('login.password')}
                  labelHint={t('login.passwordHint')}
                  required
                  validationMessage={getErrorMessage(errors.password?.message)}
                >
                  <>
                    <Input type="password" {...register('password')} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Link inline>{t('login.forgotPassword')}</Link>{' '}
                    </div>
                  </>
                </Field>
              </div>
              <ButtonPanel className={styles.buttonPanel}>
                <Button
                  appearance="primary"
                  disabled={hasMissingRequiredField(formValues, schema)}
                  icon={<PersonPasskeyRegular />}
                  onClick={handleSubmit(handleLogin)}
                >
                  {t('login.signIn')}
                </Button>
              </ButtonPanel>
            </div>
          </CardPreview>
        </Card>
        <div style={{ textAlign: 'center' }}>
          {`${t('login.newUser')} ?  `}
          <Link inline onClick={props.onNavigateToSignup}>
            {t('login.register')}
          </Link>{' '}
          {t('login.studentAccount')}
        </div>
      </div>
    </div>
  );
};
