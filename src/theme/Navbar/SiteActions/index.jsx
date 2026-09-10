/**
 * A slot in the public navbar, between search and the colour-mode toggle.
 * Empty here. The main docs site overrides it in its own src/theme/ to render
 * its Ask AI button; that component talks to the Vantage AI backend and does
 * not belong in a theme package.
 *
 * The developer navbar does not render this slot.
 */
export default function NavbarSiteActions() {
  return null;
}
