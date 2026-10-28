/**
 * The mermaid configuration every Vantage site renders with.
 *
 * Mermaid paints its SVG from JavaScript, so the design system cannot reach it
 * from CSS alone: the `default` palette fills clusters pale yellow and boxes edge
 * labels in grey, and the `dark` palette fills nodes within 2% of the page. This
 * is the palette, the type and the spacing instead, from the same tokens as
 * src/css/custom.css (mermaid's colour maths needs literal hex, not var()).
 *
 * `useMaxWidth: false` keeps every diagram at its natural size, so text is the
 * same size in every diagram on the site, instead of a wide diagram shrinking
 * its labels to fit the column and a narrow one blowing them up. A diagram
 * wider than the column scrolls inside its own container (custom.css).
 */

const FONT_FAMILY = "'Satoshi', 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const PALETTE = {
  light: {
    background: '#fbfbfd', // --paper
    surface: '#ffffff',
    node: '#eef0fe', // --iris-50
    nodeBorder: '#6366f1', // --iris-500
    text: '#1f2547', // --ink-700
    textStrong: '#0b1020', // --ink-900
    line: '#6b7494', // --ink-400
    cluster: '#f4f5fb', // --ink-50
    clusterBorder: '#c8cce0', // --ink-200
    rowOdd: '#ffffff',
    rowEven: '#f4f5fb',
  },
  dark: {
    background: '#0b1020',
    surface: '#161a36',
    node: '#1f2547',
    nodeBorder: '#818cf8',
    text: '#d4d8e9',
    textStrong: '#f4f5fb',
    line: '#9aa1bd',
    cluster: '#161a36',
    clusterBorder: '#2a3157',
    rowOdd: '#161a36',
    rowEven: '#1f2547',
  },
};

export function vantageMermaidConfig(colorMode) {
  const dark = colorMode === 'dark';
  const p = dark ? PALETTE.dark : PALETTE.light;
  return {
    theme: 'base',
    darkMode: dark,
    fontFamily: FONT_FAMILY,
    themeVariables: {
      darkMode: dark,
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      background: p.surface,
      primaryColor: p.node,
      primaryBorderColor: p.nodeBorder,
      primaryTextColor: p.textStrong,
      secondaryColor: p.cluster,
      secondaryBorderColor: p.clusterBorder,
      secondaryTextColor: p.text,
      tertiaryColor: p.surface,
      tertiaryBorderColor: p.clusterBorder,
      tertiaryTextColor: p.text,
      lineColor: p.line,
      textColor: p.text,
      mainBkg: p.node,
      nodeBorder: p.nodeBorder,
      nodeTextColor: p.textStrong,
      clusterBkg: p.cluster,
      clusterBorder: p.clusterBorder,
      titleColor: p.text,
      // The edge label sits on the diagram's frame, not in a grey pill.
      edgeLabelBackground: p.surface,
      noteBkgColor: p.cluster,
      noteBorderColor: p.clusterBorder,
      noteTextColor: p.text,
      actorBkg: p.node,
      actorBorder: p.nodeBorder,
      actorTextColor: p.textStrong,
      actorLineColor: p.line,
      signalColor: p.text,
      signalTextColor: p.text,
      labelBoxBkgColor: p.node,
      labelBoxBorderColor: p.nodeBorder,
      labelTextColor: p.textStrong,
      attributeBackgroundColorOdd: p.rowOdd,
      attributeBackgroundColorEven: p.rowEven,
    },
    flowchart: {
      useMaxWidth: false,
      htmlLabels: true,
      curve: 'basis',
      padding: 14,
      nodeSpacing: 40,
      rankSpacing: 52,
      diagramPadding: 12,
      // Wide enough that a label wraps at a phrase, not after every word.
      wrappingWidth: 220,
    },
    sequence: {useMaxWidth: false, mirrorActors: false},
    er: {useMaxWidth: false},
    state: {useMaxWidth: false},
    class: {useMaxWidth: false},
    gantt: {useMaxWidth: false},
    // The edge label's backing must match the frame the diagram sits on
    // (`.vantage-mermaid` in custom.css). Read the live custom property rather
    // than a hex: the SVG is inline, so var() resolves against the page, and the
    // label stays matched whatever the site's surface colour resolves to.
    themeCSS: `
      .edgeLabel, .edgeLabel p, .edgeLabel span, .labelBkg {
        background-color: var(--ifm-background-surface-color) !important;
      }
      .edgeLabel rect { fill: var(--ifm-background-surface-color) !important; }
    `,
  };
}
