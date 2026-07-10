/**
 * Swizzled <Tabs> component.
 *
 * Why: Docusaurus 3.10.0's `useTabValues` calls `extractChildrenTabValues`
 * on raw children, which crashes at `child.type.name` when whitespace text
 * nodes (`\n`) sit between `<Tabs>` and `<TabItem>`. The upstream Tabs
 * component sanitizes children only when rendering, not when extracting
 * values  -  see node_modules/@docusaurus/theme-common/lib/utils/tabsUtils.js.
 *
 * Fix: sanitize children up front, then pass the cleaned list to BOTH
 * `useTabsContextValue` (for value extraction) and the rendered
 * `TabsContainer`.
 */
import {useRef} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {
  useScrollPositionBlocker,
  useTabsContextValue,
  useTabs,
  sanitizeTabsChildren,
  TabsProvider,
} from '@docusaurus/theme-common/internal';
import useIsBrowser from '@docusaurus/useIsBrowser';
import styles from './styles.module.css';

function TabList({className}) {
  const {selectedValue, selectValue, tabValues, block} = useTabs();
  const tabRefs = useRef([]);
  const {blockElementScrollPositionUntilNextRender} =
    useScrollPositionBlocker();
  const handleTabChange = (event) => {
    const newTab = event.currentTarget;
    const newTabIndex = tabRefs.current.indexOf(newTab);
    const newTabValue = tabValues[newTabIndex].value;
    if (newTabValue !== selectedValue) {
      blockElementScrollPositionUntilNextRender(newTab);
      selectValue(newTabValue);
    }
  };
  const handleKeydown = (event) => {
    let focusElement = null;
    switch (event.key) {
      case 'Enter': {
        handleTabChange(event);
        break;
      }
      case 'ArrowRight': {
        const nextTab = tabRefs.current.indexOf(event.currentTarget) + 1;
        focusElement = tabRefs.current[nextTab] ?? tabRefs.current[0];
        break;
      }
      case 'ArrowLeft': {
        const prevTab = tabRefs.current.indexOf(event.currentTarget) - 1;
        focusElement = tabRefs.current[prevTab] ?? tabRefs.current[tabRefs.current.length - 1];
        break;
      }
      default:
        break;
    }
    focusElement?.focus();
  };
  return (
    <ul
      role="tablist"
      aria-orientation="horizontal"
      className={clsx(
        'tabs',
        {
          'tabs--block': block,
        },
        className,
      )}>
      {tabValues.map(({value, label, attributes}) => (
        <li
          role="tab"
          tabIndex={selectedValue === value ? 0 : -1}
          aria-selected={selectedValue === value}
          key={value}
          ref={(ref) => {
            tabRefs.current.push(ref);
          }}
          onKeyDown={handleKeydown}
          onClick={handleTabChange}
          {...attributes}
          className={clsx('tabs__item', styles.tabItem, attributes?.className, {
            'tabs__item--active': selectedValue === value,
          })}>
          {label ?? value}
        </li>
      ))}
    </ul>
  );
}

function TabContent({children}) {
  return <div className="margin-top--md">{children}</div>;
}

function TabsContainer({className, children}) {
  return (
    <div
      className={clsx(
        ThemeClassNames.tabs.container,
        'tabs-container',
        styles.tabList,
      )}>
      <TabList className={className} />
      <TabContent>{children}</TabContent>
    </div>
  );
}

export default function Tabs(props) {
  const isBrowser = useIsBrowser();
  const sanitizedChildren = sanitizeTabsChildren(props.children);
  const value = useTabsContextValue({...props, children: sanitizedChildren});
  return (
    <TabsProvider
      value={value}
      // Remount tabs after hydration  -  see facebook/docusaurus#5653
      key={String(isBrowser)}>
      <TabsContainer className={props.className}>
        {sanitizedChildren}
      </TabsContainer>
    </TabsProvider>
  );
}
