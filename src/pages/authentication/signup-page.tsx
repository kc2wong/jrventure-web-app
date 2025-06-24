import { makeStyles, Subtitle2 } from '@fluentui/react-components';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGoogleLogin } from '@react-oauth/google';
import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FcGoogle } from 'react-icons/fc';
import { z } from 'zod';

import { Field } from '@components/field';
import { Input } from '@components/input';
import { useMessage } from '@hooks/use-message';
import {
  userRegistrationAtom,
  UserRegistrationStateFail,
  UserRegistrationStateProgress,
  UserRegistrationStateSuccess,
} from '@states/user-registration';
import { zodString } from '@t/zod';
import { hasMissingRequiredField } from '@utils/form-util';
import { constructErrorMessage, constructMessage } from '@utils/string-util';

import { AuthPage } from './authen-page';
import { MessageType } from '../../models/system';

export const useStyles = makeStyles({
  spacer: {
    '@media (min-width: 601px)': {
      marginBottom: '20px',
    },
  },
});

const schema = z.object({
  studentId: zodString(),
  name: zodString(),
});

type FormData = z.infer<typeof schema>;

type SignupPageProps = {
  onNavigateToLogin: () => void;
};

export const SignupPage = ({ onNavigateToLogin }: SignupPageProps) => {
  const styles = useStyles();

  const { t } = useTranslation();
  const { showSpinner, stopSpinner, dispatchMessage } = useMessage();
  const [state, action] = useAtom(userRegistrationAtom);
  const baselineTimestamp = useRef<number>(Date.now());

  const {
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const formValues = watch();

  useEffect(() => {
    if (state.eventTime <= baselineTimestamp.current) {
      return;
    }
    baselineTimestamp.current = state.eventTime;

    if (state instanceof UserRegistrationStateProgress) {
      showSpinner();
    } else {
      stopSpinner();

      if (state instanceof UserRegistrationStateSuccess) {
        if (!state.result) {
          dispatchMessage({
            type: MessageType.Success,
            text: constructMessage(t, 'signup.success', [state.email])!,
          });
        } else {
          onNavigateToLogin();
        }
      }

      if (state instanceof UserRegistrationStateFail) {
        dispatchMessage({
          type: state.failure.type,
          text: constructErrorMessage(
            t,
            state.failure.key,
            state.failure.parameters,
            state.failure.fallbackMessage,
          )!,
        });
      }
    }
  }, [state]);

  const handleGoogleLogin = handleSubmit(() => {
    useGoogleLogin({
      onSuccess: (tokenResponse) => {
        action({
          accessToken: tokenResponse.access_token,
          studentId: formValues.studentId,
          studentName: formValues.name,
        });
      },
      onError: (errorResponse) => {
        dispatchMessage({
          type: MessageType.Error,
          text: errorResponse.error_description ?? errorResponse.error ?? 'Unknown Error',
        });
      },
    });
  });

  return (
    <AuthPage
      greetingMessage={t('signup.greeting')}
      spaceEvenly={false}
      submitButton={{
        label: t('signup.signUpWithGoogle'),
        icon: <FcGoogle />,
        action: hasMissingRequiredField(formValues, schema) ? undefined : handleGoogleLogin,
      }}
      switchLink={{
        prefix: `${t('signup.alreadyUser')}?`,
        linkText: t('signup.login'),
        linkAction: onNavigateToLogin,
        suffix: t('signup.withCredential'),
      }}
    >
      <div style={{ marginTop: '30px' }}></div>

      <Controller
        control={control}
        name="studentId"
        render={({ field: { ref, ...rest } }) => (
          <Field
            label={t('signup.studentId')}
            required
            validationMessage={errors.studentId?.message}
          >
            <Input ref={ref} {...rest} />
          </Field>
        )}
      />
      <Controller
        control={control}
        name="name"
        render={({ field: { ref, ...rest } }) => (
          <Field label={t('signup.name')} required validationMessage={errors.name?.message}>
            <Input ref={ref} className={styles.spacer} {...rest} />
          </Field>
        )}
      />
    </AuthPage>
  );
};
