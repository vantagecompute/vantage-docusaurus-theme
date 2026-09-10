# Theme-Owned Navbars Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The theme renders the whole navbar itself, in one of two fixed variants (public and developer), and the only navbar knob a site keeps is a list of at most two external link buttons. No site renders a footer.

**Architecture:** The theme's Node entry point validates a `navbarLinks` option, picks the navbar variant from the site's `baseUrl` (anything under `/developer/` is developer, everything else is public), and publishes `{variant, logoHref, navbarLinks}` to the client with `setGlobalData`. Four theme component overrides read that data with `usePluginData` and render the navbar, the mobile menu and the brand link, ignoring `themeConfig.navbar` entirely. A fifth override returns `null` for the footer. The public variant exposes one empty slot component, `Navbar/SiteActions`, that the main docs site swizzles to insert its Ask AI button.

**Tech Stack:** Docusaurus 3.10 theme package (TypeScript entry point compiled by `tsc` to `lib/*.cjs`, plain JSX theme components under `src/theme/`), Node's built-in test runner for the validator, the package's own docs site under `docusaurus/` as the integration check.

**Decision record:** https://claude.ai/code/artifact/5f4a93be-42aa-4c1f-9c53-d731ddbfb53e (decisions D1 to D5). Meeting: Docs Site Consistency & Embeddings, 2026-09-10.

**Confirmed design choices (Bryan, 2026-09-10):**
1. Variant is inferred from `baseUrl`, no explicit option.
2. The theme owns navbar rendering through component overrides plus plugin options; sites stop declaring `themeConfig.navbar`.
3. The public navbar renders search itself and leaves a `Navbar/SiteActions` slot for the Ask AI button, which lives in vantage-docs.

**Assumptions to flag in the PR description:**
- The developer variant shows `siteConfig.title` centred with the version badge. The public variant shows no title; it keeps the lone version badge the main site shows today when `customFields.projectVersion` is set.
- Logo hrefs are absolute (`https://docs.vantagecompute.ai/` and `https://docs.vantagecompute.ai/developer/`), matching the convention the removed `navbarLogo` export used.
- `navbarLogo`, `footerLogo` and `ThemeLogo` are removed, not deprecated. This ships as 0.5.0.
- Between merging this and releasing 0.5.0, the docs site under `docusaurus/` builds against 0.4.9 from npm with a config that declares no navbar. It renders a bare navbar for that window and nothing breaks. `just docs-pin 0.5.0` closes the window.

---

## File structure

**Create**
- `src/options.cts`: option types, `validateVantageThemeOptions`, `resolveNavbarVariant`, `LOGO_HREF`. Pure, no Docusaurus imports, so it is unit-testable.
- `test/options.test.cjs`: `node:test` cases against the compiled `lib/options.cjs`.
- `src/theme/Navbar/useVantageNavbar.js`: one client hook that turns plugin global data plus `siteConfig` into `{variant, logoHref, links, title, version}`, and `toNavbarItems(links)` which maps links to theme-classic `NavbarItem` props.
- `src/theme/Navbar/Content/index.jsx` and `styles.module.css`: the navbar, both variants.
- `src/theme/Navbar/MobileSidebar/PrimaryMenu/index.jsx`: the same external links in the mobile drawer.
- `src/theme/Navbar/SiteActions/index.jsx`: the empty slot the public variant renders.
- `src/theme/Footer/index.js`: returns `null`.

**Modify**
- `src/index.cts`: accept `(context, options)`, publish global data, export `validateOptions`, drop the three logo exports.
- `src/theme/Navbar/Logo/index.jsx`: replace the wrapper with a full brand-link render that uses the baked href.
- `src/css/custom.css`: delete the footer tokens and the `.footer*` block.
- `package.json`: add the `test` script.
- `.github/workflows/ci.yml`: run the tests, and assert `lib/options.cjs` is in the tarball.
- `docusaurus/docusaurus.config.ts`: drop `themeConfig.navbar` and `footer`, pass `navbarLinks`.
- `README.md`, `MIGRATION.md`, `docusaurus/docs/usage.md`, `docusaurus/docs/migration.md`, `docusaurus/docs/reference/{exports,components,customization,assets}.md`: document the option, the new overrides, and the removals.

**Not in this plan** (tracked separately, in vantage-docs): removing the `Ctrl+I` hint from `src/components/VantageAssistant/AssistantLauncher.tsx`, dropping the main site's navbar and logo config, and adding its `src/theme/Navbar/SiteActions/index.tsx` swizzle that renders `AskAIButton`.

---

## Reference: how theme-classic does it today

The override work replaces three theme-classic components. Their v3.10.2 sources, for the engineer's orientation:

- `Navbar/Content` reads `useThemeConfig().navbar.items`, splits them left and right, and renders `NavbarMobileSidebarToggle`, `NavbarLogo`, the items, `NavbarColorModeToggle` (with a CSS-module class that hides it below 997px), and `NavbarSearch > SearchBar` when no item has `type: 'search'`.
- `Navbar/MobileSidebar/PrimaryMenu` renders the same items as `<NavbarItem mobile ... onClick={toggle} />` inside `ul.menu__list`.
- `Logo` renders `<Link className="navbar__brand">` containing `div.navbar__logo > img` and `b.navbar__title`.

The hamburger is hidden when `themeConfig.navbar.items` is empty AND the page has no docs sidebar (`useIsNavbarMobileSidebarDisabled` in theme-common). After this change every site's `items` is empty, so the hamburger, and with it the mobile external links, appear only on pages with a docs sidebar. That is every docs page, and it is accepted.

`@docusaurus/Link` does not add `target="_blank"` for external hrefs on its own, so the theme sets `target` and `rel` on each external item explicitly. `NavbarNavLink` appends the external-link icon whenever `href` is external and `label` is set.

---

### Task 1: Option validator and variant resolver (TDD)

> **Executed note (2026-09-10):** the validator must always return an `id`
> (defaulting to `'default'`). When a plugin exports `validateOptions`,
> Docusaurus trusts the returned object to carry the instance id and names the
> plugin's generated data directory after it; without one the build dies in
> `path.join` with "Received undefined". The tests and the code below were
> amended accordingly after the first docs-site build exposed it.

