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
  getProjectVersion,
} = require('@vantagecompute/docusaurus-theme');

const projectVersion = getProjectVersion();

const config = {
  title: 'my-project',

  // The project version belongs here, not in the navbar title: a title that
  // grows and shrinks reflows the header on every release.
  tagline: `What this project does (${projectVersion})`,

  // Add the Vantage theme. Its one option is the external buttons on the
  // developer navbar: at most two, each a label and an absolute url.
  themes: [
    ['@vantagecompute/docusaurus-theme', {
      navbarLinks: [
        {label: 'GitHub', url: 'https://github.com/vantagecompute/my-project'},
        {label: 'PyPI', url: 'https://pypi.org/project/my-project/'},
      ],
    }],
  ],

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
    // No navbar and no footer here: the theme renders both. A site under
    // /developer/ gets the developer navbar, anything else the public one.
    prism: {/* ... */},
  },
};
```

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
  the theme's navbar. It has no dark variant on purpose: the one colour mark
  is drawn to read in both colour modes.
- **Legacy logo**: `vantage-logo.svg`, the older monochrome mark. Kept for the
  `vantage-docs` hub, which still points at it. New sites should use the
  brand mark above.
- **Favicon**: `favicon.ico`

### Theme Component Overrides
| Component | What it changes |
|---|---|
| `Navbar/Content` | The whole navbar, in a public or a developer variant chosen from `baseUrl` (0.5.0) |
| `Navbar/Logo` | The brand link with the variant's baked href, the centred title and the version badge |
| `Navbar/MobileSidebar/PrimaryMenu` | The developer navbar's external buttons, in the mobile drawer (0.5.0) |
| `Navbar/SiteActions` | An empty slot in the public navbar for a site's own controls (0.5.0) |
| `Navbar/MobileSidebar/SecondaryMenu` | A clean secondary-menu render |
| `Footer` | Renders nothing (0.5.0) |
| `ColorModeToggle` | Sun and moon SVG icons in place of the default toggle |
| `DocBreadcrumbs` | Full-path breadcrumbs instead of the truncated default |
| `Tabs` | A workaround for a Docusaurus 3.10 crash |
| `MDXComponents` | Every markdown `table` renders inside a horizontal scroll region (0.4.9) |

### Utilities
| Export | Description |
|---|---|
| `staticDir` | Absolute path to this package's `static/` directory; add it to `staticDirectories` |
| `rehypeTabsTransform` | Rehype plugin that transforms lowercase `<tabs>`/`<tabitem>` to React components |
| `getProjectVersion()` | Project version inferred from git tags (`git describe --tags --always`), or `"dev"` |
| `resolveNavbarVariant(baseUrl)` | The rule that picks the public or developer navbar; exported for tooling |

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

### Navbar buttons

```js
themes: [
  ['@vantagecompute/docusaurus-theme', {
    navbarLinks: [
      {label: 'GitHub', url: 'https://github.com/vantagecompute/my-project'},
      {label: 'PyPI', url: 'https://pypi.org/project/my-project/'},
    ],
  }],
],
```

That is the whole navbar surface a site has. See the docs site's Customization
page for the public navbar's `SiteActions` slot.

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
