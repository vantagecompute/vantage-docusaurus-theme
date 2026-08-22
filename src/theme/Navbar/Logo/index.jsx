import React from 'react';
// Must be @theme-init, NOT @theme-original. This component ships inside a
// theme package that sits in the theme stack, so @theme-original/Navbar/Logo
// resolves back to this same component -- React SSR then recurses without
// bound and exhausts the heap during static site generation. @theme-init is
// the alias for a theme wrapping the implementation below it in the stack.
import Logo from '@theme-init/Navbar/Logo';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function LogoWrapper(props) {
  const {siteConfig} = useDocusaurusContext();
  const version = siteConfig.customFields?.projectVersion;

  return (
    <div className="navbar__brand-with-version">
      <Logo {...props} />
      {version && (
        <span className="navbar__version-badge">
          {String(version).startsWith('v') ? version : `v${version}`}
        </span>
      )}
    </div>
  );
}
