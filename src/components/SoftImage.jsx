import { useEffect, useState } from 'react'
import './SoftImage.css'

/** Image with skeleton shimmer until loaded (card media). */
export default function SoftImage({
  src,
  alt = '',
  className = '',
  fallback = '/cover.jpg',
  onError,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false)
  const [current, setCurrent] = useState(src || fallback)

  useEffect(() => {
    setLoaded(false)
    setCurrent(src || fallback)
  }, [src, fallback])

  return (
    <span className={`soft-img${loaded ? ' is-loaded' : ''}${className ? ` ${className}` : ''}`}>
      {!loaded ? <span className="soft-img__skel" aria-hidden /> : null}
      <img
        src={current}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          if (current !== fallback) {
            setLoaded(false)
            setCurrent(fallback)
          } else {
            setLoaded(true)
          }
          onError?.(e)
        }}
        {...rest}
      />
    </span>
  )
}
