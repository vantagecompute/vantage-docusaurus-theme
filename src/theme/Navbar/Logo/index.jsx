import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useVantageNavbar} from '../useVantageNavbar';

// The one colour mark reads on both colour modes, so there is no srcDark and
// no second asset to keep in sync. Resolves through staticDir, which every
// Vantage site lists in staticDirectories.
const LOGO_SRC = 'img/vantage-logo-color.svg';

/**
 * The brand link, the centred title and the version badge.
 *
 * Replaces theme-classic's Logo outright instead of wrapping it, because the
 * href is not the site's to choose: the theme bakes it per variant (the docs
 * root for the public navbar, the developer overview for the developer one).
 * A plain anchor rather than @docusaurus/Link because the jump crosses SPA
 * boundaries and should be a full navigation. Same tab: command-click covers
 * "open in a new tab".
 *
 * The markup mirrors theme-classic's (navbar__brand > navbar__logo > img,
 * plus b.navbar__title) so Infima's and this theme's CSS keep applying. On
 * desktop the in-brand title is hidden by CSS and re-rendered centred below,
 * which is what lets the version badge sit beside it.
 */
export default function NavbarLogo() {
  const {logoHref, title, version} = useVantageNavbar();
  const src = useBaseUrl(LOGO_SRC);

  return (
    <>
      <a className="navbar__brand" href={logoHref}>
        <div className="navbar__logo">
          <img src={src} alt="Vantage Compute Logo" />
        </div>
        {title && <b className="navbar__title text--truncate">{title}</b>}
      </a>
      {(title || version) && (
        <div className="navbar__center-title">
          {title && <span className="navbar__center-title-text">{title}</span>}
          {version && <span className="navbar__version-badge">{version}</span>}
        </div>
      )}
    </>
  );
}
