import { Link } from 'react-router-dom'
import { FiShoppingCart } from 'react-icons/fi'
import GeneratedThumbnail from './GeneratedThumbnail'

const WALRUS_AGGREGATOR = import.meta.env.VITE_WALRUS_AGGREGATOR
const TYPE_LABELS = ['Ebook', 'Course', 'Template', 'Coaching', 'Software', 'Other']

export default function ProductCard({ id, title, creator, price, type, thumbnailBlobId }) {
  const typeLabel = typeof type === 'number' ? (TYPE_LABELS[type] || 'Product') : (type || 'Product')
  const displayPrice = typeof price === 'number' ? price.toFixed(2) : price
  const displayCreator = creator ? `${creator.slice(0, 6)}...${creator.slice(-4)}` : ''
  const thumbnailUrl = thumbnailBlobId ? `${WALRUS_AGGREGATOR}/v1/blobs/${thumbnailBlobId}` : null

  return (
    <div className="card overflow-hidden group cursor-pointer">
      <Link to={`/product/${id}`}>
        <div className="aspect-video relative overflow-hidden bg-marketplace-gray">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <GeneratedThumbnail id={id} title={title} type={type} />
          )}
          <span className="absolute top-3 left-3 bg-primary/90 text-white text-[10px] font-semibold uppercase px-2.5 py-1 rounded">
            {typeLabel}
          </span>
        </div>
      </Link>

      <div className="p-5">
        <Link
          to={`/creator/${creator}`}
          className="text-xs text-on-surface-variant mb-1 font-medium hover:text-primary transition-colors block"
        >
          by {displayCreator}
        </Link>
        <Link to={`/product/${id}`}>
          <h3 className="text-[16px] font-semibold text-primary line-clamp-2 mb-4 leading-snug hover:underline">
            {title}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold mb-0.5">Price</p>
            <p className="text-[16px] font-bold text-primary">USDC {displayPrice}</p>
          </div>
          <Link to={`/product/${id}`}>
            <button className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all">
              <FiShoppingCart size={14} /> Buy
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
