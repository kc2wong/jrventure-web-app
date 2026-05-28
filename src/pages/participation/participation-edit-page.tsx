import { CancelButton } from '@component/jr-venture-button';
import { JrVcEditPageLayout } from '@component/jr-venture-edit-page-layout';
import { JrVcGrid, JrVcGridItem } from '@component/jr-venture-grid';
import {
  JrVcInputDateTime,
  JrVcInputNumber,
  JrVcInputText,
} from '@component/jr-venture-input';
import {
  Button,
  Divider,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  ShoppingBagCheckmarkRegular,
  PersonAddRegular,
  ShoppingBagDismissRegular,
} from '@fluentui/react-icons';
import { ActivityCategoryDropdown } from '@page/activity/activity-dropdown';
import { activityEditStateAtom } from '@store/activity/activity-edit-bloc';
import { authStateAtom } from '@store/auth/auth-bloc';
import {
  participationEditActionAtom,
  participationEditStateAtom,
} from '@store/participation/participation-edit-bloc';
import { EMPTY_MULTI_LANG_TEXT, multiLangNameToText } from '@util/form-util';
import {
  FuiButtonPanel,
  FuiInputTextArea,
  FuiTab,
  FuiTabList,
  useDialog,
} from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  notEnrolled: {
    color: tokens.colorNeutralForeground3,
    fontStyle: 'italic',
  },
});

const ParticipationEditPage = ({ onExit }: { onExit: () => void }) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const [contentTab, setContentTab] = useState('en');
  const dialog = useDialog();

  const dispatch = useSetAtom(participationEditActionAtom);
  const { data: activity } = useAtomValue(activityEditStateAtom);
  const { data: participation } = useAtomValue(participationEditStateAtom);
  const { selectedStudentId } = useAtomValue(authStateAtom);

  const description = activity
    ? multiLangNameToText(activity.description)
    : EMPTY_MULTI_LANG_TEXT;
  const venue = activity
    ? multiLangNameToText(activity.venue)
    : EMPTY_MULTI_LANG_TEXT;
  const detail = activity
    ? multiLangNameToText(activity.detail)
    : EMPTY_MULTI_LANG_TEXT;

  const handleEnroll = () => {
    if (activity?.id && selectedStudentId) {
      void dispatch({
        type: 'ENROLL',
        activityId: activity.id,
        studentId: selectedStudentId,
      });
    }
  };

  const handleWithdraw = () => {
    void dispatch({ type: 'WITHDRAW' });
  };

  const handleCheckIn = () => {
    void dispatch({ type: 'CHECK_IN' });
  };

  const actionButtons = !participation ? (
    <Button
      appearance="primary"
      icon={<PersonAddRegular />}
      onClick={handleEnroll}
    >
      {t('participation.enroll')}
    </Button>
  ) : participation.status === 'ENROLLED' ? (
    <>
      <Button
        icon={<ShoppingBagDismissRegular />}
        onClick={() => {
          dialog.openDialog({
            content: t('general.text.confirmSaveContent'),
            primaryButton: {
              action: () => handleWithdraw(),
              label: t('general.text.save'),
            },
            secondaryButton: {
              action: () => {},
              label: t('general.text.cancel'),
            },
            title: t('participation.withdraw'),
          });
        }}
      >
        {t('participation.withdraw')}
      </Button>
      <Button
        appearance="primary"
        icon={<ShoppingBagCheckmarkRegular />}
        onClick={handleCheckIn}
      >
        {t('participation.checkIn')}
      </Button>
    </>
  ) : null;

  return (
    <JrVcEditPageLayout
      actionButtons={
        <FuiButtonPanel>
          <CancelButton onClick={onExit} />
          {actionButtons}
        </FuiButtonPanel>
      }
      data={null}
      desktopWidth={{ maxWidth: '800px', minWidth: '520px', width: '50vw' }}
      entityName={t('activity.title')}
      mode="view"
    >
      <JrVcGrid columns={2}>
        <JrVcGridItem fullWidth>
          <FuiTabList
            onTabSelect={(d) => setContentTab(d.value as string)}
            selectedValue={contentTab}
          >
            <FuiTab name={t('general.language.en')} value="en">
              <JrVcInputText
                label={t('activity.description')}
                onChange={() => {}}
                readOnly
                value={description.valueInLangOne}
              />
              <JrVcInputText
                label={t('activity.venue')}
                onChange={() => {}}
                readOnly
                value={venue.valueInLangOne}
              />
              <FuiInputTextArea
                label={t('activity.detail')}
                onChange={() => {}}
                readOnly
                rows={4}
                value={detail.valueInLangOne}
              />
            </FuiTab>
            <FuiTab name={t('general.language.zh-Hant')} value="zhHant">
              <JrVcInputText
                label={t('activity.description')}
                onChange={() => {}}
                readOnly
                value={description.valueInLangTwo}
              />
              <JrVcInputText
                label={t('activity.venue')}
                onChange={() => {}}
                readOnly
                value={venue.valueInLangTwo}
              />
              <FuiInputTextArea
                label={t('activity.detail')}
                onChange={() => {}}
                readOnly
                rows={4}
                value={detail.valueInLangTwo}
              />
            </FuiTab>
            <FuiTab name={t('general.language.zh-Hans')} value="zhHans">
              <JrVcInputText
                label={t('activity.description')}
                onChange={() => {}}
                readOnly
                value={description.valueInLangThree}
              />
              <JrVcInputText
                label={t('activity.venue')}
                onChange={() => {}}
                readOnly
                value={venue.valueInLangThree}
              />
              <FuiInputTextArea
                label={t('activity.detail')}
                onChange={() => {}}
                readOnly
                rows={4}
                value={detail.valueInLangThree}
              />
            </FuiTab>
          </FuiTabList>
        </JrVcGridItem>

        <ActivityCategoryDropdown
          label={t('activity.category')}
          onChange={() => {}}
          readOnly
          value={activity?.category ?? null}
        />

        <JrVcInputNumber
          label={t('activity.maxNumOfParticipant')}
          onChange={() => {}}
          readOnly
          value={activity?.maxNumOfParticipant ?? null}
        />

        <JrVcInputDateTime
          label={t('activity.startDateTime')}
          onChange={() => {}}
          readOnly
          value={activity ? new Date(activity.startDate) : null}
        />

        <JrVcInputDateTime
          label={t('activity.endDateTime')}
          onChange={() => {}}
          readOnly
          value={activity ? new Date(activity.endDate) : null}
        />
      </JrVcGrid>

      <Divider>{t('participation.enrollment')}</Divider>

      {participation ? (
        <JrVcGrid columns={2}>
          <JrVcInputText
            label={t('participation.status')}
            onChange={() => {}}
            readOnly
            value={t(
              `participation.status${participation.status.charAt(0) + participation.status.slice(1).toLowerCase()}` as never,
            )}
          />
          <JrVcInputDateTime
            label={t('participation.attendedAt')}
            onChange={() => {}}
            readOnly
            value={
              participation.attendedAt
                ? new Date(participation.attendedAt)
                : null
            }
          />
        </JrVcGrid>
      ) : (
        <div className={styles.notEnrolled}>
          {t('participation.notEnrolled')}
        </div>
      )}
    </JrVcEditPageLayout>
  );
};

export { ParticipationEditPage };
