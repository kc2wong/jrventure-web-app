import {
  InteractionTag,
  InteractionTagPrimary,
  InteractionTagSecondary,
  TagGroup,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowClockwiseRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  DismissRegular,
  DocumentAddRegular,
  EraserRegular,
  FilterAddRegular,
} from '@fluentui/react-icons';
import type { FuiTable } from 'handy-fluentui';
import {
  FuiBody1,
  FuiButton,
  FuiDrawer,
  FuiDrawerBody,
  FuiDrawerHeader,
  FuiToggle,
  FuiTooltip,
  useBreadcrumb,
  useIsMobile,
} from 'handy-fluentui';
import type {
  ComponentProps,
  CSSProperties,
  ReactElement,
  ReactNode,
} from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flex: '1',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  content: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    minWidth: '0',
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
  },
  contentMobile: {
    paddingLeft: '0',
    paddingRight: '0',
  },
  drawerHeader: {
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalL,
    paddingTop: '0',
    paddingBottom: tokens.spacingVerticalS,
    minHeight: '32px',
    display: 'flex',
    alignItems: 'stretch',
    '& h2': {
      margin: '0',
      padding: '0',
    },
  },
  drawerBody: {
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalL,
    paddingTop: '0',
  },
  buttonBar: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
  buttonBarMobile: {
    alignItems: 'stretch',
    flexDirection: 'column',
    paddingLeft: tokens.spacingHorizontalS,
  },
  buttonBarActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  buttonBarActionsMobile: {
    justifyContent: 'flex-end',
    marginTop: tokens.spacingVerticalS,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  filterTagsRow: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
  },
  filterTagsRowMobile: {
    flexWrap: 'nowrap',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': { display: 'none' },
  },
  filterTagsScrollContainer: {
    position: 'relative',
  },
  filterTagPrimary: {
    cursor: 'default',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
      cursor: 'default',
    },
  },
  filterTagsScrollArrow: {
    alignItems: 'center',
    background: 'none',
    border: 'none',
    bottom: 0,
    color: tokens.colorNeutralForeground1,
    cursor: 'pointer',
    display: 'flex',
    fontSize: '16px',
    padding: '0',
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  filterTagsScrollArrowLeft: {
    background: `linear-gradient(to right, ${tokens.colorNeutralBackground1} 50%, transparent)`,
    left: 0,
    paddingLeft: tokens.spacingHorizontalXS,
    paddingRight: tokens.spacingHorizontalL,
  },
  filterTagsScrollArrowRight: {
    background: `linear-gradient(to left, ${tokens.colorNeutralBackground1} 50%, transparent)`,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalXS,
    right: 0,
  },
  filterLabel: {
    color: tokens.colorNeutralForeground2,
    flexShrink: 0,
  },
  filterTagsPlaceholder: {
    minHeight: '32px',
  },
});

type SearchStatus = 'idle' | 'loading' | 'success' | 'invalid' | 'error';
type WidthProps = Pick<CSSProperties, 'width' | 'minWidth' | 'maxWidth'>;

const defaultDesktopWidth: WidthProps = { maxWidth: '700px', width: '60vw' };

const computeButtonBarWidth = ({
  width,
  minWidth,
  maxWidth,
}: WidthProps): CSSProperties => {
  if (!width) {
    return {};
  }
  let w = width as string;
  if (minWidth) {
    w = `max(${w}, ${minWidth})`;
  }
  if (maxWidth) {
    w = `min(${w}, ${maxWidth})`;
  }
  return { width: `min(${w}, 100%)` };
};

type JrVcSearchPageLayoutProps = {
  children: ReactElement<ComponentProps<typeof FuiTable>>;
  entityName: string;
  /**
   * Renders the filter form. The `onSearch` argument must be called after the
   * form dispatches its search action so the layout can close the filter drawer
   * on mobile.
   */
  filterForm: (onSearch: () => void) => ReactNode;
  filterTags?: { label: string; onRemove: () => void }[];
  /** Called when the user submits a new record. Omit to hide the Add button. */
  onAdd?: () => void;
  /** Called to reset the filter and reload the list with no criteria applied. */
  onClear: () => void;
  /** Called to reload the list using the current filter without changing criteria. */
  onRefresh: () => void;
  status: SearchStatus;
  mobile: {
    filterPath: string;
  };
  desktop?: {
    filterWidth?: WidthProps;
    width?: WidthProps;
  };
};

