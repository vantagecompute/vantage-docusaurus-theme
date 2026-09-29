/**
 * Code block syntax colours and languages for every Vantage docs site.
 *
 * Sites used to pick their own Prism themes and language lists, and drifted:
 * two light themes, six language lists, and the hub loaded no extra languages
 * at all, so its bash blocks rendered as plain text. The stock themes also
 * failed WCAG AA (github left 61% of code text below 4.5:1, dracula's comments
 * measured 3.03:1). This module is the one place those choices live now.
 *
 * Every colour below is held to 4.5:1 against its mode's code background and
 * against that background under the highlighted-line tint
 * (--docusaurus-highlighted-code-line-bg in src/css/custom.css). The test in
 * test/prism.test.cjs enforces it, so a colour change that breaks contrast
 * fails the build rather than shipping.
 */

/**
 * The subset of prism-react-renderer's PrismTheme that Docusaurus reads.
 * Declared locally so the package does not take a dependency for a type.
 */
export interface VantageCodeTheme {
  plain: {color: string; backgroundColor: string};
  styles: Array<{
    types: string[];
    style: {color?: string; fontStyle?: 'italic'; fontWeight?: 'bold'; textDecorationLine?: string};
  }>;
}

/** The palette one mode's theme is built from. */
interface Palette {
  plain: string;
  background: string;
  comment: string;
  keyword: string;
  string: string;
  function: string;
  number: string;
  variable: string;
  property: string;
  punctuation: string;
  inserted: string;
  deleted: string;
}

/**
 * The code backgrounds match the theme's ink scale (--ink-50 in light mode,
 * --ink-100 in dark), which is what code blocks have shown until now.
 */
export const LIGHT_CODE_PALETTE: Readonly<Palette> = {
  plain: '#1f2547',
  background: '#f4f5fb',
  comment: '#545c78',
  keyword: '#4338ca',
  string: '#0f6b63',
  function: '#6d28d9',
  number: '#9a4208',
  variable: '#b3165a',
  property: '#0b5a82',
  punctuation: '#454e70',
  inserted: '#166534',
  deleted: '#b01c1c',
};

export const DARK_CODE_PALETTE: Readonly<Palette> = {
  plain: '#e4e7f2',
  background: '#1f2547',
  comment: '#a3aacb',
  keyword: '#b4c0fd',
  string: '#5eead4',
  function: '#dcbcfe',
  number: '#fcd34d',
  variable: '#f9b2d9',
  property: '#8bd8fc',
  punctuation: '#c1c7de',
  inserted: '#86efac',
  deleted: '#fcaaaa',
};

/**
 * Token types grouped by role. Anything not listed falls back to the plain
 * colour, which passes contrast in both modes, so an unmapped type can look
 * plain but never unreadable.
 */
function buildTheme(p: Palette): VantageCodeTheme {
  return {
    plain: {color: p.plain, backgroundColor: p.background},
    styles: [
      {types: ['comment', 'prolog', 'doctype', 'cdata', 'shebang', 'hashbang', 'doc-comment'],
        style: {color: p.comment, fontStyle: 'italic'}},
      // A shell-session prompt (user@host:~$) reads as context, not code.
      {types: ['info'], style: {color: p.comment}},
      {types: ['keyword', 'atrule', 'important', 'control-flow', 'directive', 'rule', 'builtin',
        'selector', 'request-line', 'section'],
        style: {color: p.keyword}},
      {types: ['string', 'char', 'attr-value', 'regex', 'template-string', 'triple-quoted-string',
        'url', 'header-value', 'reason-phrase', 'string-property'],
        style: {color: p.string}},
      {types: ['function', 'function-name', 'function-variable', 'method', 'decorator',
        'annotation', 'generic-function'],
        style: {color: p.function}},
      {types: ['number', 'boolean', 'constant', 'symbol', 'nil', 'null', 'unit', 'date',
        'datetime', 'hexcode', 'color', 'status-code'],
        style: {color: p.number}},
      {types: ['variable', 'parameter', 'assign-left', 'environment', 'shell-symbol',
        'interpolation-punctuation', 'template-punctuation'],
        style: {color: p.variable}},
      {types: ['property', 'attr-name', 'key', 'class-name', 'namespace', 'tag', 'section-name',
        'header-name', 'label-key', 'known-class-name', 'maybe-class-name', 'literal-property'],
        style: {color: p.property}},
      {types: ['punctuation', 'operator', 'entity', 'arrow'], style: {color: p.punctuation}},
      {types: ['inserted', 'inserted-sign'], style: {color: p.inserted}},
      {types: ['deleted', 'deleted-sign'], style: {color: p.deleted}},
      {types: ['bold', 'title'], style: {fontWeight: 'bold'}},
      {types: ['italic'], style: {fontStyle: 'italic'}},
      {types: ['strike'], style: {textDecorationLine: 'line-through'}},
    ],
  };
}

export const vantageLightCodeTheme: VantageCodeTheme = buildTheme(LIGHT_CODE_PALETTE);
export const vantageDarkCodeTheme: VantageCodeTheme = buildTheme(DARK_CODE_PALETTE);

/**
 * Grammars Docusaurus loads on top of the ones prism-react-renderer bundles
 * (which already covers python, json, go, yaml, graphql, js/ts/jsx/tsx,
 * markdown, css and sql). Each name must be a Prism component, and a
 * component must come after anything it requires: shell-session needs bash.
 */
export const VANTAGE_PRISM_LANGUAGES: readonly string[] = [
  'bash',
  'shell-session',
  'powershell',
  'http',
  'ini',
  'toml',
  'hcl',
  'diff',
  'promql',
];

/**
 * Drop-in value for `themeConfig.prism`:
 *
 * ```ts
 * import {vantagePrism} from '@vantagecompute/docusaurus-theme';
 * themeConfig: { prism: vantagePrism }
 * ```
 *
 * A site that needs another grammar extends the list rather than replacing it:
 *
 * ```ts
 * prism: {...vantagePrism, additionalLanguages: [...vantagePrism.additionalLanguages, 'rust']}
 * ```
 */
export const vantagePrism: {
  theme: VantageCodeTheme;
  darkTheme: VantageCodeTheme;
  additionalLanguages: string[];
} = {
  theme: vantageLightCodeTheme,
  darkTheme: vantageDarkCodeTheme,
  additionalLanguages: [...VANTAGE_PRISM_LANGUAGES],
};
