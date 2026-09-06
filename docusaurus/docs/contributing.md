---
title: Contributing
sidebar_position: 90
---

# Contributing

The repository is small and has two halves that build differently.

```
src/index.cts        TypeScript, compiled to lib/index.cjs by `tsc`
src/theme/**         JSX and CSS, shipped as SOURCE and compiled by consumers
src/css/custom.css   the design system, shipped as source
src/utils/           plain JS, shipped as source
static/              fonts, icons, brand mark, favicon
```

`tsconfig.json` deliberately excludes `src/theme`, `src/css` and `src/utils`.
Only the entry point is compiled here; everything else is resolved and compiled
by each consuming site's own toolchain at build time, so there is no second
Babel or webpack configuration to keep aligned with theirs.

## Local development

```bash
just install     # npm install
just build       # tsc -> lib/
just clean       # rm -rf lib
```

To try a change against a real site before publishing, link the working tree
into it:

```bash
npm link                                   # in this repository
npm link @vantagecompute/docusaurus-theme  # in the consuming site
```

Restart the Docusaurus dev server afterwards. `getPathsToWatch()` covers
`src/theme/**`, so component and CSS edits hot-reload once the link is in
place; a change to `src/index.cts` needs `just build` and a restart.

## Documentation

This site lives in `docusaurus/` and is deployed as a spoke under
`docs.vantagecompute.ai/developer/docusaurus-theme/`.

```bash
just docs-install
just docs-serve    # http://localhost:3000/developer/docusaurus-theme/
just docs-build
```

It installs the theme from npm at a pinned version rather than through a
`file:` link to the repository around it. That is what makes the site an honest
preview: it renders what consumers actually get, and it fails if a release ever
ships a tarball missing something the build needs.

The pin therefore trails the package by up to one release, and moving it is a
separate deliberate commit after the version is on npm:

```bash
just docs-pin 0.4.8
```

## Releasing

```bash
just release 0.4.8
```

That bumps `package.json`, commits, tags, pushes, and creates the GitHub
release. Publishing to npm happens in CI, on the `release: published` event,
with provenance attestation.

Two details worth knowing:

- The publish step uses the **npm** CLI rather than yarn, because yarn 1 cannot
  emit provenance attestations. Installation and the build still run under
  yarn.
- The working tree must be clean; the recipe refuses to run otherwise, so a
  release can never contain something that was never committed.

After the release lands on npm, bump this site's pin and, when the change
matters to them, the pins in the consuming sites.

## What belongs in the theme

The test for a CSS rule or a component override is whether you would copy it
into the next Vantage site you set up. If yes, it belongs here, where every
site gets it at once. If it is true of one site only, it belongs in that site's
own `src/css/custom.css` or `src/theme/`, which take priority over anything
this package provides.
