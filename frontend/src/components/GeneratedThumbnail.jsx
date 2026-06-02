const TYPE_LABELS = ['Ebook', 'Course', 'Template', 'Coaching', 'Software', 'Other']

function hashId(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export default function GeneratedThumbnail({ id, title, type }) {
  const typeLabel = TYPE_LABELS[type] ?? 'Product'
  const h = hashId(id || title)
  const hue1 = h % 360
  const hue2 = (hue1 + 45) % 360
  const sat = 55 + (h % 20)

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, hsl(${hue1},${sat}%,52%), hsl(${hue2},${sat + 10}%,38%))` }}
    >
      <span className="absolute -bottom-3 -right-3 text-white/20 font-black select-none leading-none"
        style={{ fontSize: '96px' }}>
        D
      </span>
      <span className="relative z-10 text-white text-[10px] font-bold uppercase tracking-widest mb-2 bg-white/20 px-3 py-1 rounded-full">
        {typeLabel}
      </span>
      <p className="relative z-10 text-white text-sm font-semibold text-center px-6 line-clamp-2 leading-snug">
        {title}
      </p>
    </div>
  )
}
