---
title: Design System
sidebar_label: Overview
---

# Design system

The design system arrives automatically. The plugin's `getClientModules()`
returns the package's `src/css/custom.css`, so adding the theme to `themes` is
the whole installation: there is no stylesheet to import and no `customCss`
entry to add.

That file is roughly 1,950 lines and covers:

| Area | What it sets |
|---|---|
| Fonts | Satoshi `@font-face` declarations, plus Open Sans and JetBrains Mono from Google Fonts |
| [Design tokens](./tokens.md) | The ink and iris scales, status colours, and the Infima variables mapped onto them |
| Dark theme | The full token set redefined under `[data-theme='dark']` |
| [Typography](./typography.md) | Headings, body copy, links, inline code and `kbd` |
| Content blocks | Code blocks, tables, lists, blockquotes, `details`/`summary`, horizontal rules |
| Admonitions | Docusaurus admonitions restyled as Vantage callouts |
| Guided how-to layout | The numbered-step treatment used by walkthrough pages |
| Chrome | Navbar, left sidebar, right table of contents, mobile TOC, breadcrumbs, pagination, footer |
| Search | A full DocSearch theme: the navbar input, the modal, and the dedicated `/search` page |
| Details | Buttons, landing-page cards, selection colour, scrollbars, sidebar section labels |

## Layering your own styles on top

Your site's `customCss` loads after the theme's client module, so a plain
override in your own file wins without `!important`:

```js
presets: [
  ['classic', {
    theme: {customCss: './src/css/custom.css'},
  }],
],
```

```css
/* your site's src/css/custom.css */
:root {
  --iris-700: #7c3aed;
}
```

Prefer overriding a token to overriding a rule. A token propagates through
every rule that reads it, in both colour modes; a rule override reaches one
selector and goes stale the next time the theme restyles that component.

## When a change belongs in the theme instead

If a rule would be right for every Vantage site, it belongs in the theme's own
`src/css/custom.css`, not in one site's override. The test is simple: would you
copy this rule into the next site you set up? If yes, it is a theme change, and
[Contributing](../contributing.md) covers how to ship one.
