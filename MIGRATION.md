# Migrating to @vantagecompute/docusaurus-theme

Four migrations live here:

- **[Part 1: adopting the theme](#part-1-adopting-the-theme)** walks the
  `vantage-docs` project through its first move onto the shared package. Any
  site not yet on the theme follows the same steps.
- **[Part 2: adopting the shared brand mark](#part-2-adopting-the-shared-brand-mark-047)**
  is for a site already on the theme that still carries its own copy of the
  logo and its own navbar/footer logo config. Added in 0.4.7.
- **[Part 3: small screens](#part-3-small-screens-049)** is for a site that
  papered over the theme's phone and tablet defects itself. Added in 0.4.9.
- **[Part 4: the theme-owned navbar](#part-4-the-theme-owned-navbar-050)**
  is for a site on 0.4.x that declares its own `themeConfig.navbar` or
  `footer`. Added in 0.5.0.

## Part 1: adopting the theme

## Step 1: Install the package

```bash
npm install @vantagecompute/docusaurus-theme
```

## Step 2: Update `docusaurus.config.js`

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
+             // customCss only needed for project-specific styles
+             theme: { customCss: require.resolve("./src/css/custom.css") },
          }],
      ],
  };
```

## Step 3: Replace `src/css/custom.css` with project-specific styles only

Replace the 1,858-line `custom.css` with this slim version:

```css
/**
 * Project-specific CSS overrides for vantage-docs.
 * The shared design system is loaded by @vantagecompute/docusaurus-theme.
 */

/* Hide AskAI button at medium breakpoints */
@media (max-width: 1050px) {
  .navbar__items [data-navbar-ask-ai] { display: none !important; }
}

/* Hide duplicate h1 from DocItem/Layout header */
.theme-doc-markdown > article > h1:first-of-type {
  display: none;
}

/* Chat sidebar - push main content when open */
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

## Step 4: Delete shared theme swizzles from `src/theme/`

Remove these files/directories (now provided by the package):

```
src/theme/ColorModeToggle/       ← delete entire directory
src/theme/DocBreadcrumbs/        ← delete entire directory
src/theme/Tabs/                  ← delete entire directory
src/theme/MDXComponents.js       ← delete file
src/theme/Navbar/MobileSidebar/SecondaryMenu/  ← delete directory
```

**Keep** these project-specific files:
```
src/theme/Root.js                         ← wraps with ChatProvider
src/theme/DocItem/Layout/                 ← injects CopyMcpServerButton
src/theme/NavbarItem/ComponentTypes.js    ← wires custom-askAI
src/theme/Navbar/MobileSidebar/Header/    ← has AskAI in mobile sidebar
```

## Step 5: Delete shared static assets

Remove these files (now served from the package):

```
static/fonts/              ← delete entire directory
static/img/icons/          ← delete entire directory
static/img/vantage-logo.svg
static/img/favicon.ico
static/js/error-suppression.js
```

**Keep** project-specific assets:
```
static/img/preview.png
static/img/providers/       ← provider logos specific to vantage-docs
static/api/                 ← API spec files
```

## Step 6: Delete the rehype plugin

```
src/rehypeTabsTransform.js  ← delete (now imported from the package)
```

## Step 7: Verify

```bash
npm run build
npm run serve
```

Check that:
- [x] Fonts load (Satoshi, JetBrains Mono)
- [x] Light/dark mode toggle works with sun/moon icons
- [x] Breadcrumbs show full path
- [x] Tabs don't crash on whitespace
- [x] Admonitions/callouts render with correct colors
- [x] AI chat button still appears in navbar
- [x] Chat side panel still opens

---

## Part 2: adopting the shared brand mark (0.4.7)

For a site already using the theme that has its own
`static/img/vantage-logo-color.svg` and hand-written navbar and footer logo
blocks. After this, the mark and its wiring come from the package.

### Step 1: Upgrade the package

```bash
npm install @vantagecompute/docusaurus-theme@0.4.7
```

### Step 2: Delete your copy of the brand mark

```
static/img/vantage-logo-color.svg   <- delete
```

It is served from the package, provided `staticDir` is already in
`staticDirectories`. If it is not, add it:

```js
staticDirectories: ['static', staticDir],
```

The path your config references does not change: it is still
`img/vantage-logo-color.svg`, now resolved out of the package.

### Step 3: Replace the two logo blocks with the exports

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

Also delete any `srcDark` still sitting on either logo. The colour mark is one
asset for both colour modes; a second one is only a second thing to keep in
sync.

### Step 4: Keep the version out of the navbar title

The version belongs in the tagline, where it does not resize the header on
every release:

```js
const projectVersion = getProjectVersion();

const config = {
  title: 'my-project',
  tagline: `What this project does (${projectVersion})`,
  customFields: {projectVersion},
  // ...
};
```

`customFields.projectVersion` is what the theme's `Navbar/Logo` override reads
to render the version badge beside the centered title. Set it; do not append
the version to `navbar.title`.

### Step 5: If your site has a reason to differ

Spread to change one field, and omit `logo` to render none:

```js
logo: {...navbarLogo, href: 'https://docs.vantagecompute.ai/developer/'},
```

Spread rather than mutate: the exported objects are shared by every importer.

### Step 6: Verify