**Files:**
- Create: `src/options.cts`
- Create: `test/options.test.cjs`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Add the test script**

In `package.json`, change the `scripts` block to:

```json
  "scripts": {
    "build": "tsc",
    "test": "node --test 'test/**/*.test.cjs'",
    "prepublishOnly": "npm run build"
  },
```

- [ ] **Step 2: Write the failing tests**

Create `test/options.test.cjs`:

```js
// Runs against the compiled output, the same code consumers get. Build first:
//   yarn build && yarn test
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  validateVantageThemeOptions,
  resolveNavbarVariant,
  LOGO_HREF,
  MAX_NAVBAR_LINKS,
} = require('../lib/options.cjs');

const github = {label: 'GitHub', url: 'https://github.com/vantagecompute/vantage-mcp'};
const pypi = {label: 'PyPI', url: 'https://pypi.org/project/vantage-mcp/'};
const npm = {label: 'npm', url: 'https://www.npmjs.com/package/vantage-mcp'};

test('no options at all resolves to no links', () => {
  assert.deepEqual(validateVantageThemeOptions(undefined), {navbarLinks: []});
  assert.deepEqual(validateVantageThemeOptions({}), {navbarLinks: []});
});

test('one and two links pass through normalised', () => {
  assert.deepEqual(validateVantageThemeOptions({navbarLinks: [github]}), {
    navbarLinks: [github],
  });
  assert.deepEqual(validateVantageThemeOptions({navbarLinks: [github, pypi]}), {
    navbarLinks: [github, pypi],
  });
});

test('labels are trimmed', () => {
  const out = validateVantageThemeOptions({navbarLinks: [{...github, label: '  GitHub '}]});
  assert.equal(out.navbarLinks[0].label, 'GitHub');
});

test('a third link is rejected', () => {
  assert.equal(MAX_NAVBAR_LINKS, 2);
  assert.throws(
    () => validateVantageThemeOptions({navbarLinks: [github, pypi, npm]}),
    /at most 2/,
  );
});

test('a link with an extra property is rejected', () => {
  assert.throws(
    () => validateVantageThemeOptions({navbarLinks: [{...github, icon: 'github'}]}),
    /"icon"/,
  );
});

test('a link needs a non-empty label', () => {
  assert.throws(
    () => validateVantageThemeOptions({navbarLinks: [{url: github.url}]}),
    /label/,
  );
  assert.throws(
    () => validateVantageThemeOptions({navbarLinks: [{label: '   ', url: github.url}]}),
    /label/,
  );
});

test('a link needs an absolute http(s) url', () => {
  assert.throws(
    () => validateVantageThemeOptions({navbarLinks: [{label: 'Docs', url: '/docs'}]}),
    /url/,
  );
  assert.throws(
    () => validateVantageThemeOptions({navbarLinks: [{label: 'Mail', url: 'mailto:x@y.z'}]}),
    /url/,
  );
});

test('navbarLinks must be an array', () => {
  assert.throws(() => validateVantageThemeOptions({navbarLinks: github}), /array/);
});

test('an unknown top-level option is rejected by name', () => {
  assert.throws(() => validateVantageThemeOptions({logoUrl: '/'}), /"logoUrl"/);
});

test('options must be an object', () => {
  assert.throws(() => validateVantageThemeOptions([github]), /object/);
  assert.throws(() => validateVantageThemeOptions('nope'), /object/);
});

test('the Docusaurus plugin id passes through untouched', () => {
  assert.deepEqual(validateVantageThemeOptions({id: 'default', navbarLinks: [github]}), {
    id: 'default',
    navbarLinks: [github],
  });
});

test('baseUrl under /developer/ is the developer variant', () => {
  assert.equal(resolveNavbarVariant('/developer/'), 'developer');
  assert.equal(resolveNavbarVariant('/developer/vantage-mcp/'), 'developer');
  assert.equal(resolveNavbarVariant('/developer/docusaurus-theme/'), 'developer');
});

test('every other baseUrl is the public variant', () => {
  assert.equal(resolveNavbarVariant('/'), 'public');
  assert.equal(resolveNavbarVariant('/docs/'), 'public');
  assert.equal(resolveNavbarVariant('/developers/'), 'public');
});

test('logo hrefs are baked per variant', () => {
  assert.deepEqual(LOGO_HREF, {
    public: 'https://docs.vantagecompute.ai/',
    developer: 'https://docs.vantagecompute.ai/developer/',
  });
});
```

- [ ] **Step 3: Run the tests to confirm they fail**

```bash
yarn build && yarn test
```

Expected: every test errors with `Cannot find module '../lib/options.cjs'`.

- [ ] **Step 4: Implement `src/options.cts`**

