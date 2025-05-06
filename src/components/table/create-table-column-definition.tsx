import {
  TableHeaderCell,
  TableCell,
  TableCellLayout,
  Body1Strong,
  tokens,
  TableColumnDefinition,
} from '@fluentui/react-components'; // import the necessary components
import { ReactElement } from 'react';

interface createTableColumnProps<T> {
  columnId: string;
  width: number;
  header: string;
  builder: (item: T) => ReactElement;
}

export function createTableColumn<T extends { id: string | number }>(
  props: createTableColumnProps<T>,
): TableColumnDefinition<T> {
  const { columnId, width, header, builder } = props;
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
      </TableHeaderCell>
    ),
    renderCell: (item: T) => (
      <TableCell key={`${item.id}_${columnId}`} {...style}>
        {builder(item)}
      </TableCell>
    ),
    compare: () => 0,
  };
}
