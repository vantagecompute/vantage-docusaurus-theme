# @vantagecompute/docusaurus-theme

Shared Docusaurus theme for all Vantage Compute documentation sites. Provides the Vantage design system (CSS tokens, typography, dark/light themes), brand assets (Satoshi fonts, SVG icons, logo), and common theme component overrides.

## Installation

```bash
npm install @vantagecompute/docusaurus-theme
```

## Usage

Add the theme to your `docusaurus.config.js`:

```js
const { staticDir, rehypeTabsTransform } = require('@vantagecompute/docusaurus-theme');

const config = {
  // Add the Vantage theme
  themes: ['@vantagecompute/docusaurus-theme'],

  // Serve shared static assets (fonts, icons, logo)
  staticDirectories: ['static', staticDir],

  presets: [
    ['classic', {
      docs: {
        // Optional: use the shared rehype plugin for lowercase <tabs>/<tabitem> support
        rehypePlugins: [rehypeTabsTransform],
      },
      // Do NOT set customCss — the theme injects it automatically
    }],
  ],
};
```

## What's included

### Design System CSS
The full Vantage design system (`custom.css`) is automatically loaded as a client module. It provides:
- **Design tokens** — Ink (neutral) and Iris (accent) color palettes with CSS variables
- **Dark/light themes** — Complete dark mode support
- **Typography** — Satoshi + Open Sans body, JetBrains Mono code
- **Component styles** — Navbar, sidebar, TOC, admonitions/callouts, tables, code blocks, breadcrumbs, tabs, guided how-to steps, and more

### Brand Assets (static files)
Served automatically via `configureStaticDirs`:
- **Fonts** — Satoshi (Regular, Medium, Bold + italics) as `.woff` files
- **Icons** — Sun/moon toggles, search, external link, GitHub, chevron SVGs
- **Logo** — `vantage-logo.svg`
- **Favicon** — `favicon.ico`

### Theme Component Overrides
| Component | Description |
|---|---|
| `ColorModeToggle` | Custom sun/moon SVG icon toggle |
| `DocBreadcrumbs` | Full-path breadcrumb rendering |
| `Tabs` | Bugfix for Docusaurus 3.10 whitespace crash |
| `MDXComponents` | Global `Tabs`/`TabItem` registration |
| `Navbar/MobileSidebar/SecondaryMenu` | Clean secondary menu render |

### Utilities
| Export | Description |
|---|---|
| `rehypeTabsTransform` | Rehype plugin that transforms lowercase `<tabs>`/`<tabitem>` to React components |

## Customization

### Overriding theme components
Docusaurus uses layered theme resolution. To override any component the shared theme provides, create the same file path in your site's `src/theme/` directory. Your local version takes priority.

```
your-docs-site/
  src/
    theme/
      ColorModeToggle/     ← overrides the package's ColorModeToggle
        index.js
```

### Extending CSS
Add your own CSS in `src/css/custom.css` and reference it in your preset config. Your styles will layer on top of the shared design system:

```js
presets: [
  ['classic', {
    theme: {
      customCss: require.resolve('./src/css/custom.css'),
    },
  }],
],
```

### Overriding CSS variables
Override any design token in your custom CSS:

```css
:root {
  --iris-700: #your-brand-color;
  --ifm-color-primary: #your-brand-color;
}
```

## Development

```bash
npm install
npm run build    # Compile TypeScript entry point
```

The package uses TypeScript for the plugin entry point (`src/index.ts` → `lib/index.js`). Theme components, CSS, and static assets are shipped as source and resolved by Docusaurus at build time.

## License

MIT
