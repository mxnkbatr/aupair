import { Link } from 'react-router-dom'
import { CaretRight, Phone, SealCheck } from '@phosphor-icons/react'
import { org, social } from '../data'
import Pressable from '../components/Pressable'
import './About.css'

export default function About() {
  return (
    <div className="about">
      <header className="about-hero container">
        <img src="/logo.png" alt="" className="about-hero__logo" width={64} height={64} />
        <h1>{org.name}</h1>
        <p>2005 оноос · Au Pair агентлаг</p>
      </header>

      <section className="about-stats container" aria-label="Тоо">
        <div>
          <strong>{org.years}</strong>
          <span>жил</span>
        </div>
        <div>
          <strong>{org.placed}</strong>
          <span>оролцогч</span>
        </div>
        <div>
          <strong>{org.partnerCountries}</strong>
          <span>улс</span>
        </div>
      </section>

      <section className="about-group container">
        <h2 className="about-group__title">Товч</h2>
        <div className="about-group__card">
          <p>
            Европын Au Pair, хэлний бэлтгэл, визийн зөвлөгөөг нэг дороос үзүүлнэ.
          </p>
        </div>
      </section>

      <section className="about-group container">
        <h2 className="about-group__title">Үнэт зүйл</h2>
        <ul className="about-group__list">
          {(org.values || []).map((v, i) => (
            <li key={v.id}>
              <strong>{v.title}</strong>
              <span>{v.text}</span>
              {i < (org.values?.length || 0) - 1 ? <i aria-hidden /> : null}
            </li>
          ))}
        </ul>
      </section>

      {(org.certifications || []).length > 0 ? (
        <section className="about-group container">
          <h2 className="about-group__title">Баталгаа</h2>
          <ul className="about-group__list">
            {org.certifications.map((c) => (
              <li key={c.id} className="about-cert">
                <SealCheck weight="fill" size={22} aria-hidden />
                <div>
                  <strong>{c.name}</strong>
                  <span>{c.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="about-group container">
        <h2 className="about-group__title">Холбоо</h2>
        <ul className="about-group__list">
          <li>
            <a href={`tel:${social.phoneTel}`} className="about-link">
              <Phone weight="fill" size={18} aria-hidden />
              <span>{social.phone}</span>
              <CaretRight size={14} weight="bold" aria-hidden />
            </a>
          </li>
          <li>
            <Pressable as={Link} to="/me/help" className="about-link">
              <span className="about-link__grow">Тусламж бичих</span>
              <CaretRight size={14} weight="bold" aria-hidden />
            </Pressable>
          </li>
        </ul>
      </section>
    </div>
  )
}
