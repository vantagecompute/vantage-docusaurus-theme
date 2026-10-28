// Runs against the compiled output, the same code consumers get. Build first:
//   yarn build && yarn test
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');

const {
  vantagePrism,
  vantageLightCodeTheme,
  vantageDarkCodeTheme,
  VANTAGE_PRISM_LANGUAGES,
  LIGHT_CODE_PALETTE,
  DARK_CODE_PALETTE,
} = require('../lib/index.cjs');

const hex = (h) => [0, 2, 4].map((i) => parseInt(h.replace('#', '').slice(i, i + 2), 16));
const luminance = ([r, g, b]) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const over = ([r, g, b, a], bg) => [r, g, b].map((v, i) => v * a + bg[i] * (1 - a));

// The highlighted-line tint each mode lays over the code background, read
// from the stylesheet so this test follows it if the tint ever changes.
const css = fs.readFileSync(path.join(__dirname, '../src/css/custom.css'), 'utf8');
const tints = [...css.matchAll(/--docusaurus-highlighted-code-line-bg:\s*rgba\(([^)]+)\)/g)]
  .map((m) => m[1].split(',').map(Number));

const modes = [
  {name: 'light', theme: vantageLightCodeTheme, palette: LIGHT_CODE_PALETTE, tint: tints[0]},
  {name: 'dark', theme: vantageDarkCodeTheme, palette: DARK_CODE_PALETTE, tint: tints[1]},
];

test('the stylesheet defines a highlighted-line tint for each mode', () => {
  assert.equal(tints.length, 2, 'expected one light and one dark --docusaurus-highlighted-code-line-bg');
});

for (const {name, theme, palette, tint} of modes) {
  const background = hex(palette.background);
  const highlighted = over(tint, background);

  test(`${name}: every colour meets WCAG AA on the code background and on a highlighted line`, () => {
    for (const [role, colour] of Object.entries(palette)) {
      if (role === 'background') continue;
      for (const [where, bg] of [['background', background], ['highlighted line', highlighted]]) {
        const ratio = contrast(hex(colour), bg);
        assert.ok(ratio >= 4.5, `${name} ${role} ${colour} is ${ratio.toFixed(2)}:1 on the ${where}`);
      }
    }
  });

  test(`${name}: the theme only uses palette colours`, () => {
    const allowed = new Set(Object.values(palette));
    assert.equal(theme.plain.backgroundColor, palette.background);
    assert.equal(theme.plain.color, palette.plain);
    for (const {types, style} of theme.styles) {
      if (style.color) assert.ok(allowed.has(style.color), `${types.join(',')} uses ${style.color}, outside the palette`);
    }
  });

  test(`${name}: no token type is mapped twice`, () => {
    const seen = new Map();
    for (const {types, style} of theme.styles) {
      if (!style.color) continue; // weight and style modifiers may stack with a colour
      for (const t of types) {
        assert.ok(!seen.has(t), `${t} is coloured by two rules`);
        seen.set(t, style.color);
      }
    }
  });
}

test('vantagePrism is the drop-in themeConfig.prism value', () => {
  assert.equal(vantagePrism.theme, vantageLightCodeTheme);
  assert.equal(vantagePrism.darkTheme, vantageDarkCodeTheme);
  assert.deepEqual(vantagePrism.additionalLanguages, [...VANTAGE_PRISM_LANGUAGES]);
  // A copy, so a site that pushes onto it cannot change another site's list.
  assert.notEqual(vantagePrism.additionalLanguages, VANTAGE_PRISM_LANGUAGES);
});

// Docusaurus requires prismjs/components/prism-<name> for each entry, so an
// unknown name fails the site build. prismjs is installed with the docs site
// under docusaurus/, not at the package root; skip when it is absent.
let components;
try {
  components = createRequire(path.join(__dirname, '../docusaurus/package.json'))('prismjs/components.json').languages;
} catch {
  components = null;
}

test('every additional language is a Prism component, listed after what it requires', {skip: !components && 'prismjs not installed under docusaurus/'}, () => {
  const loaded = new Set();
  for (const name of VANTAGE_PRISM_LANGUAGES) {
    const entry = components[name];
    assert.ok(entry, `${name} is not a Prism component`);
    for (const dep of [].concat(entry.require || [])) {
      assert.ok(loaded.has(dep) || !VANTAGE_PRISM_LANGUAGES.includes(dep),
        `${name} requires ${dep}, which must come earlier in the list`);
    }
    loaded.add(name);
  }
});
