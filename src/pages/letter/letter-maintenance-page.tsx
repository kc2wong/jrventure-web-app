import { withMaintenancePage } from '@component/with-maintenance-page';

import { LetterEditPage } from './letter-edit-page';
import { LetterListPage } from './letter-list-page';

const LetterMaintenancePage = withMaintenancePage(LetterListPage, LetterEditPage, { entityName: 'letter' });

export { LetterMaintenancePage };
