---
title: Usage
sidebar_position: 3
---

# Usage

A complete `docusaurus.config.js` for a Vantage site. Everything the theme
contributes is in the four highlighted places; the rest is ordinary Docusaurus.

```js
const {
  staticDir,
  rehypeTabsTransform,
  navbarLogo,
  footerLogo,
  getProjectVersion,
} = require('@vantagecompute/docusaurus-theme');

const projectVersion = getProjectVersion();

const config = {
  title: 'my-project',

  // 1. The version goes in the tagline, never in `navbar.title`.
  tagline: `What this project does (${projectVersion})`,

  // 2. Add the theme to the theme stack.
  themes: ['@docusaurus/theme-mermaid', '@vantagecompute/docusaurus-theme'],

  // 3. Serve the shared fonts, icons, brand mark and favicon.
  staticDirectories: ['static', staticDir],

  presets: [
    ['classic', {
      docs: {
        sidebarPath: './sidebars.js',
        // Optional: lowercase <tabs>/<tabitem> support in MDX.
        rehypePlugins: [rehypeTabsTransform],
      },
      // Your site's own styles. Do NOT point this at the design system:
      // the theme injects that itself as a client module.
      theme: {customCss: './src/css/custom.css'},
    }],
  ],

  // 4. What the navbar version badge reads.
  customFields: {projectVersion},

  themeConfig: {
    navbar: {
      title: 'my-project',
      logo: navbarLogo,
      items: [/* ... */],
    },
    footer: {
      style: 'dark',
      logo: footerLogo,
      links: [/* ... */],
    },
  },
};

module.exports = config;
```

TypeScript sites use the same exports with `import`:

```ts
import type {Config} from '@docusaurus/types';
import {staticDir, navbarLogo, footerLogo, getProjectVersion}
  from '@vantagecompute/docusaurus-theme';
```

## The four pieces, and why each is there

### `themes`

Adding the package to `themes` is what puts its component overrides into the
theme resolution stack and what loads the design system, via the plugin's
`getClientModules()`. Order matters only against other themes that override the
same components; `@docusaurus/theme-mermaid` overrides none of them, so either
order works.

### `staticDirectories`

`staticDir` is the absolute path to the package's own `static/` directory.
Listing it alongside your site's `static` means every asset the design system
references resolves without your repository carrying a copy: the Satoshi
`@font-face` sources, the toggle and search icons, the brand mark that
`navbarLogo` points at, and `img/favicon.ico`.

Leave it out and the CSS still loads, but the fonts fall back to Open Sans and
the icons render as broken images. That failure is quiet, which is worth
knowing when a site "looks slightly wrong" after an upgrade.

### `customFields.projectVersion`

The theme's `Navbar/Logo` override renders a centered site title with a version
badge beside it, and `customFields.projectVersion` is where it reads that
version. A missing value renders the title alone, with no badge and no error.

`getProjectVersion()` returns `git describe --tags --always`, so the string
**already carries its own leading `v`**: `v0.4.7`, or `v0.4.7-2-gb4f14ee`
between tags. Adding another one renders `my-project vv0.4.7`. The badge
component tolerates a bare `0.4.7` and adds the `v` itself, but it will not
strip a second one.

:::caution CI needs the tags
`git describe` needs tag history. `actions/checkout` fetches a single commit
and no tags by default, so a CI build gets a bare commit hash instead of a
version. Set `fetch-depth: 0` (or `fetch-tags: true`) on the checkout step.
:::

### The version stays out of the navbar title

```js
// Wrong: reflows the header on every commit between tags.
navbar: {title: `my-project ${projectVersion}`}

// Right: the badge is a separate element of fixed position.
navbar: {title: 'my-project'},
customFields: {projectVersion},
```

Between tags the git-describe string grows a `-N-gSHA` suffix, so a title that
contains it changes width on every commit and drags the centered layout with
it.

## Spoke sites under the docs hub

Vantage project documentation is published as a spoke under
`docs.vantagecompute.ai/developer/<name>/`. Three settings are part of that
contract:

```js
url: 'https://docs.vantagecompute.ai',
baseUrl: '/developer/<name>/',
trailingSlash: false,
noIndex: true,
```

`trailingSlash: false` is not a preference. The CloudFront edge rewrites
extensionless URLs to `{path}.html`, which is the layout that setting emits;
with a trailing slash the site 404s on every page but the index.

Authentication is free: the Lambda@Edge Keycloak gateway guards all of
`/developer/*` at any depth, so a spoke needs no login of its own. `noIndex`
because the hub is not public.

Registering a spoke is a one-line change in `vantage-docs`
(`.developer-subsites` plus the `spokes` list in `infra/cdk.json`), which is
also what creates the per-repo deploy role.

:::warning No `custom-authNavbarItem`
Some Vantage sites list a `custom-authNavbarItem` navbar entry. That component
comes from `vdeployer`'s own `src/theme` and OIDC contexts, not from this
theme. Referencing it without that local implementation fails the build with
`No NavbarItem component found for type`.
:::
