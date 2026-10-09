import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { GERMAN_LEVEL_LABELS, INTEREST_LABELS, STATUS_LABELS } from '../data'
import PageHeader from '../components/PageHeader'
import './Admin.css'

const KEY_STORAGE = 'aupair-admin-key'

const TABS = [
  { id: 'enrollments', label: 'Элсэлт' },
  { id: 'contacts', label: 'Хүсэлт' },
  { id: 'orders', label: 'Захиалга' },
  { id: 'users', label: 'Хэрэглэгч' },
]

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function rowsFor(tab, items) {
  if (tab === 'users') {
    return items.map((u) => ({
      Код: u.id,
      Бүртгүүлсэн: formatDate(u.createdAt),
      Нэр: u.name,
      Утас: u.phone,
      Имэйл: u.email,
      Нас: u.age ?? '',
      'Герман хэл': GERMAN_LEVEL_LABELS[u.germanLevel] || '',
    }))
  }
  if (tab === 'enrollments') {
    return items.map((e) => ({
      Код: e.id,
      Огноо: formatDate(e.createdAt),
      Хөтөлбөр: e.courseTitle,
      Нэр: e.name,
      Утас: e.phone,
      Имэйл: e.email,
      Нас: e.age,
      'Герман хэл': GERMAN_LEVEL_LABELS[e.germanLevel] || '',
      Тэмдэглэл: e.note,
      Төлөв: STATUS_LABELS.enrollments[e.status] || e.status,
    }))
  }
  if (tab === 'contacts') {
    return items.map((c) => ({
      Код: c.id,
      Огноо: formatDate(c.createdAt),
      Нэр: c.name,
      Утас: c.phone,
      Сэдэв: INTEREST_LABELS[c.interest] || c.interest,
      Зурвас: c.message,
      Төлөв: STATUS_LABELS.contacts[c.status] || c.status,
    }))
  }
  return items.map((o) => ({
    Код: o.id,
    Огноо: formatDate(o.createdAt),
    Нэр: o.name,
    Утас: o.phone,
    Бараа: (o.items || []).map((i) => i.name).join('; '),
    Төлөв: STATUS_LABELS.orders[o.status] || o.status,
  }))
}

