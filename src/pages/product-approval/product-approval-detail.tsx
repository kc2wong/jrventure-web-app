import React, { FC } from 'react';
import { Caption2, makeStyles, Text, tokens } from '@fluentui/react-components';
import { ProductDetailPage } from '../market/product-detail';
import { productApprovalListAtom } from '../../states/product-approval-list';
import { useAtom } from 'jotai';
import { MultiLingualLabel } from '../../components/multi-lang-label';
import { useTimezone } from '../../hooks/use-timezone';
import { ApprovalCommentType, ApprovalStatus } from '../../__generated__/linkedup-web-api-client';
import { ChatDismissRegular, ChatRegular, ChatSparkleRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  row: {
    display: 'flex',
    width: '100%',
    alignItems: 'baseline',
  },
  col10: {
    width: '10%',
    textAlign: 'left',
  },
  col40: {
    width: '40%',
    textAlign: 'left',
  },
  col90: {
    width: '90%',
    textAlign: 'left',
  },
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

const commentTypeComponents: Record<ApprovalCommentType, FC> = {
  Conversation: () => <ChatRegular color={tokens.colorPaletteBlueBackground2} fontSize={20} />,
  Rejection: () => <ChatDismissRegular color={tokens.colorPaletteRedForeground2} fontSize={20} />,
  Approval: () => <ChatSparkleRegular color={tokens.colorPaletteGreenForeground2} fontSize={20} />,
};

export const ProductApprovalDetailPage: React.FC = () => {
  const styles = useStyles();
  const [state] = useAtom(productApprovalListAtom);
  const { formatDatetime } = useTimezone();

  const comments = state.selectedResult?.comments ?? [];

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Left Panel - 20% width */}
      <div
        style={{
          flex: '0 0 25%',
          padding: '1rem',
          borderRight: '1px solid #ddd',
          overflowY: 'auto',
        }}
      >
        <Text size={400} weight="semibold">
          Comments
        </Text>
        {comments.length > 0 ? (
          <ul style={{ marginTop: '1rem', paddingLeft: '1rem' }}>
            {comments.map((comment) => (
              <>
                <div className={styles.row}>
                  <div className={styles.col10}>
                    {React.createElement(commentTypeComponents[comment.type])}
                  </div>
                  <div className={styles.col40}>
                    <MultiLingualLabel caption={comment.commentBy.name}>
                      <Text />
                    </MultiLingualLabel>
                  </div>
                  <div className={styles.col50Right}>
                    <Caption2>{formatDatetime(new Date(comment.commentAt))}</Caption2>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.col10}></div>
                  <div className={styles.col90}>
                    <div className={styles.commentWrapper}>
                      <Text block>{comment.comment}</Text>
                    </div>
                  </div>
                </div>
              </>
            ))}
          </ul>
        ) : (
          <Text italic size={300}>
            No comments available.
          </Text>
        )}
      </div>

      {/* Right Panel - 80% width */}
      <div style={{ flex: '1', padding: '1rem', overflowY: 'auto' }}>
        <ProductDetailPage
          approvalStatus={ApprovalStatus.PENDING}
          product={state.selectedResult?.product}
          type="approval"
        />
      </div>
    </div>
  );
};
