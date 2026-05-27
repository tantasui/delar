import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiArrowRight } from 'react-icons/fi'
import { HiOutlineSparkles } from 'react-icons/hi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { PRODUCTS, CATEGORIES } from '../data/products'

// Social proof avatars (placeholder initials)
const AVATARS = [
  { initials: 'AK', bg: '#ff90e8' },
  { initials: 'BM', bg: '#ffc900' },
  { initials: 'CL', bg: '#d1d5dc' },
]

export default function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = PRODUCTS.filter((p) => {
    const matchesCategory =
      activeCategory === 'All' || p.category === activeCategory
    const matchesSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.creator.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      <main className="pt-16">
        {/* ── Hero ── */}
        <section className="relative py-20 md:py-28 flex flex-col items-center text-center container-site overflow-visible">
          {/* Floating decorative coins */}
          <div className="hidden lg:block absolute left-[-40px] top-32 animate-float pointer-events-none select-none">
            <div className="w-16 h-16 rounded-full bg-creator-pink border-2 border-primary flex items-center justify-center text-2xl font-bold rotate-[-12deg]">
              D
            </div>
          </div>
          <div className="hidden lg:block absolute right-[-40px] top-52 animate-float-delayed pointer-events-none select-none">
            <div className="w-20 h-20 rounded-full bg-creator-pink border-2 border-primary flex items-center justify-center text-3xl font-bold rotate-[8deg]">
              D
            </div>
          </div>

          {/* Pill label */}
          <div className="inline-flex items-center gap-2 bg-marketplace-gray border border-subtle-ash text-on-surface-variant text-xs font-semibold px-4 py-2 rounded-full mb-6">
            {/* <HiOutlineSparkles className="text-creator-pink" size={14} /> */}
            Built on Sui + Walrus
          </div>

          {/* Headline */}
          <h1 className="text-[42px] md:text-[64px] lg:text-display font-bold text-primary leading-tight tracking-[-1.44px] max-w-[860px] mb-6">
            The creator marketplace that{' '}
            <span className="relative inline-block">
              can't be shut down
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-creator-pink rounded-full" />
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-[18px] md:text-subheading text-on-surface-variant max-w-[560px] mb-8 leading-relaxed">
            Sell ebooks, courses, templates and coaching sessions. Get paid in
            USDC. Your content protected by encryption. Nobody can deplatform
            you.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link to="/dashboard" className="btn-primary">
              Start selling for free
            </Link>
            <a href="#products" className="btn-secondary">
              Browse products
            </a>
          </div>

          {/* Social proof */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex -space-x-3">
              {AVATARS.map(({ initials, bg }) => (
                <div
                  key={initials}
                  className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold text-primary"
                  style={{ backgroundColor: bg }}
                >
                  {initials}
                </div>
              ))}
              <div className="w-9 h-9 rounded-full border-2 border-white bg-on-surface flex items-center justify-center text-white text-xs font-bold">
                +
              </div>
            </div>
            <p className="text-xs text-on-surface-variant font-semibold">
              Trusted by 2,400+ creators
            </p>
          </div>
        </section>

        {/* ── Search + Filters ── */}
        <section className="container-site mb-16">
          {/* Search bar */}
          <div className="relative mb-4">
            <FiSearch
              className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant"
              size={18}
            />
            <input
              type="text"
              placeholder="Search for ebooks, courses, templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-5 bg-marketplace-gray border border-subtle-ash rounded-full focus:border-primary focus:outline-none text-body-md transition-all"
            />
          </div>

          {/* Category filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap text-xs font-semibold px-5 py-2 rounded-full transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-marketplace-gray text-on-surface-variant hover:border hover:border-subtle-ash'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* ── Product Grid ── */}
        <section id="products" className="container-site mb-20">
          <h2 className="text-subheading font-semibold text-primary mb-8">
            Featured Products
          </h2>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-on-surface-variant">
              <p className="text-subheading mb-2">No products found</p>
              <p className="text-body-md">Try a different search or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </section>

        {/* ── CTA Banner ── */}
        <section className="container-site mb-20">
          <div className="bg-primary text-white rounded-lg p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-headline-lg font-bold mb-2">
                Start selling your digital products
              </h2>
              <p className="text-white/70 text-body-md max-w-[500px]">
                Join thousands of creators earning in USDC. No middleman. No
                deplatforming. Permanent ownership on-chain.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 bg-white text-primary font-semibold px-8 py-3 rounded-full whitespace-nowrap hover:bg-marketplace-gray transition-all"
            >
              Get started free
              <FiArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
