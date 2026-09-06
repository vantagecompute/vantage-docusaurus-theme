---
title: Assets
sidebar_position: 3
---

# Brand assets

Everything below is served from the package once `staticDir` is in your
`staticDirectories`. No site needs a copy, and the paths your config references
are the ordinary static paths: `img/vantage-logo-color.svg`, not a package
specifier.

## Fonts

`static/fonts/`, six Satoshi faces as `.woff`:

```
Satoshi-Regular.woff        Satoshi-Italic.woff
Satoshi-Medium.woff         Satoshi-MediumItalic.woff
Satoshi-Bold.woff           Satoshi-BoldItalic.woff
```

The theme's `@font-face` rules point at these. Open Sans and JetBrains Mono
come from Google Fonts instead, so they are not in the package.

## Icons

`static/img/icons/`, used by the theme's own components and styles:

| File | Used by |
|---|---|
| `bx-sun.svg`, `bx-moon.svg` | `ColorModeToggle` |
| `bx-search.svg`, `bx-search-dark.svg` | Navbar search, per colour mode |
| `bx-link-external.svg` | External link markers |
| `bxl-github.svg` | The `github-button` navbar class |
| `bxs-chevron-up.svg` | Back-to-top and collapse affordances |

## Brand mark

| File | Status |
|---|---|
| `img/vantage-logo-color.svg` | **Current.** What `navbarLogo` and `footerLogo` point at. |
| `img/vantage-logo.svg` | Legacy monochrome mark, kept for the `vantage-docs` hub, which still references it. New sites should not use it. |

The colour mark has no dark variant on purpose: it is drawn to read in both
colour modes, and the theme pins the navbar background to a constant dark
regardless of mode, so a second asset would only be a second thing to keep in
sync.

## Favicon

`img/favicon.ico`. Reference it the usual way:

```js
favicon: 'img/favicon.ico',
```

## Other

`static/js/error-suppression.js` ships with the package for sites that load it
deliberately. It is not injected by the theme, so a site that does not
reference it never runs it.

## Adding an asset to the theme

Two things have to agree, or the asset ships to nobody:

1. Put the file under `static/`.
2. Check that `files` in `package.json` still covers it. It currently lists
   `lib`, `static` and `src`, so anything under those three directories is
   included and anything elsewhere is not.

A file the build needs that `files` does not ship is the failure this
documentation site is positioned to catch: it installs the published tarball,
so the missing asset breaks this build before it reaches a consumer.
