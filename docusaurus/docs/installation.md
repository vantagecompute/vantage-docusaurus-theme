---
title: Installation
sidebar_position: 2
---

# Installation

```bash
npm install @vantagecompute/docusaurus-theme
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

## Pin the version

Pin an exact version rather than a range:

```json
{
  "dependencies": {
    "@vantagecompute/docusaurus-theme": "0.4.7"
  }
}
```

The theme changes how every page on the site looks. A caret range means a
design change can land in a build nobody intended to change the design in,
which is a bad way to find out about it. An exact pin makes the adoption a
commit you can point at, and makes "which sites have this fix" a question
`grep` answers.

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
