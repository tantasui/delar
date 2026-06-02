import { useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiPackage, FiUsers } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../hooks/useProducts'

export default function CreatorProfilePage() {
  const { address } = useParams()
  const { products, isLoading } = useProducts()

  const creatorProducts = (products || []).filter((p) => p.creator === address && p.isActive)
  const totalSales = creatorProducts.reduce((s, p) => s + p.totalSales, 0)
  const initials = address ? address.slice(2, 4).toUpperCase() : '??'

  // deterministic avatar color from address
  let hue = 0
  for (let i = 0; i < (address?.length || 0); i++) {
    hue = (Math.imul(31, hue) + address.charCodeAt(i)) | 0
  }
  hue = Math.abs(hue) % 360

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      <main className="pt-20 pb-16">
        <div className="container-site">
          <Link to="/discover" className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors mb-8">
            <FiArrowLeft size={14} /> Back to Discover
          </Link>

          {/* creator header */}
          <div className="flex flex-col items-center text-center py-10 mb-10 border-b border-subtle-ash">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4 flex-shrink-0"
              style={{ background: `linear-gradient(135deg, hsl(${hue},60%,55%), hsl(${(hue+40)%360},70%,40%))` }}
            >
              {initials}
            </div>
            <p className="font-mono text-xs text-on-surface-variant mb-1 select-all">{address}</p>
            <h1 className="text-subheading font-bold text-primary mb-6">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </h1>
            <div className="flex gap-10">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <FiPackage size={14} className="text-on-surface-variant" />
                  <p className="text-xl font-bold text-primary">{creatorProducts.length}</p>
                </div>
                <p className="text-xs text-on-surface-variant">Products</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <FiUsers size={14} className="text-on-surface-variant" />
                  <p className="text-xl font-bold text-primary">{totalSales}</p>
                </div>
                <p className="text-xs text-on-surface-variant">Total sales</p>
              </div>
            </div>
          </div>

          {/* products grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="aspect-video skeleton" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 skeleton rounded w-1/3" />
                    <div className="h-4 skeleton rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : creatorProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-subheading text-on-surface-variant mb-2">No products yet</p>
              <p className="text-sm text-on-surface-variant">This creator hasn't published anything.</p>
            </div>
          ) : (
            <>
              <h2 className="text-subheading font-semibold text-primary mb-6">Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {creatorProducts.map((p) => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
