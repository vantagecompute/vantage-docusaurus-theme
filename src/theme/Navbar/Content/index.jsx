import React from 'react';
import clsx from 'clsx';
import {ErrorCauseBoundary, ThemeClassNames} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import NavbarItem from '@theme/NavbarItem';
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle';
import SearchBar from '@theme/SearchBar';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import NavbarLogo from '@theme/Navbar/Logo';
import NavbarSearch from '@theme/Navbar/Search';
import NavbarSiteActions from '@theme/Navbar/SiteActions';
import {toNavbarItems, useVantageNavbar} from '../useVantageNavbar';

import styles from './styles.module.css';

/**
 * The navbar, replacing theme-classic's Navbar/Content.
 *
 * Two fixed variants, chosen by the theme from the site's baseUrl:
 *
 *   public     logo | search, SiteActions slot, colour-mode toggle
 *   developer  logo + centred title and version | external buttons, toggle
 *
 * themeConfig.navbar.items is never read. A site that still declares items
 * gets no error and no rendering; the convention is the theme's to hold.
 */
function ExternalLinks({items}) {
  return (
    <>
      {items.map((item, i) => (
        <ErrorCauseBoundary
          key={i}
          onError={(error) =>
            new Error(
              `A theme navbar link failed to render: ${JSON.stringify(item)}`,
              {cause: error},
            )
          }>
          <NavbarItem {...item} />
        </ErrorCauseBoundary>
      ))}
    </>
  );
}

function NavbarContentLayout({left, right}) {
  return (
    <div className="navbar__inner">
      <div className={clsx(ThemeClassNames.layout.navbar.containerLeft, 'navbar__items')}>
        {left}
      </div>
      <div
        className={clsx(
          ThemeClassNames.layout.navbar.containerRight,
          'navbar__items navbar__items--right',
        )}>
        {right}
      </div>
    </div>
  );
}

export default function NavbarContent() {
  const mobileSidebar = useNavbarMobileSidebar();
  const {variant, links} = useVantageNavbar();

  const left = (
    <>
      {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
      <NavbarLogo />
    </>
  );

  const right =
    variant === 'developer' ? (
      <>
        <ExternalLinks items={toNavbarItems(links)} />
        <NavbarColorModeToggle className={styles.colorModeToggle} />
      </>
    ) : (
      <>
        <NavbarSearch>
          <SearchBar />
        </NavbarSearch>
        <NavbarSiteActions />
        <NavbarColorModeToggle className={styles.colorModeToggle} />
      </>
    );

  return <NavbarContentLayout left={left} right={right} />;
}
