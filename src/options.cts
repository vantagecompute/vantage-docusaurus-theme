/**
 * Theme options and the navbar variant rule. Pure functions with no Docusaurus
 * imports, so they are tested directly against the compiled output.
 */

export type NavbarVariant = 'public' | 'developer';

/** One external button in the developer navbar. Nothing else is configurable. */
export interface NavbarLink {
  label: string;
  url: string;
}

/** What a site may pass in `themes: [['@vantagecompute/docusaurus-theme', {...}]]`. */
export interface VantageThemeOptions {
  /** External buttons, at most {@link MAX_NAVBAR_LINKS}. Rendered by the developer navbar only. */
  navbarLinks?: NavbarLink[];
}

/**
 * Options after validation. `id` is Docusaurus's plugin-instance id. When a
 * plugin exports validateOptions, Docusaurus trusts the returned object to
 * carry it (its own Joi path adds one), and names the plugin's generated data
 * directory after it. Leaving it out crashes the build in path.join.
 */
export interface ResolvedVantageThemeOptions {
  id: string;
  navbarLinks: NavbarLink[];
}

const DEFAULT_PLUGIN_ID = 'default';

/** Two is GitHub plus one registry (PyPI, npm, ...). More than that is a nav, and navs drift. */
export const MAX_NAVBAR_LINKS = 2;

/**
 * Where the brand mark links, per variant. Baked in on purpose: a site cannot
 * point its logo anywhere else, which is what keeps the hub consistent.
 */
export const LOGO_HREF: Record<NavbarVariant, string> = {
  public: 'https://docs.vantagecompute.ai/',
  developer: 'https://docs.vantagecompute.ai/developer/',
};

/**
 * Every site published under /developer/ (the developer overview and every
 * spoke) gets the developer navbar. Everything else gets the public one.
 * Docusaurus normalises baseUrl to a leading and trailing slash before the
 * plugin sees it.
 */
export function resolveNavbarVariant(baseUrl: string): NavbarVariant {
  return baseUrl.startsWith('/developer/') ? 'developer' : 'public';
}

const PREFIX = '[@vantagecompute/docusaurus-theme]';

function fail(message: string): never {
  throw new Error(`${PREFIX} ${message}`);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateLink(value: unknown, index: number): NavbarLink {
  const where = `navbarLinks[${index}]`;
  if (!isPlainObject(value)) {
    fail(`${where} must be an object with "label" and "url".`);
  }

  const extra = Object.keys(value).filter((key) => key !== 'label' && key !== 'url');
  if (extra.length > 0) {
    fail(
      `${where} has unsupported propert${extra.length === 1 ? 'y' : 'ies'} ` +
        `${extra.map((k) => `"${k}"`).join(', ')}. Only "label" and "url" are ` +
        `accepted; the icon, external-link marker and rel attributes come from the theme.`,
    );
  }

  const {label, url} = value;
  if (typeof label !== 'string' || label.trim() === '') {
    fail(`${where}.label must be a non-empty string.`);
  }
  if (typeof url !== 'string' || url.trim() === '') {
    fail(`${where}.url must be a non-empty string.`);
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return fail(`${where}.url must be an absolute http(s) URL, got "${url}".`);
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    fail(`${where}.url must be an absolute http(s) URL, got "${url}".`);
  }

  return {label: label.trim(), url};
}

/**
 * Validate and normalise the theme options. Throws with a message that names
 * the offending key, so a misconfigured spoke fails its build instead of
 * quietly rendering something off-convention.
 */
export function validateVantageThemeOptions(options: unknown): ResolvedVantageThemeOptions {
  if (options === undefined || options === null) {
    return {id: DEFAULT_PLUGIN_ID, navbarLinks: []};
  }
  if (!isPlainObject(options)) {
    fail('theme options must be an object.');
  }

  const {navbarLinks, id, ...unknown} = options;
  const unknownKeys = Object.keys(unknown);
  if (unknownKeys.length > 0) {
    fail(
      `unknown option${unknownKeys.length === 1 ? '' : 's'} ` +
        `${unknownKeys.map((k) => `"${k}"`).join(', ')}. The only option is "navbarLinks".`,
    );
  }

  const resolved: ResolvedVantageThemeOptions = {
    id: typeof id === 'string' ? id : DEFAULT_PLUGIN_ID,
    navbarLinks: [],
  };

  if (navbarLinks === undefined) {
    return resolved;
  }
  if (!Array.isArray(navbarLinks)) {
    fail('"navbarLinks" must be an array of {label, url} objects.');
  }
  if (navbarLinks.length > MAX_NAVBAR_LINKS) {
    fail(
      `"navbarLinks" allows at most ${MAX_NAVBAR_LINKS} entries, got ${navbarLinks.length}. ` +
        `GitHub plus one package registry is the intended use.`,
    );
  }

  resolved.navbarLinks = navbarLinks.map(validateLink);
  return resolved;
}
