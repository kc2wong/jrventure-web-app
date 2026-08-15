import { FuiTable } from 'handy-fluentui';
import type { FuiTableProps } from 'handy-fluentui';
import { useTranslation } from 'react-i18next';

type JrVcTableProps = Omit<FuiTableProps<Record<string, unknown>>, 'data'> & {
  data: unknown[];
};

const JrVcTable = ({ data, children, ...props }: JrVcTableProps) => {
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
    >
      {children}
    </FuiTable>
  );
};

export { JrVcTable };
