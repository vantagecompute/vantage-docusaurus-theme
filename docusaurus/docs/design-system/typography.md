---
title: Typography
---

# Typography

Three families, each with one job.

| Role | Family | Source |
|---|---|---|
| Headings and body | Satoshi | `.woff` files shipped in the package's `static/fonts/` |
| Body fallback | Open Sans | Google Fonts, via `@import` in the theme CSS |
| Code | JetBrains Mono | Google Fonts, via the same `@import` |

```css
--ifm-font-family-base: 'Satoshi', 'Open Sans', -apple-system, BlinkMacSystemFont,
                        'Segoe UI', sans-serif;
--ifm-font-family-monospace: 'JetBrains Mono', ui-monospace, SFMono-Regular,
                             Menlo, Monaco, Consolas, monospace;
--ifm-heading-font-family: var(--ifm-font-family-base);
```

## Satoshi ships with the package

Six faces are shipped as `.woff`, all declared with `font-display: swap`:

| Weight | Upright | Italic |
|---|---|---|
| 400 Regular | `Satoshi-Regular.woff` | `Satoshi-Italic.woff` |
| 500 Medium | `Satoshi-Medium.woff` | `Satoshi-MediumItalic.woff` |
| 700 Bold | `Satoshi-Bold.woff` | `Satoshi-BoldItalic.woff` |

The `@font-face` rules reference them at `/fonts/Satoshi-*.woff`, which resolves
only because `staticDir` is in your `staticDirectories`. Omit it and the site
falls back to Open Sans with no error anywhere: text renders, in the wrong
face. If a site "looks slightly off" after adopting the theme, check
`staticDirectories` first.

Satoshi is self-hosted rather than fetched from a CDN because it is the brand
face, and because it removes a third-party request from the critical path.
Open Sans and JetBrains Mono come from Google Fonts, so a site behind a strict
outbound policy falls back on those two and keeps its headings.

## Inline code and `kbd`

Inline code is set in JetBrains Mono on an `--ink-50` background with an
`--ink-100` border, and `kbd` shares the treatment with a heavier border so a
key reads as a key rather than as a code span.

## Table of contents depth

The right-hand table of contents is styled for two levels. Sites should match
that in `themeConfig`:

```js
tableOfContents: {minHeadingLevel: 2, maxHeadingLevel: 4},
```

Deeper trees render, but the indentation stops distinguishing levels and a long
page turns the rail into a wall.
