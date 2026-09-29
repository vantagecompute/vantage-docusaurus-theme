import React from 'react';
import {useVantageNavbar} from '../useVantageNavbar';
import VantageLogo from './VantageLogo';

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
 * The markup mirrors theme-classic's (navbar__brand > navbar__logo, plus
 * b.navbar__title) so Infima's and this theme's CSS keep applying. The logo is
 * an inline SVG rather than an <img> so its wordmark can follow the context
 * it sits on; see VantageLogo. On
 * desktop the in-brand title is hidden by CSS and re-rendered centred below,
 * which is what lets the version badge sit beside it.
 */
export default function NavbarLogo() {
  const {logoHref, title, version} = useVantageNavbar();

  return (
    <>
      <a className="navbar__brand" href={logoHref}>
        <div className="navbar__logo">
          <VantageLogo />
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
