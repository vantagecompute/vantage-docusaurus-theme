---
title: Exports
sidebar_position: 1
---

# Exports

Everything the package exports from `@vantagecompute/docusaurus-theme`.

| Export | Kind | Purpose |
|---|---|---|
| `default` | Plugin factory | The theme itself. Goes in `themes`, not in `plugins`. |
| `staticDir` | `string` | Absolute path to the package's `static/`. Goes in `staticDirectories`. |
| `getProjectVersion()` | `() => string` | The project version from git tags. |
| `navbarLogo` | `ThemeLogo` | Navbar logo config, linking to the docs hub. |
| `footerLogo` | `ThemeLogo` | Footer logo config, linking to the marketing site. |
| `rehypeTabsTransform` | Rehype plugin | Lowercase `<tabs>`/`<tabitem>` support in MDX. |
| `ThemeLogo` | `interface` | The shape of the two logo objects. |

The entry point is CommonJS (`lib/index.cjs`) with type declarations, so both
`require` and `import` work:

```js
const {staticDir, navbarLogo} = require('@vantagecompute/docusaurus-theme');
```

```ts
import {staticDir, navbarLogo} from '@vantagecompute/docusaurus-theme';
```

## `default` (the theme)

```js
themes: ['@vantagecompute/docusaurus-theme'],
```

The factory returns a Docusaurus plugin that does three things:

- `getThemePath()` puts `src/theme/` into the theme resolution stack, which is
  what makes the [component overrides](./components.md) take effect.
- `getClientModules()` returns `src/css/custom.css`, which is how the design
  system loads. There is nothing to add to `customCss`.
- `getPathsToWatch()` covers `src/theme/**/*.{js,jsx,ts,tsx,css}`, so a linked
  working tree hot-reloads during development.

It takes no options. Everything configurable is configured through CSS tokens
and through your own `src/theme/` overrides.

## `staticDir`

```js
const {staticDir} = require('@vantagecompute/docusaurus-theme');

staticDirectories: ['static', staticDir],
```

The absolute path to the package's `static/` directory. Listing it means the
Satoshi fonts, the icon set, the brand mark and the favicon resolve without
your repository holding a copy. See [Assets](./assets.md) for what is in there.

Omitting it is the quiet failure mode described in
[Typography](../design-system/typography.md): the CSS still loads, the fonts do
not.

## `getProjectVersion()`

```js
const projectVersion = getProjectVersion();
```

Runs `git describe --tags --always` and returns the trimmed output: `v0.4.7` on
a tag, `v0.4.7-2-gb4f14ee` between tags. Returns `'dev'` if git is unavailable
or the repository has no tags, so it never throws and never fails a build.

Two things to keep in mind:

- **The string already has its leading `v`.** Prefixing another produces
  `vv0.4.7`.
- **It needs tag history.** `actions/checkout` fetches one commit and no tags
  by default, which yields a bare hash. Set `fetch-depth: 0` or
  `fetch-tags: true`.

Pass the result through `customFields.projectVersion` for the navbar badge, and
into the tagline if you want it on the page. Do not put it in `navbar.title`.

## `navbarLogo` and `footerLogo`

```js
navbar: {title: 'my-project', logo: navbarLogo, items: [...]},
footer: {style: 'dark', logo: footerLogo, links: [...]},
```

Both carry the same brand mark, `img/vantage-logo-color.svg`, resolved out of
`staticDir`. They differ only in where they point:

| | `href` | `target` |
|---|---|---|
| `navbarLogo` | `https://docs.vantagecompute.ai` | `_self` |
| `footerLogo` | `https://vantagecompute.ai` | default |

The navbar mark points at the docs hub because from inside a project's
documentation the useful "home" is the rest of the documentation, and `_self`
so that jump replaces the tab. The footer mark points at the company, which is
what a reader who has finished reading is looking for.

Neither has a `srcDark`, on purpose: the one colour mark is drawn to read in
both colour modes, and a second asset would only be a second thing to keep in
sync.

**Override by spreading, never by mutating.** These are module-level objects
shared by everything that imports them in the process:

```js
// Right
logo: {...navbarLogo, href: 'https://docs.vantagecompute.ai/developer/'},

// Wrong: changes the logo for every importer
navbarLogo.href = '...';
```

Omit `logo` entirely to render no logo.

### `ThemeLogo`

```ts
interface ThemeLogo {
  alt: string;
  src: string;
  srcDark?: string;
  href: string;
  target?: string;
  width?: number;
  height?: number;
}
```

## `rehypeTabsTransform`

```js
presets: [
  ['classic', {
    docs: {rehypePlugins: [rehypeTabsTransform]},
  }],
],
```

A rehype plugin that rewrites lowercase `<tabs>` and `<tabitem>` elements into
the `Tabs` and `TabItem` React components. MDX treats a lowercase tag name as a
plain HTML element, so without this the markup renders as unknown elements
rather than as tabs.

It is opt-in. Add it only if your content uses the lowercase form, typically
content converted out of a generator that lowercases tag names.
