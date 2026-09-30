// Colour every bash flag, including ones with hyphens in their names.
//
// Prism's bash grammar marks a flag as a `parameter` only when its name is a
// single word: `-n`, `--app` and `--disk=50G` are coloured, but
// `--cloud-account`, `--memory-limit` and `--dry-run` fall through as plain
// text. Vantage CLIs use hyphenated flags throughout, so in a single command
// some flags were coloured and some were not.
//
// This widens the name to hyphen- and dot-separated words. The rule object is
// changed in place rather than replaced: shell-session embeds the bash grammar
// by reference, so its commands pick the change up too.

// Prism's own pattern, with `(?:\.\w+)*` widened to `(?:[.-]\w+)*`.
const BASH_FLAG = /(^|\s)-{1,2}(?:\w+:[+-]?)?\w+(?:[.-]\w+)*(?=[=\s]|$)/;

function extendBashFlags(Prism) {
  const bash = Prism && Prism.languages && Prism.languages.bash;
  const parameter = bash && bash.parameter;
  // Bash is only present when a site loads it; do nothing otherwise.
  if (!parameter || typeof parameter !== 'object' || Array.isArray(parameter)) return false;
  parameter.pattern = BASH_FLAG;
  return true;
}

module.exports = extendBashFlags;
module.exports.BASH_FLAG = BASH_FLAG;