```bash
npm run build
npm run serve
```

- [ ] The colour mark renders in the navbar and in the footer
- [ ] It reads correctly in both light and dark mode
- [ ] The navbar mark links to `https://docs.vantagecompute.ai` in the same tab
- [ ] The footer mark links to `https://vantagecompute.ai`
- [ ] No `static/img/vantage-logo-color.svg` remains in your repo

## Part 3: small screens (0.4.9)

0.4.9 makes the theme behave on phones and tablets: the search control is a
bare icon below 1200px, the logo is never hidden, markdown tables scroll,
tab strips wrap, the 997 to 1199 band drops the right-hand TOC for the
collapsible one, touch targets are 44px, and every muted label moved from
`--ink-400` to `--ink-500` for contrast. A site that fixed any of this itself
now has two copies of the fix, and one of them is wrong.

### Step 1: Upgrade the package

```bash
npm install @vantagecompute/docusaurus-theme@^0.4.9
```

### Step 2: Delete your own table wrapper

The theme now routes every markdown `table` through a scroll region from its
own `src/theme/MDXComponents`. A site that did the same wraps every table
twice. Delete the site's `src/theme/MDXComponents` (or its `table` entry) and
the component it pointed at.

### Step 3: Delete the overrides the theme now carries

Search `src/css/custom.css` for rules that touch any of these and remove them;
the theme's own version is what you want:

- `.DocSearch-Button` below 1200, and `[class*="navbarSearchContainer"]`
- `.navbar__logo` visibility at small widths
- `.navbar__center-title` when there is no title
- `[data-navbar-ask-ai]` visibility and size
- `.markdown table` display, overflow, border and radius
- `.markdown .tabs` wrapping
- `.pagination-nav` columns below 600
- `--ifm-navbar-sidebar-width`
- `.navbar__toggle`, `.navbar-sidebar__close`, `.menu__link`, `.menu__caret`,
  `.breadcrumbs__link`, `.theme-doc-toc-mobile` sizing below 997
- `--doc-sidebar-width`, `.col--3:has(.theme-doc-toc-desktop)`,
  `.theme-doc-toc-mobile` between 997 and 1199
- `.DocSearch-Modal`, `.DocSearch-Input`, `.DocSearch-Close` below 768
- `h2` and `h3` margins below 600
- `body.chat-open` (removed from the theme; it was dead)

### Step 4: Check your own muted text

If the site sets `color: var(--ink-400)` on anything a reader is meant to
read, change it to `--ink-500`. The token page explains the numbers.

### Step 5: Verify

```bash
npm run build
npm run serve
```

At 375, 768 and 1024 wide:

- [ ] No horizontal scroll on any page
- [ ] The navbar shows the logo, a magnifying glass and (if the site has one) the Ask AI sparkle, all the same size
- [ ] A wide reference table scrolls inside its frame rather than squeezing
- [ ] Every tab in a tab strip is visible
- [ ] At 1024 the article has no right-hand TOC column and shows the "On this page" collapsible instead

## Part 4: the theme-owned navbar (0.5.0)

From 0.5.0 the theme renders the navbar itself and renders no footer. A site's
`themeConfig.navbar` and `themeConfig.footer` are ignored, and the
`navbarLogo`, `footerLogo` and `ThemeLogo` exports are gone. This is the
breaking change behind the minor bump.

### Step 1: Upgrade the package

```bash
npm install @vantagecompute/docusaurus-theme@^0.5.0
```

### Step 2: Move your external buttons to the theme option

```diff
- themes: ['@docusaurus/theme-mermaid', '@vantagecompute/docusaurus-theme'],
+ themes: [
+   '@docusaurus/theme-mermaid',
+   ['@vantagecompute/docusaurus-theme', {
+     navbarLinks: [
+       {label: 'GitHub', url: 'https://github.com/vantagecompute/my-project'},
+       {label: 'PyPI', url: 'https://pypi.org/project/my-project/'},
+     ],
+   }],
+ ],
```

Two at most, `label` and `url` only. Anything else in your old `items` (doc
links, dropdowns, a search item) has no equivalent; the developer navbar does
not carry them, by design.

### Step 3: Delete the navbar and footer blocks

```diff
- const {staticDir, navbarLogo, footerLogo, getProjectVersion} = require('@vantagecompute/docusaurus-theme');
+ const {staticDir, getProjectVersion} = require('@vantagecompute/docusaurus-theme');

  themeConfig: {
-   navbar: {
-     title: 'my-project',
-     logo: navbarLogo,
-     items: [...],
-   },
-   footer: {...},
    prism: {...},
  },
```

The centred title now comes from `siteConfig.title`, so make sure that is the
name you want beside the version badge. The version badge still reads
`customFields.projectVersion`.

### Step 4: Delete any local navbar swizzle

If your `src/theme/` has `Navbar/Content`, `Navbar/Logo`,
`Navbar/MobileSidebar/PrimaryMenu` or `Footer`, delete them; a local copy
silently wins over the theme's.

### Step 5: Verify

```bash
npm run build
```

Then open the site: the brand mark links to `/developer/` (or the docs root
on the main site), your buttons open in a new tab with the external-link icon,
and there is no footer. A misconfigured `navbarLinks` fails the build with a
message naming the entry.
