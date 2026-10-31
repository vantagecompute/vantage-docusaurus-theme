---
title: Installation
sidebar_position: 2
---

# Installation

```bash
yarn add @vantagecompute/docusaurus-theme
```

Or with yarn:

```bash
yarn add @vantagecompute/docusaurus-theme
```

## Requirements

| | |
|---|---|
| Node | `>=24.0` |
| Docusaurus | `^3.0.0` |
| React | `^18.0.0` or `^19.0.0` |

Docusaurus and React are peer dependencies: the theme uses whichever copy your
site already installed rather than pulling in a second one. `@docusaurus/core`,
`@docusaurus/plugin-content-docs`, `@docusaurus/theme-common`, `react` and
`react-dom` all have to be present in your site.

The package itself depends only on `clsx` and `unist-util-visit`.

## Declare the range

A caret range on the current minor:

```json
{
  "dependencies": {
    "@vantagecompute/docusaurus-theme": "^0.4.7"
  }
}
```

Below 1.0.0 npm reads a caret as "this minor only", so `^0.4.7` means
`>=0.4.7 <0.5.0`. Patch releases within 0.4.x, which is where fixes land,
arrive on their own. A 0.5.0 does not, so a release that changes the design
deliberately stays a deliberate adoption in each site.

:::caution `yarn install --immutable` will not move this on its own
`yarn install --immutable` installs exactly what the lockfile says, by design,
so a site whose CI uses it stays on whatever version the lockfile was last
regenerated against however wide the range is. That is what you want for a
site that gets published: its build should use only versions a reviewed commit
pinned.

Take new theme releases as lockfile changes instead. Locally:

```bash
yarn up @vantagecompute/docusaurus-theme   # rewrites yarn.lock
```

or let Dependabot open them, with an `npm` entry for the site's directory in
`.github/dependabot.yml`. Do not refresh the theme inside a deploy workflow:
that builds the published site from a version no commit reviewed.
:::

## What lands in `node_modules`

The published tarball ships three directories:

| Directory | Contents |
|---|---|
| `lib/` | The compiled plugin entry point (`index.cjs`) and its type declarations |
| `src/` | Theme components, `css/custom.css`, and the rehype utility, shipped as source |
| `static/` | Fonts, icons, the brand mark, the favicon |

Theme components and CSS ship as source on purpose. Docusaurus resolves and
compiles them itself at build time, using your site's own toolchain, so there
is no second Babel or webpack configuration to keep aligned with yours.
