import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FiCheck,
  FiDownload,
  FiFileText,
  FiPackage,
  FiUsers,
  FiStar,
  FiChevronRight,
} from 'react-icons/fi'
import { HiOutlineLightningBolt } from 'react-icons/hi'
import { SiGoogle } from 'react-icons/si'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { getProductById, PRODUCTS } from '../data/products'

const TABS = ['Overview', 'Contents', 'Reviews']

const MOCK_REVIEWS = [
  { author: '0x71...f4e2', rating: 5, text: 'Absolutely worth every USDC. Changed how I work completely.', date: 'Mar 2026' },
  { author: '0xab...12cd', rating: 5, text: 'Incredible quality. The templates are clean and easy to customise.', date: 'Feb 2026' },
  { author: '0x9f...aa01', rating: 4, text: 'Really solid pack. Would love even more templates in future updates.', date: 'Jan 2026' },
]

export default function ProductDetailPage() {
  const { id } = useParams()
  const product = getProductById(id) || PRODUCTS[0]
  const [activeTab, setActiveTab] = useState('Overview')
  const [bought, setBought] = useState(false)

  const related = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3)

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      <main className="pt-20 pb-8">
        <div className="container-site">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-xs text-on-surface-variant mb-8 font-medium">
            <Link to="/discover" className="hover:text-primary transition-colors">
              Discover
            </Link>
            <FiChevronRight size={12} />
            <span className="text-on-surface-variant">{product.category}</span>
            <FiChevronRight size={12} />
            <span className="text-primary line-clamp-1 max-w-[200px]">{product.title}</span>
          </nav>

          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-10">
            {/* ── Left Column (60%) ── */}
            <div className="flex-1 min-w-0">
              {/* Thumbnail */}
              <div className="aspect-video rounded-lg overflow-hidden bg-marketplace-gray mb-6 border border-subtle-ash">
                {product.thumbnail ? (
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiFileText size={48} className="text-on-surface-variant" />
                  </div>
                )}
              </div>

              {/* Tab navigation */}
              <div className="flex gap-2 mb-8">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-sm font-semibold px-5 py-2 rounded-full transition-all ${
                      activeTab === tab
                        ? 'bg-primary text-white'
                        : 'bg-marketplace-gray text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab: Overview */}
              {activeTab === 'Overview' && (
                <div>
                  <h2 className="text-subheading font-semibold text-primary mb-4">
                    About this product
                  </h2>
                  <p className="text-body-md text-on-surface-variant mb-4 leading-relaxed">
                    {product.description}
                  </p>
                  <p className="text-body-md text-on-surface-variant mb-4 leading-relaxed">
                    All files are encrypted and stored permanently on Walrus decentralised storage,
                    secured by the Sui blockchain. Once you purchase, your access is yours forever —
                    no subscriptions, no takedowns.
                  </p>
                  <p className="text-body-md text-on-surface-variant mb-8 leading-relaxed">
                    Payments are processed in USDC with instant settlement. Nigerian buyers can
                    convert NGN to USDC via Linq's on-ramp directly at checkout.
                  </p>

                  {/* What you'll get */}
                  <h3 className="text-[16px] font-semibold text-primary mb-4">
                    What you'll get
                  </h3>
                  <ul className="flex flex-col gap-3 mb-8">
                    {product.contents.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-body-md text-on-surface">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <FiCheck size={11} className="text-white" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { icon: FiFileText, label: product.fileSize },
                      { icon: FiPackage, label: product.format + ' Format' },
                      { icon: FiDownload, label: 'Instant Download' },
                      { icon: FiUsers, label: `${product.sales} sales` },
                    ].map(({ icon: Icon, label }) => (
                      <span
                        key={label}
                        className="flex items-center gap-1.5 bg-marketplace-gray text-on-surface text-xs font-semibold px-3 py-2 rounded-full"
                      >
                        <Icon size={12} />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Contents */}
              {activeTab === 'Contents' && (
                <div>
                  <h2 className="text-subheading font-semibold text-primary mb-4">
                    What's included
                  </h2>
                  <ul className="flex flex-col divide-y divide-subtle-ash">
                    {product.contents.map((item, i) => (
                      <li
                        key={item}
                        className="flex items-center justify-between py-4 text-body-md"
                      >
                        <span className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded bg-marketplace-gray text-on-surface-variant text-xs flex items-center justify-center font-semibold">
                            {i + 1}
                          </span>
                          {item}
                        </span>
                        <FiCheck size={14} className="text-primary" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tab: Reviews */}
              {activeTab === 'Reviews' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <FiStar key={s} size={16} className="fill-sunshine-yellow text-sunshine-yellow" />
                      ))}
                    </div>
                    <span className="text-subheading font-bold text-primary">4.9</span>
                    <span className="text-on-surface-variant text-sm">({MOCK_REVIEWS.length} reviews)</span>
                  </div>
                  <div className="flex flex-col gap-6">
                    {MOCK_REVIEWS.map((r) => (
                      <div key={r.author} className="border-b border-subtle-ash pb-6 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm font-semibold text-primary">{r.author}</span>
                          <span className="text-xs text-on-surface-variant">{r.date}</span>
                        </div>
                        <div className="flex gap-0.5 mb-2">
                          {[...Array(r.rating)].map((_, i) => (
                            <FiStar key={i} size={12} className="fill-sunshine-yellow text-sunshine-yellow" />
                          ))}
                        </div>
                        <p className="text-body-md text-on-surface-variant">{r.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Sidebar (40%, sticky) ── */}
            <div className="w-full lg:w-[380px] flex-shrink-0">
              <div className="sticky top-24">
                <div className="card p-6 mb-4">
                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-headline-lg font-bold text-primary">
                      USDC {product.price}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      One-time payment. Yours forever.
                    </p>
                  </div>

                  {/* Buy button */}
                  <button
                    onClick={() => setBought(true)}
                    className={`w-full h-[52px] rounded-full font-semibold text-sm transition-all mb-4 ${
                      bought
                        ? 'bg-marketplace-gray text-on-surface-variant cursor-default'
                        : 'bg-primary text-white hover:opacity-90 active:scale-95'
                    }`}
                  >
                    {bought ? '✓ Purchased' : 'Buy Now — USDC ' + product.price}
                  </button>

                  <div className="border-t border-subtle-ash my-4" />

                  {/* Auth options */}
                  <button className="w-full flex items-center justify-center gap-2 border border-subtle-ash rounded-full py-3 text-sm font-medium hover:bg-marketplace-gray transition-all mb-3">
                    <SiGoogle size={14} />
                    Sign in with Google to purchase
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-full py-3 text-sm font-semibold hover:opacity-90 transition-all mb-4">
                    Connect Wallet
                  </button>

                  {/* Linq NGN onramp */}
                  <div className="bg-marketplace-gray rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-creator-pink text-primary text-[10px] font-bold px-2.5 py-1 rounded-full">
                        Pay with NGN
                      </span>
                      <HiOutlineLightningBolt size={14} className="text-creator-pink" />
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Convert your naira to USDC instantly via Linq. No crypto wallet required.
                    </p>
                  </div>

                  <div className="border-t border-subtle-ash my-4" />

                  {/* Creator mini-card */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-marketplace-gray flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                      {product.creator.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary truncate">{product.creator}</p>
                      <p className="text-xs text-on-surface-variant">{product.sales} products sold</p>
                    </div>
                    <a href="#" className="text-xs text-primary font-semibold underline whitespace-nowrap">
                      View store →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── More from creator ── */}
          <section className="mt-16">
            <h2 className="text-subheading font-semibold text-primary mb-6">
              You might also like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
