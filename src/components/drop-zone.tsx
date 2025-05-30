import {
  Text,
  tokens,
  makeStyles,
  shorthands,
} from '@fluentui/react-components';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

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
    selectors: {
      '&:hover': {
        // borderColor: tokens.colorBrandStroke1,
      },
    },
  },
});

type DropzoneBoxProps = {
  onFilesAccepted: (files: File[]) => void;
};

export const DropzoneBox: React.FC<DropzoneBoxProps> = ({ onFilesAccepted }) => {
  const styles = useStyles();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAccepted(acceptedFiles);
    },
    [onFilesAccepted],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  return (
    <div {...getRootProps()} className={styles.dropzone}>
      <input {...getInputProps()} />
      <Text>
        {isDragActive ? 'Drop the files here...' : 'Drag and drop files here or click to upload'}
      </Text>
    </div>
  );
};