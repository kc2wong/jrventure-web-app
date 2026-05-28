import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { useIsMobile } from 'handy-fluentui';
import type { ReactNode } from 'react';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  grid: {
    display: 'grid',
    columnGap: tokens.spacingHorizontalL,
    minWidth: '0',
    rowGap: tokens.spacingVerticalL,
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
});

type JrVcGridProps = {
  children: ReactNode;
  columns?: number;
  className?: string;
};

export const JrVcGrid = ({ children, columns = 2, className }: JrVcGridProps) => {
  const styles = useStyles();
  const isMobile = useIsMobile();

  if (isMobile) {
    return <div className={mergeClasses(styles.root, className)}>{children}</div>;
  }

  return (
    <div
      className={mergeClasses(styles.grid, className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
};

export const JrVcGridItem = ({
  children,
  fullWidth,
  className,
}: {
  children: ReactNode;
  fullWidth?: boolean;
  className?: string;
}) => {
  const styles = useStyles();
  const isMobile = useIsMobile();

  return (
    <div
      className={mergeClasses(
        !isMobile && fullWidth && styles.fullWidth,
        className,
      )}
    >
      {children}
    </div>
  );
};