```ts
/**
 * Theme options and the navbar variant rule. Pure functions with no Docusaurus
 * imports, so they are tested directly against the compiled output.
 */

export type NavbarVariant = 'public' | 'developer';

/** One external button in the developer navbar. Nothing else is configurable. */
export interface NavbarLink {
  label: string;
  url: string;
}

/** What a site may pass in `themes: [['@vantagecompute/docusaurus-theme', {...}]]`. */
export interface VantageThemeOptions {
  /** External buttons, at most {@link MAX_NAVBAR_LINKS}. Rendered by the developer navbar only. */
  navbarLinks?: NavbarLink[];
}

/** Options after validation. `id` is Docusaurus's plugin-instance id, kept if it was given. */
export interface ResolvedVantageThemeOptions {
  id?: string;
  navbarLinks: NavbarLink[];
}

/** Two is GitHub plus one registry (PyPI, npm, ...). More than that is a nav, and navs drift. */
export const MAX_NAVBAR_LINKS = 2;

/**
 * Where the brand mark links, per variant. Baked in on purpose: a site cannot
 * point its logo anywhere else, which is what keeps the hub consistent.
 */
export const LOGO_HREF: Record<NavbarVariant, string> = {
  public: 'https://docs.vantagecompute.ai/',
  developer: 'https://docs.vantagecompute.ai/developer/',
};

/**
 * Every site published under /developer/ (the developer overview and every
 * spoke) gets the developer navbar. Everything else gets the public one.
 * Docusaurus normalises baseUrl to a leading and trailing slash before the
 * plugin sees it.
 */
export function resolveNavbarVariant(baseUrl: string): NavbarVariant {
  return baseUrl.startsWith('/developer/') ? 'developer' : 'public';
}

const PREFIX = '[@vantagecompute/docusaurus-theme]';

function fail(message: string): never {
  throw new Error(`${PREFIX} ${message}`);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateLink(value: unknown, index: number): NavbarLink {
  const where = `navbarLinks[${index}]`;
  if (!isPlainObject(value)) {
    fail(`${where} must be an object with "label" and "url".`);
  }

  const extra = Object.keys(value).filter((key) => key !== 'label' && key !== 'url');
  if (extra.length > 0) {
    fail(
      `${where} has unsupported propert${extra.length === 1 ? 'y' : 'ies'} ` +
        `${extra.map((k) => `"${k}"`).join(', ')}. Only "label" and "url" are ` +
        `accepted; the icon, external-link marker and rel attributes come from the theme.`,
    );
  }

  const {label, url} = value;
  if (typeof label !== 'string' || label.trim() === '') {
    fail(`${where}.label must be a non-empty string.`);
  }
  if (typeof url !== 'string' || url.trim() === '') {
    fail(`${where}.url must be a non-empty string.`);
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return fail(`${where}.url must be an absolute http(s) URL, got "${url}".`);
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    fail(`${where}.url must be an absolute http(s) URL, got "${url}".`);
  }

  return {label: label.trim(), url};
}

/**
 * Validate and normalise the theme options. Throws with a message that names
 * the offending key, so a misconfigured spoke fails its build instead of
 * quietly rendering something off-convention.
 */
export function validateVantageThemeOptions(options: unknown): ResolvedVantageThemeOptions {
  if (options === undefined || options === null) {
    return {navbarLinks: []};
  }
  if (!isPlainObject(options)) {
    fail('theme options must be an object.');
  }

  const {navbarLinks, id, ...unknown} = options;
  const unknownKeys = Object.keys(unknown);
  if (unknownKeys.length > 0) {
    fail(
      `unknown option${unknownKeys.length === 1 ? '' : 's'} ` +
        `${unknownKeys.map((k) => `"${k}"`).join(', ')}. The only option is "navbarLinks".`,
    );
  }

  const resolved: ResolvedVantageThemeOptions = {navbarLinks: []};
  if (typeof id === 'string') {
    resolved.id = id;
  }

  if (navbarLinks === undefined) {
    return resolved;
  }
  if (!Array.isArray(navbarLinks)) {
    fail('"navbarLinks" must be an array of {label, url} objects.');
  }
  if (navbarLinks.length > MAX_NAVBAR_LINKS) {
    fail(
      `"navbarLinks" allows at most ${MAX_NAVBAR_LINKS} entries, got ${navbarLinks.length}. ` +
        `GitHub plus one package registry is the intended use.`,
    );
  }

  resolved.navbarLinks = navbarLinks.map(validateLink);
  return resolved;
}
```

Note on `id`: Docusaurus can hand a plugin its instance id inside `options` before `validateOptions` runs. The validator lets that one key through so the theme never fails on Docusaurus's own bookkeeping.

- [ ] **Step 5: Run the tests to confirm they pass**

```bash
yarn build && yarn test
```

Expected: `# pass 14` and `# fail 0`. Also confirm `ls lib/` shows `options.cjs` and `options.d.cts`.

- [ ] **Step 6: Commit**

```bash
git add package.json src/options.cts test/options.test.cjs
git commit -m "feat: validate navbarLinks and resolve the navbar variant from baseUrl"
```

---

### Task 2: Entry point publishes global data and drops the logo exports

**Files:**
- Modify: `src/index.cts`

- [ ] **Step 1: Rewrite `src/index.cts`**

Replace the whole file with:

```ts
import path from 'node:path';
import {execSync} from 'node:child_process';
import type {LoadContext, OptionValidationContext, Plugin} from '@docusaurus/types';
import {
  LOGO_HREF,
  resolveNavbarVariant,
  validateVantageThemeOptions,
  type ResolvedVantageThemeOptions,
  type VantageThemeOptions,
} from './options.cjs';

export type {NavbarLink, NavbarVariant, VantageThemeOptions} from './options.cjs';
export {LOGO_HREF, MAX_NAVBAR_LINKS, resolveNavbarVariant} from './options.cjs';

/**
 * Shape of the global data the theme's client components read through
 * `usePluginData('@vantagecompute/docusaurus-theme')`.
 */
export interface VantageThemeGlobalData {
  variant: 'public' | 'developer';
  logoHref: string;
  navbarLinks: ResolvedVantageThemeOptions['navbarLinks'];
}

export default function themeVantage(
  context: LoadContext,
  options: ResolvedVantageThemeOptions,
): Plugin {
  const variant = resolveNavbarVariant(context.baseUrl);
  const globalData: VantageThemeGlobalData = {
    variant,
    logoHref: LOGO_HREF[variant],
    navbarLinks: options.navbarLinks,
  };

  return {
    name: '@vantagecompute/docusaurus-theme',

    getThemePath() {
      return path.resolve(__dirname, '../src/theme');
    },

    getPathsToWatch() {
      return [path.resolve(__dirname, '../src/theme/**/*.{js,jsx,ts,tsx,css}')];
    },

    getClientModules() {
      return [path.resolve(__dirname, '../src/css/custom.css')];
    },

    // The navbar variant and the external buttons reach the client this way.
    // Nothing in themeConfig.navbar is read by the theme's components.
    contentLoaded({actions}) {
      actions.setGlobalData(globalData);
    },
  };
}

/**
 * Docusaurus calls this before the plugin factory. Hand-rolled rather than Joi
 * so the package carries no validation dependency; see src/options.cts.
 */
export function validateOptions({
  options,
}: OptionValidationContext<VantageThemeOptions | undefined, ResolvedVantageThemeOptions>):
  ResolvedVantageThemeOptions {
  return validateVantageThemeOptions(options);
}

/**
 * Returns the absolute path to this package's static directory.
 * Add this to your `staticDirectories` in docusaurus.config.js:
 *
 * ```js
 * const { staticDir } = require('@vantagecompute/docusaurus-theme');
 * module.exports = {
 *   staticDirectories: ['static', staticDir],
 * };
 * ```
 */
export const staticDir = path.resolve(__dirname, '../static');

/**
 * Infer the project version from git tags via `git describe --tags --always`.
 * Returns a string like "v0.3.1" (on a tag) or "v0.3.1-3-gabcdef" (between tags).
 * Falls back to "dev" if git is unavailable or no tags exist.
 */
export function getProjectVersion(): string {
  try {
    const version = execSync('git describe --tags --always', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return version;
  } catch {
    return 'dev';
  }
}

// Re-export the rehype utility (plain JS, lives in src/utils/)
export const rehypeTabsTransform = require(path.resolve(__dirname, '../src/utils/rehypeTabsTransform'));
```

