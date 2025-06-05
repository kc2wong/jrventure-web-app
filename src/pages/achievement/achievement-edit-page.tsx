import { z } from 'zod';
import {
  Achievement,
  AchievementAttachmentCreation,
  AchievementCreation,
} from '../../models/openapi';
import {
  Body1,
  Button,
  Caption1,
  Divider,
  makeStyles,
  Option,
  shorthands,
  Image,
  TabValue,
  Textarea,
  tokens,
  TabList,
  Tab,
  Caption2,
  Rating,
  Skeleton,
  SkeletonItem,
} from '@fluentui/react-components';
import { Field } from '../../components/Field';
import { Input } from '../../components/Input';
import { Dropdown } from '../../components/drop-down';
import {
  AddRegular,
  AppsListDetailFilled,
  AppsListDetailRegular,
  bundleIcon,
  CheckmarkRegular,
  CommentFilled,
  CommentRegular,
  Dismiss24Regular,
  DismissRegular,
  EraserRegular,
  SearchRegular,
} from '@fluentui/react-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Form, Root, Row } from '../../components/Container';
import { zodInt, zodOptionalString, zodString } from '../../types/zod';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMessage } from '../../hooks/use-message';
import { useAtom, useAtomValue } from 'jotai';
import { useDialog } from '../../hooks/use-dialog';
import { useFormDirty } from '../../contexts/FormDirty';
import { constructErrorMessage, constructMessage } from '../../utils/string-util';
import { EmptyCell } from '../../components/Container';
import { useLocation } from 'react-router-dom';
import { hasMissingRequiredField } from '../../utils/form-util';
import { Message, MessageType } from '../../models/system';
import { useBreadcrumb } from '../../hooks/use-breadcrumb';
import { authenticationAtom } from '../../states/authentication';
import { useNameInPreferredLanguage } from '../../hooks/use-preferred-language';
import { achievementDetailAtom, AchievementDetailStateFail, AchievementDetailStateSearchAchievementSuccess, AchievementDetailStateSearchProgress, AchievementDetailStateSearchStudentSuccess, AchievementDetailStateSearchSuccess, AchievementDetailStateUpdateSuccess } from '../../states/achievement-detail';
import { getFieldValueInPreferredLanguage } from '../../utils/language-util';
import { AchievementStatusIcon } from './achievement-status-label';
import { ReviewPanel } from '../../components/review-panel';
import { DropzoneBox } from '../../components/drop-zone';
import { deleteMedia, uploadMedia } from '../../repo/media-repo';

