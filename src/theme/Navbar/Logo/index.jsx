import React from 'react';
// Must be @theme-init, NOT @theme-original. This component ships inside a
// theme package that sits in the theme stack, so @theme-original/Navbar/Logo
// resolves back to this same component -- React SSR then recurses without
// bound and exhausts the heap during static site generation. @theme-init is
// the alias for a theme wrapping the implementation below it in the stack.
import Logo from '@theme-init/Navbar/Logo';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

/**
 * Brand logo on the left, plus a centered title with the project version
 * immediately to its right.
 *
 * The title cannot just be centered in place: theme-classic renders it inside
 * the brand <a>, beside the logo, so centering it would drag the logo along.
 * Instead the in-brand title is hidden by CSS and re-rendered here as its own
 * absolutely-centered element, which lets the version badge sit next to it.
 */
export default function LogoWrapper(props) {
  const {siteConfig} = useDocusaurusContext();

  const raw = siteConfig.customFields?.projectVersion;
  const version = raw
    ? String(raw).startsWith('v')
      ? String(raw)
      : `v${raw}`
    : null;

  const title = siteConfig.themeConfig?.navbar?.title;

  return (
    <>
      <Logo {...props} />
      {(title || version) && (
        <div className="navbar__center-title">
          {title && <span className="navbar__center-title-text">{title}</span>}
          {version && <span className="navbar__version-badge">{version}</span>}
        </div>
      )}
    </>
  );
}
