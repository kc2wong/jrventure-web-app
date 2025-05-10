import { SimpleUser } from '../__generated__/linkedup-web-api-client';
import { User } from './openapi';

interface Login {
  user: User;
  parentUser: SimpleUser[];
  menu: MenuItem;
}

interface MenuItem {
  id: string;
  label: string;
  children?: MenuItem[];
}

export type { Login, MenuItem };
