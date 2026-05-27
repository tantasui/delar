import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiDownload,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiShoppingBag,
} from 'react-icons/fi'
import { HiOutlineLibrary } from 'react-icons/hi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { PRODUCTS } from '../data/products'

// Simulate "owned" products (first 3 for demo)
const OWNED = PRODUCTS.slice(0, 3).map((p, i) => ({
  ...p,
  purchasedDate: ['March 2026', 'February 2026', 'January 2026'][i],
  downloads: [3, 1, 7][i],
}))

export default function LibraryPage() {
  const [pdfOpen, setPdfOpen] = useState(null) // product or null
  const [pdfPage, setPdfPage] = useState(1)
  const TOTAL_PAGES = 24

  function openPdf(product) {
    setPdfOpen(product)
    setPdfPage(1)
  }

  function closePdf() {
    setPdfOpen(null)
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      {/* ── PDF Viewer ── */}
      {pdfOpen && (
        <div className="fixed inset-0 z-[200] bg-[#0a0a0a] flex flex-col">
          {/* Top bar */}
          <div className="bg-black h-14 flex items-center justify-between px-6 flex-shrink-0">
            <button
              onClick={closePdf}
              className="flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors"
            >
              <FiChevronLeft size={16} />
              Back to Library
            </button>
            <span className="text-white text-sm font-semibold line-clamp-1 max-w-[300px]">
              {pdfOpen.title}
            </span>
            <span className="text-white/60 text-xs">
              Page {pdfPage} of {TOTAL_PAGES}
            </span>
          </div>

          {/* PDF Canvas area */}
          <div
            className="flex-1 overflow-y-auto flex items-start justify-center py-8 px-4 relative select-none"
            onContextMenu={e => e.preventDefault()}
          >
            {/* Mock PDF page */}
            <div className="relative w-full max-w-[640px] bg-white rounded min-h-[800px] p-12 flex flex-col gap-4">
              {/* Watermark */}
              <span className="absolute bottom-8 right-6 text-[11px] text-black/10 font-mono pointer-events-none select-none">
                Licensed to 0x1234...abcd
              </span>

              {/* Mock content */}
              <div className="text-center mb-8">
                <h1 className="text-[28px] font-bold text-primary tracking-tight mb-2">
                  {pdfOpen.title}
                </h1>
                <p className="text-sm text-on-surface-variant">by {pdfOpen.creator}</p>
              </div>

              <div className="flex flex-col gap-3">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-3 bg-marketplace-gray rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
                ))}
              </div>

              <div className="mt-6 p-6 bg-marketplace-gray rounded-lg">
                <div className="h-4 bg-subtle-ash rounded mb-3 w-1/3" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-3 bg-subtle-ash/60 rounded mb-2" style={{ width: `${60 + Math.random() * 35}%` }} />
                ))}
              </div>

              <div className="flex flex-col gap-3 mt-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-3 bg-marketplace-gray rounded" style={{ width: `${55 + Math.random() * 40}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom toolbar */}
          <div className="bg-black/80 h-16 flex items-center justify-center gap-4 flex-shrink-0">
            <button
              onClick={() => setPdfPage(p => Math.max(1, p - 1))}
              disabled={pdfPage === 1}
              className="flex items-center gap-2 border border-white/20 text-white text-xs font-semibold px-5 py-2 rounded-full hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FiChevronLeft size={14} /> Previous
            </button>
            <span className="text-white/60 text-xs">{pdfPage} / {TOTAL_PAGES}</span>
            <button
              onClick={() => setPdfPage(p => Math.min(TOTAL_PAGES, p + 1))}
              disabled={pdfPage === TOTAL_PAGES}
              className="flex items-center gap-2 border border-white/20 text-white text-xs font-semibold px-5 py-2 rounded-full hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <main className="pt-20 pb-8">
        <div className="container-site">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-headline-lg font-bold text-primary mb-2">My Library</h1>
            <p className="text-body-md text-on-surface-variant">Products you own, forever.</p>
          </div>

          {OWNED.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center text-center py-24">
              <div className="w-24 h-24 rounded-2xl bg-marketplace-gray flex items-center justify-center mb-6">
                <HiOutlineLibrary size={40} className="text-on-surface-variant" />
              </div>
              <h2 className="text-subheading font-semibold text-primary mb-2">Nothing here yet</h2>
              <p className="text-body-md text-on-surface-variant max-w-[320px] mb-8">
                Browse the marketplace to find something you'll love.
              </p>
              <Link to="/discover" className="btn-primary">
                Browse products
              </Link>
            </div>
          ) : (
            <>
              {/* Stats strip */}
              <div className="flex flex-wrap gap-4 mb-8">
                {[
                  { label: 'Products owned', value: OWNED.length },
                  { label: 'Total downloads', value: OWNED.reduce((a, p) => a + p.downloads, 0) },
                  { label: 'Formats', value: [...new Set(OWNED.map(p => p.format))].join(', ') },
                ].map(({ label, value }) => (
                  <div key={label} className="card px-6 py-4 flex flex-col">
                    <span className="text-xs text-on-surface-variant font-semibold mb-1">{label}</span>
                    <span className="text-subheading font-bold text-primary">{value}</span>
                  </div>
                ))}
              </div>

              {/* Library grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {OWNED.map((product) => (
                  <LibraryCard
                    key={product.id}
                    product={product}
                    onOpen={() => openPdf(product)}
                  />
                ))}
              </div>

              {/* Browse more CTA */}
              <div className="border border-subtle-ash rounded-lg p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-marketplace-gray flex items-center justify-center flex-shrink-0">
                    <FiShoppingBag size={18} className="text-on-surface-variant" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary mb-1">Expand your collection</p>
                    <p className="text-sm text-on-surface-variant">Discover more digital products from top creators.</p>
                  </div>
                </div>
                <Link to="/discover" className="btn-secondary whitespace-nowrap text-sm">
                  Browse marketplace
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Library card sub-component
function LibraryCard({ product, onOpen }) {
  const isPdf = ['PDF', 'EPUB'].includes(product.format)

  return (
    <div className="card overflow-hidden relative group">
      {/* Owned badge */}
      <span className="absolute top-3 right-3 z-10 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
        Owned
      </span>

      {/* Thumbnail */}
      <div className="aspect-video bg-marketplace-gray overflow-hidden">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiBookOpen size={32} className="text-on-surface-variant" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <span className="badge text-[10px] mb-2">{product.type}</span>
        <h3 className="text-sm font-semibold text-primary line-clamp-2 mb-2 leading-snug">
          {product.title}
        </h3>
        <p className="text-xs text-on-surface-variant mb-1">
          Purchased {product.purchasedDate}
        </p>
        <p className="text-xs text-on-surface-variant mb-4 flex items-center gap-1">
          <FiDownload size={10} />
          Downloaded {product.downloads} {product.downloads === 1 ? 'time' : 'times'}
        </p>

        {/* Action button */}
        {isPdf ? (
          <button
            onClick={onOpen}
            className="flex items-center justify-center gap-2 btn-primary w-full text-sm py-2.5"
          >
            <FiBookOpen size={14} />
            Open
          </button>
        ) : (
          <button className="flex items-center justify-center gap-2 btn-primary w-full text-sm py-2.5">
            <FiDownload size={14} />
            Download
          </button>
        )}
      </div>
    </div>
  )
}
