import { withMaintenancePage } from '@component/with-maintenance-page';

import { ClassEditPage } from './class-edit-page';
import { ClassListPage } from './class-list-page';

const ClassMaintenancePage = withMaintenancePage(ClassListPage, ClassEditPage, { entityName: 'class' });

export { ClassMaintenancePage };
