import {
  Breadcrumb,
  BreadcrumbItem as FuiBreadcrumbItem,
  BreadcrumbButton,
  BreadcrumbDivider,
  tokens,
  makeStyles,
  mergeClasses,
} from '@fluentui/react-components';
import { ChevronCircleRightRegular } from '@fluentui/react-icons';
import { FuiButton, useBreadcrumb } from 'handy-fluentui';
import { Fragment } from 'react';

const useStyles = makeStyles({
  nonInteractiveItem: {
    color: tokens.colorNeutralForeground2,
    backgroundColor: 'transparent',
    cursor: 'default',
  },
  collapsibleItem: {
    overflow: 'hidden',
    maxWidth: '240px',
    opacity: 1,
    transitionProperty: 'max-width, opacity',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
  },
  collapsedItem: {
    maxWidth: '0px',
    opacity: 0,
    pointerEvents: 'none',
  },
  chevron: {
    transitionProperty: 'transform',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    transitionDelay: tokens.durationNormal,
  },
  chevronExpanded: {
    transform: 'rotate(-180deg)',
  },
});

type JrVcBreadcrumbProps = {
  isExpanded: boolean;
  onClick: () => void;
};

export const JrVcBreadcrumb = (props: JrVcBreadcrumbProps) => {
  const styles = useStyles();
  const { items } = useBreadcrumb();

  const { isExpanded } = props;
  return (
    <Breadcrumb>
      {items.map((item, index) => {
        const label = item.label();
        const isLast = index === items.length - 1;
        const isNonInteractive = !item.action && !isLast;

        const colorStyle = isNonInteractive
          ? {
              color: tokens.colorNeutralForeground2,
              backgroundColor: 'transparent',
              cursor: 'default',
            }
          : {};
        const fontStyle = isLast ? { fontSize: tokens.fontSizeBase500 } : {};

        return (
          <Fragment key={index}>
            <FuiBreadcrumbItem
              className={isLast ? undefined : mergeClasses(
                styles.collapsibleItem,
                !isExpanded && styles.collapsedItem,
              )}
            >
              <BreadcrumbButton
                className={isNonInteractive ? styles.nonInteractiveItem : undefined}
                current={isLast}
                disabled={isLast}
                onClick={item.action}
                style={{ ...colorStyle, ...fontStyle }}
              >
                {label}
              </BreadcrumbButton>
            </FuiBreadcrumbItem>
            {!isLast && (
              <BreadcrumbDivider
                className={mergeClasses(
                  styles.collapsibleItem,
                  !isExpanded && styles.collapsedItem,
                )}
              />
            )}
          </Fragment>
        );
      })}
      <FuiButton
        appearance="subtle"
        icon={
          <ChevronCircleRightRegular
            className={mergeClasses(styles.chevron, isExpanded && styles.chevronExpanded)}
          />
        }
        onClick={props.onClick}
      />
    </Breadcrumb>
  );
};
