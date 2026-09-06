---
title: Migration
sidebar_position: 4
---

# Migration

Two migrations, depending on where a site starts.

- **[Part 1](#part-1-adopting-the-theme)** is for a site not yet on the
  package: it still carries its own copy of the design system, the fonts and
  the shared swizzles.
- **[Part 2](#part-2-adopting-the-shared-brand-mark)** is for a site already on
  the package that still carries its own copy of the logo and its own
  navbar/footer logo blocks. Added in 0.4.7.

## Part 1: adopting the theme

### Step 1: install

```bash
npm install @vantagecompute/docusaurus-theme
```

### Step 2: update `docusaurus.config.js`

```diff
+ const { staticDir, rehypeTabsTransform } = require("@vantagecompute/docusaurus-theme");

  const config = {
-     themes: ["@docusaurus/theme-mermaid"],
+     themes: ["@docusaurus/theme-mermaid", "@vantagecompute/docusaurus-theme"],

+     // Serve shared static assets (fonts, icons, logo)
+     staticDirectories: ["static", staticDir],

      presets: [
          ["classic", {
              docs: {
-                 rehypePlugins: [require("./src/rehypeTabsTransform.js")],
+                 rehypePlugins: [rehypeTabsTransform],
              },
-             theme: { customCss: require.resolve("./src/css/custom.css") },
+             // customCss is now for project-specific styles only
+             theme: { customCss: require.resolve("./src/css/custom.css") },
          }],
      ],
  };
```

### Step 3: cut `src/css/custom.css` down to project-specific styles

The design system arrives as a client module from the package, so everything in
your local `custom.css` that the theme now provides is dead weight that will
also mask the next theme change. What is left is whatever is true of this site
alone. For `vantage-docs` that took a 1,858-line file down to this:

```css
/**
 * Project-specific CSS overrides.
 * The shared design system is loaded by @vantagecompute/docusaurus-theme.
 */

/* Hide the AskAI button at medium breakpoints */
@media (max-width: 1050px) {
  .navbar__items [data-navbar-ask-ai] { display: none !important; }
}

/* Hide the duplicate h1 from DocItem/Layout header */
.theme-doc-markdown > article > h1:first-of-type {
  display: none;
}

/* Chat sidebar: push main content when open */
.main-wrapper {
  transition: margin-right 0.3s ease-in-out;
}

body.chat-open .main-wrapper {
  margin-right: 400px;
}

@media (max-width: 480px) {
  body.chat-open .main-wrapper {
    margin-right: 0;
  }
}
```

### Step 4: delete the shared swizzles

Now provided by the package, and a local copy silently wins over it:

```
src/theme/ColorModeToggle/                     <- delete
src/theme/DocBreadcrumbs/                      <- delete
src/theme/Tabs/                                <- delete
src/theme/MDXComponents.js                     <- delete
src/theme/Navbar/MobileSidebar/SecondaryMenu/  <- delete
```

Keep anything project-specific. From `vantage-docs`:

```
src/theme/Root.js                         <- wraps with ChatProvider
src/theme/DocItem/Layout/                 <- injects CopyMcpServerButton
src/theme/NavbarItem/ComponentTypes.js    <- wires custom-askAI
src/theme/Navbar/MobileSidebar/Header/    <- AskAI in the mobile sidebar
```

### Step 5: delete the shared static assets

Now served from the package:

```
static/fonts/                  <- delete
static/img/icons/              <- delete
static/img/vantage-logo.svg    <- delete
static/img/favicon.ico         <- delete
static/js/error-suppression.js <- delete
```

Keep the project's own: preview images, provider logos, API specs.

### Step 6: delete the local rehype plugin

```
src/rehypeTabsTransform.js   <- delete, now imported from the package
```

### Step 7: verify

```bash
npm run build
npm run serve
```

- Fonts load (Satoshi, JetBrains Mono)
- The light/dark toggle works, with the sun and moon icons
- Breadcrumbs show the full path
- Tabs do not crash on whitespace
- Admonitions render as Vantage callouts
- Anything project-specific still works

If the page renders but the type looks wrong, `staticDir` is missing from
`staticDirectories`. That failure is silent.

## Part 2: adopting the shared brand mark

For a site already on the theme that has its own
`static/img/vantage-logo-color.svg` and hand-written navbar and footer logo
blocks. Afterwards the mark and its wiring both come from the package.

### Step 1: upgrade

```bash
npm install @vantagecompute/docusaurus-theme@0.4.7
```

### Step 2: delete your copy of the mark

```
static/img/vantage-logo-color.svg   <- delete
```

The path in your config does not change. It is still
`img/vantage-logo-color.svg`, now resolved out of the package, provided
`staticDir` is in `staticDirectories`:

```js
staticDirectories: ['static', staticDir],
```

### Step 3: replace the two logo blocks with the exports

```diff
- import {staticDir, getProjectVersion} from '@vantagecompute/docusaurus-theme';
+ import {
+   staticDir,
+   getProjectVersion,
+   navbarLogo,
+   footerLogo,
+ } from '@vantagecompute/docusaurus-theme';

  themeConfig: {
    navbar: {
      title: 'my-project',
-     logo: {
-       alt: 'Vantage Compute Logo',
-       src: 'img/vantage-logo-color.svg',
-       href: 'https://docs.vantagecompute.ai',
-       target: '_self',
-     },
+     logo: navbarLogo,
      items: [/* ... */],
    },
    footer: {
      style: 'dark',
-     logo: {
-       alt: 'Vantage Compute Logo',
-       src: 'img/vantage-logo-color.svg',
-       href: 'https://vantagecompute.ai',
-     },
+     logo: footerLogo,
      links: [/* ... */],
    },
  },
```

Delete any `srcDark` still sitting on either logo. One colour mark serves both
modes; a second asset is only a second thing to keep in sync.

### Step 4: move the version out of the navbar title

```js
const projectVersion = getProjectVersion();

const config = {
  title: 'my-project',
  tagline: `What this project does (${projectVersion})`,
  customFields: {projectVersion},
};
```

`customFields.projectVersion` is what the theme's `Navbar/Logo` override reads
to render the badge beside the centered title. Set it; do not append the
version to `navbar.title`, which reflows the header on every commit between
tags.

### Step 5: if your site has a reason to differ

```js
logo: {...navbarLogo, href: 'https://docs.vantagecompute.ai/developer/'},
```

Spread rather than mutate: the exported objects are shared by every importer.
Omit `logo` to render none.

### Step 6: verify

```bash
npm run build
npm run serve
```

- The colour mark renders in the navbar and in the footer
- It reads correctly in both colour modes
- The navbar mark links to `https://docs.vantagecompute.ai` in the same tab
- The footer mark links to `https://vantagecompute.ai`
- No `static/img/vantage-logo-color.svg` remains in your repository
