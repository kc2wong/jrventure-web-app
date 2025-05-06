import { Student, User } from './openapi';

interface Login {
  user: User;
  entitledStudents: Student[],
  menu: MenuItem;
}

interface MenuItem {
  id: string;
  label: string;
  children?: MenuItem[];
}

export type { Login, MenuItem };
