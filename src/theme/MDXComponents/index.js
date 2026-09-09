// Routes every markdown `table` through TableScroll. Docusaurus's own map has
// no `table` entry, so this adds one rather than replacing anything.
//
// @theme-init, not @theme-original: this file ships inside a theme package that
// sits in the theme stack, so @theme-original/MDXComponents would resolve back
// to this same module and recurse. See src/theme/Navbar/Logo for the same note.
//
// A site that already wraps `table` itself (vantage-docs did, before this
// shipped) must drop its own wrapper, or every table renders in two scroll
// regions. MIGRATION.md, Part 3.
import MDXComponents from '@theme-init/MDXComponents';
import TableScroll from './TableScroll';

export default {
  ...MDXComponents,
  table: TableScroll,
};
