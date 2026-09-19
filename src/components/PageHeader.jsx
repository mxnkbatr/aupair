import './PageHeader.css'

export default function PageHeader({ eyebrow, title, text, right }) {
  return (
    <header className="page-header fade-up">
      <div className="page-header__row">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {text && <p>{text}</p>}
        </div>
        {right && <div className="page-header__right">{right}</div>}
      </div>
    </header>
  )
}
