// Runs against the compiled output, the same code consumers get. Build first:
//   yarn build && yarn test
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  validateVantageThemeOptions,
  resolveNavbarVariant,
  LOGO_HREF,
  MAX_NAVBAR_LINKS,
} = require('../lib/options.cjs');

const github = {label: 'GitHub', url: 'https://github.com/vantagecompute/vantage-mcp'};
const pypi = {label: 'PyPI', url: 'https://pypi.org/project/vantage-mcp/'};
const npm = {label: 'npm', url: 'https://www.npmjs.com/package/vantage-mcp'};

// Docusaurus relies on validateOptions to return an `id`: its own Joi path
// adds one, and the plugin's data directory is named after it. Without it the
// build dies in path.join with "Received undefined".
test('no options at all resolves to no links and the default id', () => {
  assert.deepEqual(validateVantageThemeOptions(undefined), {id: 'default', navbarLinks: []});
  assert.deepEqual(validateVantageThemeOptions({}), {id: 'default', navbarLinks: []});
});

test('one and two links pass through normalised', () => {
  assert.deepEqual(validateVantageThemeOptions({navbarLinks: [github]}), {
    id: 'default',
    navbarLinks: [github],
  });
  assert.deepEqual(validateVantageThemeOptions({navbarLinks: [github, pypi]}), {
    id: 'default',
    navbarLinks: [github, pypi],
  });
});

test('labels are trimmed', () => {
  const out = validateVantageThemeOptions({navbarLinks: [{...github, label: '  GitHub '}]});
  assert.equal(out.navbarLinks[0].label, 'GitHub');
});

test('a third link is rejected', () => {
  assert.equal(MAX_NAVBAR_LINKS, 2);
  assert.throws(
    () => validateVantageThemeOptions({navbarLinks: [github, pypi, npm]}),
    /at most 2/,
  );
});

test('a link with an extra property is rejected', () => {
  assert.throws(
    () => validateVantageThemeOptions({navbarLinks: [{...github, icon: 'github'}]}),
    /"icon"/,
  );
});

test('a link needs a non-empty label', () => {
  assert.throws(
    () => validateVantageThemeOptions({navbarLinks: [{url: github.url}]}),
    /label/,
  );
  assert.throws(
    () => validateVantageThemeOptions({navbarLinks: [{label: '   ', url: github.url}]}),
    /label/,
  );
});

test('a link needs an absolute http(s) url', () => {
  assert.throws(
    () => validateVantageThemeOptions({navbarLinks: [{label: 'Docs', url: '/docs'}]}),
    /url/,
  );
  assert.throws(
    () => validateVantageThemeOptions({navbarLinks: [{label: 'Mail', url: 'mailto:x@y.z'}]}),
    /url/,
  );
});

test('navbarLinks must be an array', () => {
  assert.throws(() => validateVantageThemeOptions({navbarLinks: github}), /array/);
});

test('an unknown top-level option is rejected by name', () => {
  assert.throws(() => validateVantageThemeOptions({logoUrl: '/'}), /"logoUrl"/);
});

test('options must be an object', () => {
  assert.throws(() => validateVantageThemeOptions([github]), /object/);
  assert.throws(() => validateVantageThemeOptions('nope'), /object/);
});

test('an explicit Docusaurus plugin id passes through untouched', () => {
  assert.deepEqual(validateVantageThemeOptions({id: 'second', navbarLinks: [github]}), {
    id: 'second',
    navbarLinks: [github],
  });
});

test('baseUrl under /developer/ is the developer variant', () => {
  assert.equal(resolveNavbarVariant('/developer/'), 'developer');
  assert.equal(resolveNavbarVariant('/developer/vantage-mcp/'), 'developer');
  assert.equal(resolveNavbarVariant('/developer/docusaurus-theme/'), 'developer');
});

test('every other baseUrl is the public variant', () => {
  assert.equal(resolveNavbarVariant('/'), 'public');
  assert.equal(resolveNavbarVariant('/docs/'), 'public');
  assert.equal(resolveNavbarVariant('/developers/'), 'public');
});

test('logo hrefs are baked per variant', () => {
  assert.deepEqual(LOGO_HREF, {
    public: 'https://docs.vantagecompute.ai/',
    developer: 'https://docs.vantagecompute.ai/developer/',
  });
});
