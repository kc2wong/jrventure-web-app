import { FC } from 'react';
import { Button, Caption2, Image, makeStyles, shorthands } from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';

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

type ImagePreviewProps = {
  fileName: string;
  src: string;
  deleteAction?: () => void;
};
export const ImagePreview: FC<ImagePreviewProps> = ({ fileName, src, deleteAction }) => {
  const styles = useStyles();

  return (
    <div className={styles.imageWrapper}>
      <div className={styles.overlay}>
        <Caption2>{fileName}</Caption2>
        {deleteAction ? (
          <Button
            appearance="transparent"
            className={styles.deleteButton}
            icon={<Dismiss24Regular />}
            onClick={deleteAction}
          />
        ) : (
          <></>
        )}
      </div>
      <Image className={styles.image} fit="contain" src={src} />
    </div>
  );
};

ImagePreview.displayName = 'ImagePreview';
