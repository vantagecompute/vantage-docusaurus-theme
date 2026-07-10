import path from 'path';
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

    configureStaticDirs(staticDirs) {
      return [...staticDirs, path.resolve(__dirname, '../static')];
    },
  };
}

export { default as rehypeTabsTransform } from './utils/rehypeTabsTransform';
