import { Body1, Button, Input, Image, Link, Card } from '@fluentui/react-components';
import { useGoogleLogin } from '@react-oauth/google';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { FcGoogle } from 'react-icons/fc';

import { Field } from '../../components/field';
import { useMessage } from '../../hooks/use-message';
import { hasMissingRequiredField } from '../../utils/form-util';
import { constructErrorMessage, constructMessage } from '../../utils/string-util';
import { zodString } from '../../types/zod';
import { MessageType } from '../../models/system';
import {
  userRegistrationAtom,
  UserRegistrationStateFail,
  UserRegistrationStateProgress,
  UserRegistrationStateSuccess,
} from '../../states/user-registration';

import { z } from 'zod';
import { useAuthPageStyles } from './auth-styles';

const schema = z.object({
  studentId: zodString(),
  name: zodString(),
});

type FormData = z.infer<typeof schema>;

type SignupPageProps = {
  onNavigateToLogin: () => void;
};

export const SignupPage = ({ onNavigateToLogin }: SignupPageProps) => {
  const styles = useAuthPageStyles();

  const { t } = useTranslation();
  const { showSpinner, stopSpinner, dispatchMessage } = useMessage();
  const [state, action] = useAtom(userRegistrationAtom);
  const baselineTimestamp = useRef<number>(Date.now());

  const {
    register,
    handleSubmit,
    watch,
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

  const login = useGoogleLogin({
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

  const handleGoogleLogin = () => {
    if (!hasMissingRequiredField(formValues, schema)) {
      login();
    }
  };

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        {/* Left side: Login Form */}
        <div className={styles.formSection}>
          <Body1>
            {t('signup.greeting')} <b>{process.env.REACT_APP_NAME}</b>
          </Body1>

          <Field
            label={t('signup.studentId')}
            required
            validationMessage={errors.studentId?.message}
          >
            <Input {...register('studentId')} />
          </Field>
          <Field label={t('signup.name')} required validationMessage={errors.name?.message}>
            <Input {...register('name')} />
          </Field>

          <div className={styles.buttonRow}>
            <Button
              className={styles.googleButton}
              disabled={hasMissingRequiredField(formValues, schema)}
              icon={<FcGoogle size={20} />}
              onClick={handleSubmit(handleGoogleLogin)}
              type="button"
            >
              {t('signup.signUpWithGoogle')}
            </Button>
          </div>

          {/* Spacer to visually match login form height */}
          <div className={styles.formSpacer} />
        </div>

        <div className={styles.icon}>
          <Image
            alt="Login Icon"
            className={styles.icon}
            src="https://linkedup-web-app-media-bucket.s3.eu-west-2.amazonaws.com/logo384.png"
          />
        </div>
      </Card>

      {/* Sign up link below the card */}
      <div className={styles.signUpText}>
        {`${t('signup.alreadyUser')} ?  `}
        <Link inline onClick={onNavigateToLogin}>
          {t('signup.login')}
        </Link>{' '}
        {t('signup.withCredential')}
      </div>
    </div>
  );
};
