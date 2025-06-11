import React, { FC } from 'react';
import { Caption2, Image, makeStyles, shorthands } from '@fluentui/react-components';

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
};
export const ImagePreview: FC<ImagePreviewProps> = ({ fileName, src }) => {
  const styles = useStyles();

  return (
    <div className={styles.imageWrapper}>
      <div className={styles.overlay}>
        <Caption2>{fileName}</Caption2>
      </div>
      <Image className={styles.image} fit="contain" src={src} />
    </div>
  );
};

ImagePreview.displayName = 'ImagePreview';