function downloadCsv(tab, items) {
  const rows = rowsFor(tab, items)
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [headers, ...rows.map((r) => headers.map((h) => r[h]))]
    .map((line) => line.map(escape).join(','))
    .join('\r\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `aupair-${tab}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function Login({ onLogin, error, loading }) {
  const [key, setKey] = useState('')
  return (
    <form
      className="admin-login"
      onSubmit={(e) => {
        e.preventDefault()
        onLogin(key)
      }}
    >
      <label className="field">
        <span>Админ нууц үг</span>
        <input
          type="password"
          required
          autoFocus
          value={key}
          onChange={(e) => setKey(e.target.value)}
          autoComplete="current-password"
        />
      </label>
      {error && <div className="alert alert-err">{error}</div>}
      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Шалгаж байна...' : 'Нэвтрэх'}
      </button>
    </form>
  )
}

function ItemDetails({ tab, item }) {
  if (tab === 'users') {
    return (
      <>
        <span>
          Нас: {item.age ?? '—'} · Герман хэл: {GERMAN_LEVEL_LABELS[item.germanLevel] || '—'}
        </span>
        {item.email && <a href={`mailto:${item.email}`}>{item.email}</a>}
      </>
    )
  }
  if (tab === 'enrollments') {
    return (
      <>
        <strong className="admin-item__title">{item.courseTitle}</strong>
        <span>
          Нас: {item.age ?? '—'} · Герман хэл: {GERMAN_LEVEL_LABELS[item.germanLevel] || '—'}
        </span>
        {item.email && <a href={`mailto:${item.email}`}>{item.email}</a>}
        {item.note && <p>{item.note}</p>}
      </>
    )
  }
  if (tab === 'contacts') {
    return (
      <>
        <strong className="admin-item__title">
          {INTEREST_LABELS[item.interest] || item.interest}
        </strong>
        {item.message && <p>{item.message}</p>}
      </>
    )
  }
  return (
    <>
      <strong className="admin-item__title">{(item.items || []).length} бараа</strong>
      <ul>
        {(item.items || []).map((i, idx) => (
          <li key={`${i.id}-${idx}`}>{i.name}</li>
        ))}
      </ul>
    </>
  )
}

export default function Admin() {
  const [key, setKey] = useState(() => sessionStorage.getItem(KEY_STORAGE) || '')
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('enrollments')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (adminKey) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.adminData(adminKey)
      sessionStorage.setItem(KEY_STORAGE, adminKey)
      setKey(adminKey)
      setData(res)
    } catch (err) {
      if (err.status === 401 || err.status === 503) {
        sessionStorage.removeItem(KEY_STORAGE)
        setKey('')
        setData(null)
      }
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const saved = sessionStorage.getItem(KEY_STORAGE)
    if (saved) load(saved)
  }, [load])

  async function changeStatus(item, status) {
    try {
      const res = await api.adminSetStatus(key, tab, item.id, status)
      setData((d) => ({
        ...d,
        [tab]: d[tab].map((x) => (x.id === item.id ? res.item : x)),
      }))
    } catch (err) {
      setError(err.message)
    }
  }

  function logout() {
    sessionStorage.removeItem(KEY_STORAGE)
    setKey('')
    setData(null)
  }

  const items = useMemo(() => {
    const list = data?.[tab] || []
    return statusFilter === 'all' ? list : list.filter((x) => x.status === statusFilter)
  }, [data, tab, statusFilter])

  if (!data) {
    return (
      <div className="admin-page">
        <div className="container">
          <PageHeader title="Админ" text="Элсэлт, хүсэлт, захиалгыг удирдах" />
          <Login onLogin={load} error={error} loading={loading} />
        </div>
      </div>
    )
  }

  const labels = STATUS_LABELS[tab] || null

  return (
    <div className="admin-page">
      <div className="container">
        <PageHeader
          title="Админ"
          text="Элсэлт, хүсэлт, захиалгыг удирдах"
          right={
            <div className="admin-actions">
              <button type="button" className="btn btn-ghost" onClick={() => load(key)}>
                {loading ? '...' : 'Шинэчлэх'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={logout}>
                Гарах
              </button>
            </div>
          }
        />

        <div className="admin-tabs" role="tablist">
          {TABS.map((t) => {
            const pending = (data[t.id] || []).filter((x) => x.status === 'pending').length
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`admin-tab${tab === t.id ? ' is-active' : ''}`}
                onClick={() => {
                  setTab(t.id)
                  setStatusFilter('all')
                }}
              >
                {t.label}
                <span>{(data[t.id] || []).length}</span>
                {pending > 0 && <em>{pending} шинэ</em>}
              </button>
            )
          })}
        </div>

        <div className="admin-toolbar">
          {labels && (
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Бүх төлөв</option>
              {Object.entries(labels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            disabled={!items.length}
            onClick={() => downloadCsv(tab, items)}
          >
            CSV татах
          </button>
        </div>

        {error && <div className="alert alert-err">{error}</div>}

        {items.length === 0 ? (
          <p className="admin-empty">Одоогоор бүртгэл алга.</p>
        ) : (
          <ul className="admin-list">
            {items.map((item) => (
              <li key={item.id} className={`admin-item admin-item--${item.status || 'user'}`}>
                <div className="admin-item__head">
                  <div>
                    <strong>{item.name}</strong>
                    <a href={`tel:${item.phone.replace(/\s/g, '')}`}>{item.phone}</a>
                  </div>
                  {labels && (
                    <select
                      value={item.status}
                      onChange={(e) => changeStatus(item, e.target.value)}
                      aria-label="Төлөв"
                    >
                      {Object.entries(labels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="admin-item__body">
                  <ItemDetails tab={tab} item={item} />
                </div>
                <small className="admin-item__meta">
                  {formatDate(item.createdAt)} · {item.id}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
