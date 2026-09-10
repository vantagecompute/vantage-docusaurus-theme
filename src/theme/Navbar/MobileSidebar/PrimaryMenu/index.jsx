import React from 'react';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import NavbarItem from '@theme/NavbarItem';
import {toNavbarItems, useVantageNavbar} from '../../useVantageNavbar';

/**
 * The primary panel of the mobile drawer. theme-classic fills it from
 * themeConfig.navbar.items; this theme fills it from the same external
 * buttons the developer navbar shows. The public navbar has nothing to put
 * here (search and the site's actions stay in the bar), so the panel is empty
 * and the drawer opens straight onto the docs sidebar.
 */
export default function NavbarMobilePrimaryMenu() {
  const mobileSidebar = useNavbarMobileSidebar();
  const {variant, links} = useVantageNavbar();

  if (variant !== 'developer' || links.length === 0) {
    return null;
  }

  return (
    <ul className="menu__list">
      {toNavbarItems(links).map((item, i) => (
        <NavbarItem mobile {...item} onClick={() => mobileSidebar.toggle()} key={i} />
      ))}
    </ul>
  );
}