`navbarLogo`, `footerLogo`, `ThemeLogo` and `VANTAGE_LOGO_SRC` are gone. The brand mark path now lives in the `Navbar/Logo` component (Task 4).

- [ ] **Step 2: Build and confirm the exports**

```bash
yarn build && node -e "const t=require('./lib/index.cjs'); console.log(Object.keys(t).sort().join(' '))"
```

Expected output contains `LOGO_HREF MAX_NAVBAR_LINKS default getProjectVersion rehypeTabsTransform resolveNavbarVariant staticDir validateOptions` and does not contain `navbarLogo` or `footerLogo`.

- [ ] **Step 3: Smoke-test the factory**

```bash
node -e "
const t=require('./lib/index.cjs');
const opts=t.validateOptions({options:{navbarLinks:[{label:'GitHub',url:'https://github.com/x/y'}]}});
const p=t.default({baseUrl:'/developer/x/'},opts);
let data; p.contentLoaded({actions:{setGlobalData:(d)=>{data=d}}});
console.log(JSON.stringify(data));
"
```

Expected: `{"variant":"developer","logoHref":"https://docs.vantagecompute.ai/developer/","navbarLinks":[{"label":"GitHub","url":"https://github.com/x/y"}]}`

- [ ] **Step 4: Run the tests again**

```bash
yarn test
```

Expected: `# pass 14`.

- [ ] **Step 5: Commit**

```bash
git add src/index.cts
git commit -m "feat: publish navbar variant and links as theme global data; drop logo exports"
```

---

### Task 3: The client hook

**Files:**
- Create: `src/theme/Navbar/useVantageNavbar.js`

- [ ] **Step 1: Create the hook**

```js
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {usePluginData} from '@docusaurus/useGlobalData';

/**
 * Everything the theme's navbar components need, in one place. The variant,
 * the brand-link href and the external buttons come from the theme's Node
 * side (setGlobalData in lib/index.cjs). The title and version come from the
 * site config. themeConfig.navbar is deliberately never read.
 */
export function useVantageNavbar() {
  const {siteConfig} = useDocusaurusContext();
  const {variant, logoHref, navbarLinks} = usePluginData('@vantagecompute/docusaurus-theme');

  const raw = siteConfig.customFields?.projectVersion;
  const version = raw
    ? String(raw).startsWith('v')
      ? String(raw)
      : `v${raw}`
    : null;

  return {
    variant,
    logoHref,
    links: navbarLinks,
    // The developer navbar names the project beside its version, which is
    // how a reader confirms they are on the version they think they are.
    // The public navbar is logo-only.
    title: variant === 'developer' ? siteConfig.title : null,
    version,
  };
}

/**
 * Map the validated {label, url} links onto theme-classic NavbarItem props.
 * External destinations open in a new tab, the accepted convention for
 * leaving a site. NavbarNavLink appends the external-link icon on its own
 * because href is external and label is set.
 */
export function toNavbarItems(links) {
  return links.map((link) => ({
    label: link.label,
    href: link.url,
    position: 'right',
    target: '_blank',
    rel: 'noopener noreferrer',
    className: 'navbar__external-link',
  }));
}
```

- [ ] **Step 2: Commit**

```bash
git add src/theme/Navbar/useVantageNavbar.js
git commit -m "feat: add the useVantageNavbar client hook"
```

---

### Task 4: Brand link with the baked href

**Files:**
- Modify: `src/theme/Navbar/Logo/index.jsx` (replace entirely)

- [ ] **Step 1: Replace the component**

The current file wraps `@theme-init/Navbar/Logo` and reads `themeConfig.navbar.title`. Replace the whole file with:

```jsx
import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useVantageNavbar} from '../useVantageNavbar';

// The one colour mark reads on both colour modes, so there is no srcDark and
// no second asset to keep in sync. Resolves through staticDir, which every
// Vantage site lists in staticDirectories.
const LOGO_SRC = 'img/vantage-logo-color.svg';

/**
 * The brand link, the centred title and the version badge.
 *
 * Replaces theme-classic's Logo outright instead of wrapping it, because the
 * href is not the site's to choose: the theme bakes it per variant (the docs
 * root for the public navbar, the developer overview for the developer one).
 * A plain anchor rather than @docusaurus/Link because the jump crosses SPA
 * boundaries and should be a full navigation. Same tab: command-click covers
 * "open in a new tab".
 *
 * The markup mirrors theme-classic's (navbar__brand > navbar__logo > img,
 * plus b.navbar__title) so Infima's and this theme's CSS keep applying. On
 * desktop the in-brand title is hidden by CSS and re-rendered centred below,
 * which is what lets the version badge sit beside it.
 */
export default function NavbarLogo() {
  const {logoHref, title, version} = useVantageNavbar();
  const src = useBaseUrl(LOGO_SRC);

  return (
    <>
      <a className="navbar__brand" href={logoHref}>
        <div className="navbar__logo">
          <img src={src} alt="Vantage Compute Logo" />
        </div>
        {title && <b className="navbar__title text--truncate">{title}</b>}
      </a>
      {(title || version) && (
        <div className="navbar__center-title">
          {title && <span className="navbar__center-title-text">{title}</span>}
          {version && <span className="navbar__version-badge">{version}</span>}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/theme/Navbar/Logo/index.jsx
git commit -m "feat: render the brand link with the variant's baked href"
```

