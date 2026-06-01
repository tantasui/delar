import { Link } from 'react-router-dom'
import { FiShoppingCart } from 'react-icons/fi'

const TYPE_LABELS = ['Ebook', 'Course', 'Template', 'Coaching', 'Software', 'Other']

export default function ProductCard({ id, title, creator, price, type, thumbnail }) {
  const typeLabel = typeof type === 'number' ? (TYPE_LABELS[type] || 'Product') : (type || 'Product')
  const displayPrice = typeof price === 'number' ? price.toFixed(2) : price
  const displayCreator = creator?.length > 20
    ? `${creator.slice(0, 6)}...${creator.slice(-4)}`
    : creator

  return (
    <div className="card overflow-hidden group cursor-pointer">
      <Link to={`/product/${id}`}>
        <div className="aspect-video relative overflow-hidden bg-marketplace-gray">
          {thumbnail ? (
            <img src={thumbnail} alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-on-surface-variant text-xs uppercase tracking-widest">{typeLabel}</span>
            </div>
          )}
          <span className="absolute top-3 left-3 bg-primary/90 text-white text-[10px] font-semibold uppercase px-2.5 py-1 rounded">
            {typeLabel}
          </span>
        </div>
      </Link>

      <div className="p-5">
        <p className="text-xs text-on-surface-variant mb-1 font-medium">by {displayCreator}</p>
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
