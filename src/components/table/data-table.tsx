import type { TableColumnDefinition, TableRowProps } from '@fluentui/react-components';
import {
  Table,
  TableHeader,
  TableRow,
  TableSelectionCell,
  TableBody,
  TableCell,
  Body1,
} from '@fluentui/react-components';
import { makeStyles, shorthands } from '@fluentui/react-components';
import React from 'react';

type SelectableTableProps<T> = {
  columns: TableColumnDefinition<T>[];
  rows: {
    item: T;
    onClick: (e: React.MouseEvent) => void;
    selected: boolean;
    appearance?: TableRowProps['appearance'];
  }[];
  noSearchPerformed?: boolean;
  t: (key: string) => string;
  minWidth?: string;
  maxWidth?: string;
};

const useStyles = makeStyles({
  table: {
    width: '100%',
    tableLayout: 'fixed',
  },
  selectionCell: {
    width: '40px',
    padding: 0,
    ...shorthands.padding(0),
  },
});

export function DataTable<T>({
  columns,
  rows,
  noSearchPerformed,
  t,
  minWidth = '500px',
  maxWidth = '1200px',
}: SelectableTableProps<T>) {
  const styles = useStyles();

  return (
    <Table
      className={styles.table}
      style={{
        minWidth,
        maxWidth,
      }}
    >
      <TableHeader>
        <TableRow>
          <TableSelectionCell className={styles.selectionCell} invisible type="radio" />
          {columns.map((col) => col.renderHeaderCell())}
        </TableRow>
      </TableHeader>

      <TableBody>
        {noSearchPerformed ? (
          <TableRow>
            <TableCell colSpan={columns.length + 1}>
              <Body1>{t('system.message.noSearchPerformed')}</Body1>
            </TableCell>
          </TableRow>
        ) : rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length + 1}>
              <Body1>{t('system.message.noMatchedData')}</Body1>
            </TableCell>
          </TableRow>
        ) : (
          rows.map(({ item, selected, onClick, appearance }) => (
            <TableRow
              key={(item as any).id}
              appearance={appearance}
              aria-selected={selected}
              onClick={onClick}
            >
              <TableSelectionCell
                checked={selected}
                className={styles.selectionCell}
                type="radio"
              />
              {columns.map((col) => col.renderCell(item))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
