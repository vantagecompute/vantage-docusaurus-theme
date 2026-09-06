# Migrating to @vantagecompute/docusaurus-theme

Two migrations live here:

- **[Part 1: adopting the theme](#part-1-adopting-the-theme)** walks the
  `vantage-docs` project through its first move onto the shared package. Any
  site not yet on the theme follows the same steps.
- **[Part 2: adopting the shared brand mark](#part-2-adopting-the-shared-brand-mark-050)**
  is for a site already on the theme that still carries its own copy of the
  logo and its own navbar/footer logo config. Added in 0.5.0.

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

## Part 2: adopting the shared brand mark (0.5.0)

For a site already using the theme that has its own
`static/img/vantage-logo-color.svg` and hand-written navbar and footer logo
blocks. After this, the mark and its wiring come from the package.

### Step 1: Upgrade the package

```bash
npm install @vantagecompute/docusaurus-theme@^0.5.0
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
