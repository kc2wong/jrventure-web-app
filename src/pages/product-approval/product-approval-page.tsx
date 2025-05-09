import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useMessage } from '../../hooks/use-message';
import { useMode } from '../../hooks/use-mode';
import { Message, MessageType } from '../../models/system';
import { constructErrorMessage } from '../../utils/string-util';
import { useTranslation } from 'react-i18next';
import {
  productApprovalListAtom,
  ProductApprovalListStateFail,
  ProductApprovalListStateProgress,
  ProductApprovalListStateSuccess,
} from '../../states/product-approval-list';
import { ProductApprovalSearchPage } from './product-approval-search-page';
import { ProductApprovalDetailPage } from './product-approval-detail';
import { useNavigationHelpers } from '../../hooks/use-delay-navigate';

export const ProductApprovalPage: React.FC = () => {
  const { showSpinner, stopSpinner, dispatchMessage } = useMessage();

  const { t } = useTranslation();
  const { navigateWithSpinner } = useNavigationHelpers();
  const mode = useMode();

  const [productApprovalState] = useAtom(productApprovalListAtom);

  useEffect(() => {
    if (productApprovalState instanceof ProductApprovalListStateProgress) {
      showSpinner();
    } else if (productApprovalState instanceof ProductApprovalListStateSuccess) {
      stopSpinner();
    } else if (productApprovalState instanceof ProductApprovalListStateFail) {
      stopSpinner();
      _handleFailure(productApprovalState.failure);
    }
  }, [productApprovalState]);

  const _handleFailure = (message: Message) => {
    if (message?.type === MessageType.Error) {
      dispatchMessage({
        type: message.type,
        text: constructErrorMessage(t, message.key, message.parameters),
      });
    }
  };

  const searchPage = (
    <ProductApprovalSearchPage
      onViewButtonClick={() => {
        const selectedResult = productApprovalState.selectedResult;
        if (selectedResult) {
          navigateWithSpinner(
            `/approval/${selectedResult.id}/view`,
            {
              state: { productApproval: selectedResult },
            },
            500,
          );
        }
      }}
    />
  );

  const editPage = (_mode: string) => <ProductApprovalDetailPage />;

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
