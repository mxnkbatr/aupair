import './Skeleton.css'

/** Shimmer placeholder. Size via props or className. */
export default function Skeleton({ w = '100%', h = 14, r = 12, className = '', style }) {
  return (
    <span
      className={`sk ${className}`}
      aria-hidden
      style={{ width: w, height: h, borderRadius: r, ...style }}
    />
  )
}

/** Horizontal row of card skeletons (carousels). */
export function SkeletonRow({ count = 3, w = 220, h = 150 }) {
  return (
    <div className="sk-row" aria-label="Ачаалж байна" role="status">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} w={w} h={h} r={20} />
      ))}
    </div>
  )
}

/** Vertical list of card skeletons. */
export function SkeletonList({ count = 3, h = 120 }) {
  return (
    <div className="sk-list" aria-label="Ачаалж байна" role="status">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="sk-card">
          <Skeleton w="38%" h={12} />
          <Skeleton w="82%" h={18} />
          <Skeleton w="60%" h={12} />
          <Skeleton w="100%" h={Math.max(24, h - 80)} r={14} />
        </div>
      ))}
    </div>
  )
}
