import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { useMessage } from '../../hooks/use-message';
import { useMode } from '../../hooks/use-mode';
import { ActivitySearchPage } from './activity-search-page';
import { ActivityEditPage } from './activity-edit-page';
import { Message, MessageType } from '../../models/system';
import { constructErrorMessage } from '../../utils/string-util';
import { useTranslation } from 'react-i18next';
import { useNavigationHelpers } from '../../hooks/use-delay-navigate';
import {
  activityListAtom,
  ActivityListStateFail,
  ActivityListStateProgress,
  ActivityListStateSuccess,
} from '../../states/activity-list';
import {
  activityCategoryListAtom,
  ActivityCategoryListStateFail,
  ActivityCategoryListStateProgress,
  ActivityCategoryListStateSuccess,
} from '../../states/activity-category-list';
import {
  activityDetailAtom,
  ActivityDetailStateFail,
  ActivityDetailStateGetSuccess,
  ActivityDetailStateProgress,
  ActivityDetailStateUpdateSuccess,
} from '../../states/activity-detail';
import { Dropdown, Input, makeStyles, Textarea, Option } from '@fluentui/react-components';

const useStyles = makeStyles({
  field: {
    width: '100%', // Fill full 1fr column
    minWidth: 0, // Override Fluent UI's internal ~200px min-width
    maxWidth: '100%', // Prevent it from overflowing
    boxSizing: 'border-box', // Ensure padding doesn't break layout
  },
});

export const ActivityMaintenancePage2: React.FC = () => {
  const styles = useStyles();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        width: '400px', // or any container width
      }}
    >
      <Dropdown className={styles.field}>
        <Option>1</Option>
      </Dropdown>
      <Input className={styles.field} />
      <Textarea className={styles.field} />
    </div>
  );
};

export const ActivityMaintenancePage: React.FC = () => {
  const { showSpinner, stopSpinner, dispatchMessage } = useMessage();

  const { t } = useTranslation();
  const { navigate, navigateWithSpinner } = useNavigationHelpers();
  const mode = useMode();

  const [activityCategoryListState, activityCategoryListAction] = useAtom(activityCategoryListAtom);
  const [activityListState, activityListAction] = useAtom(activityListAtom);
  const activityDetailState = useAtomValue(activityDetailAtom);

  const activityCategory = activityCategoryListState.getResult();
  useEffect(() => {
    if (activityCategory === undefined) {
      activityCategoryListAction({ refresh: {} });
    }
  }, [activityCategory]);

  useEffect(() => {
    if (activityCategoryListState instanceof ActivityCategoryListStateProgress) {
      showSpinner();
    } else if (activityCategoryListState instanceof ActivityCategoryListStateSuccess) {
      stopSpinner();
    } else if (activityCategoryListState instanceof ActivityCategoryListStateFail) {
      stopSpinner();
      _handleFailre(activityCategoryListState.failure);
    }
  }, [activityCategoryListState]);

  useEffect(() => {
    if (activityListState instanceof ActivityListStateProgress) {
      showSpinner();
    } else if (activityListState instanceof ActivityListStateSuccess) {
      stopSpinner();
    } else if (activityListState instanceof ActivityListStateFail) {
      stopSpinner();
      _handleFailre(activityListState.failure);
    }
  }, [activityListState]);

  useEffect(() => {
    if (activityDetailState instanceof ActivityDetailStateProgress) {
      showSpinner();
    } else if (activityDetailState instanceof ActivityDetailStateGetSuccess) {
      stopSpinner();
    } else if (activityDetailState instanceof ActivityDetailStateUpdateSuccess) {
      stopSpinner();
      activityListAction({ markDirty: {} });
    } else if (activityDetailState instanceof ActivityDetailStateFail) {
      stopSpinner();
      _handleFailre(activityDetailState.failure);
    }
  }, [activityDetailState]);

  const _handleFailre = (message: Message) => {
    if (message?.type === MessageType.Error) {
      dispatchMessage({
        type: message.type,
        text: constructErrorMessage(t, message.key, message.parameters),
      });
    }
  };

  const searchPage = (
    <ActivitySearchPage
      onAddButtonClick={() => navigate('/activity/add')}
      onEditButtonClick={() => {
        // const selectedActivity = activityListState.selectedResult;
        // if (selectedActivity) {
        //   navigateWithSpinner(`/activity/${selectedActivity.id}/edit`, { state: { user: selectedActivity } });
        // }
      }}
      onViewButtonClick={() => {
        const selectedActivity = activityListState.selectedResult;
        if (selectedActivity) {
          navigateWithSpinner(`/activity/${selectedActivity.id}/view`, {
            state: { activity: selectedActivity },
          });
        }
      }}
    />
  );

  const editPage = (mode: string) => (
    <ActivityEditPage
      activity={activityListState.selectedResult}
      mode={mode}
      onBackButtonClick={() => {
        navigate(-1);
      }}
      onSave={() => {
        // if (mode === 'add') {
        //     const selectedUser = userDetailState.result;
        //     if (selectedUser) {
        //       navigateWithSpinner(`/user/${selectedUser.id}/edit`, {
        //         replace: true,
        //         state: { user: selectedUser },
        //       });
        //     }
        // }
      }}
    />
  );

  switch (mode) {
    case 'list': {
      return searchPage;
    }
    case 'add':
      return editPage(mode);
    case 'view':
    case 'edit': {
      return editPage(mode);
    }
    default:
      return <></>;
  }
};
