import { useEffect, useRef, useState } from 'react'

const NAV_LINKS = [
  { href: '/products.html', label: 'Discover Templates', className: 'nav-link nav-link--browse' },
  { href: '/bundles.html', label: 'Bundles', className: 'nav-link nav-link--bundles' },
  { href: '/faq.html', label: 'Community', className: 'nav-link' },
  { href: '/account.html', label: 'My account', className: 'nav-link nav-link--account' }
]

export default function WebsiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    function handleClick(event: MouseEvent) {
      const header = headerRef.current
      if (!header) return

      if (event.target instanceof Node && !header.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [menuOpen])

  return (
    <header ref={headerRef} className="site-header site-header--brand-text-visible">
      <a className="brand" href="/">
        <img className="brand__logo" src="/assets/logoHarmonySheets.webp" alt="" />
        <span className="brand__text">
          <span className="brand__name">Harmony Sheets</span>
          <span className="brand__notice">Plan Better. Live Smarter.</span>
        </span>
      </a>

      <button
        className="nav-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="site-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="sr-only">Toggle navigation</span>
        <span className="nav-toggle__icon" aria-hidden="true" />
      </button>

      <nav className={`main-nav${menuOpen ? ' is-open' : ''}`} id="site-menu">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            className={link.className}
            href={link.href}
            onClick={() => {
              setMenuOpen(false)
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
