import { Link } from 'react-router-dom'
import { FiTwitter, FiGlobe } from 'react-icons/fi'

const footerCols = [
  {
    heading: 'Product',
    links: ['Marketplace', 'Sell Content', 'Pricing'],
  },
  {
    heading: 'Resources',
    links: ['Documentation', 'Changelog', 'Status'],
  },
  {
    heading: 'Company',
    links: ['About', 'Careers', 'Contact'],
  },
  {
    heading: 'Legal',
    links: ['Terms', 'Privacy', 'Cookies'],
  },
]

export default function Footer() {
  return (
    <footer className="bg-primary text-on-primary py-16 px-4 md:px-10 mt-16">
      <div className="max-w-site mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="md:col-span-1 flex flex-col gap-3">
            <span className="text-[20px] font-bold">Delar</span>
            <p className="text-sm text-white/70 max-w-[180px] leading-relaxed">
              The decentralised home for the creator economy.
            </p>
          </div>

          {/* Link columns */}
          {footerCols.map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">
                {heading}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/80 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/50">
            © 2026 Delar · Built on Sui · Powered by Walrus · Protected by Seal
          </p>
          <div className="flex gap-3">
            <a
              href="#"
              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Twitter"
            >
              <FiTwitter size={15} />
            </a>
            <a
              href="#"
              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Website"
            >
              <FiGlobe size={15} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
