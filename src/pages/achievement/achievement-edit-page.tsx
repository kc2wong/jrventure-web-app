import { z } from 'zod';
import { Achievement, AchievementCreation } from '../../models/openapi';
import {
  Button,
  Divider,
  Option,
  Rating,
  Textarea,
  tokens,
  Body1,
  Caption1,
} from '@fluentui/react-components';
import { Field } from '../../components/Field';
import { Input } from '../../components/Input';
import {
  AddRegular,
  CheckmarkRegular,
  DismissRegular,
  EraserRegular,
  SearchRegular,
} from '@fluentui/react-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Form, Root, Row } from '../../components/Container';
import { zodInt, zodOptionalString, zodString } from '../../types/zod';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useMessage } from '../../hooks/use-message';
import { useAtom, useAtomValue } from 'jotai';
import { useDialog } from '../../hooks/use-dialog';
import { useFormDirty } from '../../contexts/FormDirty';
import { EmptyCell } from '../../components/Container';
import { hasMissingRequiredField } from '../../utils/form-util';
import { useBreadcrumb } from '../../hooks/use-breadcrumb';
import { authenticationAtom } from '../../states/authentication';
import {
  achievementDetailAtom,
  AchievementDetailStateFail,
  AchievementDetailStateSearchProgress,
  AchievementDetailStateSearchStudentSuccess,
  AchievementDetailStateUpdateSuccess,
  AchievementDetailStateSearchSuccess,
  AchievementDetailStateSearchAchievementSuccess,
} from '../../states/achievement-detail';
import { getFieldValueInPreferredLanguage } from '../../utils/language-util';
import { AchievementStatusIcon } from './achievement-status-label';
import { Dropdown } from '../../components/drop-down';
import { useLocation } from 'react-router-dom';
import { Message, MessageType } from '../../models/system';
import { constructErrorMessage, constructMessage } from '../../utils/string-util';

type AchievementEditPageProps = {};