---

### Task 5: Navbar content, both variants

**Files:**
- Create: `src/theme/Navbar/Content/index.jsx`
- Create: `src/theme/Navbar/Content/styles.module.css`
- Create: `src/theme/Navbar/SiteActions/index.jsx`

- [ ] **Step 1: Create the slot**

`src/theme/Navbar/SiteActions/index.jsx`:

```jsx
/**
 * A slot in the public navbar, between search and the colour-mode toggle.
 * Empty here. The main docs site overrides it in its own src/theme/ to render
 * its Ask AI button; that component talks to the Vantage AI backend and does
 * not belong in a theme package.
 *
 * The developer navbar does not render this slot.
 */
export default function NavbarSiteActions() {
  return null;
}
```

- [ ] **Step 2: Create the stylesheet**

`src/theme/Navbar/Content/styles.module.css`, the one rule theme-classic's version carries. Keep the local class name `colorModeToggle`: the design system targets it with `[class*="colorModeToggle"]`.

```css
/* The mobile drawer header has its own toggle. */
@media (max-width: 996px) {
  .colorModeToggle {
    display: none;
  }
}
```

- [ ] **Step 3: Create the navbar**

`src/theme/Navbar/Content/index.jsx`:

```jsx
import React from 'react';
import clsx from 'clsx';
import {ErrorCauseBoundary, ThemeClassNames} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import NavbarItem from '@theme/NavbarItem';
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle';
import SearchBar from '@theme/SearchBar';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import NavbarLogo from '@theme/Navbar/Logo';
import NavbarSearch from '@theme/Navbar/Search';
import NavbarSiteActions from '@theme/Navbar/SiteActions';
import {toNavbarItems, useVantageNavbar} from '../useVantageNavbar';

import styles from './styles.module.css';

/**
 * The navbar, replacing theme-classic's Navbar/Content.
 *
 * Two fixed variants, chosen by the theme from the site's baseUrl:
 *
 *   public     logo | search, SiteActions slot, colour-mode toggle
 *   developer  logo + centred title and version | external buttons, toggle
 *
 * themeConfig.navbar.items is never read. A site that still declares items
 * gets no error and no rendering; the convention is the theme's to hold.
 */
function ExternalLinks({items}) {
  return (
    <>
      {items.map((item, i) => (
        <ErrorCauseBoundary
          key={i}
          onError={(error) =>
            new Error(
              `A theme navbar link failed to render: ${JSON.stringify(item)}`,
              {cause: error},
            )
          }>
          <NavbarItem {...item} />
        </ErrorCauseBoundary>
      ))}
    </>
  );
}

function NavbarContentLayout({left, right}) {
  return (
    <div className="navbar__inner">
      <div className={clsx(ThemeClassNames.layout.navbar.containerLeft, 'navbar__items')}>
        {left}
      </div>
      <div
        className={clsx(
          ThemeClassNames.layout.navbar.containerRight,
          'navbar__items navbar__items--right',
        )}>
        {right}
      </div>
    </div>
  );
}

export default function NavbarContent() {
  const mobileSidebar = useNavbarMobileSidebar();
  const {variant, links} = useVantageNavbar();

  const left = (
    <>
      {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
      <NavbarLogo />
    </>
  );

  const right =
    variant === 'developer' ? (
      <>
        <ExternalLinks items={toNavbarItems(links)} />
        <NavbarColorModeToggle className={styles.colorModeToggle} />
      </>
    ) : (
      <>
        <NavbarSearch>
          <SearchBar />
        </NavbarSearch>
        <NavbarSiteActions />
        <NavbarColorModeToggle className={styles.colorModeToggle} />
      </>
    );

  return <NavbarContentLayout left={left} right={right} />;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/theme/Navbar/Content src/theme/Navbar/SiteActions
git commit -m "feat: theme-owned navbar with public and developer variants"
```

---

### Task 6: Mobile drawer carries the same external links

**Files:**
- Create: `src/theme/Navbar/MobileSidebar/PrimaryMenu/index.jsx`

- [ ] **Step 1: Create the component**

```jsx
import React from 'react';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import NavbarItem from '@theme/NavbarItem';
import {toNavbarItems, useVantageNavbar} from '../../useVantageNavbar';

/**
 * The primary panel of the mobile drawer. theme-classic fills it from
 * themeConfig.navbar.items; this theme fills it from the same external
 * buttons the developer navbar shows. The public navbar has nothing to put
 * here (search and the site's actions stay in the bar), so the panel is empty
 * and the drawer opens straight onto the docs sidebar.
 */
export default function NavbarMobilePrimaryMenu() {
  const mobileSidebar = useNavbarMobileSidebar();
  const {variant, links} = useVantageNavbar();

  if (variant !== 'developer' || links.length === 0) {
    return null;
  }

  return (
    <ul className="menu__list">
      {toNavbarItems(links).map((item, i) => (
        <NavbarItem mobile {...item} onClick={() => mobileSidebar.toggle()} key={i} />
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/theme/Navbar/MobileSidebar/PrimaryMenu
git commit -m "feat: mirror the external navbar links in the mobile drawer"
```

---

### Task 7: No footer

**Files:**
- Create: `src/theme/Footer/index.js`
- Modify: `src/css/custom.css` (delete the footer token comment lines, the `Footer defaults` token block, and the `.footer*` rule block)

- [ ] **Step 1: Create the override**

`src/theme/Footer/index.js`:

```js
/**
 * No Vantage documentation site renders a footer. The collapse-sidebar control
 * already frames the bottom of the screen, and the links a footer would carry
 * are the navbar's external buttons. A site that still declares
 * themeConfig.footer builds fine and renders nothing.
 */
export default function Footer() {
  return null;
}
```

