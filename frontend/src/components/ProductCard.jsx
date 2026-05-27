import { Link } from 'react-router-dom'
import { FiShoppingCart } from 'react-icons/fi'

/**
 * ProductCard — used on Discover page and carousels.
 *
 * Props:
 *  id, title, creator, price, type, thumbnail, badge
 */
export default function ProductCard({ id = '1', title, creator, price, type, thumbnail }) {
  return (
    <div className="card overflow-hidden group cursor-pointer">
      {/* Thumbnail */}
      <Link to={`/product/${id}`}>
        <div className="aspect-video relative overflow-hidden bg-marketplace-gray">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-on-surface-variant text-xs uppercase tracking-widest">
                {type || 'Product'}
              </span>
            </div>
          )}

          {/* Type badge */}
          {type && (
            <span className="absolute top-3 left-3 bg-primary/90 text-white text-[10px] font-semibold uppercase px-2.5 py-1 rounded">
              {type}
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="p-5">
        <p className="text-xs text-on-surface-variant mb-1 font-medium">by {creator}</p>
        <Link to={`/product/${id}`}>
          <h3 className="text-[16px] font-semibold text-primary line-clamp-2 mb-4 leading-snug hover:underline">
            {title}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold mb-0.5">
              Price
            </p>
            <p className="text-[16px] font-bold text-primary">USDC {price}</p>
          </div>
          <Link to={`/product/${id}`}>
            <button className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all">
              <FiShoppingCart size={14} />
              Buy
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
