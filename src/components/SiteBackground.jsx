/**
 * Soft animated brand gradient behind the whole public website.
 * Three large blurred colour blobs (Kite blue, pink, green) drift slowly; only
 * `transform` is animated, so it stays smooth on phones. Respects reduced motion.
 * Styles: .site-bg* in globals.css.
 */
export default function SiteBackground() {
  return (
    <div className="site-bg" aria-hidden="true">
      <span className="site-bg__blob site-bg__blob--blue" />
      <span className="site-bg__blob site-bg__blob--pink" />
      <span className="site-bg__blob site-bg__blob--green" />
    </div>
  );
}