- [ ] **Step 2: Delete the footer CSS**

Three edits in `src/css/custom.css`:

1. In the token documentation comment near the top of the navbar section, delete these six lines:

```
 *   --vantage-footer-bg              Footer background colour
 *   --vantage-footer-text            Footer text colour
 *   --vantage-footer-title-color     Footer section-title colour
 *   --vantage-footer-link-hover      Footer link hover colour
 *   --vantage-footer-separator       Footer separator colour
 *   --vantage-footer-logo-max-h      Footer logo max-height
```

2. In the `:root` block that follows, delete the `/* Footer defaults */` comment and the six `--vantage-footer-*` declarations, plus the blank line before the comment.

3. Delete the block that begins with the line `/* ── Footer ────────────────────────────────────────────────────────── */` and ends with the closing brace of `[data-theme='light'] .footer__link-social img { ... }`, plus the blank line after it. The next line kept must be `/* ── DocSearch (Algolia)  -  full theme ──────────────────────────────── */`.

Do not touch any `.DocSearch-Footer` or `--docsearch-footer-*` rule; those style the search modal's footer, not the page footer.

- [ ] **Step 3: Verify the CSS**

```bash
grep -n "vantage-footer\|^\.footer" src/css/custom.css; echo "exit=$?"
```

Expected: no matches, `exit=1`.

```bash
grep -c "DocSearch-Footer" src/css/custom.css
```

Expected: a number greater than 0 (unchanged).

- [ ] **Step 4: Commit**

```bash
git add src/theme/Footer src/css/custom.css
git commit -m "feat: render no footer, and drop the footer styles"
```

---

### Task 8: The docs site adopts the new contract

**Files:**
- Modify: `docusaurus/docusaurus.config.ts`

- [ ] **Step 1: Change the imports**

Replace

```ts
import {
  staticDir,
  navbarLogo,
  footerLogo,
  getProjectVersion,
} from '@vantagecompute/docusaurus-theme';
```

with

```ts
import {staticDir, getProjectVersion} from '@vantagecompute/docusaurus-theme';
```

- [ ] **Step 2: Pass the theme options**

Replace

```ts
  themes: ['@docusaurus/theme-mermaid', '@vantagecompute/docusaurus-theme'],
```

with

```ts
  // This site is a developer spoke (baseUrl under /developer/), so the theme
  // renders its developer navbar: brand mark, centred title and version, and
  // these two buttons. There is no themeConfig.navbar and no footer; both are
  // the theme's, not the site's. See docs/reference/exports.md.
  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@vantagecompute/docusaurus-theme',
      {
        navbarLinks: [
          {label: 'GitHub', url: 'https://github.com/vantagecompute/vantage-docusaurus-theme'},
          {label: 'npm', url: 'https://www.npmjs.com/package/@vantagecompute/docusaurus-theme'},
        ],
      },
    ],
  ],
```

- [ ] **Step 3: Remove the navbar and footer**

In `themeConfig`, delete the entire `navbar: {...}` object and the entire `footer: {...}` object. `themeConfig` keeps `codeBlock`, `prism` and `tableOfContents`. The Docs and API links that were in the navbar are reachable from the sidebar (`sidebars.ts` lists `reference/exports`).

- [ ] **Step 4: Typecheck the site against the working tree**

The site installs the theme from npm by design, so link the working tree only for this check:

```bash
yarn build && npm pack
```

Expected: a file `vantagecompute-docusaurus-theme-0.4.9.tgz` in the repo root (it is gitignored).

```bash
cd docusaurus && npm install --no-save ../vantagecompute-docusaurus-theme-0.4.9.tgz && npm run typecheck
```

Expected: `tsc` exits 0.

- [ ] **Step 5: Build the site and assert the rendered navbar**

```bash
cd docusaurus && npm run build
```

Expected: `[SUCCESS] Generated static files in "build".` with no broken-link errors.

```bash
cd docusaurus/build && \
echo "developer logo href: $(grep -c 'class="navbar__brand" href="https://docs.vantagecompute.ai/developer/"' index.html)" && \
echo "github button:       $(grep -c 'href="https://github.com/vantagecompute/vantage-docusaurus-theme"[^>]*target="_blank"' index.html)" && \
echo "npm button:          $(grep -c 'npmjs.com/package/@vantagecompute/docusaurus-theme"[^>]*target="_blank"' index.html)" && \
echo "rel noopener:        $(grep -c 'rel="noopener noreferrer"' index.html)" && \
echo "centred title:       $(grep -c 'navbar__center-title-text' index.html)" && \
echo "version badge:       $(grep -c 'navbar__version-badge' index.html)" && \
echo "site footer:         $(grep -c 'theme-layout-footer' index.html)"
```

Expected: every count is 1 or more except `site footer`, which must be `0`.
(A bare `<footer` grep also matches theme-classic's per-document
`theme-doc-footer`, the edit-this-page block, which is not the site footer.)

- [ ] **Step 6: Check the public variant renders**

Temporarily edit `docusaurus/docusaurus.config.ts` so `baseUrl: '/'`, rebuild, and assert:

```bash
cd docusaurus && npm run build && cd build && \
echo "public logo href:    $(grep -c 'class="navbar__brand" href="https://docs.vantagecompute.ai/"' index.html)" && \
echo "no centred title:    $(grep -c 'navbar__center-title-text' index.html)" && \
echo "no external buttons: $(grep -c 'navbar__external-link' index.html)"
```

Expected: `public logo href` is 1 or more, the other two are `0`. (Do not grep
for `target="_blank"` here: the edit-this-page link also opens in a new tab.) Then revert the `baseUrl` edit:

```bash
git checkout -- docusaurus/docusaurus.config.ts
```

and re-apply Steps 1 to 3 (or, simpler, edit only the `baseUrl` line back to `'/developer/docusaurus-theme/'` and confirm with `git diff docusaurus/docusaurus.config.ts` that only the intended changes remain).

- [ ] **Step 7: Restore the site's installed dependencies**

```bash
cd docusaurus && npm ci && cd .. && rm -f vantagecompute-docusaurus-theme-*.tgz
```

