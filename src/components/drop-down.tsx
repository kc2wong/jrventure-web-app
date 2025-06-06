import {
  Dropdown as FluentDropdown,
  DropdownProps as FluentDropdownProps,
  Listbox,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  makeStyles,
} from '@fluentui/react-components';
import { useState, cloneElement, forwardRef, isValidElement, Children } from 'react';
import { useIsMobile } from '../hooks/use-mobile';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  drawerBody: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  drawerSpacer: { flex: 1 },
  listContainer: {
    flex: 8,
    overflowY: 'auto',
  },
});

export type DropdownProps = FluentDropdownProps & {
  readOnly?: boolean;
};

export const Dropdown = forwardRef<HTMLButtonElement, DropdownProps>(
  (
    {
      children,
      readOnly = false,
      appearance,
      onOptionSelect,
      value,
      selectedOptions,
      ...restProps
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const styles = useStyles();
    const isMobile = useIsMobile();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const optionChildren = Children.toArray(children).filter(isValidElement);

    if (isMobile) {
      return (
        <>
          <div onClick={readOnly === true ? undefined : () => setDrawerOpen(true)}>
            <FluentDropdown
              ref={ref}
              {...restProps}
              appearance={readOnly ? 'underline' : appearance}
              open={false}
              style={{ width: '100%' }}
              value={value}
            >
              {optionChildren}
            </FluentDropdown>
          </div>

          <Drawer
            onOpenChange={(_, data) => setDrawerOpen(data.open)}
            // never open when readOnly
            open={readOnly === true ? false : drawerOpen}
            position="bottom"
          >
            <DrawerHeader>
              <DrawerHeaderTitle>{t('system.message.selectOption')}</DrawerHeaderTitle>
            </DrawerHeader>
            <DrawerBody>
              <div className={styles.drawerBody}>
                <div className={styles.drawerSpacer}></div>
                <div className={styles.listContainer}>
                  <Listbox
                    onOptionSelect={(ev, data) => {
                      if (onOptionSelect) {
                        onOptionSelect(ev, data);
                      }
                      setDrawerOpen(false);
                    }}
                    selectedOptions={selectedOptions}
                    tabIndex={0}
                  >
                    {optionChildren.map((child: any) =>
                      cloneElement(child, { key: child.key ?? child.props.value }),
                    )}
                  </Listbox>
                </div>
                <div className={styles.drawerSpacer}></div>
              </div>
            </DrawerBody>
          </Drawer>
        </>
      );
    } else {
      return (
        <FluentDropdown
          ref={ref}
          {...restProps}
          appearance={readOnly ? 'underline' : appearance}
          onOptionSelect={readOnly ? () => {} : onOptionSelect}
          selectedOptions={selectedOptions}
          value={value}
        >
          {optionChildren}
        </FluentDropdown>
      );
    }
  },
);

Dropdown.displayName = 'Dropdown';
