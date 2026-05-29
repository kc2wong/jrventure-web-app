import { FuiTable } from 'handy-fluentui';
import type { TableProps } from 'handy-fluentui';
import { useTranslation } from 'react-i18next';

type JrVcTableProps = Omit<TableProps<Record<string, unknown>>, 'data'> & {
  data: unknown[];
};

const JrVcTable = ({ data, ...props }: JrVcTableProps) => {
  const { t } = useTranslation();

  return (
    <FuiTable
      {...props}
      data={data as Record<string, unknown>[]}
      langLabel={{
        pageSize: t('component.fuiTable.pageSize'),
        pageRange: t('component.fuiTable.pageRange'),
        paginationBar: {
          next: t('component.fuiTable.paginationBar.next'),
          nextN: t('component.fuiTable.paginationBar.nextN'),
          previous: t('component.fuiTable.paginationBar.previous'),
          previousN: t('component.fuiTable.paginationBar.previousN'),
        },
        noData: t('component.fuiTable.paginationBar.noData'),
      }}
    />
  );
};

export { JrVcTable };
