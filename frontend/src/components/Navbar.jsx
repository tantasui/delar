import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HiMenu, HiX } from 'react-icons/hi'
import { useCurrentAccount, useDAppKit, useWallets } from '@mysten/dapp-kit-react'

function ConnectWalletButton() {
  const account = useCurrentAccount()
  const wallets = useWallets()
  const dAppKit = useDAppKit()
  const [open, setOpen] = useState(false)
  const [connecting, setConnecting] = useState(false)

  if (account) {
    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="btn-ghost text-sm font-mono">
          {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </button>
        {open && (
          <div className="absolute right-0 mt-2 bg-white border border-subtle-ash rounded-xl shadow-lg py-1 min-w-[160px]">
            <button onClick={() => { dAppKit.disconnectWallet(); setOpen(false) }} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-marketplace-gray">
              Disconnect
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="btn-primary text-sm px-6 py-2.5">
        Connect Wallet
      </button>
      {open && (
        <div className="absolute right-0 mt-2 bg-white border border-subtle-ash rounded-xl shadow-lg py-1 min-w-[200px] z-50">
          {wallets.length === 0 && (
            <p className="px-4 py-2 text-sm text-on-surface-variant">No wallets found</p>
          )}
          {wallets.map((w) => (
            <button key={w.name} disabled={connecting} onClick={async () => { setConnecting(true); try { await dAppKit.connectWallet({ wallet: w }); setOpen(false) } finally { setConnecting(false) } }} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-marketplace-gray disabled:opacity-50">
              {w.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const account = useCurrentAccount()

  const navLinks = [
    { label: 'Discover', to: '/discover' },
  ]

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-subtle-ash h-16">
      <div className="container-site h-full flex items-center justify-between">
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

        <div className="hidden md:flex items-center gap-3">
          {account && (
            <>
              <Link to="/library" className="btn-ghost text-on-surface-variant">
                My Library
              </Link>
              <Link to="/dashboard" className="btn-primary text-sm px-6 py-2.5">
                Start selling
              </Link>
            </>
          )}
          <ConnectWalletButton />
        </div>
 
        <button
          className="md:hidden p-2 rounded-full hover:bg-marketplace-gray transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <HiX size={22} /> : <HiMenu size={22} />}
        </button>
      </div>
 
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
            <ConnectWalletButton />
          </div>
        </div>
      )}
    </header>
  )
}
