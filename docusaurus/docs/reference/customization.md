---
title: Customization
sidebar_position: 4
---

# Customization

Three ways to change what a site looks like, in the order to reach for them.

## 1. Override a design token

The cheapest change, and the one that ages best. Every rule in the design
system reads a token, so redefining one propagates everywhere it is used, in
both colour modes:

```css
/* your site's src/css/custom.css */
:root {
  --iris-700: #7c3aed;
  --ifm-color-primary: #7c3aed;
}

[data-theme='dark'] {
  --iris-700: #a78bfa;
}
```

Your `customCss` loads after the theme's client module, so this wins without
`!important`.

Redefine the dark value too whenever you touch a colour. Dark mode is the same
token names with different values, so a light-only override leaves dark mode on
the old colour, which is the kind of thing that ships unnoticed.

The full list is in [Design tokens](../design-system/tokens.md).

## 2. Add a rule

For something the tokens do not reach, write a rule in your own `customCss`.
Keep it to what is true of this site alone. A rule you would copy into the next
Vantage site is a theme change, not a site change: see
[Contributing](../contributing.md).

## 3. Override a component

Docusaurus resolves themes in layers, and a site's own `src/theme/` takes
priority over anything a theme package provides. Recreate the same path:

```
your-docs-site/
  src/
    theme/
      ColorModeToggle/
        index.js        <- wins over the package's ColorModeToggle
```

To wrap the component below you rather than replace it, import
`@theme-init/<Component>`. From inside your own site `@theme-original` also
works; from inside a theme package it does not, for the reason described in
[Components](./components.md).

Reach for this last. A component override is pinned to the internals of
whatever it wraps, so it is the thing most likely to break on a Docusaurus
upgrade, and the thing most likely to silently keep working while looking
wrong.

## Overriding the logos

`navbarLogo` and `footerLogo` are plain objects. Spread to change a field:

```js
navbar: {
  logo: {...navbarLogo, href: 'https://docs.vantagecompute.ai/developer/'},
},
```

Spread rather than mutate: the exported objects are shared by every importer in
the process. Omit `logo` entirely to render none.

## Keeping the search styling

The theme ships a full DocSearch theme covering the navbar input, the modal and
the dedicated `/search` page. It is styled against the tokens, so a site that
overrides tokens gets a matching search UI for free, and a site that overrides
DocSearch's own selectors takes on the job of maintaining them.