export const JrVcSearchPageLayout = ({
  children,
  entityName,
  filterForm,
  filterTags,
  desktop,
  mobile,
  onAdd,
  onClear,
  onRefresh,
  status,
}: JrVcSearchPageLayoutProps) => {
  const styles = useStyles();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { append, items } = useBreadcrumb();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const filterTagsScrollRef = useRef<HTMLDivElement>(null);

  const updateFilterTagsScrollState = () => {
    const el = filterTagsScrollRef.current;
    if (!el) {
      return;
    }
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    if (!isMobile || status === 'idle') {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const el = filterTagsScrollRef.current;
    if (!el) {
      return;
    }
    updateFilterTagsScrollState();
    el.addEventListener('scroll', updateFilterTagsScrollState);
    const observer = new ResizeObserver(updateFilterTagsScrollState);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', updateFilterTagsScrollState);
      observer.disconnect();
    };
  }, [isMobile, status, filterTags]);

  const breadcrumbTag = location.pathname;
  const currentTagInItems = items.some((item) => item.tag === breadcrumbTag);
  useEffect(() => {
    if (!currentTagInItems) {
      append({
        action: () => navigate(breadcrumbTag),
        label: () => t(`${breadcrumbTag.substring(1)}.list`),
        tag: breadcrumbTag,
      });
    }
  }, [currentTagInItems, breadcrumbTag, t, navigate, append]);

  useEffect(() => {
    if (status === 'invalid') {
      onRefresh();
    }
  }, [status, onRefresh]);

  const handleFilterClick = () => {
    if (isMobile) {
      navigate(mobile.filterPath, { state: { fromSearch: true } });
    } else {
      setIsDrawerOpen((prev) => !prev);
    }
  };

  return (
    <div className={styles.root}>
      {!isMobile && (
        <FuiDrawer
          onOpenChange={setIsDrawerOpen}
          open={isDrawerOpen}
          style={{ ...desktop?.filterWidth }}
          type="inline"
        >
          <FuiDrawerHeader
            action={
              <FuiTooltip text={t('general.text.close')}>
                <FuiButton
                  appearance="subtle"
                  aria-label={t('general.text.close')}
                  icon={<DismissRegular />}
                  onClick={() => setIsDrawerOpen(false)}
                />
              </FuiTooltip>
            }
            className={styles.drawerHeader}
            title={t('general.text.filter', {
              entityName: isMobile ? entityName : '',
            }).trim()}
          />
          <FuiDrawerBody className={styles.drawerBody}>
            {filterForm(() => setIsDrawerOpen(false))}
          </FuiDrawerBody>
        </FuiDrawer>
      )}

      <div
        className={mergeClasses(
          styles.content,
          isMobile ? styles.contentMobile : undefined,
        )}
      >
        <div
          className={mergeClasses(
            styles.buttonBar,
            isMobile && styles.buttonBarMobile,
          )}
          style={
            isMobile
              ? {}
              : computeButtonBarWidth(desktop?.width ?? defaultDesktopWidth)
          }
        >
          <div className={isMobile ? styles.filterTagsPlaceholder : undefined}>
            {status === 'idle' ? (
              <FuiBody1 text={t('general.text.searchNotPerformed')} />
            ) : (
              <div
                className={
                  isMobile ? styles.filterTagsScrollContainer : undefined
                }
              >
                {isMobile && canScrollLeft && (
                  <button
                    className={mergeClasses(
                      styles.filterTagsScrollArrow,
                      styles.filterTagsScrollArrowLeft,
                    )}
                    onClick={() =>
                      filterTagsScrollRef.current?.scrollBy({
                        behavior: 'smooth',
                        left: -150,
                      })
                    }
                  >
                    <ChevronLeftRegular />
                  </button>
                )}
                <div
                  ref={filterTagsScrollRef}
                  className={mergeClasses(
                    styles.filterTagsRow,
                    isMobile && styles.filterTagsRowMobile,
                  )}
                >
                  <FuiBody1
                    className={styles.filterLabel}
                    text={`${t('general.text.filter', { entityName: '' }).trim()}:`}
                  />
                  <TagGroup style={{ flexShrink: 0 }}>
                    {!filterTags?.length ? (
                      <InteractionTag appearance="filled" size="medium">
                        <InteractionTagPrimary className={styles.filterTagPrimary}>
                          {t('general.text.all')}
                        </InteractionTagPrimary>
                      </InteractionTag>
                    ) : (
                      filterTags.map((tag, i) => (
                        <InteractionTag
                          key={i}
                          appearance="filled"
                          size="medium"
                        >
                          <InteractionTagPrimary className={styles.filterTagPrimary} hasSecondaryAction>
                            {tag.label}
                          </InteractionTagPrimary>
                          <InteractionTagSecondary
                            aria-label="remove"
                            onClick={tag.onRemove}
                          />
                        </InteractionTag>
                      ))
                    )}
                  </TagGroup>
                </div>
                {isMobile && canScrollRight && (
                  <button
                    className={mergeClasses(
                      styles.filterTagsScrollArrow,
                      styles.filterTagsScrollArrowRight,
                    )}
                    onClick={() =>
                      filterTagsScrollRef.current?.scrollBy({
                        behavior: 'smooth',
                        left: 150,
                      })
                    }
                  >
                    <ChevronRightRegular />
                  </button>
                )}
              </div>
            )}
          </div>
          <div
            className={mergeClasses(
              styles.buttonBarActions,
              isMobile && styles.buttonBarActionsMobile,
            )}
          >
            <FuiTooltip
              text={t('general.text.filter', {
                entityName: isMobile ? entityName : '',
              }).trim()}
            >
              <FuiToggle
                checked={isDrawerOpen}
                icon={<FilterAddRegular />}
                onClick={handleFilterClick}
              />
            </FuiTooltip>
            <FuiTooltip text={t('general.text.refresh')}>
              <FuiButton icon={<ArrowClockwiseRegular />} onClick={onRefresh} />
            </FuiTooltip>
            <FuiTooltip text={t('general.text.clear')}>
              <FuiButton icon={<EraserRegular />} onClick={onClear} />
            </FuiTooltip>
            {onAdd && (
              <FuiTooltip text={t('general.text.add', { entityName: '' }).trim()}>
                <FuiButton icon={<DocumentAddRegular />} onClick={onAdd} />
              </FuiTooltip>
            )}
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <div
            style={isMobile ? undefined : { ...(desktop?.width ?? defaultDesktopWidth) }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export type { JrVcSearchPageLayoutProps };
