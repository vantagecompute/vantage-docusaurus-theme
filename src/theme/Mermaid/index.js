import React, {useEffect, useMemo, useRef, useState} from 'react';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {ErrorBoundaryErrorMessageFallback, useColorMode} from '@docusaurus/theme-common';
import {
  MermaidContainerClassName,
  useMermaidConfig,
  useMermaidRenderResult,
} from '@docusaurus/theme-mermaid/client';
import {vantageMermaidConfig} from './config';

/**
 * Replaces @docusaurus/theme-mermaid's Mermaid component so every diagram
 * renders in the Vantage palette and type (./config.js), and only once the
 * theme's fonts have loaded.
 *
 * Mermaid sizes each label box from the text as measured at render time. Render
 * before Satoshi has loaded and the boxes are measured in the fallback font,
 * then the web font swaps in wider and the labels are cut off at the box edge.
 * Waiting for the font costs one frame on a warm cache.
 *
 * The theme's own palette wins over a site's `themeConfig.mermaid.theme` (which
 * defaults to mermaid's `default`/`dark`); a site's other `mermaid.options` still
 * apply on top. Shipped as a theme component, it only takes effect when the
 * Vantage theme is listed after `@docusaurus/theme-mermaid` in `themes`.
 */

const FONT_PROBES = ['400 14px Satoshi', '500 14px Satoshi'];

function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
    const loaded = fonts
      ? Promise.all(FONT_PROBES.map((f) => fonts.load(f).catch(() => null))).then(() => fonts.ready)
      : Promise.resolve();
    loaded.finally(() => {
      if (live) {
        setReady(true);
      }
    });
    return () => {
      live = false;
    };
  }, []);
  return ready;
}

function MermaidRenderResult({renderResult}) {
  const ref = useRef(null);
  useEffect(() => {
    renderResult.bindFunctions?.(ref.current);
  }, [renderResult]);
  return (
    <div
      ref={ref}
      className={`${MermaidContainerClassName} vantage-mermaid`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{__html: renderResult.svg}}
    />
  );
}

function MermaidRenderer({value}) {
  const {colorMode} = useColorMode();
  const siteConfig = useMermaidConfig();
  const config = useMemo(() => {
    const vantage = vantageMermaidConfig(colorMode);
    const {theme: _siteTheme, ...siteOptions} = siteConfig;
    return {
      ...siteOptions,
      ...vantage,
      flowchart: {...vantage.flowchart, ...siteOptions.flowchart},
      themeVariables: {...vantage.themeVariables, ...siteOptions.themeVariables},
    };
  }, [colorMode, siteConfig]);
  const renderResult = useMermaidRenderResult({text: value, config});
  if (renderResult === null) {
    return null;
  }
  return <MermaidRenderResult renderResult={renderResult} />;
}

export default function Mermaid(props) {
  const fontsReady = useFontsReady();
  return (
    <ErrorBoundary fallback={(params) => <ErrorBoundaryErrorMessageFallback {...params} />}>
      {fontsReady ? <MermaidRenderer {...props} /> : null}
    </ErrorBoundary>
  );
}
