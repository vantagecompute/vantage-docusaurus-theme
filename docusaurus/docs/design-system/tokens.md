---
title: Design tokens
---

# Design tokens

Two scales carry the design: **ink** for neutrals and **iris** for the accent.
Everything else, including the Infima variables Docusaurus itself reads, is
defined in terms of them. Override a token and the change reaches every rule
that reads it, in both colour modes.

## Ink: the neutral scale

A slate-blue neutral rather than a pure grey. Light mode:

| Token | Value | Typical use |
|---|---|---|
| `--ink-900` | `#0b1020` | Headings, code block background |
| `--ink-700` | `#1f2547` | Body text |
| `--ink-500` | `#4a5375` | Secondary text, sidebar and TOC links |
| `--ink-400` | `#6b7494` | Decoration only: list markers, separators, chevrons. Never text (see below) |
| `--ink-300` | `#9aa1bd` | Disabled text, placeholders |
| `--ink-200` | `#c8cce0` | Strong borders |
| `--ink-100` | `#e6e8f2` | Borders, rules, TOC border |
| `--ink-50` | `#f4f5fb` | Inline code background, hover fills |
| `--paper` | `#fbfbfd` | Page background |

`--ink-400` is the one step that is not mirrored: it is `#6b7494` in both
modes, the ramp's fixed point. As text it measures 4.46:1 on the light page,
4.24:1 on a light `--ink-50` surface and 3.68 to 4.10:1 on every dark surface,
all under the 4.5:1 floor for text. Use `--ink-500` for muted text: it is
mirrored (`#4a5375` light, `#9aa1bd` dark) and clears 6.6:1 everywhere. Keep
`--ink-400` for things that are not read: list markers, breadcrumb separators,
chevrons, where the 3:1 non-text floor is what applies and it passes (4.6:1
light, 4.1:1 dark).

## Iris: the accent scale

| Token | Value | Typical use |
|---|---|---|
| `--iris-900` | `#312e81` | Deepest accent |
| `--iris-700` | `#4338ca` | Links, active sidebar item, primary |
| `--iris-600` | `#5046e5` | Link hover |
| `--iris-500` | `#6366f1` | Button fills |
| `--iris-200` | `#c7d2fe` | Light accent borders |
| `--iris-100` | `#e0e2fb` | Accent underlines |
| `--iris-50` | `#eef0fe` | Active menu background |

Three aliases exist for readability at the call site, and are the names to
reach for in site-level CSS:

```css
--vantage-purple:      var(--iris-700);
--vantage-purple-dark: var(--iris-900);
--vantage-button:      var(--iris-500);
```

## Dark mode

Dark mode is not a separate palette. The same token names are redefined under
`[data-theme='dark']`, with the ink scale inverted so that `--ink-900` is the
lightest value rather than the darkest:

| Token | Light | Dark |
|---|---|---|
| `--ink-900` | `#0b1020` | `#f4f5fb` |
| `--ink-700` | `#1f2547` | `#d4d8e9` |
| `--ink-500` | `#4a5375` | `#9aa1bd` |
| `--ink-100` | `#e6e8f2` | `#1f2547` |
| `--ink-50` | `#f4f5fb` | `#161a36` |
| `--iris-700` | `#4338ca` | `#818cf8` |
| `--iris-500` | `#6366f1` | `#818cf8` |
| `--iris-100` | `#e0e2fb` | `rgba(129, 140, 248, 0.15)` |
| `--iris-50` | `#eef0fe` | `rgba(129, 140, 248, 0.10)` |

This inversion is why a rule written as `color: var(--ink-700)` needs no dark
variant, and why a rule written as `color: #1f2547` needs one and will not get
it. Write rules against tokens.

Note the direction of the ink scale in dark mode when picking a token by feel:
`--ink-900` is the *foreground* end of the scale in both modes, not the dark
end.

## Infima variables

Docusaurus's own variables are mapped onto the scales, so restyling a
Docusaurus component usually means overriding a token rather than a selector:

```css
--ifm-color-primary:       var(--iris-700);
--ifm-heading-color:       var(--ink-900);
--ifm-font-color-base:     var(--ink-700);
--ifm-link-color:          var(--iris-700);
--ifm-link-hover-color:    var(--iris-600);
--ifm-code-background:     var(--ink-50);
--ifm-pre-background:      var(--ink-900);
--ifm-menu-color:          var(--ink-500);
--ifm-menu-color-active:   var(--iris-700);
--ifm-toc-border-color:    var(--ink-100);
```

The `--ifm-color-emphasis-*` ramp is mapped onto the ink scale as well, which
is what keeps third-party plugin components in the palette without either side
knowing about the other.
