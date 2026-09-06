# @vantagecompute/docusaurus-theme

Shared Docusaurus theme for all Vantage Compute documentation sites. Provides the Vantage design system (CSS tokens, typography, dark/light themes), brand assets (Satoshi fonts, SVG icons, logo), and common theme component overrides.

## Installation

```bash
npm install @vantagecompute/docusaurus-theme
```

## Usage

Add the theme to your `docusaurus.config.js`:

```js
const {
  staticDir,
  rehypeTabsTransform,
  navbarLogo,
  footerLogo,
  getProjectVersion,
} = require('@vantagecompute/docusaurus-theme');

const projectVersion = getProjectVersion();

const config = {
  title: 'my-project',

  // The project version belongs here, not in the navbar title: a title that
  // grows and shrinks reflows the header on every release.
  tagline: `What this project does (${projectVersion})`,

  // Add the Vantage theme
  themes: ['@vantagecompute/docusaurus-theme'],

  // Serve shared static assets (fonts, icons, brand mark)
  staticDirectories: ['static', staticDir],

  presets: [
    ['classic', {
      docs: {
        // Optional: use the shared rehype plugin for lowercase <tabs>/<tabitem> support
        rehypePlugins: [rehypeTabsTransform],
      },
      // Do NOT set customCss - the theme injects it automatically
    }],
  ],

  themeConfig: {
    navbar: {
      title: 'my-project',
      logo: navbarLogo,
      items: [/* ... */],
    },
    footer: {
      style: 'dark',
      logo: footerLogo,
      links: [/* ... */],
    },
  },
};
```

`navbarLogo` and `footerLogo` carry the Vantage brand mark, its alt text, and
the right link target for each position. Your site needs no copy of the SVG:
it is served out of `staticDir`.

## What's included

### Design System CSS
The full Vantage design system (`custom.css`) is automatically loaded as a client module. It provides:
- **Design tokens**: Ink (neutral) and Iris (accent) color palettes with CSS variables
- **Dark/light themes**: Complete dark mode support
- **Typography**: Satoshi + Open Sans body, JetBrains Mono code
- **Component styles**: Navbar, sidebar, TOC, admonitions/callouts, tables, code blocks, breadcrumbs, tabs, guided how-to steps, and more

### Brand Assets (static files)
Served from the package once `staticDir` is in your `staticDirectories`, so no site needs its own copy:
- **Fonts**: Satoshi (Regular, Medium, Bold + italics) as `.woff` files
- **Icons**: Sun/moon toggles, search, external link, GitHub, chevron SVGs
- **Brand mark**: `vantage-logo-color.svg`, the current Vantage mark, used by
  `navbarLogo` and `footerLogo`. It has no dark variant on purpose: the one
  colour mark is drawn to read in both colour modes.
- **Legacy logo**: `vantage-logo.svg`, the older monochrome mark. Kept for the
  `vantage-docs` hub, which still points at it. New sites should use the
  brand mark above.
- **Favicon**: `favicon.ico`

### Theme Component Overrides
| Component | Description |
|---|---|
| `ColorModeToggle` | Custom sun/moon SVG icon toggle |
| `DocBreadcrumbs` | Full-path breadcrumb rendering |
| `Navbar/Logo` | Centered site title with the version badge beside it |
| `Tabs` | Bugfix for Docusaurus 3.10 whitespace crash |
| `Navbar/MobileSidebar/SecondaryMenu` | Clean secondary menu render |

### Utilities
| Export | Description |
|---|---|
| `staticDir` | Absolute path to this package's `static/` directory; add it to `staticDirectories` |
| `rehypeTabsTransform` | Rehype plugin that transforms lowercase `<tabs>`/`<tabitem>` to React components |
| `getProjectVersion()` | Project version inferred from git tags (`git describe --tags --always`), or `"dev"` |
| `navbarLogo` | Navbar logo config: the brand mark, linking to `https://docs.vantagecompute.ai` |
| `footerLogo` | Footer logo config: the same mark, linking to `https://vantagecompute.ai` |

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

### Overriding the logo

`navbarLogo` and `footerLogo` are plain objects. Spread one to change a field,
and leave the rest to the theme:

```js
navbar: {
  logo: { ...navbarLogo, href: 'https://docs.vantagecompute.ai/developer/' },
},
```

Spread rather than mutate: the objects are shared by everything that imports
them. To render no logo at all, just omit `logo`.

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

## Documentation

Full documentation is published as a spoke site on the Vantage docs hub:

**https://docs.vantagecompute.ai/developer/docusaurus-theme/**

It lives in `docusaurus/` in this repository and installs the theme from npm, so
it renders what consumers actually get rather than the working tree. The
declared range is `^0.4.7`, so patch releases reach the site on the next deploy
with no commit.

```bash
just docs-serve         # local preview at /developer/docusaurus-theme/
just docs-build         # build and link-check
just docs-pin 0.5.0     # move the range across a minor
```

## Development

```bash
npm install
npm run build    # Compile TypeScript entry point
```

The package uses TypeScript for the plugin entry point (`src/index.cts` -> `lib/index.cjs`). Theme components, CSS, and static assets are shipped as source and resolved by Docusaurus at build time.

`tsconfig.json` deliberately excludes `src/theme`, `src/css` and `src/utils`: only the entry point is compiled here, and everything else is compiled by each consuming site's own toolchain.

## Releasing

```bash
just release 0.4.8
```

Bumps `package.json`, commits, tags, pushes, and creates the GitHub release. The npm publish runs in CI on `release: published`, with provenance attestation. A patch release needs nothing else; a new minor needs `just docs-pin` for the docs site.

## License

MIT
