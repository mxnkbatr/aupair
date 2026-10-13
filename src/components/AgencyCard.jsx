import { org, social } from '../data'
import './AgencyCard.css'

/** Official Mongolian Au Pair agency block for Profile / Contact. */
export default function AgencyCard({ compact = false }) {
  return (
    <section className={`agency-card${compact ? ' agency-card--compact' : ''}`} aria-label="Байгууллагын мэдээлэл">
      <div className="agency-card__head">
        <img src="/logo.png" alt="" width={48} height={48} />
        <div>
          <p className="agency-card__kicker">Албан ёсны агентлаг</p>
          <strong>{org.legalName}</strong>
          <span>{org.tagline}</span>
        </div>
      </div>

      {!compact ? <p className="agency-card__about">{org.aboutShort}</p> : null}

      <ul className="agency-card__stats">
        <li>
          <strong>{org.years}</strong>
          <span>жил</span>
        </li>
        <li>
          <strong>{org.placed}</strong>
          <span>оролцогч</span>
        </li>
        <li>
          <strong>{org.partnerCountries}</strong>
          <span>улс</span>
        </li>
        <li>
          <strong>IAPA</strong>
          <span>гишүүн</span>
        </li>
      </ul>

      <div className="agency-card__certs">
        {org.certifications.map((c) => (
          <span key={c.id} className="agency-card__pill">
            {c.short}
          </span>
        ))}
        <span className="agency-card__pill">Since {org.since}</span>
      </div>

      {!compact ? (
        <div className="agency-card__contact">
          <a href={`tel:${social.phoneTel}`}>{social.phone}</a>
          <a href={`mailto:${social.email}`}>{social.email}</a>
          <a href={org.website} target="_blank" rel="noreferrer">
            mongolianaupair.com
          </a>
          <p>{social.address}</p>
        </div>
      ) : null}
    </section>
  )
}
