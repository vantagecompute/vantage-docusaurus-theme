---
title: Components
sidebar_position: 2
---

# Theme component overrides

Adding the package to `themes` puts its `src/theme/` into the Docusaurus theme
resolution stack. These overrides then take effect on every site, with no
per-site swizzling.

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

## `Tabs`: the one that is a bugfix

Docusaurus 3.10.0's `useTabValues` calls `extractChildrenTabValues` on raw
children, which reads `child.type.name` and throws when a whitespace text node
sits between `<Tabs>` and `<TabItem>`. Upstream sanitizes children when
rendering but not when extracting values.

The override sanitizes children up front and passes the cleaned list to both
`useTabsContextValue` and the rendered container.

The practical consequence: authors can format tab markup normally. Without it,
this crashes the build.

```jsx
<Tabs>
  <TabItem value="a">A</TabItem>
</Tabs>
```

Revisit the override when the upstream fix lands; until then, removing it
reintroduces the crash.

## `Navbar/Content`, `Navbar/Logo` and `Navbar/MobileSidebar/PrimaryMenu`: the theme-owned navbar

theme-classic renders `themeConfig.navbar.items`. This theme does not read
them. `Navbar/Content` renders one of two fixed layouts chosen from the site's
`baseUrl` (see [Exports](./exports.md#which-navbar-a-site-gets)), `Navbar/Logo`
renders the brand link with an href the site cannot change, and
`PrimaryMenu` repeats the developer navbar's external buttons in the mobile
drawer. The only input a site has is the `navbarLinks` option.

`Navbar/Logo` reads `siteConfig.title` and `siteConfig.customFields.projectVersion`,
both on the developer variant only; the public navbar shows neither. theme-classic renders the title inside
the brand anchor, so the override hides it there with CSS and re-renders it as
its own absolutely centred element, which is what lets the version badge sit
next to it. A version without a leading `v` gets one added.

The hamburger appears only on pages with a docs sidebar, and only once the
page has hydrated: with no `themeConfig.navbar.items`, theme-common treats the
drawer as empty until the sidebar registers itself, which happens client-side.

:::note `@theme-init`, not `@theme-original`
Wrapping a component from inside a theme package needs `@theme-init/<Component>`.
`@theme-original` would resolve back to the wrapper itself, because the package
is in the stack it is resolving against. React SSR then recurses without bound
and exhausts the heap during static site generation. The navbar overrides above
replace their components outright and so sidestep this; `DocBreadcrumbs` and
`MDXComponents` wrap, and use `@theme-init`.
:::

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

## `MDXComponents`: tables that scroll

The theme frames tables with a border and a radius. Doing that on the table
itself needed `overflow: hidden`, which threw away the horizontal scrolling
Docusaurus gives wide tables, so on a phone a four-column reference table
squeezed into 61px columns. Since 0.4.9 the theme maps the markdown `table`
element to `TableScroll`, a `div.table-scroll` with `role="region"` around the
table. The wrapper carries the frame and scrolls; the table keeps its natural
width, with cells capped at 60ch.

A site that already wraps `table` in its own `MDXComponents` must remove that
entry, or every table renders in two scroll regions. See `MIGRATION.md`,
Part 3.

## Overriding an override

Docusaurus resolves themes in layers, and a site's own `src/theme/` wins over
anything a theme package provides. Recreate the same path to take over:

```
your-docs-site/
  src/
    theme/
      ColorModeToggle/
        index.js        <- wins over the package's ColorModeToggle
```

To wrap rather than replace, import `@theme-init/<Component>` for the same
reason the `Navbar/Logo` override does.

See [Customization](./customization.md) for the fuller picture, including when
an override is the wrong tool and a CSS token is the right one.
