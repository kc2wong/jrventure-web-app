import { Text, tokens, makeStyles, shorthands } from '@fluentui/react-components';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  dropzone: {
    ...shorthands.border('2px', 'dashed', tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.padding('40px'),
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground1,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease-in-out',
    marginBottom: tokens.spacingVerticalM,
  },
});

type DropzoneBoxProps = {
  onFilesAccepted: (files: File[]) => void;
};

export const DropzoneBox: React.FC<DropzoneBoxProps> = ({ onFilesAccepted }) => {
  const styles = useStyles();
  const { t } = useTranslation();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAccepted(acceptedFiles);
    },
    [onFilesAccepted],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': [],
    },
    onDrop,
  });

  return (
    <div {...getRootProps()} className={styles.dropzone}>
      <input {...getInputProps()} />
      <Text>
        {isDragActive ? t('system.message.dropZoneDrop') : t('system.message.dropZoneSelect')}
      </Text>
    </div>
  );
};
