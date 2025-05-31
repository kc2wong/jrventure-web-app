import React from 'react';
import { RatingDisplay, Text, makeStyles, tokens } from '@fluentui/react-components';
import { formatDistanceToNow } from 'date-fns';

const useStyles = makeStyles({
  row: {
    display: 'flex',
    width: '100%',
  },
  col25: {
    width: '25%',
    textAlign: 'left',
  },
  col50Right: {
    width: '50%',
    textAlign: 'right',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  panels: {
    padding: '0 10px',
    '& th': {
      textAlign: 'left',
      padding: '0 30px 0 0',
    },
  },
  iconText: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS, // small space between icon and text
  },
  commentWrapper: {
    marginLeft: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalXL,
  },
});

interface ReviewPanelProps {
  author: string;
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

  return (
    <React.Fragment>
      <div className={styles.row}>
        <div className={styles.col25}>
          <Text>{author}</Text>
        </div>
        <div className={styles.col25}>{formatDistanceToNow(reviewDateTime)}</div>
        {rating ? (
          <div className={styles.col50Right}>
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
    </React.Fragment>
  );
};
