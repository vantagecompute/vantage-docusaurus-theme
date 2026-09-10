---
title: Exports
sidebar_position: 1
---

# Exports

Everything the package exports from `@vantagecompute/docusaurus-theme`.

| Export | Kind | Purpose |
|---|---|---|
| `default` | Plugin factory | The theme itself. Goes in `themes`, not in `plugins`. Takes the options below. |
| `validateOptions` | Plugin static | Docusaurus calls it; you never do. Rejects anything but `navbarLinks`. |
| `staticDir` | `string` | Absolute path to the package's `static/`. Goes in `staticDirectories`. |
| `getProjectVersion()` | `() => string` | The project version from git tags. |
| `rehypeTabsTransform` | Rehype plugin | Lowercase `<tabs>`/`<tabitem>` support in MDX. |
| `resolveNavbarVariant(baseUrl)` | `(string) => 'public' \| 'developer'` | The rule the theme applies to pick a navbar. Exported for tests and tooling. |
| `LOGO_HREF` | `Record<variant, string>` | Where the brand mark links, per variant. |
| `MAX_NAVBAR_LINKS` | `number` | Two. |
| `VantageThemeOptions`, `NavbarLink`, `NavbarVariant` | types | The option shapes. |

The entry point is CommonJS (`lib/index.cjs`) with type declarations, so both
`require` and `import` work:

```js
const {staticDir, getProjectVersion} = require('@vantagecompute/docusaurus-theme');
```

```ts
import {staticDir, getProjectVersion} from '@vantagecompute/docusaurus-theme';
```

## `default` (the theme)

```js
themes: [
  ['@vantagecompute/docusaurus-theme', {
    navbarLinks: [
      {label: 'GitHub', url: 'https://github.com/vantagecompute/vantage-mcp'},
      {label: 'PyPI', url: 'https://pypi.org/project/vantage-mcp/'},
    ],
  }],
],
```

The factory returns a Docusaurus plugin that does four things:

- `getThemePath()` puts `src/theme/` into the theme resolution stack, which is
  what makes the [component overrides](./components.md) take effect.
- `getClientModules()` returns `src/css/custom.css`, which is how the design
  system loads. There is nothing to add to `customCss`.
- `getPathsToWatch()` covers `src/theme/**/*.{js,jsx,ts,tsx,css}`, so a linked
  working tree hot-reloads during development.
- `contentLoaded()` publishes the navbar variant, the brand-link href and the
  validated `navbarLinks` as plugin global data, which the navbar components
  read. Nothing in `themeConfig.navbar` is read by the theme.

### Options

There is one.

| Option | Type | Default | Meaning |
|---|---|---|---|
| `navbarLinks` | `{label: string, url: string}[]` | `[]` | External buttons on the right of the developer navbar. At most two. |

Each entry is exactly `label` and `url`. The url must be absolute `http(s)`.
The theme adds the external-link icon, `target="_blank"` and
`rel="noopener noreferrer"`; a third entry, an extra property, a relative url
or an unknown option fails the build with a message naming the problem.

The public navbar ignores `navbarLinks`; it has no buttons to add.

### Which navbar a site gets

The theme decides from `baseUrl`, and there is no override:

| `baseUrl` | Variant | Brand link | Right-hand side |
|---|---|---|---|
| starts with `/developer/` | developer | `https://docs.vantagecompute.ai/developer/` | `navbarLinks` buttons, colour-mode toggle |
| anything else | public | `https://docs.vantagecompute.ai/` | search, the `Navbar/SiteActions` slot, colour-mode toggle |

The developer navbar centres `siteConfig.title` with the version badge beside
it. The public navbar shows neither: it is the brand mark, search, the slot and
the toggle, and `customFields.projectVersion` is ignored there.

Sites declare no `themeConfig.navbar` and no `themeConfig.footer`. A site that
still does builds fine; the theme renders neither.

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
