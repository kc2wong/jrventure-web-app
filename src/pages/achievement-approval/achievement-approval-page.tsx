import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { useMessage } from '../../hooks/use-message';
import { useMode } from '../../hooks/use-mode';
import { Message, MessageType } from '../../models/system';
import { constructErrorMessage } from '../../utils/string-util';
import { useTranslation } from 'react-i18next';
import { AchievementApprovalSearchPage } from './achievement-approval-search-page';
import { AchievementApprovalDetailPage } from './achievement-approval-detail';
import { useNavigationHelpers } from '../../hooks/use-delay-navigate';
import {
  achievementApprovalListAtom,
  AchievementApprovalListStateFail,
  AchievementApprovalListStateProgress,
  AchievementApprovalListStateSuccess,
} from '../../states/achievement-approval-list';
import {
  achievementApprovalDetailAtom,
  AchievementApprovalDetailStateFail,
  AchievementApprovalDetailStateProgress,
  AchievementApprovalDetailStateSearchSuccess,
  AchievementApprovalDetailStateUpdateSuccess,
} from '../../states/achievement-approval-detail';

export const AchievementApprovalPage: React.FC = () => {
  const { showSpinner, stopSpinner, dispatchMessage } = useMessage();

  const { t } = useTranslation();
  const { navigate, navigateWithSpinner } = useNavigationHelpers();
  const mode = useMode();

  const [achievementApprovalState, achievementApprovalListAction] = useAtom(
    achievementApprovalListAtom,
  );
  const achievementApprovalDetailState = useAtomValue(achievementApprovalDetailAtom);

  useEffect(() => {
    if (achievementApprovalState instanceof AchievementApprovalListStateProgress) {
      showSpinner();
    } else if (achievementApprovalState instanceof AchievementApprovalListStateSuccess) {
      stopSpinner();
    } else if (achievementApprovalState instanceof AchievementApprovalListStateFail) {
      stopSpinner();
      _handleFailure(achievementApprovalState.failure);
    }
  }, [achievementApprovalState]);

  useEffect(() => {
    if (achievementApprovalDetailState instanceof AchievementApprovalDetailStateProgress) {
      showSpinner();
    } else if (
      achievementApprovalDetailState instanceof AchievementApprovalDetailStateSearchSuccess
    ) {
      stopSpinner();
    } else if (
      achievementApprovalDetailState instanceof AchievementApprovalDetailStateUpdateSuccess
    ) {
      stopSpinner();
      achievementApprovalListAction({ markDirty: {} });
    } else if (achievementApprovalDetailState instanceof AchievementApprovalDetailStateFail) {
      stopSpinner();
      _handleFailure(achievementApprovalDetailState.failure);
    }
  }, [achievementApprovalDetailState]);

  const _handleFailure = (message: Message) => {
    if (message?.type === MessageType.Error) {
      dispatchMessage({
        type: message.type,
        text: constructErrorMessage(t, message.key, message.parameters),
      });
    }
  };

  const searchPage = (
    <AchievementApprovalSearchPage
      onViewButtonClick={() => {
        const selectedResult = achievementApprovalState.selectedResult;
        if (selectedResult) {
          navigateWithSpinner(
            `/achievement-approval/${selectedResult.id}/view`,
            {
              state: { achievementApproval: selectedResult },
            },
            500,
          );
        }
      }}
    />
  );

  const editPage = (_mode: string) => (
    <AchievementApprovalDetailPage
      achievement={achievementApprovalState.selectedResult!}
      onBackButtonClick={() => navigate(-1)}
      onSave={() => {
        achievementApprovalListAction({ markDirty: {} });
        navigate(-1);
      }}
    />
  );

  switch (mode) {
    case 'list': {
      return searchPage;
    }
    case 'add':
    case 'view':
    case 'edit': {
      return editPage(mode);
    }
    default:
      return <></>;
  }
};
