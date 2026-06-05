import { useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import {
  FiCheck, FiDownload, FiFileText, FiPackage, FiUsers,
  FiChevronRight, FiShare2, FiLink,
} from 'react-icons/fi'
import { useCurrentAccount } from '@mysten/dapp-kit-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import GeneratedThumbnail from '../components/GeneratedThumbnail'
import { useProductById, useProducts } from '../hooks/useProducts'
import { useReceipts } from '../hooks/useReceipts'
import { useBuy } from '../hooks/useBuy'

const WALRUS_AGGREGATOR = import.meta.env.VITE_WALRUS_AGGREGATOR

export default function ProductDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const affiliateRef = searchParams.get('ref') || null

  const { data: product, isLoading } = useProductById(id)
  const { data: receipts } = useReceipts()
  const { buy, isPending: buying, error: buyError } = useBuy()
  const { products: allProducts } = useProducts()
  const account = useCurrentAccount()
  const [shareCopied, setShareCopied] = useState(false)
  const [affiliateCopied, setAffiliateCopied] = useState(false)

  const hasReceipt = receipts?.some((r) => r.productId === id)
  const related = (allProducts || []).filter((p) => p.id !== id).slice(0, 3)
  const isCreator = account && product && account.address === product.creator
  const thumbnailUrl = product?.thumbnailBlobId
    ? `${WALRUS_AGGREGATOR}/v1/blobs/${product.thumbnailBlobId}`
    : null

  function handleShare() {
    navigator.clipboard.writeText(`${window.location.origin}/product/${id}`)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  function handleCopyAffiliateLink() {
    navigator.clipboard.writeText(`${window.location.origin}/product/${id}?ref=${account.address}`)
    setAffiliateCopied(true)
    setTimeout(() => setAffiliateCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar />
        <main className="pt-20 pb-8 container-site">
          <div className="aspect-video skeleton rounded-lg mb-6" />
          <div className="h-8 skeleton rounded w-2/3 mb-4" />
          <div className="h-4 skeleton rounded w-1/3" />
        </main>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar />
        <main className="pt-20 pb-8 container-site text-center py-24">
          <h2 className="text-subheading font-semibold text-primary mb-2">Product not found</h2>
          <Link to="/discover" className="btn-primary mt-4 inline-block">Browse products</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      <main className="pt-20 pb-8">
        <div className="container-site">
          <nav className="flex items-center gap-1 text-xs text-on-surface-variant mb-8 font-medium">
            <Link to="/discover" className="hover:text-primary transition-colors">Discover</Link>
            <FiChevronRight size={12} />
            <span className="text-primary line-clamp-1 max-w-[200px]">{product.title}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1 min-w-0">
              <div className="aspect-video rounded-lg overflow-hidden bg-marketplace-gray mb-6 border border-subtle-ash">
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <GeneratedThumbnail id={product.id} title={product.title} type={product.type} />
                )}
              </div>

              <div>
                <h2 className="text-subheading font-semibold text-primary mb-4">About this product</h2>
                <p className="text-body-md text-on-surface-variant mb-4 leading-relaxed">{product.description}</p>
                <p className="text-body-md text-on-surface-variant mb-4 leading-relaxed">
                  All files are encrypted and stored permanently on Walrus decentralised storage,
                  secured by the Sui blockchain. Once you purchase, your access is yours forever.
                </p>
                <p className="text-body-md text-on-surface-variant mb-8 leading-relaxed">
                  Payments are processed in USDC with instant settlement.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: FiFileText, label: 'Digital Product' },
                    { icon: FiPackage, label: 'Instant Download' },
                    { icon: FiDownload, label: 'Unlimited Access' },
                    { icon: FiUsers, label: `${product.totalSales} sales` },
                  ].map(({ icon: Icon, label }) => (
                    <span key={label} className="flex items-center gap-1.5 bg-marketplace-gray text-on-surface text-xs font-semibold px-3 py-2 rounded-full">
                      <Icon size={12} /> {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[380px] flex-shrink-0">
              <div className="sticky top-24">
                <div className="card p-6 mb-4">
                  <div className="mb-4">
                    <p className="text-headline-lg font-bold text-primary">USDC {product.price.toFixed(2)}</p>
                    <p className="text-xs text-on-surface-variant mt-1">One-time payment. Yours forever.</p>
                  </div>

                  {/* affiliate ref banner */}
                  {affiliateRef && !isCreator && (
                    <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 mb-4">
                      <FiLink size={12} className="text-primary flex-shrink-0" />
                      <p className="text-xs text-primary font-medium">
                        Referred by {affiliateRef.slice(0, 6)}...{affiliateRef.slice(-4)}
                      </p>
                    </div>
                  )}

                  {hasReceipt ? (
                    <Link
                      to="/library"
                      className="flex items-center justify-center gap-2 w-full h-[52px] rounded-full font-semibold text-sm transition-all bg-marketplace-gray text-on-surface-variant"
                    >
                      <FiCheck size={16} /> Owned — Open in Library
                    </Link>
                  ) : isCreator ? (
                    <div className="w-full h-[52px] rounded-full font-semibold text-sm flex items-center justify-center bg-marketplace-gray text-on-surface-variant">
                      You own this product
                    </div>
                  ) : !account ? (
                    <p className="text-xs text-on-surface-variant text-center py-3">Connect your wallet to purchase</p>
                  ) : (
                    <>
                      <button
                        onClick={() => buy(product.id, product.priceUsdc, affiliateRef)}
                        disabled={buying}
                        className="w-full h-[52px] rounded-full font-semibold text-sm transition-all mb-3 bg-primary text-white hover:opacity-90 active:scale-95 disabled:opacity-50"
                      >
                        {buying ? 'Confirming...' : `Buy Now — USDC ${product.price.toFixed(2)}`}
                      </button>
                      {buyError && <p className="text-xs text-error text-center mb-2">{buyError}</p>}
                    </>
                  )}

                  {/* share + affiliate buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-full text-xs font-semibold border border-subtle-ash text-on-surface-variant hover:bg-marketplace-gray transition-all"
                    >
                      <FiShare2 size={12} />
                      {shareCopied ? 'Copied!' : 'Share'}
                    </button>
                    {account && !isCreator && product.affiliateBps > 0 && (
                      <button
                        onClick={handleCopyAffiliateLink}
                        className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-full text-xs font-semibold border border-primary/30 text-primary hover:bg-primary/5 transition-all"
                      >
                        <FiLink size={12} />
                        {affiliateCopied ? 'Copied!' : `Earn ${product.affiliateBps / 100}%`}
                      </button>
                    )}
                  </div>

                  <div className="border-t border-subtle-ash my-4" />

                  <Link to={`/creator/${product.creator}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-marketplace-gray flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                      {product.creator?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary truncate">
                        {product.creator?.slice(0, 6)}...{product.creator?.slice(-4)}
                      </p>
                      <p className="text-xs text-on-surface-variant">{product.totalSales} products sold</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="text-subheading font-semibold text-primary mb-6">You might also like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((p) => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