const useStyles = makeStyles({
  imageWrapper: {
    position: 'relative',
    width: '100%',
    marginBottom: '1rem',
    // ...shorthands.overflow('hidden'),
    borderRadius: '8px',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '4px 8px',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // increased transparency
    color: 'white',
    fontSize: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteButton: {
    color: 'white',
    background: 'transparent',
    ...shorthands.border('none'),
    cursor: 'pointer',
  },
  image: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
});

const attachmentSchema = z.object({
  fileName: z.string(),
  objectKey: z.string(),
  getUrl: z.string().url(),
  deleteUrl: z.string().url().optional(),
});
const schema = z
  .object({
    id: zodOptionalString(),
    studentId: zodString(),
    activityId: zodString(),
    comment: zodString(),
    rating: zodInt(),
    attachment: z.array(attachmentSchema),
  })
  .refine((data) => data.studentId?.trim().length ?? 0 > 0, {
    message: 'zod.error.Required',
    path: ['studentId'],
  })
  .refine((data) => data.rating > 0, {
    message: 'zod.error.Required',
    path: ['rating'],
  })
  .refine((data) => data.comment.trim().length ?? 0 > 0, {
    message: 'zod.error.Required',
    path: ['comment'],
  });
type AttachmentType = z.infer<typeof attachmentSchema>;
type FormData = z.infer<typeof schema>;

type AchievementEditPageProps = {};

export const AchievementEditPage: React.FC<
  AchievementEditPageProps
> = ({}: AchievementEditPageProps) => {
  const styles = useStyles();

  const { t, i18n } = useTranslation();
  const { showSpinner, stopSpinner, dispatchMessage } = useMessage();
  const { useStartBreadcrumb } = useBreadcrumb();

  const { showConfirmationDialog } = useDialog();
  const [selectedTab, setSelectedTab] = useState<TabValue>('tab1');
  const [uploadInProgress, setUploadInProgress] = useState<File[]>([]);
  const { markDirty, resetDirty } = useFormDirty();

  const [state, action] = useAtom(achievementDetailAtom);
  const authentication = useAtomValue(authenticationAtom);

  const baselineTimestamp = useRef<number>(Date.now());

  const _achievement2FormData = (achievement?: Achievement): FormData => {
    if (achievement) {
      const { rating, attachment, ...rest } = achievement;
      return {
        ...rest,
        rating: rating ?? 0,
        attachment: attachment.map(({ fileName, objectKey, getUrl }) => {
          return { fileName, objectKey, getUrl };
        }),
      };
    } else {
      return {
        studentId: '',
        activityId: '',
        comment: '',
        rating: 0,
        attachment: [],
      };
    }
  };

  const _formData2AchievementCreation = (
    formData: FormData,
  ): { achievement: AchievementCreation; attachment: AchievementAttachmentCreation[] } => {
    const { studentId, activityId, rating, comment, attachment } = formData;
    return {
      achievement: {
        studentId,
        activityId,
        rating,
        comment,
      },
      attachment: attachment.map(({ objectKey, fileName }) => {
        return { objectKey, fileName };
      }),
    };
  };

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

  /**
   * Reset the form and state
   */
  const _resetAll = () => {
    setSelectedTab('tab1');
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

  const formValues = watch();
  useEffect(() => {
    // to trigger enable / disable of save button and mark dirtiness
    if (isDirty) {
      markDirty();
    }
    return () => resetDirty();
  }, [formValues, isDirty, markDirty, resetDirty]);

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
      style={{ width: 'auto', height: 'auto', justifySelf: 'end' }}
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
      style={{ width: 'auto', height: 'auto', justifySelf: 'end' }}
    >
      {t('achievementSubmission.getAchievement')}
    </Button>
  );
  const saveButton = (
    <Button
      appearance="primary"
      disabled={hasMissingRequiredField(formValues, schema) || selectedTab !== 'tab1'}
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

  const selectedStudent = state.student;
  const studentInfo = selectedStudent
    ? `P${selectedStudent?.classId}-${selectedStudent?.studentNumber} ${getFieldValueInPreferredLanguage(i18n.language, 'name', selectedStudent)}`
    : '';
  const selectedActivity = state.activity.find(
    (item) => item.activity.id === formValues.activityId,
  );
  const selectedAchievement = state.achievement;
  const selectedAchievementStatusText = selectedAchievement
    ? t(`achievementSubmission.status.value.${selectedAchievement?.status}`)
    : '';

  const AppsListDetail = bundleIcon(AppsListDetailFilled, AppsListDetailRegular);
  const Comment = bundleIcon(CommentFilled, CommentRegular);

  return (
    <Root>
      {/* <Row> to make MultiLangDrawer inline */}
      <Row>
        <Form
          buttons={
            selectedAchievement
              ? [resetButton, saveButton]
              : selectedActivity
                ? [
                    resetButton,
                    selectedActivity.achievementStatus
                      ? getAchievementButton
                      : newAchievementButton,
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
                          const activityId = data.selectedOptions[0] ?? '';
                          const selectedActivity = state.activity.find(
                            (item) => item.activity.id === activityId,
                          );
                          field.onChange(activityId);
                          if (selectedActivity && selectedActivity.activity.ratable) {
                            setValue('rating', -1);
                          }
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
                  <Caption1>{`${t('achievementSubmission.achievement')} (${selectedAchievementStatusText})`}</Caption1>
                </Divider>
              </div>

              {(selectedAchievement.status === 'Pending' ||
                selectedAchievement.status === 'Rejected') && (
                <TabList
                  onTabSelect={(_ev, data) => {
                    setSelectedTab(data.value);
                  }}
                  selectedValue={selectedTab}
                  style={{ gridColumn: 'span 3', marginBottom: '10px', justifyContent: 'flex-end' }}
                >
                  <Tab icon={<AppsListDetail />} value="tab1">
                    Detail
                  </Tab>
                  <Tab icon={<Comment />} value="tab2">
                    Review
                  </Tab>
                </TabList>
              )}

              <div style={{ gridColumn: 'span 3' }}>
                {selectedTab === 'tab1' && (
                  <>
                    {selectedActivity?.activity.ratable === true ? (
                      <>
                        <Controller
                          control={control}
                          name="rating"
                          render={({ field }) => {
                            const { onChange, onBlur, ...rest } = field;
                            return (
                              <Field
                                label={t('achievementSubmission.rating')}
                                validationMessage={errors.rating?.message}
                              >
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
                      </>
                    ) : (
                      <></>
                    )}
                    <Controller
                      control={control}
                      name="comment"
                      render={({ field }) => {
                        return (
                          <Field
                            label={t('achievementSubmission.comment')}
                            validationMessage={errors?.comment?.message}
                          >
                            <Textarea {...field} rows={4}></Textarea>
                          </Field>
                        );
                      }}
                    />

                    <Controller
                      control={control}
                      name="attachment"
                      render={({ field }) => {
                        return (
                          <Field label="Attachment">
                            <>
                              {uploadInProgress.map((item, i) => (
                                <>
                                  <Caption1>{item.name}</Caption1>
                                  <Skeleton
                                    key={`skeleton.${i}`}
                                    style={{
                                      width: '100%',
                                      marginTop: tokens.spacingVerticalS,
                                      marginBottom: tokens.spacingVerticalL,
                                    }}
                                  >
                                    <SkeletonItem animation="pulse" shape="rectangle" size={40} />
                                  </Skeleton>
                                </>
                              ))}
                              {field.value.map((v, idx) => {
                                const filename = v.fileName;
                                return (
                                  <div key={`image.${idx}`} className={styles.imageWrapper}>
                                    <div className={styles.overlay}>
                                      <Caption2>{filename}</Caption2>
                                      <Button
                                        appearance="transparent"
                                        className={styles.deleteButton}
                                        icon={<Dismiss24Regular />}
                                        onClick={async () => {
                                          const updated = [...field.value];
                                          const removedItem = updated.splice(idx, 1)[0];
                                          if (removedItem.deleteUrl !== undefined) {
                                            await deleteMedia({
                                              ...removedItem,
                                              deleteUrl: removedItem.deleteUrl as string,
                                            });
                                          }
                                          setValue('attachment', updated);
                                        }}
                                      />
                                    </div>
                                    <Image className={styles.image} fit="contain" src={v.getUrl} />
                                  </div>
                                );
                              })}
                              <DropzoneBox
                                onFilesAccepted={async (files: File[]) => {
                                  setUploadInProgress(files);
                                  const doneFiles: AttachmentType[] = [];
                                  for (const f of files) {
                                    const result = await uploadMedia(f);
                                    if (
                                      typeof result === 'object' &&
                                      result !== null &&
                                      'code' in result
                                    ) {
                                      // error occurred
                                      continue;
                                    }
                                    doneFiles.push(result);

                                    // Remove from upload progress
                                    setUploadInProgress((prev) => prev.filter((uip) => uip !== f));

                                    // Add result to attachment
                                    const currentAttachments = field.value || [];
                                    const newAttachments = new Set([
                                      ...currentAttachments,
                                      ...doneFiles,
                                    ]);
                                    setValue('attachment', Array.from(newAttachments), {
                                      shouldDirty: true,
                                    });
                                  }
                                }}
                              />
                            </>
                          </Field>
                        );
                      }}
                    />
                  </>
                )}
                {selectedTab === 'tab2' && (
                  <div aria-labelledby="AchievementReview" role="tabpanel">
                    <Form numColumn={1}>
                      {(selectedAchievement?.review ?? []).map((r) => {
                        return (
                          <ReviewPanel
                            key={r.id}
                            author={useNameInPreferredLanguage(r.createdBy)}
                            comment={r.comment}
                            reviewDateTime={new Date(r.createdAt)}
                          />
                        );
                      })}
                    </Form>
                  </div>
                )}
              </div>
            </>
          ) : (
            <></>
          )}
        </Form>
        <div style={{ flex: 1 }}></div>
      </Row>
    </Root>
  );
};
