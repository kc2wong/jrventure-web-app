import {
  Button,
  Caption1,
  Divider,
  makeStyles,
  Skeleton,
  SkeletonItem,
  Text,
  Textarea,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowTurnUpLeftRegular,
  ChatDismissRegular,
  ChatRegular,
  ChatSparkleRegular,
  CheckmarkRegular,
  DismissRegular,
} from '@fluentui/react-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom } from 'jotai';
import React, { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

import { Root, EmptyCell, Form, Row } from '@components/container';
import { Field } from '@components/field';
import { ImagePreview } from '@components/image-preview';
import { Input } from '@components/input';
import { MultiLangText } from '@components/multi-lang-field';
import { Rating } from '@components/rating';
import { useBreadcrumb } from '@hooks/use-breadcrumb';
import { useDialog } from '@hooks/use-dialog';
import { useMessage } from '@hooks/use-message';
import { useTimezone } from '@hooks/use-timezone';
import { achievementApprovalDetailAtom } from '@states/achievement-approval-detail';
import { AchievementDetailStateUpdateSuccess } from '@states/achievement-detail';
import { getFieldValueInPreferredLanguage } from '@utils/language-util';
import { constructMessage } from '@utils/string-util';
import { Achievement, AchievementDetail, ApprovalCommentType } from '@webapi/types';

import { MessageType } from '../../models/system';
import { zodString } from '../../types/zod';

const useStyles = makeStyles({
  col10: { width: '10%', textAlign: 'left' },
  col40: { width: '40%', textAlign: 'left' },
  col90: { width: '90%', textAlign: 'left' },
  col50Right: {
    width: '50%',
    textAlign: 'right',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  commentWrapper: {
    marginTop: tokens.spacingVerticalXS,
    marginBottom: tokens.spacingVerticalM,
  },
  buttonPanel: { margin: '20px 20px 20px 0' },
});

const commentTypeComponents: Record<ApprovalCommentType, React.FC> = {
  Conversation: () => <ChatRegular color={tokens.colorPaletteBlueBackground2} fontSize={20} />,
  Rejection: () => <ChatDismissRegular color={tokens.colorPaletteRedForeground2} fontSize={20} />,
};

const schema = z.object({ remark: zodString() });
type FormData = z.infer<typeof schema>;

type Props = {
  achievement: Achievement;
  onBackButtonClick: () => void;
  onSave: () => void;
};

export const AchievementApprovalDetailPage: React.FC<Props> = ({
  achievement: inAchievement,
  onBackButtonClick,
  onSave,
}) => {
  const styles = useStyles();
  const { formatDatetime } = useTimezone();
  const { dispatchMessage } = useMessage();
  const { useAppendBreadcrumb } = useBreadcrumb();
  const { showConfirmationDialog } = useDialog();
  const { i18n, t } = useTranslation();
  const [state, action] = useAtom(achievementApprovalDetailAtom);
  const { id } = useParams<{ id: string }>();
  const remarkRef = useRef('');
  const baselineTimestamp = useRef(Date.now());

  const { control, reset } = useForm<FormData>({
    defaultValues: { remark: '' },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    useAppendBreadcrumb('achievementApproval.titleReview', []);
  }, []);

  useEffect(() => {
    if (id) {
      action({ search: { id } });
    }
  }, [id]);

  useEffect(() => {
    if (state.eventTime > baselineTimestamp.current) {
      baselineTimestamp.current = state.eventTime;
      if (state instanceof AchievementDetailStateUpdateSuccess) {
        dispatchMessage({
          type: MessageType.Success,
          text: constructMessage(t, 'system.message.saveObjectSuccess', [
            'Achievement',
            state.result.id,
          ]),
        });
        onSave();
      }
    }
  }, [state]);

  const achievement: AchievementDetail | undefined = state?.achievement ?? {
    ...inAchievement,
    attachment: [],
  };
  const comments = achievement?.review ?? [];

  const showRemarkDialog = (type: 'comment' | 'reject', label: string) => {
    reset();
    showConfirmationDialog({
      title: type === 'reject' ? { confirmType: type } : { title: label },
      content: {
        form: (
          <Form numColumn={1}>
            <Controller
              control={control}
              name="remark"
              render={({ field }) => (
                <Field label={type === 'reject' ? t('achievementSubmission.comment') : ''}>
                  <Textarea
                    {...field}
                    onChange={(e, data) => {
                      field.onChange(e);
                      remarkRef.current = data.value;
                    }}
                    rows={4}
                  />
                </Field>
              )}
            />
          </Form>
        ),
      },
      primaryButton: {
        label: t('system.message.submit'),
        icon: <CheckmarkRegular />,
        action: () => {
          reset();
          action({ review: { comment: remarkRef.current } });
        },
      },
      secondaryButton: { label: t('system.message.cancel'), icon: <DismissRegular /> },
    });
  };

  const student = achievement?.student;
  const studentInfo = student
    ? `P${student.classId}-${student.studentNumber} ${getFieldValueInPreferredLanguage(i18n.language, 'name', student)}`
    : '';
  const selectedActivity = achievement?.activity;
  const statusText = achievement
    ? t(`achievementSubmission.status.value.${achievement.status}`)
    : '';

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Left Panel */}
      <div
        style={{ flex: '0 0 20%', minWidth: 300, padding: '1rem', borderRight: '1px solid #ddd' }}
      >
        <Text size={400} weight="semibold">
          Comments
        </Text>
        {comments.length > 0 ? (
          <ul style={{ marginTop: '1rem', paddingInline: '1rem' }}>
            {comments.map((comment, idx) => (
              <div key={idx} style={{ marginBottom: tokens.spacingVerticalL }}>
                <Row style={{ alignItems: 'center' }}>
                  <div className={styles.col10}>
                    {React.createElement(commentTypeComponents[comment.commentType])}
                  </div>
                  <div className={styles.col40}>
                    <MultiLangText object={comment.createdBy} />
                  </div>
                  <div className={styles.col50Right}>
                    <Text size={200}>{formatDatetime(new Date(comment.createdAt))}</Text>
                  </div>
                </Row>
                <Row>
                  <div className={styles.col10}></div>
                  <div className={styles.col90}>
                    <Text block style={{ whiteSpace: 'pre-line' }}>
                      {comment.comment}
                    </Text>
                  </div>
                </Row>
              </div>
            ))}
          </ul>
        ) : (
          <Text italic size={300} style={{ marginTop: '1rem', paddingLeft: '1rem' }}>
            No comments available.
          </Text>
        )}
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}>
        {achievement && (
          <Root withDrawerSupport>
            <Form
              buttons={[
                onBackButtonClick && (
                  <Button icon={<ArrowTurnUpLeftRegular />} onClick={onBackButtonClick}>
                    {t('system.message.back')}
                  </Button>
                ),
                <Button
                  key="comment"
                  icon={<ChatRegular />}
                  onClick={() => showRemarkDialog('comment', 'Leave your comment')}
                >
                  {t('productApproval.comment')}
                </Button>,
                <Button
                  key="reject"
                  icon={<ChatDismissRegular />}
                  onClick={() => showRemarkDialog('reject', 'Reject')}
                >
                  {t('productApproval.reject')}
                </Button>,
                <Button
                  key="approve"
                  appearance="primary"
                  icon={<ChatSparkleRegular />}
                  onClick={() =>
                    showConfirmationDialog({
                      title: { confirmType: 'approve' },
                      content: { message: t('system.message.doYouWantToSaveChange') },
                      primaryButton: {
                        label: t('system.message.submit'),
                        icon: <CheckmarkRegular />,
                        action: () => action({ approve: {} }),
                      },
                      secondaryButton: {
                        label: t('system.message.cancel'),
                        icon: <DismissRegular />,
                      },
                    })
                  }
                >
                  {t('productApproval.approve')}
                </Button>,
              ]}
              numColumn={3}
              styles={{ width: '600px' }}
              title={t('achievementApproval.titleReview')}
            >
              {/* Student Info */}
              <div style={{ gridColumn: 'span 3', marginBottom: tokens.spacingVerticalS }}>
                <Divider>
                  <Caption1>{t('achievementSubmission.studentInfo')}</Caption1>
                </Divider>
              </div>
              <Field label={t('achievementSubmission.studentId')}>
                <Input readOnly value={student?.id} />
              </Field>
              <Field colSpan={2} label={t('achievementSubmission.studentName')}>
                <Input readOnly value={studentInfo} />
              </Field>

              {/* Activity Info */}
              {selectedActivity && (
                <>
                  <div
                    style={{
                      gridColumn: 'span 3',
                      margin: `${tokens.spacingVerticalXXL} 0 ${tokens.spacingVerticalS}`,
                    }}
                  >
                    <Divider>
                      <Caption1>{t('achievementSubmission.activityDetail')}</Caption1>
                    </Divider>
                  </div>
                  <Field colSpan={2} label={t('achievementSubmission.activityName')} required>
                    <Input
                      readOnly
                      value={getFieldValueInPreferredLanguage(
                        i18n.language,
                        'name',
                        selectedActivity,
                      )}
                    />
                  </Field>
                  <EmptyCell />
                  <Field colSpan={3} label={t('achievementSubmission.activityDescription')}>
                    <Textarea readOnly rows={4} value={selectedActivity.description} />
                  </Field>
                  <Field label={t('achievementSubmission.eCoin')}>
                    <Input readOnly value={`${selectedActivity.eCoin}`} />
                  </Field>
                  <EmptyCell colSpan={2} />
                </>
              )}

              {/* Achievement Info */}
              <div
                style={{
                  gridColumn: 'span 3',
                  margin: `${tokens.spacingVerticalL} 0 ${tokens.spacingVerticalS}`,
                }}
              >
                <Divider>
                  <Caption1>{`${t('achievementSubmission.achievement')} (${statusText})`}</Caption1>
                </Divider>
              </div>
              <Field colSpan={2} label="Submitted By">
                <Input
                  readOnly
                  value={
                    achievement.submittedBy
                      ? getFieldValueInPreferredLanguage(
                          i18n.language,
                          'name',
                          achievement.submittedBy,
                        )
                      : ''
                  }
                />
              </Field>
              <Field label="Submitted At">
                <Input
                  readOnly
                  value={
                    achievement.submissionDate
                      ? formatDatetime(new Date(achievement.submissionDate))
                      : ''
                  }
                />
              </Field>
              <div style={{ gridColumn: 'span 3' }}>
                <Field label={t('achievementSubmission.rating')}>
                  <Rating
                    color="brand"
                    readOnly
                    size="large"
                    style={{ marginLeft: tokens.spacingHorizontalL }}
                    value={achievement.rating}
                  />
                </Field>
                <Field label={t('achievementSubmission.comment')}>
                  <Textarea rows={4} value={achievement.comment} />
                </Field>
                <Field label={t('achievementSubmission.attachment')}>
                  <>
                    {Array.from({
                      length:
                        achievement.numberOfAttachment - (achievement.attachment ?? []).length,
                    }).map((_, i) => (
                      <Skeleton
                        key={`skeleton.${i}`}
                        style={{
                          width: '100%',
                          margin: `${tokens.spacingVerticalS} 0 ${tokens.spacingVerticalL}`,
                        }}
                      >
                        <SkeletonItem animation="pulse" shape="rectangle" size={40} />
                      </Skeleton>
                    ))}
                    {achievement.attachment?.map((v, idx) => (
                      <ImagePreview key={`image.${idx}`} fileName={v.fileName} src={v.getUrl} />
                    ))}
                  </>
                </Field>
              </div>
            </Form>
          </Root>
        )}
      </div>
    </div>
  );
};
