import { Divider, makeStyles } from '@fluentui/react-components';

const useStyles = makeStyles({
  divider: { width: '8px' },
});

export const Spacer: React.FC = () => {
  const styles = useStyles();
  return <Divider className={styles.divider} vertical />;
};
