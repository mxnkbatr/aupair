import './PullIndicator.css'

export default function PullIndicator({ pull, refreshing, ready }) {
  const height = refreshing ? 52 : pull
  if (!height) return null
  return (
    <div className="ptr" style={{ height }} aria-live="polite">
      <span
        className={`ptr__spinner${refreshing ? ' is-spinning' : ''}${ready ? ' is-ready' : ''}`}
        style={refreshing ? undefined : { transform: `rotate(${pull * 3}deg)`, opacity: Math.min(1, pull / 50) }}
      />
      {refreshing && <span className="ptr__label">Шинэчилж байна</span>}
    </div>
  )
}
