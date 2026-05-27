import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HiMenu, HiX } from 'react-icons/hi'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  const navLinks = [
    { label: 'Discover', to: '/discover' },
    { label: 'How it works', to: '#' },
    { label: 'Pricing', to: '#' },
  ]

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-subtle-ash h-16">
      <div className="container-site h-full flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link to="/discover" className="text-[20px] font-bold text-primary tracking-tight">
            Delar
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className={`btn-ghost text-sm ${
                  pathname === to
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/library" className="btn-ghost text-on-surface-variant">
            Sign in
          </Link>
          <Link to="/dashboard" className="btn-primary text-sm px-6 py-2.5">
            Start selling
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-marketplace-gray transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <HiX size={22} /> : <HiMenu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-subtle-ash px-4 pb-4 pt-2 flex flex-col gap-1">
          {navLinks.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-full text-on-surface hover:bg-marketplace-gray transition-colors text-sm font-medium"
            >
              {label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 mt-2">
            <Link to="/library" onClick={() => setMobileOpen(false)} className="btn-ghost text-center">
              Sign in
            </Link>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="btn-primary text-center">
              Start selling
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
