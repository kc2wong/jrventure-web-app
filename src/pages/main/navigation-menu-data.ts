import {
  AccessibilityRegular,
  BriefcaseRegular,
  DocumentOnePageSparkleRegular,
  EditPersonRegular,
  NotepadEditRegular,
  PeopleRegular,
} from '@fluentui/react-icons';
import type { SVGProps } from 'react';

type NavigationMenuItemEntry = {
  id: string;
  labelKey: string;
  icon: React.ElementType<SVGProps<SVGSVGElement>>;
  path: string;
};

type NavigationMenuSection = {
  titleKey?: string;
  items: [NavigationMenuItemEntry, ...NavigationMenuItemEntry[]];
};

const navigationMenu: NavigationMenuSection[] = [
  {
    titleKey: 'navigation.administration',
    items: [
      { id: 'mnuUser', labelKey: 'user.title', icon: PeopleRegular, path: '/user' },
      {
        id: 'mnuClass',
        labelKey: 'class.title',
        icon: BriefcaseRegular,
        path: '/class',
      },
      {
        id: 'mnuStudent',
        labelKey: 'student.title',
        icon: EditPersonRegular,
        path: '/student',
      },
    ],
  },
  {
    titleKey: 'navigation.studentEngagement',
    items: [
      {
        id: 'mnuNotice',
        labelKey: 'notice.title',
        icon: NotepadEditRegular,
        path: '/notice',
      },
      {
        id: 'mnuLetter',
        labelKey: 'letter.title',
        icon: DocumentOnePageSparkleRegular,
        path: '/letter',
      },
      {
        id: 'mnuActivity',
        labelKey: 'activity.title',
        icon: AccessibilityRegular,
        path: '/activity',
      },
    ],
  },
];

const isItemVisible = (
  item: NavigationMenuItemEntry,
  entitledMenuItemIds: string[],
): boolean => entitledMenuItemIds.includes(item.id);

export type { NavigationMenuItemEntry, NavigationMenuSection };
export { isItemVisible, navigationMenu };
