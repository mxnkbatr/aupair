import { Drawer } from 'vaul'
import './Sheet.css'

/**
 * Bottom sheet built on vaul (native-feeling drag, snap-back, velocity dismiss).
 * API unchanged: { open, onClose, title, children }.
 */
export default function Sheet({ open, onClose, title, children }) {
  return (
    <Drawer.Root
      open={Boolean(open)}
      onOpenChange={(next) => {
        if (!next) onClose?.()
      }}
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="sheet__backdrop" />
        <Drawer.Content className="sheet__panel" aria-describedby={undefined}>
          <div className="sheet__handle" aria-hidden />
          <div className="sheet__head">
            <Drawer.Title asChild>
              <h3>{title}</h3>
            </Drawer.Title>
            <button type="button" className="sheet__close" onClick={() => onClose?.()} aria-label="Хаах">
              <span className="sheet__close-circle" aria-hidden>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                  <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </button>
          </div>
          <div className="sheet__body">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
