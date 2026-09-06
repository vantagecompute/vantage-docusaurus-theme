import path from 'node:path';
import { execSync } from 'node:child_process';
import type { Plugin } from '@docusaurus/types';

export default function themeVantage(): Plugin {
  return {
    name: '@vantagecompute/docusaurus-theme',

    getThemePath() {
      return path.resolve(__dirname, '../src/theme');
    },

    getPathsToWatch() {
      return [path.resolve(__dirname, '../src/theme/**/*.{js,jsx,ts,tsx,css}')];
    },

    getClientModules() {
      return [path.resolve(__dirname, '../src/css/custom.css')];
    },
  };
}

/**
 * Returns the absolute path to this package's static directory.
 * Add this to your `staticDirectories` in docusaurus.config.js:
 *
 * ```js
 * const { staticDir } = require('@vantagecompute/docusaurus-theme');
 * module.exports = {
 *   staticDirectories: ['static', staticDir],
 * };
 * ```
 */
export const staticDir = path.resolve(__dirname, '../static');

/**
 * Infer the project version from git tags via `git describe --tags --always`.
 * Returns a string like "v0.3.1" (on a tag) or "v0.3.1-3-gabcdef" (between tags).
 * Falls back to "dev" if git is unavailable or no tags exist.
 */
export function getProjectVersion(): string {
  try {
    const version = execSync('git describe --tags --always', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return version;
  } catch {
    return 'dev';
  }
}

// Re-export the rehype utility (plain JS, lives in src/utils/)
export const rehypeTabsTransform = require(path.resolve(__dirname, '../src/utils/rehypeTabsTransform'));

/**
 * Shape of a Docusaurus navbar or footer logo entry.
 */
export interface ThemeLogo {
  alt: string;
  src: string;
  srcDark?: string;
  href: string;
  target?: string;
  width?: number;
  height?: number;
}

/**
 * The Vantage colour brand mark, as a path relative to a served static
 * directory. It resolves once `staticDir` is in `staticDirectories`; no site
 * needs its own copy of the SVG.
 */
const VANTAGE_LOGO_SRC = 'img/vantage-logo-color.svg';

/**
 * Navbar logo for a Vantage documentation site.
 *
 * ```js
 * const { navbarLogo } = require('@vantagecompute/docusaurus-theme');
 * themeConfig: { navbar: { title: 'v8x', logo: navbarLogo, items: [...] } }
 * ```
 *
 * Deliberately has no `srcDark`. The single colour mark is drawn to read on
 * both colour modes, and a second asset would only be a second thing to keep
 * in sync.
 *
 * `href` points at the docs hub rather than the marketing site: from a spoke's
 * documentation the useful "home" is the rest of the documentation. `target`
 * is `_self` so that jump replaces the tab instead of opening a new one.
 *
 * Override by spreading, never by mutating -- the object is shared by every
 * site in the process:
 *
 * ```js
 * logo: { ...navbarLogo, href: 'https://docs.vantagecompute.ai/developer/' }
 * ```
 *
 * Omit `logo` entirely to render no navbar logo.
 */
export const navbarLogo: ThemeLogo = {
  alt: 'Vantage Compute Logo',
  src: VANTAGE_LOGO_SRC,
  href: 'https://docs.vantagecompute.ai',
  target: '_self',
};

/**
 * Footer logo for a Vantage documentation site.
 *
 * ```js
 * const { footerLogo } = require('@vantagecompute/docusaurus-theme');
 * themeConfig: { footer: { style: 'dark', logo: footerLogo, links: [...] } }
 * ```
 *
 * Same mark as {@link navbarLogo}, but `href` points at the marketing site:
 * the footer is where a reader who has finished reading looks for the company.
 *
 * Override by spreading; omit `logo` to render no footer logo.
 */
export const footerLogo: ThemeLogo = {
  alt: 'Vantage Compute Logo',
  src: VANTAGE_LOGO_SRC,
  href: 'https://vantagecompute.ai',
};
