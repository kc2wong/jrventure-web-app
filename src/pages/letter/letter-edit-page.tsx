import { CancelButton } from '@component/jr-venture-button';
import { JrVcEditPageLayout } from '@component/jr-venture-edit-page-layout';
import { JrVcGrid, JrVcGridItem } from '@component/jr-venture-grid';
import { JrVcInputDate, JrVcInputText } from '@component/jr-venture-input';
import { RoleBasedComponent } from '@component/role-based-component';
import { StudentIdInputText } from '@component/student-id-input-text';
import type { MaintenanceEditPageProps } from '@component/with-maintenance-page';
import { Button } from '@fluentui/react-components';
import { PenSparkleRegular } from '@fluentui/react-icons';
import { usePreferredLanguage } from '@hook/use-preferred-language';
import {
  letterEditActionAtom,
  letterEditStateAtom,
} from '@store/letter/letter-edit-bloc';
import { letterListActionAtom } from '@store/letter/letter-list-bloc';
import { multiLangNameToText } from '@util/form-util';
import {
  FuiButtonPanel,
  FuiInputTextArea,
  FuiTab,
  FuiTabList,
} from 'handy-fluentui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LetterStatusDropdown } from './letter-status-dropdown';

const LetterEditPage = ({ id, mode, onExit }: MaintenanceEditPageProps) => {
  const { t } = useTranslation();

  const dispatch = useSetAtom(letterEditActionAtom);
  const listDispatch = useSetAtom(letterListActionAtom);
  const { data } = useAtomValue(letterEditStateAtom);
  const { fullNameInPreferredLanguage } = usePreferredLanguage();

  const [contentTab, setContentTab] = useState<string>('en');

  const onAcknowledge = async () => {
    if (!data) { return; }
    await dispatch({ type: 'ACKNOWLEDGE', id: data.id, version: data.version });
    listDispatch({ type: 'INVALIDATE' });
    onExit();
  };

  const showAcknowledgeButton = data?.status !== 'ACKNOWLEDGED';

  useEffect(() => {
    if (id && data?.id !== id) {
      void dispatch({ type: 'GET', id });
    }
  }, [id, data?.id]);

  const title = data ? multiLangNameToText(data.title) : null;
  const content = data ? multiLangNameToText(data.content) : null;

  return (
    <JrVcEditPageLayout
      actionButtons={
        <FuiButtonPanel>
          <CancelButton onClick={onExit} />
          {showAcknowledgeButton && (
            <RoleBasedComponent role="PARENT">
              <Button
                appearance="primary"
                icon={<PenSparkleRegular />}
                onClick={() => void onAcknowledge()}
              >
                {t('letter.acknowledge')}
              </Button>
            </RoleBasedComponent>
          )}
        </FuiButtonPanel>
      }
      data={data}
      desktopWidth={{ maxWidth: '680px', minWidth: '520px', width: '35vw' }}
      entityName={t('letter.title')}
      mode={mode}
    >
      <JrVcGrid columns={2}>
        <JrVcGridItem fullWidth>
          <FuiTabList
            onTabSelect={(d) => setContentTab(d.value as string)}
            selectedValue={contentTab}
          >
            <FuiTab name={t('general.language.en')} value="en">
              <JrVcInputText
                label={t('letter.letterTitle')}
                onChange={() => {}}
                readOnly
                value={title?.valueInLangOne ?? null}
              />
              <FuiInputTextArea
                label={t('letter.content')}
                onChange={() => {}}
                readOnly
                rows={5}
                value={content?.valueInLangOne ?? null}
              />
            </FuiTab>
            <FuiTab name={t('general.language.zh-Hant')} value="zhHant">
              <JrVcInputText
                label={t('letter.letterTitle')}
                onChange={() => {}}
                readOnly
                value={title?.valueInLangTwo ?? null}
              />
              <FuiInputTextArea
                label={t('letter.content')}
                onChange={() => {}}
                readOnly
                rows={5}
                value={content?.valueInLangTwo ?? null}
              />
            </FuiTab>
            <FuiTab name={t('general.language.zh-Hans')} value="zhHans">
              <JrVcInputText
                label={t('letter.letterTitle')}
                onChange={() => {}}
                readOnly
                value={title?.valueInLangThree ?? null}
              />
              <FuiInputTextArea
                label={t('letter.content')}
                onChange={() => {}}
                readOnly
                rows={5}
                value={content?.valueInLangThree ?? null}
              />
            </FuiTab>
          </FuiTabList>
        </JrVcGridItem>

        <RoleBasedComponent role="TEACHER">
          <JrVcInputText
            label={t('letter.noticeId')}
            onChange={() => {}}
            readOnly
            value={data?.noticeId ?? null}
          />
          <StudentIdInputText
            label={t('letter.studentId')}
            readOnly
            value={data?.studentId ?? null}
          />
        </RoleBasedComponent>

        <JrVcGridItem fullWidth>
          <LetterStatusDropdown
            label={t('letter.status')}
            onChange={() => {}}
            readOnly
            value={data?.status ?? null}
          />
        </JrVcGridItem>

        <JrVcInputText
          label={t('letter.acknowledgedBy')}
          onChange={() => {}}
          readOnly
          value={data?.acknowledgedBy
            ? fullNameInPreferredLanguage(data.acknowledgedBy.firstName, data.acknowledgedBy.lastName)
            : null}
        />

        <JrVcInputDate
          label={t('letter.acknowledgedAt')}
          onChange={() => {}}
          readOnly
          value={data?.acknowledgedAt ? new Date(data.acknowledgedAt) : null}
        />
      </JrVcGrid>
    </JrVcEditPageLayout>
  );
};

export { LetterEditPage };
