# Migrating vantage-docs to @vantagecompute/docusaurus-theme

This guide walks through migrating the `vantage-docs` project to use the shared theme package.

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

/* Chat sidebar — push main content when open */
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
