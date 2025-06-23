import { Button, Divider, Input, Link } from '@fluentui/react-components';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGoogleLogin } from '@react-oauth/google';
import { zodEmail, zodString } from '@t/zod';
import { useAtom } from 'jotai';
import { useContext, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FcGoogle } from 'react-icons/fc'; // Google "G" icon
import { z } from 'zod';

import { Field } from '@components/field';
import { TimezoneContext } from '@contexts/timezone-context';
import { useMessage } from '@hooks/use-message';
import {
  authenticationAtom,
  AuthenticationStateFail,
  AuthenticationStateProgress,
  AuthenticationStateSuccess,
} from '@states/authentication';
import { hasMissingRequiredField } from '@utils/form-util';
import { logger } from '@utils/logging-util';
import { constructErrorMessage } from '@utils/string-util';

import { AuthPage } from './authen-page';
import { MessageType } from '../../models/system';

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
  const { showSpinner, stopSpinner, dispatchMessage } = useMessage();
  const { t } = useTranslation();
  const [authenticationState, action] = useAtom(authenticationAtom);
  const timezoneContext = useContext(TimezoneContext);

  const {
    control,
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

  const handleLogin = hasMissingRequiredField(formValues, schema)
    ? undefined
    : handleSubmit(async (data: FormData) => {
        logger.info(`Start sign in for user ${data.email}`);
        await action({ signIn: { email: data.email, password: data.password } });
      });

  return (
    <AuthPage
      greetingKey={t('login.greeting')}
      onSubmit={handleLogin}
      submitLabelKey={t('login.signIn')}
      switchLink={{
        prefix: `${t('login.newUser')}?`,
        linkText: t('login.register'),
        linkAction: props.onNavigateToSignup,
        suffix: t('login.studentAccount'),
      }}
    >
      <div style={{ marginTop: '30px' }}>
        <GoogleSignInButton />
        <Divider style={{ marginTop: '30px', marginBottom: '20px' }}>
          {t('login.orWithCredential')}
        </Divider>
      </div>
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <Field
            {...field}
            label={t('login.email')}
            labelHint={t('login.emailHint')}
            required
            validationMessage={getErrorMessage(errors.email?.message)}
          >
            <Input autoComplete="email" type="email" {...register('email')} />
          </Field>
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <Field
            {...field}
            label={t('login.password')}
            labelHint={t('login.passwordHint')}
            required
            validationMessage={getErrorMessage(errors.password?.message)}
          >
            <>
              <Input autoComplete="current-password" type="password" {...register('password')} />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link inline>{t('login.forgotPassword')}</Link>
              </div>
            </>
          </Field>
        )}
      />
    </AuthPage>
  );
};
