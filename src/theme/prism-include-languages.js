// @theme-init, not @theme-original: this file ships inside a theme package in
// the theme stack, so @theme-original would resolve back to this file and
// recurse. @theme-init is theme-classic's loader. See MDXComponents/index.js.
import prismIncludeLanguages from '@theme-init/prism-include-languages';
import extendBashFlags from '../utils/extendBashFlags';

/**
 * Docusaurus's own loader registers the grammars listed in
 * themeConfig.prism.additionalLanguages. Once bash is registered, widen its
 * flag rule so hyphenated flags such as `--cloud-account` are coloured like
 * `--app`; see src/utils/extendBashFlags.js.
 */
export default function prismIncludeLanguagesVantage(PrismObject) {
  prismIncludeLanguages(PrismObject);
  extendBashFlags(PrismObject);
}
