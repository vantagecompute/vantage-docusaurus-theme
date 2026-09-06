---
title: Overview
sidebar_label: Overview
sidebar_position: 1
---

# @vantagecompute/docusaurus-theme

The shared Docusaurus theme behind every Vantage Compute documentation site. It
carries three things that would otherwise be copied into each repository and
drift apart there:

- **The design system**: the ink and iris palettes, dark and light modes,
  typography, and the component styling that makes a Vantage page look like a
  Vantage page.
- **Brand assets**: the Satoshi font files, the icon set, the brand mark and
  the favicon, served straight out of the package.
- **Theme component overrides**: the swizzles every site needs, including one
  that exists purely to work around an upstream Docusaurus crash.

## Why it exists

Before the package, each documentation site kept its own copy of a
1,900-line `custom.css`, its own `static/fonts/`, and its own set of swizzled
components. Fixing a colour meant fixing it in every repository, and in
practice that meant fixing it in one and letting the rest fall behind.

A single versioned package makes each of those a one-line upgrade, and makes a
regression visible: a site that has not adopted a fix says so in its
`package.json`.

## What a site has to do

Three lines of configuration, covered in [Usage](./usage.md):

```js
themes: ['@vantagecompute/docusaurus-theme'],
staticDirectories: ['static', staticDir],
customFields: {projectVersion},
```

There is no `customCss` entry to add for the design system. The theme injects
it as a client module, so a site's own `customCss` is for that site's own
styles and nothing else.

## Where to go next

| If you want to | Read |
|---|---|
| Add the theme to a new site | [Installation](./installation.md) then [Usage](./usage.md) |
| Move an existing site onto it | [Migration](./migration.md) |
| Know what a colour token is called | [Design tokens](./design-system/tokens.md) |
| Know what a given export does | [Exports](./reference/exports.md) |
| Override something the theme provides | [Customization](./reference/customization.md) |
| Change the theme itself | [Contributing](./contributing.md) |

## This site dogfoods the theme

The site you are reading installs `@vantagecompute/docusaurus-theme` from npm,
exactly as any other consumer does, not through a `file:` link to the
repository it lives in. So it renders the design that is actually published,
and a packaging mistake (a file the build needs that `files` in `package.json`
does not ship) fails this build before it reaches anybody else.

It follows the `^0.4.7` range, so each deploy picks up the newest 0.4.x
release. A new minor is a deliberate bump.