export const AchievementEditPage: React.FC<AchievementEditPageProps> = (
  {
    // mode,
    // onBackButtonClick,
    // onSave,
  }: AchievementEditPageProps,
) => {
  const { t, i18n } = useTranslation();
  const { showSpinner, stopSpinner, dispatchMessage } = useMessage();
  const { useStartBreadcrumb } = useBreadcrumb();

  const { showConfirmationDialog } = useDialog();
  const { markDirty, resetDirty } = useFormDirty();

  const [state, action] = useAtom(achievementDetailAtom);

  const authentication = useAtomValue(authenticationAtom);

  const baselineTimestamp = useRef<number>(Date.now());

  const _achievement2FormData = (achievement?: Achievement): FormData => {
    if (achievement) {
      const { rating, ...rest } = achievement;
      return {
        ...rest,
        rating: rating ?? 0,
      };
    } else {
      return {
        studentId: '',
        activityId: '',
        comment: '',
        rating: 0,
      };
    }
  };

  const _formData2AchievementCreation = (formData: FormData): AchievementCreation => {
    const { studentId, activityId, rating, comment } = formData;
    return {
      studentId,
      activityId,
      rating,
      comment,
    };
  };

  /**
   * Reset the form and state
   */
  const _resetAll = () => {
    resetForm(_achievement2FormData());
    const role = authentication.login?.user.role;
    action({
      reset: {
        student:
          role === 'Student' || role === 'Parent' ? authentication.selectedStudent : undefined,
      },
    });
  };

  const _handleFailre = (message: Message) => {
    if (message?.type === MessageType.Error) {
      dispatchMessage({
        type: message.type,
        text: constructErrorMessage(t, message.key, message.parameters),
      });
    }
  };

  const schema = z
    .object({
      id: zodOptionalString(),
      studentId: zodString(),
      activityId: zodString(),
      comment: zodString(),
      rating: zodInt(),
    })
    .refine((data) => data.studentId?.trim().length ?? 0 > 0, {
      message: 'zod.error.Required',
      path: ['studentId'],
    })
    .refine((data) => data.comment.trim().length ?? 0 > 0, {
      message: 'zod.error.Required',
      path: ['comment'],
    });
  type FormData = z.infer<typeof schema>;

  const {
    control,
    setValue,
    handleSubmit,
    reset: resetForm,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    defaultValues: _achievement2FormData(),
    resolver: zodResolver(schema),
  });

  const location = useLocation();
  useEffect(() => {
    useStartBreadcrumb('achievementSubmission.title');
    if (location.state.reset === true) {
      _resetAll();
    }
  }, []);

  const formValues = watch();
  useEffect(() => {
    // to trigger enable / disable of save button and mark dirtiness
    if (isDirty) {
      markDirty();
    }
    return () => resetDirty();
  }, [formValues, isDirty, markDirty, resetDirty]);

  useEffect(() => {
    const student = authentication.selectedStudent;
    if (student) {
      action({ searchStudent: { student } });
    }
  }, [authentication]);

  useEffect(() => {
    if (state.eventTime <= baselineTimestamp.current) {
      return;
    }
    baselineTimestamp.current = state.eventTime;
    if (state instanceof AchievementDetailStateSearchProgress) {
      showSpinner();
    } else if (state instanceof AchievementDetailStateSearchSuccess) {
      stopSpinner();
      if (state instanceof AchievementDetailStateSearchStudentSuccess) {
        const student = state.student;
        if (student) {
          if (student.id !== formValues.studentId) {
            setValue('studentId', student.id);
          }
          // Search activity for students
          action({ searchActivity: {} });
        }
      } else if (state instanceof AchievementDetailStateSearchAchievementSuccess) {
        resetForm(_achievement2FormData(state.achievement));
      }
    } else if (state instanceof AchievementDetailStateUpdateSuccess) {
      stopSpinner();
      dispatchMessage({
        type: MessageType.Success,
        text: constructMessage(
          t,
          state.achievement.status === 'Pending'
            ? 'achievementSubmission.message.submittedForApproval'
            : 'achievementSubmission.message.submittedSuccess',
        ),
      });
      setTimeout(() => {
        _resetAll();
      }, 2000);
    } else if (state instanceof AchievementDetailStateFail) {
      stopSpinner();
      _handleFailre(state.failure);
    }
  }, [state]);

  const resetButton = (
    <Button
      icon={<EraserRegular />}
      onClick={() => {
        _resetAll();
      }}
    >
      {t('system.message.clear')}
    </Button>
  );

  const newAchievementButton = (
    <Button
      appearance="primary"
      icon={<AddRegular />}
      onClick={() => {
        if (selectedStudent !== undefined && selectedActivity !== undefined) {
          action({
            newAchievement: {
              studentId: selectedStudent.id,
              activityId: selectedActivity.activity.id,
            },
          });
        }
      }}
      style={{ width: 'auto', height: 'auto', alignSelf: 'center', justifySelf: 'end' }}
    >
      {t('achievementSubmission.addAchievement')}
    </Button>
  );

  const getAchievementButton = (
    <Button
      appearance="primary"
      icon={<SearchRegular />}
      onClick={() => {
        if (selectedStudent !== undefined && selectedActivity !== undefined) {
          action({
            newAchievement: {
              studentId: selectedStudent.id,
              activityId: selectedActivity.activity.id,
            },
          });
        }
      }}
      style={{ width: 'auto', height: 'auto', alignSelf: 'center', justifySelf: 'end' }}
    >
      {t('achievementSubmission.getAchievement')}
    </Button>
  );
  const saveButton = (
    <Button
      appearance="primary"
      disabled={hasMissingRequiredField(formValues, schema)}
      icon={<CheckmarkRegular />}
      onClick={handleSubmit(() => {
        showConfirmationDialog({
          confirmType: 'save',
          message: t('achievementSubmission.message.confirmSubmission'),
          primaryButton: {
            label: t('system.message.submit'),
            icon: <CheckmarkRegular />,
            action: () => {
              action({ create: _formData2AchievementCreation(formValues) });
            },
          },
          secondaryButton: { label: t('system.message.cancel'), icon: <DismissRegular /> },
        });
      })}
    >
      {t('system.message.submit')}
    </Button>
  );

  const selectedStudent = state.student;
  const studentInfo = selectedStudent
    ? `P${selectedStudent?.classId}-${selectedStudent?.studentNumber} ${getFieldValueInPreferredLanguage(i18n.language, 'name', selectedStudent)}`
    : '';
  const selectedActivity = state.activity.find(
    (item) => item.activity.id === formValues.activityId,
  );
  const selectedAchievement = state.achievement;

  // Student not found yet - Reset
  // Activity with achievement - Reset, Get
  // Activity without achievement - Reset, New
  // Achievement retrieve - Reset, Save
  return (
    <Root>
      <Form
        buttons={
          selectedAchievement
            ? [resetButton, saveButton]
            : selectedActivity
              ? [
                  resetButton,
                  selectedActivity.achievementStatus ? getAchievementButton : newAchievementButton,
                ]
              : [resetButton]
        }
        numColumn={3}
        styles={{ width: '600px' }}
        title={t('achievementSubmission.title')}
      >
        {authentication.login?.user.role === 'Teacher' ? (
          <>
            <div style={{ gridColumn: 'span 3', marginBottom: tokens.spacingVerticalS }}>
              <Divider>
                <Caption1>{t('achievementSubmission.studentInfo')}</Caption1>
              </Divider>
            </div>

            <Controller
              control={control}
              name="studentId"
              render={({ field }) => {
                const { value, ...others } = field;
                return (
                  <Field
                    label={t('achievementSubmission.studentId')}
                    labelHint="P[1 to 6]-[1 to 30] e.g. P1A-1, P1A-2, .... P6E-30"
                    validationMessage={errors?.studentId?.message}
                  >
                    <Input
                      {...others}
                      onBlur={() => {
                        if (value) {
                          action({ searchStudent: { studentId: value } });
                        }
                      }}
                      readOnly={selectedActivity !== undefined}
                      value={value}
                    />
                  </Field>
                );
              }}
            />
            <Field colSpan={2} label={t('achievementSubmission.studentName')}>
              <Input readOnly value={studentInfo} />
            </Field>
          </>
        ) : (
          <></>
        )}

        {selectedStudent ? (
          <>
            <div
              style={{
                gridColumn: 'span 3',
                marginBottom: tokens.spacingVerticalS,
                marginTop: tokens.spacingVerticalXXL,
              }}
            >
              <Divider>
                <Caption1>{t('achievementSubmission.activityDetail')}</Caption1>
              </Divider>
            </div>

            <Controller
              control={control}
              name="activityId"
              render={({ field }) => {
                const activityName = getFieldValueInPreferredLanguage(
                  i18n.language,
                  'name',
                  selectedActivity?.activity,
                );
                const { value, ...rest } = field;
                return (
                  <Field
                    colSpan={2}
                    label={t('achievementSubmission.activityName')}
                    required={true}
                    validationMessage={errors?.activityId?.message}
                  >
                    <Dropdown
                      {...rest}
                      multiselect={false}
                      onOptionSelect={(_ev, data) => {
                        field.onChange(data.selectedOptions[0] ?? '');
                      }}
                      readOnly={selectedAchievement !== undefined}
                      selectedOptions={value.length > 0 ? [value] : []}
                      value={activityName}
                    >
                      {state.activity.map(({ achievementStatus, activity }) => {
                        const name = getFieldValueInPreferredLanguage(
                          i18n.language,
                          'name',
                          activity,
                        );
                        return (
                          <Option key={activity.id} text={name} value={activity.id}>
                            <Row>
                              <div style={{ width: '20px' }}>
                                {achievementStatus ? (
                                  <AchievementStatusIcon status={achievementStatus} />
                                ) : (
                                  <></>
                                )}
                              </div>
                              <Body1>{name}</Body1>
                            </Row>
                          </Option>
                        );
                      })}
                    </Dropdown>
                  </Field>
                );
              }}
            />
            <EmptyCell />

            <Field colSpan={3} label={t('achievementSubmission.activityDescription')}>
              <Textarea
                readOnly
                rows={4}
                value={selectedActivity ? selectedActivity.activity.description : ''}
              ></Textarea>
            </Field>

            <Field label={t('achievementSubmission.eCoin')}>
              <Input
                readOnly
                value={selectedActivity ? `${selectedActivity.activity.eCoin}` : ''}
              />
            </Field>
            <EmptyCell colSpan={2} />
          </>
        ) : (
          <></>
        )}

        {selectedAchievement ? (
          <>
            <div
              style={{
                gridColumn: 'span 3',
                marginBottom: tokens.spacingVerticalS,
                marginTop: tokens.spacingVerticalL,
              }}
            >
              <Divider>
                <Caption1>{`${t('achievementSubmission.achievement')} (New)`}</Caption1>
              </Divider>
            </div>

            {selectedActivity?.activity.ratable === true ? (
              <>
                <Controller
                  control={control}
                  name="rating"
                  render={({ field }) => {
                    const { onChange, onBlur, ...rest } = field;
                    return (
                      <Field label={t('achievementSubmission.rating')}>
                        <Rating
                          {...rest}
                          color="brand"
                          onChange={(_, data) => onChange(data.value)}
                          style={{ marginLeft: tokens.spacingHorizontalL }}
                        />
                      </Field>
                    );
                  }}
                />
                <EmptyCell colSpan={2} />
              </>
            ) : (
              <></>
            )}

            <Controller
              control={control}
              name="comment"
              render={({ field }) => {
                return (
                  <Field colSpan={3} label={t('achievementSubmission.comment')}>
                    <Textarea {...field} rows={4}></Textarea>
                  </Field>
                );
              }}
            />
          </>
        ) : (
          <></>
        )}
      </Form>
      <div style={{ flex: 1 }}></div>
    </Root>
  );
};
