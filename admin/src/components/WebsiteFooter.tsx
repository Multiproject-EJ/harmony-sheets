export default function WebsiteFooter() {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div className="site-footer__column">
            <h3 className="site-footer__heading">Customer Support</h3>
            <ul className="site-footer__links">
              <li>
                <a href="/about.html">About</a>
              </li>
              <li>
                <a href="/faq.html#guides">Information Guides</a>
              </li>
              <li>
                <a href="/faq.html">Community</a>
              </li>
              <li>
                <a href="/faq.html#contact">Contact Us</a>
              </li>
            </ul>
          </div>
          <div className="site-footer__column">
            <h3 className="site-footer__heading">Policies</h3>
            <ul className="site-footer__links">
              <li>
                <a href="/policies.html#privacy">Privacy Policy</a>
              </li>
              <li>
                <a href="/policies.html#delivery">Delivery Policy</a>
              </li>
              <li>
                <a href="/policies.html#refund">Refund Policy</a>
              </li>
              <li>
                <a href="/policies.html#terms">Terms of Service</a>
              </li>
            </ul>
          </div>
          <div className="site-footer__column">
            <h3 className="site-footer__heading">Affiliate</h3>
            <ul className="site-footer__links">
              <li>
                <a href="/affiliate.html#apply">Become an Affiliate</a>
              </li>
              <li>
                <a href="/affiliate.html#login">Affiliate Login</a>
              </li>
            </ul>
          </div>
          <div className="site-footer__column site-footer__column--newsletter">
            <h3 className="site-footer__heading">Social &amp; Newsletter</h3>
            <form id="footer-newsletter" className="footer-form" action="https://www.harmony-sheets.com/#newsletter">
              <label className="sr-only" htmlFor="footer-email">
                Email address
              </label>
              <div className="footer-form__controls">
                <input id="footer-email" type="email" name="email" placeholder="Enter email" required />
                <button type="submit" className="footer-form__submit">
                  Join
                </button>
              </div>
            </form>
            <p className="site-footer__note">
              Subscribe to receive exclusive releases, deals, and event updates.
            </p>
            <div className="site-footer__social">
              <a
                className="site-footer__social-link"
                href="https://www.instagram.com/harmonysheets"
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
              >
                <span aria-hidden="true">IG</span>
              </a>
              <a
                className="site-footer__social-link"
                href="https://www.youtube.com/@HarmonySheets"
                target="_blank"
                rel="noopener"
                aria-label="YouTube"
              >
                <span aria-hidden="true">YT</span>
              </a>
              <a
                className="site-footer__social-link"
                href="https://www.pinterest.com/harmonysheets"
                target="_blank"
                rel="noopener"
                aria-label="Pinterest"
              >
                <span aria-hidden="true">PI</span>
              </a>
              <a className="site-footer__social-link" href="mailto:support@harmony-sheets.com" aria-label="Email Harmony Sheets">
                <span aria-hidden="true">@</span>
              </a>
            </div>
            <p id="footer-newsletter-status" className="site-footer__status" role="status" aria-live="polite"></p>
          </div>
        </div>
        <div className="site-footer__bottom">
          <div className="site-footer__brand">
            <a className="brand brand--footer" href="/">
              Harmony Sheets
            </a>
            <p className="site-footer__copy">© {currentYear} Harmony Sheets. All rights reserved.</p>
            <p className="site-footer__tagline">One-time purchase. No subscriptions.</p>
          </div>
          <div className="site-footer__extras">
            <p className="site-footer__locale">Serving customers worldwide • USD</p>
            <div className="site-footer__payments">
              <span className="site-footer__payment">Visa</span>
              <span className="site-footer__payment">Mastercard</span>
              <span className="site-footer__payment">Amex</span>
              <span className="site-footer__payment">PayPal</span>
              <span className="site-footer__payment">Shop Pay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
