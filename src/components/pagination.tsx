import * as React from 'react';
import { Button, makeStyles, mergeClasses, shorthands, tokens } from '@fluentui/react-components';
import { ChevronCircleLeftRegular, ChevronCircleRightRegular } from '@fluentui/react-icons'; // Ensure this is the correct library

type PaginationProps = {
  offset: number;
  pageSize: number;
  totalRecord: number;
  onOffsetChanged: (offset: number) => void;
};

const useStyles = makeStyles({
  container: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  buttonWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '32px',
  },
  pageButton: {
    minWidth: '0',
    width: '32px',
    height: '32px',
    padding: '4px',
    fontWeight: 'normal',
    ...shorthands.borderRadius('4px'),
  },
  selectedPageButton: {
    fontWeight: 'bold',
  },
  underline: {
    height: '2px',
    backgroundColor: tokens.colorBrandForeground1,
    width: '100%',
    borderRadius: '1px',
  },
});

type PageItem = {
  label: string;
  page: number | null; // null means ellipsis
  key: string;
};

const maxNumberOfSlot = 7;

export const getPaginationSlots = (selectedPage: number, totalPages: number): PageItem[] => {
  const items: PageItem[] = [];

  if (totalPages <= maxNumberOfSlot) {
    Array.from({ length: totalPages }, (_, i) => i + 1).forEach((i) => {
      items.push({ label: i.toString(), page: i, key: i.toString() });
    });
  } else {
    const startPage = 1;
    let adjacentPages = [selectedPage - 1, selectedPage, selectedPage + 1].filter(
      (i) => i > 1 && i < totalPages,
    );

    let showLeftEllipsis = adjacentPages[0] > startPage + 1;
    let showRightEllipsis = adjacentPages[adjacentPages.length - 1] < totalPages - 1;

    while (
      adjacentPages.length + (showLeftEllipsis ? 1 : 0) + (showRightEllipsis ? 1 : 0) <
      maxNumberOfSlot - 2
    ) {
      if (showLeftEllipsis && adjacentPages[0] - 1 > 1) {
        adjacentPages = [adjacentPages[0] - 1, ...adjacentPages];
      } else if (showRightEllipsis && adjacentPages[adjacentPages.length - 1] + 1 < totalPages) {
        adjacentPages = [...adjacentPages, adjacentPages[adjacentPages.length - 1] + 1];
      } else {
        break;
      }
      showLeftEllipsis = adjacentPages[0] > startPage + 1;
      showRightEllipsis = adjacentPages[adjacentPages.length - 1] < totalPages - 1;
    }

    items.push({ label: '1', page: 1, key: '1' });
    if (showLeftEllipsis) {
      items.push({ label: '…', page: null, key: 'lEllipsis' });
    }
    adjacentPages.forEach((i) => {
      items.push({ label: i.toString(), page: i, key: i.toString() });
    });
    if (showRightEllipsis) {
      items.push({ label: '…', page: null, key: 'rEllipsis' });
    }
    items.push({ label: totalPages.toString(), page: totalPages, key: totalPages.toString() });
  }

  return items;
};

export const Pagination: React.FC<PaginationProps> = ({
  offset,
  pageSize,
  totalRecord,
  onOffsetChanged,
}) => {
  const styles = useStyles();

  if (totalRecord === 0) {
    return <></>;
  }
  const totalPages = Math.ceil(totalRecord / pageSize);
  const selectedPage = Math.floor(offset / pageSize) + 1;

  const pageItems = getPaginationSlots(selectedPage, totalPages);

  return (
    <div className={styles.container}>
      <Button
        appearance="transparent"
        className={styles.pageButton}
        disabled={selectedPage === 1}
        icon={<ChevronCircleLeftRegular />}
        onClick={() => {
          const newOffset = Math.max(0, (selectedPage - 2) * pageSize);
          if (newOffset !== offset) {
            onOffsetChanged(newOffset);
          }
        }} // Ensure offset does not go below 0
      ></Button>

      {pageItems.map(({ label, page, key }) => (
        <div key={key} className={styles.buttonWrapper}>
          <Button
            appearance="transparent"
            className={mergeClasses(
              styles.pageButton,
              selectedPage === page && styles.selectedPageButton,
            )}
            onClick={() => {
              const newOffset = page !== null ? (page - 1) * pageSize : offset;
              if (newOffset !== offset) {
                onOffsetChanged(newOffset);
              }
            }}
          >
            {label}
          </Button>
          {selectedPage === page && <div className={styles.underline} />}
        </div>
      ))}

      <Button
        appearance="transparent"
        className={styles.pageButton}
        disabled={selectedPage === totalPages}
        icon={<ChevronCircleRightRegular />}
        onClick={() => {
          const newOffset = Math.min(totalRecord, selectedPage * pageSize);
          if (newOffset !== offset) {
            onOffsetChanged(newOffset);
          }
        }}
      ></Button>
    </div>
  );
};
