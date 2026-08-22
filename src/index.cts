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