Expected: `git status` shows no change under `docusaurus/package.json` or `docusaurus/package-lock.json`.

- [ ] **Step 8: Commit**

```bash
git add docusaurus/docusaurus.config.ts
git commit -m "feat(docs): adopt the theme-owned navbar and drop the footer"
```

---

### Task 9: CI runs the tests and checks the tarball

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Run the tests after the build**

In the `package` job, after the `- run: yarn build` step, add:

```yaml
      # The option validator is tested against lib/, the compiled output
      # consumers get, so this has to follow the build.
      - run: yarn test
```

- [ ] **Step 2: Add the new module to the tarball assertion**

In the `Verify the tarball ships its assets` step, add `lib/options.cjs \` to the asset list directly after `lib/index.d.cts \`.

- [ ] **Step 3: Validate the YAML**

```bash
node -e "require('node:fs').readFileSync('.github/workflows/ci.yml','utf8')" && grep -n "yarn test\|lib/options.cjs" .github/workflows/ci.yml
```

Expected: two matching lines.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: run the option tests and assert lib/options.cjs ships"
```

---

### Task 10: Reference docs for the option and the overrides

**Files:**
- Modify: `docusaurus/docs/reference/exports.md`
- Modify: `docusaurus/docs/reference/components.md`
- Modify: `docusaurus/docs/reference/customization.md`
- Modify: `docusaurus/docs/reference/assets.md`

- [ ] **Step 1: `exports.md`**

Replace the exports table with:

```markdown
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
```

Update the two import examples below the table to `const {staticDir, getProjectVersion} = require(...)` and `import {staticDir, getProjectVersion} from ...`.

Replace the `## default (the theme)` section's config snippet and the sentence "It takes no options..." with:

```markdown
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
it. The public navbar shows only the badge, when `customFields.projectVersion`
is set.

Sites declare no `themeConfig.navbar` and no `themeConfig.footer`. A site that
still does builds fine; the theme renders neither.
```

Delete the `## navbarLogo and footerLogo` section and its `### ThemeLogo` subsection entirely.

- [ ] **Step 2: `components.md`**

Replace the overrides table with:

```markdown
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
```

Replace the `## Navbar/Logo: the centered title and version badge` section body (keep the `:::note` about `@theme-init` but reword its first sentence to "Wrapping a component from inside a theme package needs `@theme-init/<Component>`.") with:

```markdown
## `Navbar/Content`, `Navbar/Logo` and `Navbar/MobileSidebar/PrimaryMenu`: the theme-owned navbar

theme-classic renders `themeConfig.navbar.items`. This theme does not read
them. `Navbar/Content` renders one of two fixed layouts chosen from the site's
`baseUrl` (see [Exports](./exports.md#which-navbar-a-site-gets)), `Navbar/Logo`
renders the brand link with an href the site cannot change, and
`PrimaryMenu` repeats the developer navbar's external buttons in the mobile
drawer. The only input a site has is the `navbarLinks` option.

`Navbar/Logo` reads `siteConfig.title` (developer variant only) and
`siteConfig.customFields.projectVersion`. theme-classic renders the title inside
the brand anchor, so the override hides it there with CSS and re-renders it as
its own absolutely centred element, which is what lets the version badge sit
next to it. A version without a leading `v` gets one added.

The hamburger appears only on pages with a docs sidebar: with no
`themeConfig.navbar.items`, theme-common treats the drawer as empty otherwise.

## `Navbar/SiteActions`: the public navbar's slot

Renders `null`. The public navbar places it between search and the colour-mode
toggle. A site overrides it in its own `src/theme/Navbar/SiteActions/index.js`
to add a control of its own; the main docs site puts its Ask AI button there.
The developer navbar does not render the slot.

## `Footer`: nothing

Returns `null`. No Vantage documentation site has a footer: the sidebar's
collapse control already frames the bottom of the screen and the links a
footer would carry are the navbar buttons. Delete `themeConfig.footer` from
your config; leaving it in is harmless.
```

- [ ] **Step 3: `customization.md`**

Replace the `## Overriding the logos` section with:

```markdown
## Adding navbar buttons

The developer navbar takes up to two external buttons through the theme option:

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

That is the whole surface. The brand link, the title, the version badge and the
toggle are the theme's; `themeConfig.navbar` is not read. If a project needs a
third destination, put it in the docs, not the bar.

## Adding a control to the public navbar

The public navbar renders `@theme/Navbar/SiteActions`, which is empty. A site
on the public variant overrides it:

```
your-docs-site/
  src/
    theme/
      Navbar/
        SiteActions/
          index.js
```

```jsx
import AskAIButton from '@site/src/components/AskAIButton';

export default function NavbarSiteActions() {
  return <AskAIButton />;
}
```
```

- [ ] **Step 4: `assets.md`**

Change the row for `img/vantage-logo-color.svg` to: `| `img/vantage-logo-color.svg` | **Current.** What the theme's brand link renders. |`

- [ ] **Step 5: Confirm no stale references remain in the reference docs**

```bash
grep -rn "navbarLogo\|footerLogo\|ThemeLogo" docusaurus/docs/reference; echo "exit=$?"
```

Expected: no matches, `exit=1`.

- [ ] **Step 6: Commit**

```bash
git add docusaurus/docs/reference
git commit -m "docs: document navbarLinks, the navbar variants and the new overrides"
```

---

### Task 11: Usage, README and the migration guide

**Files:**
- Modify: `docusaurus/docs/usage.md`
- Modify: `README.md`
- Modify: `MIGRATION.md`
- Modify: `docusaurus/docs/migration.md`

- [ ] **Step 1: `usage.md`**

In the config example: remove `navbarLogo,` and `footerLogo,` from the `require` destructure; change the `themes` line to the two-entry array from Task 10 Step 1 (labelled `// 2. Add the theme, with its one option.`); delete the `navbar: {...}` and `footer: {...}` objects from `themeConfig` and replace them with the comment `// No navbar and no footer here: the theme renders both. See Exports.`. Change the TypeScript import example to `import {staticDir, getProjectVersion}`. In the `### staticDirectories` paragraph, change "the brand mark that `navbarLogo` points at" to "the brand mark the navbar renders".

