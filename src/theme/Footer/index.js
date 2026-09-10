/**
 * No Vantage documentation site renders a footer. The collapse-sidebar control
 * already frames the bottom of the screen, and the links a footer would carry
 * are the navbar's external buttons. A site that still declares
 * themeConfig.footer builds fine and renders nothing.
 */
export default function Footer() {
  return null;
}
