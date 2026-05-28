import { makeStyles, tokens } from '@fluentui/react-components';
import { useBreadcrumb } from 'handy-fluentui';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { JrVcBreadcrumb } from './jr-venture-breadcrumb';

export type MaintenanceEditMode = 'add' | 'edit' | 'view';
type MaintenanceMode = 'list' | MaintenanceEditMode;

export type MaintenanceListPageProps = {
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onView: (id: string) => void;
};

export type MaintenanceEditPageProps = {
  id?: string;
  mode: MaintenanceEditMode;
  onExit: () => void;
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    overflow: 'hidden',
  },
  content: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    overflow: 'hidden',
  },
});


export function withMaintenancePage(
  ListPage: React.ComponentType<MaintenanceListPageProps>,
  EditPage: React.ComponentType<MaintenanceEditPageProps>,
  options: { entityName: string },
) {
  const { entityName } = options;

  return function MaintenancePage() {
    const styles = useStyles();
    const location = useLocation();
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { append, start, items, popTill } = useBreadcrumb();
    const [isExpanded, setIsExpanded] = useState(false); // title is expanded or not

    const segments = location.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1];

    let mode: MaintenanceMode;
    let basePath: string;

    if (last === 'add') {
      mode = 'add';
      basePath = '/' + segments.slice(0, -1).join('/');
    } else if (id && (last === 'view' || last === 'edit')) {
      mode = last;
      basePath = '/' + segments.slice(0, -2).join('/');
    } else {
      mode = 'list';
      basePath = location.pathname;
    }

    // The maintenance tag marks whether this HOC has initialised the breadcrumb trail.
    // It is set by start() below and persists in the breadcrumb context across re-renders.
    // Checking for it (rather than checking items.length) means the guard survives
    // navigating between sub-pages of the same entity without re-triggering start().
    const maintenanceTag = `mnu${entityName}`;
    const currentTagInItems = items.some((item) => item.tag === maintenanceTag);

    // Breadcrumb bootstrap effect.
    //
    // React runs child effects before parent effects, so ListPage / EditPage would
    // append their own items before this effect fires. If start() ran after those
    // appends it would reset the trail and lose them. The `return null` guard below
    // prevents children from mounting — and therefore from running their effects —
    // until this effect has already seeded the trail.
    //
    // On browser refresh all breadcrumb state is lost. This effect reconstructs the
    // minimum trail needed so that child components can append on top of it:
    //   - list mode  → start() only; ListPage appends its own item after mount.
    //   - add/edit/view → start() + append(list bridge); EditPage appends its item after mount.
    useEffect(() => {
      if (!currentTagInItems) {
        start({
          label: () => t(`${entityName}.title`),
          tag: maintenanceTag,
        });
        // For sub-pages the list item sits between the maintenance root and the
        // edit/add/view item. We add it here because ListPage is not mounted on
        // this route and cannot add it itself.
        if (mode !== 'list') {
          append({
            action: () => navigate(basePath),
            label: () => t(`${entityName}.list`),
            tag: basePath,
          });
        }
      }
    }, [currentTagInItems, maintenanceTag, mode, basePath]);

    const handleBack = () => {
      // Remove the current breadcrumb item (add/edit/view) before navigating back
      // to the list. popTill() without an argument removes the last item only, so
      // the list item and maintenance root are preserved.
      popTill();
      navigate(basePath);
    };

    // Do not render children until the maintenance tag is confirmed in the trail.
    // This ensures child components (ListPage, EditPage) only mount — and fire
    // their own breadcrumb append effects — after start() has already run, avoiding
    // the race where child appends are wiped by a later start() call.
    if (!currentTagInItems) {
      return null;
    }

    const breadcrumb = (
      <JrVcBreadcrumb
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      />
    );
    if (mode === 'list') {
      return (
        <div className={styles.root}>
          {breadcrumb}
          <div className={styles.content}>
            <ListPage
              onAdd={() => navigate(`${basePath}/add`)}
              onEdit={(itemId) => navigate(`${basePath}/${itemId}/edit`)}
              onView={(itemId) => navigate(`${basePath}/${itemId}/view`)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className={styles.root}>
        {breadcrumb}
        <div className={styles.content}>
          <EditPage
            id={id}
            mode={mode}
            onExit={handleBack}
          />
        </div>
      </div>
    );
  };
}
