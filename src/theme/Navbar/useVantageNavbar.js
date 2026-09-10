import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {usePluginData} from '@docusaurus/useGlobalData';

/**
 * Everything the theme's navbar components need, in one place. The variant,
 * the brand-link href and the external buttons come from the theme's Node
 * side (setGlobalData in lib/index.cjs). The title and version come from the
 * site config. themeConfig.navbar is deliberately never read.
 */
export function useVantageNavbar() {
  const {siteConfig} = useDocusaurusContext();
  const {variant, logoHref, navbarLinks} = usePluginData('@vantagecompute/docusaurus-theme');

  const raw = siteConfig.customFields?.projectVersion;
  const version = raw
    ? String(raw).startsWith('v')
      ? String(raw)
      : `v${raw}`
    : null;

  return {
    variant,
    logoHref,
    links: navbarLinks,
    // The developer navbar names the project beside its version, which is
    // how a reader confirms they are on the version they think they are.
    // The public navbar is logo-only.
    title: variant === 'developer' ? siteConfig.title : null,
    version,
  };
}

/**
 * Map the validated {label, url} links onto theme-classic NavbarItem props.
 * External destinations open in a new tab, the accepted convention for
 * leaving a site. NavbarNavLink appends the external-link icon on its own
 * because href is external and label is set.
 */
export function toNavbarItems(links) {
  return links.map((link) => ({
    label: link.label,
    href: link.url,
    position: 'right',
    target: '_blank',
    rel: 'noopener noreferrer',
    className: 'navbar__external-link',
  }));
}