- [ ] **Step 2: `README.md`**

Apply the same four changes to the README's usage block (imports, `themes`, remove `navbar` and `footer`, comment). Then:

- Delete the paragraph beginning "`navbarLogo` and `footerLogo` carry the Vantage brand mark".
- In "Brand Assets", change the brand-mark bullet's second sentence to "used by the theme's navbar."
- Replace the "Theme Component Overrides" table with the table from Task 10 Step 2.
- In the "Utilities" table, delete the `navbarLogo` and `footerLogo` rows and add:

```markdown
| `resolveNavbarVariant(baseUrl)` | The rule that picks the public or developer navbar; exported for tooling |
```

- Replace the `### Overriding the logo` subsection with a `### Navbar buttons` subsection containing the `navbarLinks` snippet from Task 10 Step 3 and the sentence "That is the whole navbar surface a site has. See the docs site's Customization page for the public navbar's `SiteActions` slot."

- [ ] **Step 3: `MIGRATION.md`, Part 4**

Add a fourth bullet to the index at the top:

```markdown
- **[Part 4: the theme-owned navbar](#part-4-the-theme-owned-navbar-050)**
  is for a site on 0.4.x that declares its own `themeConfig.navbar` or
  `footer`. Added in 0.5.0.
```

Append at the end of the file:

```markdown
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
```

- [ ] **Step 4: Mirror Part 4 into `docusaurus/docs/migration.md`**

That file is the site copy of `MIGRATION.md` with a frontmatter block and lightly reworded headings (compare Parts 2 and 3 to see the house style: `### Step N: lowercase verb phrase`). Add the same index bullet and the same Part 4, with the step headings in that style.

- [ ] **Step 5: Confirm no stale references remain anywhere**

```bash
grep -rn "navbarLogo\|footerLogo\|ThemeLogo" README.md MIGRATION.md docusaurus/docs src; echo "exit=$?"
```

Expected: matches only inside `MIGRATION.md` and `docusaurus/docs/migration.md` (Parts 2 and 4 describe the old config on purpose). Nothing in `README.md`, `src/` or the other docs.

- [ ] **Step 6: Build the docs site once more against the tarball**

Repeat Task 8 Steps 4, 5 and 7 (pack, install `--no-save`, typecheck, build, assert, then `npm ci`). `onBrokenLinks: 'throw'` makes this the link check for the new anchors (`#which-navbar-a-site-gets`, `#part-4-the-theme-owned-navbar-050`).

Expected: build succeeds, the assertions from Task 8 Step 5 hold, `git status` is clean apart from the intended edits.

- [ ] **Step 7: Commit**

```bash
git add README.md MIGRATION.md docusaurus/docs/usage.md docusaurus/docs/migration.md
git commit -m "docs: usage, README and migration for the theme-owned navbar"
```

---

### Task 12: Release (Bryan runs this after the PR merges)

**Files:** none edited by hand; `just release` bumps `package.json`.

- [ ] **Step 1: Open the PR** from this branch to `main` with the four assumptions from the top of this plan in the description, and a link to the decision record. CI must be green on both jobs.

- [ ] **Step 2: Release 0.5.0** from a clean `main`:

```bash
just release 0.5.0
```

Expected: tag `v0.5.0` pushed, GitHub release created, the publish workflow runs `npm publish --provenance`.

- [ ] **Step 3: Pin the docs site**

```bash
just docs-pin 0.5.0
```

Then commit `docusaurus/package.json` and `docusaurus/package-lock.json` (`chore(docs): track the theme at ^0.5.0`) and push. The deploy workflow rebuilds the spoke with the new navbar.

- [ ] **Step 4: Hand off the vantage-docs work**

Open the follow-up in vantage-docs: upgrade to `^0.5.0`, delete `themeConfig.navbar`, the logo and the `custom-askAI` item type, add `src/theme/Navbar/SiteActions/index.tsx` rendering `AskAIButton`, and remove the `Ctrl+I` `<kbd>` from `AssistantLauncher.tsx` (decisions D5 and item 5 of the record). Spoke owners follow Part 4 of the migration guide.

---

## Self-review

**Spec coverage**
- D1 (logo to developer root inside `/developer/`, same tab): Task 1 `LOGO_HREF` + `resolveNavbarVariant`, Task 4 anchor with no `target`.
- D2 (two navbars, spokes declare none, developer shows name + version): Tasks 2, 3, 5; title fallback to `siteConfig.title` in Task 3.
- D3 (at most two `label`+`url` buttons, templated icon and rel, new tab): Task 1 validator, Task 3 `toNavbarItems`, Tasks 5 and 6 rendering.
- D4 (no footer anywhere): Task 7 override and CSS, Task 8 config, Task 10 docs.
- D5 (Ask AI hint): out of this repo; handed off in Task 12 Step 4.
- Confirmed choices 1 to 3: variant from `baseUrl` (Task 1), overrides plus options (Tasks 2, 5, 6), `SiteActions` slot (Task 5).

**Type consistency**
- `ResolvedVantageThemeOptions.navbarLinks` (Task 1) is what `themeVantage` receives and republishes as `navbarLinks` in global data (Task 2); the hook renames it to `links` (Task 3) and both renderers use `links` (Tasks 5, 6).
- `toNavbarItems` and `useVantageNavbar` are exported by name from `src/theme/Navbar/useVantageNavbar.js` and imported with matching relative paths: `../useVantageNavbar` from `Navbar/Content` and `Navbar/Logo`, `../../useVantageNavbar` from `Navbar/MobileSidebar/PrimaryMenu`.
- `usePluginData('@vantagecompute/docusaurus-theme')` matches the plugin `name` in Task 2.

**Known limits, stated rather than hidden**
- No React component tests exist in this repo; the component work is verified by building the docs site against the packed tarball (Task 8) in both variants.
- The docs site builds against npm in CI, so the PR's CI does not exercise the working-tree components. Task 8 and Task 11 Step 6 are the local gate.
