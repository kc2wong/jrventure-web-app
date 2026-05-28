import { FuiTable } from 'handy-fluentui';
import type { TableProps } from 'handy-fluentui';
import { useTranslation } from 'react-i18next';

const JrVcTable = <T extends Record<string, unknown>>(props: TableProps<T>) => {
  const { t } = useTranslation();

  return (
    <FuiTable
      {...props}
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
