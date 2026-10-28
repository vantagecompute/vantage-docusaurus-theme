// Tokenises real bash with the same Prism the docs sites use. prismjs is
// installed with the docs site under docusaurus/, not at the package root;
// the tests skip when it is absent.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {createRequire} = require('node:module');

const extendBashFlags = require('../src/utils/extendBashFlags');

let loadPrism;
try {
  const req = createRequire(path.join(__dirname, '../docusaurus/package.json'));
  req.resolve('prismjs');
  loadPrism = () => {
    // A fresh instance per test, so one test's change cannot leak into another.
    for (const id of Object.keys(req.cache)) if (id.includes(`${path.sep}prismjs${path.sep}`)) delete req.cache[id];
    const Prism = req('prismjs');
    globalThis.Prism = Prism;
    req('prismjs/components/prism-bash');
    req('prismjs/components/prism-shell-session');
    delete globalThis.Prism;
    return Prism;
  };
} catch {
  loadPrism = null;
}
const skip = !loadPrism && 'prismjs not installed under docusaurus/';

// The text of every token of the given type, however deeply it is nested.
function tokensOf(Prism, code, language, type) {
  const found = [];
  const walk = (list) => {
    for (const t of list) {
      if (typeof t === 'string') continue;
      if (t.type === type) found.push(typeof t.content === 'string' ? t.content : Prism.util.encode(t.content).toString());
      if (Array.isArray(t.content)) walk(t.content);
      else if (t.content && typeof t.content === 'object') walk([t.content]);
    }
  };
  walk(Prism.tokenize(code, Prism.languages[language]));
  return found;
}

const COMMAND = 'uvx v8x cluster create my-slurm-cluster --cloud-account my-local-machine --app slurm-multipass -n 3 --memory-limit=4G --dry-run';

test('stock Prism leaves hyphenated flags uncoloured', {skip}, () => {
  const Prism = loadPrism();
  assert.deepEqual(tokensOf(Prism, COMMAND, 'bash', 'parameter'), ['--app', '-n']);
});

test('every flag is coloured once the rule is widened', {skip}, () => {
  const Prism = loadPrism();
  assert.equal(extendBashFlags(Prism), true);
  assert.deepEqual(tokensOf(Prism, COMMAND, 'bash', 'parameter'),
    ['--cloud-account', '--app', '-n', '--memory-limit', '--dry-run']);
});

test('hyphenated arguments that are not flags stay plain', {skip}, () => {
  const Prism = loadPrism();
  extendBashFlags(Prism);
  const flags = tokensOf(Prism, COMMAND, 'bash', 'parameter');
  for (const word of ['my-slurm-cluster', 'my-local-machine', 'slurm-multipass']) {
    assert.ok(!flags.some((f) => f.includes(word)), `${word} was coloured as a flag`);
  }
});

test('shell-session commands pick up the widened rule', {skip}, () => {
  const Prism = loadPrism();
  extendBashFlags(Prism);
  const flags = tokensOf(Prism, '$ multipass launch --cloud-init user-data.yaml --name vantage-node\n', 'shell-session', 'parameter');
  assert.deepEqual(flags, ['--cloud-init', '--name']);
});

test('does nothing when bash is not loaded', () => {
  assert.equal(extendBashFlags({languages: {}}), false);
  assert.equal(extendBashFlags(undefined), false);
});
