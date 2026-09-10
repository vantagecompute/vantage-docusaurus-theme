---
title: Components
sidebar_position: 2
---

# Theme component overrides

Adding the package to `themes` puts its `src/theme/` into the Docusaurus theme
resolution stack. These five overrides then take effect on every site, with no
per-site swizzling.

| Component | What it changes |
|---|---|
| `ColorModeToggle` | Sun and moon SVG icons in place of the default toggle |
| `DocBreadcrumbs` | Full-path breadcrumbs instead of the truncated default |
| `Navbar/Logo` | A centered site title with a version badge beside it |
| `Tabs` | A workaround for a Docusaurus 3.10 crash |
| `Navbar/MobileSidebar/SecondaryMenu` | A clean secondary-menu render |
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

## `Navbar/Logo`: the centered title and version badge

Theme-classic renders the site title inside the brand anchor, beside the logo,
so centering the title in place would drag the logo to the middle with it. The
override instead hides the in-brand title with CSS and re-renders it as its own
absolutely centered element, which is what lets the version badge sit next to
it.

It reads `siteConfig.customFields.projectVersion` and
`siteConfig.themeConfig.navbar.title`. A missing version renders the title
alone. A version without a leading `v` gets one added; a version that already
has one is left as it is.

:::note `@theme-init`, not `@theme-original`
The override wraps the component below it with `@theme-init/Navbar/Logo`.
`@theme-original` would resolve back to this same component, because it ships
inside a theme package that is itself in the stack. React SSR then recurses
without bound and exhausts the heap during static site generation. If you
wrap a component from inside a theme package, use `@theme-init`.
:::

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
