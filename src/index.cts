import path from 'node:path';
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

// Re-export the rehype utility (plain JS, lives in src/utils/)
export const rehypeTabsTransform = require(path.resolve(__dirname, '../src/utils/rehypeTabsTransform'));
