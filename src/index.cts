import path from 'node:path';
import {execSync} from 'node:child_process';
import type {LoadContext, OptionValidationContext, Plugin} from '@docusaurus/types';
import {
  LOGO_HREF,
  resolveNavbarVariant,
  validateVantageThemeOptions,
  type ResolvedVantageThemeOptions,
  type VantageThemeOptions,
} from './options.cjs';

export type {NavbarLink, NavbarVariant, VantageThemeOptions} from './options.cjs';
export {LOGO_HREF, MAX_NAVBAR_LINKS, resolveNavbarVariant} from './options.cjs';

/**
 * Shape of the global data the theme's client components read through
 * `usePluginData('@vantagecompute/docusaurus-theme')`.
 */
export interface VantageThemeGlobalData {
  variant: 'public' | 'developer';
  logoHref: string;
  navbarLinks: ResolvedVantageThemeOptions['navbarLinks'];
}

export default function themeVantage(
  context: LoadContext,
  options: ResolvedVantageThemeOptions,
): Plugin {
  const variant = resolveNavbarVariant(context.baseUrl);
  const globalData: VantageThemeGlobalData = {
    variant,
    logoHref: LOGO_HREF[variant],
    navbarLinks: options.navbarLinks,
  };

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

    // The navbar variant and the external buttons reach the client this way.
    // Nothing in themeConfig.navbar is read by the theme's components.
    contentLoaded({actions}) {
      actions.setGlobalData(globalData);
    },
  };
}

/**
 * Docusaurus calls this before the plugin factory. Hand-rolled rather than Joi
 * so the package carries no validation dependency; see src/options.cts.
 */
export function validateOptions({
  options,
}: OptionValidationContext<VantageThemeOptions | undefined, ResolvedVantageThemeOptions>):
  ResolvedVantageThemeOptions {
  return validateVantageThemeOptions(options);
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
