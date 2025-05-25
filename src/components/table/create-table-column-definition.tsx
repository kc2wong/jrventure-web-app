import {
  TableHeaderCell,
  TableCell,
  Body1Strong,
  tokens,
  TableColumnDefinition,
} from '@fluentui/react-components'; // import the necessary components
import { ReactElement } from 'react';

type SortDirection = 'asc' | 'desc';

interface createTableColumnProps<T> {
  columnId: string;
  width: number;
  header: string;
  sortDirection?: SortDirection;
  builder: (item: T) => ReactElement;
}

export const createTableColumn = <T extends { id: string | number }>(
  props: createTableColumnProps<T>,
): TableColumnDefinition<T> {
  const { columnId, width, header, builder } = props;
): TableColumnDefinition<T> => {
  const style = { width: `${width}%` };

  return {
    columnId,
    renderHeaderCell: () => (
      <TableHeaderCell key={columnId} style={{ pointerEvents: 'none', ...style }}>
        <TableCellLayout appearance="primary">
          <span style={{ color: tokens.colorBrandForeground1 }}>
            <Body1Strong>{header}</Body1Strong>
          </span>
        </TableCellLayout>
              ? 'descending'
              : undefined
        }
        style={style}
      >
        <span style={{ color: tokens.colorBrandForeground1 }}>
          <Body1Strong italic={onSort !== undefined}>{header}</Body1Strong>
        </span>
      </TableHeaderCell>
    ),
    renderCell: (item: T) => (
      <TableCell key={`${item.id}_${columnId}`} {...style}>
        {builder(item)}
      </TableCell>
    ),
    compare: () => 0,
  };
};
