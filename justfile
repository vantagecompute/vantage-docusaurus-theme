#!/usr/bin/env just --justfile

project_dir := justfile_directory()

export PATH := project_dir + "/node_modules/.bin:" + env_var('PATH')

[private]
default:
    @just help

# Install dependencies
[group("dev")]
install:
    @echo "📦 Installing dependencies..."
    npm install

# Build TypeScript entry point
[group("dev")]
build: install
    @echo "🏗️ Building TypeScript..."
    npm run build

# Clean build artifacts
[group("dev")]
clean:
    @echo "🧹 Cleaning build artifacts..."
    rm -rf lib

# ---------------------------------------------------------------------------
# Documentation site (docusaurus/)
#
# Published as a spoke under docs.vantagecompute.ai/developer/docusaurus-theme/.
# It installs @vantagecompute/docusaurus-theme from npm at a PINNED version
# rather than through a file: link to this working tree. That is deliberate: the
# site then renders what consumers actually get, and a release that ships a
# tarball missing something the build needs fails here first. The cost is that
# the pin trails the package by up to one release -- move it with `docs-pin`
# once the version is on npm.
# ---------------------------------------------------------------------------

# Install the docs site's dependencies
[group("docs")]
docs-install:
    @echo "📦 Installing docs dependencies..."
    cd docusaurus && npm install

# Serve the docs site locally at /developer/docusaurus-theme/
[group("docs")]
docs-serve: docs-install
    cd docusaurus && npm run start

# Build the docs site (also link-checks it: onBrokenLinks is 'throw')
[group("docs")]
docs-build: docs-install
    @echo "🏗️ Building docs site..."
    cd docusaurus && npm run typecheck && npm run build

# Remove the docs site's build output
[group("docs")]
docs-clean:
    rm -rf docusaurus/build docusaurus/.docusaurus

# Point the docs site at a published theme version, and refresh its lockfile
[group("docs")]
docs-pin version:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! npm view "@vantagecompute/docusaurus-theme@{{version}}" version >/dev/null 2>&1; then
        echo "❌ @vantagecompute/docusaurus-theme@{{version}} is not on npm yet."
        echo "   Release it first: just release {{version}}"
        exit 1
    fi
    cd docusaurus
    npm pkg set 'dependencies.@vantagecompute/docusaurus-theme={{version}}'
    npm install
    echo "✅ Docs site pinned to {{version}}. Commit docusaurus/package.json and package-lock.json."

# Bump version, commit, tag, push, and create GitHub release to trigger npm publish
[group("release")]
release version:
    #!/usr/bin/env bash
    set -euo pipefail
    if [[ -n "$(git status --porcelain)" ]]; then
        echo "❌ Working tree is dirty. Commit or stash changes first."
        exit 1
    fi
    echo "📦 Bumping to v{{version}}..."
    yarn version --new-version "{{version}}" --no-git-tag-version
    git add package.json yarn.lock
    git commit -m "release: v{{version}}"
    git tag "v{{version}}"
    git push && git push origin "v{{version}}"
    echo "🚀 Creating GitHub release v{{version}}..."
    gh release create "v{{version}}" --title "v{{version}}" --generate-notes
    echo "✅ Release v{{version}} created. npm publish will run via GitHub Actions."

# Show available commands
[group("dev")]
help:
    @echo "📚 Commands:"
    @echo "  install         - Install dependencies"
    @echo "  build           - Build TypeScript"
    @echo "  clean           - Clean build artifacts"
    @echo "  docs-serve      - Serve the docs site locally"
    @echo "  docs-build      - Build (and link-check) the docs site"
    @echo "  docs-clean      - Clean the docs site build output"
    @echo "  docs-pin x.x.x  - Point the docs site at a published theme version"
    @echo "  release x.x.x   - Bump, tag, push, and publish to npm"
