import type {Config} from '@docusaurus/types';
import {themes as prismThemes} from 'prism-react-renderer';
import {
  staticDir,
  navbarLogo,
  footerLogo,
  getProjectVersion,
} from '@vantagecompute/docusaurus-theme';

// This site is the theme's own documentation, and it dogfoods the theme: the
// dependency in package.json is the PUBLISHED version from npm, not a file:
// link to the repository root. That is deliberate. A file: link would render
// the working tree, so the site would show a design nobody can install yet and
// would never catch a packaging mistake -- a file the build needs that
// `files` in package.json does not ship. Building against the tarball readers
// actually get is the only way this site stays honest.
//
// The consequence to keep in mind: the site trails the theme by up to one
// release. Bumping the pin is a deliberate step after a version is on npm --
// `just docs-pin <version>` -- not something a release does on its own.
//
// From the theme rather than hand-rolled here, so every Vantage site advertises
// its version the same way. It returns `git describe --tags --always`, so the
// string ALREADY carries its own leading `v` ("v0.4.7", or "v0.4.7-2-gb4f14ee"
// between tags). Do not add another one.
const projectVersion = getProjectVersion();

const config: Config = {
  title: 'docusaurus-theme',
  tagline: `The shared Vantage Docusaurus theme: design system, brand assets, and theme overrides (${projectVersion})`,
  favicon: 'img/favicon.ico',

  // A spoke site under the docs hub, not GitHub Pages. Authentication happens
  // at the edge: the Lambda@Edge Keycloak gateway guards all of /developer/*,
  // so this site carries no login of its own. `noIndex` because the hub is not
  // public.
  //
  // `trailingSlash: false` is part of the spoke contract: the edge rewrites
  // extensionless URLs to `{path}.html`, which is the layout this setting
  // emits.
  url: 'https://docs.vantagecompute.ai',
  baseUrl: '/developer/docusaurus-theme/',
  noIndex: true,

  organizationName: 'vantagecompute',
  projectName: 'vantage-docusaurus-theme',
  deploymentBranch: 'main',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  i18n: {defaultLocale: 'en', locales: ['en']},

  markdown: {
    format: 'detect',
    mermaid: true,
    hooks: {onBrokenMarkdownLinks: 'warn'},
  },

  themes: ['@docusaurus/theme-mermaid', '@vantagecompute/docusaurus-theme'],

  // `staticDir` serves the theme's own fonts, icons, brand mark and favicon.
  // This site needs it for the same reason every other Vantage site does, and
  // it is also the assertion under test: if the package stopped shipping
  // static/, this build would be the first thing to notice.
  //
  // No local 'static' alongside it. This site owns no assets of its own, and
  // Docusaurus fails the client bundle outright on a static directory that does
  // not exist -- which an empty one in git is, since git does not track empty
  // directories. Add it back the day this site has an asset to put in it.
  staticDirectories: [staticDir],

  presets: [
    [
      'classic',
      {
        docs: {
          path: './docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/vantagecompute/vantage-docusaurus-theme/tree/main/docusaurus/',
        },
        blog: false,
        // Project-specific styles only. The design system itself arrives as a
        // client module from the theme package -- see src/css/custom.css.
        theme: {customCss: './src/css/custom.css'},
      },
    ],
  ],

  plugins: [
    [
      'docusaurus-plugin-llms',
      {
        generateLLMsTxt: true,
        generateLLMsFullTxt: true,
        docsDir: 'docs',
        title: '@vantagecompute/docusaurus-theme Documentation',
        description:
          'Shared Docusaurus theme for Vantage Compute documentation sites: design tokens, brand assets, and theme component overrides.',
        includeBlog: false,
        excludeImports: true,
        removeDuplicateHeadings: true,
        generateMarkdownFiles: true,
        includeUnmatchedLast: true,
        pathTransformation: {ignorePaths: ['docs']},
      },
    ],
  ],

  // Read by the theme's Navbar/Logo override, which renders the version badge
  // beside the centered title. The version belongs here, never appended to
  // `navbar.title`: a title that grows a git-describe suffix between releases
  // reflows the header on every commit.
  customFields: {projectVersion},

  themeConfig: {
    navbar: {
      title: 'docusaurus-theme',
      logo: navbarLogo,
      items: [
        {type: 'docSidebar', sidebarId: 'docsSidebar', position: 'left', label: 'Docs'},
        {to: '/reference/exports', label: 'API', position: 'left'},
        {
          href: 'https://www.npmjs.com/package/@vantagecompute/docusaurus-theme',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://github.com/vantagecompute/vantage-docusaurus-theme',
          label: 'GitHub',
          position: 'right',
          className: 'github-button',
        },
      ],
    },
    footer: {
      style: 'dark',
      logo: footerLogo,
      links: [
        {
          title: 'Documentation',
          items: [
            {label: 'Overview', to: '/'},
            {label: 'Installation', to: '/installation'},
            {label: 'Usage', to: '/usage'},
            {label: 'Migration', to: '/migration'},
          ],
        },
        {
          title: 'Reference',
          items: [
            {label: 'Exports', to: '/reference/exports'},
            {label: 'Components', to: '/reference/components'},
            {label: 'Assets', to: '/reference/assets'},
            {label: 'Design tokens', to: '/design-system/tokens'},
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/vantagecompute/vantage-docusaurus-theme',
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/@vantagecompute/docusaurus-theme',
            },
            {label: 'Vantage Compute', href: 'https://vantagecompute.ai'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Vantage Compute.`,
    },
    codeBlock: {showCopyButton: true},
    prism: {
      theme: prismThemes.vsLight,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'diff', 'json', 'jsx', 'tsx', 'css', 'yaml'],
    },
    tableOfContents: {minHeadingLevel: 2, maxHeadingLevel: 4},
  },
};

export default config;
