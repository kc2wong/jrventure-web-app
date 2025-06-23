import React from 'react';
import {
  Avatar,
  Divider,
  RatingDisplay,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { formatDistanceToNow } from 'date-fns';
import { MultiLangText } from './multi-lang-field';
import { useNameInPreferredLanguage } from '@hooks/use-preferred-language';

const useStyles = makeStyles({
  row: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
  },
  col25: {
    width: '25%',
    textAlign: 'left',
  },
  col50: {
    width: '50%',
    textAlign: 'left',
  },
  col25Right: {
    width: '50%',
    textAlign: 'right',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  commentWrapper: {
    marginTop: tokens.spacingVerticalL,
    marginBottom: tokens.spacingVerticalL,
  },
});

interface ReviewPanelProps {
  author: any;
  reviewDateTime: Date;
  rating?: number;
  comment: string;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  author,
  reviewDateTime,
  rating,
  comment,
}) => {
  const styles = useStyles();

  const name = useNameInPreferredLanguage(author);

  return (
    <React.Fragment>
      <div className={styles.row}>
        <div className={`${styles.col50} ${styles.row}`}>
          <Avatar
            color="colorful"
            name={name}
            size={24}
            style={{ marginRight: tokens.spacingHorizontalS }}
          />
          <Text>{name}</Text>
        </div>
        <div className={styles.col25}>{formatDistanceToNow(reviewDateTime)}</div>
        {rating ? (
          <div className={styles.col25Right}>
            <RatingDisplay color="brand" value={rating} />
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className={styles.commentWrapper}>
        <Text block style={{ whiteSpace: 'pre-wrap' }}>
          {comment}
        </Text>
      </div>
      <Divider appearance="subtle" style={{ marginBottom: tokens.spacingVerticalL }} />
    </React.Fragment>
  );
};
