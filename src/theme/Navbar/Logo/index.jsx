import React from 'react';
import Logo from '@theme-original/Navbar/Logo';
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
