import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth'
import { STATUS_LABELS } from '../data'
import { DOC_STATUS_LABELS, PROGRAM_STAGES } from '../data/program'
import useMyData from './useMyData'

const READ_KEY = 'aupair-notif-read'

function loadRead() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

function saveRead(ids) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...ids].slice(0, 80)))
  } catch {
    // ignore
  }
}

function relativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'саяхан'
  if (mins < 60) return `${mins} мин`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} цаг`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} өдөр`
  return new Date(iso).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })
}

/** In-app notification feed derived from enrollments / program status. */
export default function useNotifications() {
  const { user } = useAuth()
  const data = useMyData()
  const [readIds, setReadIds] = useState(loadRead)

  useEffect(() => {
    const onStorage = () => setReadIds(loadRead())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const items = useMemo(() => {
    const list = []
    const enrollments = data?.enrollments || []

    if (!user) {
      list.push({
        id: 'guest-welcome',
        title: 'Au Pair Mongolia-д тавтай морил',
        text: 'Бүртгүүлээд элсэлт, аяллын явцаа утаснаасаа хянаарай.',
        at: null,
        kind: 'tip',
        to: '/me',
        state: { auth: 'register' },
      })
      return list
    }

    if (user.inProgram) {
      const stage = PROGRAM_STAGES.find((s) => s.id === user.programStage) || PROGRAM_STAGES[0]
      list.push({
        id: `program-stage-${user.programStage}`,
        title: `Хөтөлбөр · ${stage.label}`,
        text: stage.hint || 'Миний аяллыг шалгаарай.',
        at: user.programEnrolledAt || user.createdAt,
        kind: 'program',
        to: '/me/program',
      })
      if (user.programNote) {
        list.push({
          id: `program-note-${String(user.programNote).slice(0, 24)}`,
          title: 'Админ тэмдэглэл',
          text: user.programNote,
          at: user.updatedAt || user.createdAt,
          kind: 'program',
          to: '/me/program',
        })
      }
      const rejected = (user.programChecklist || []).filter((d) => d.status === 'rejected')
      for (const doc of rejected.slice(0, 3)) {
        list.push({
          id: `doc-rej-${doc.key}-${doc.updatedAt || ''}`,
          title: `${doc.label} · ${DOC_STATUS_LABELS.rejected}`,
          text: doc.adminNote || 'Засварлаад дахин илгээнэ үү.',
          at: doc.updatedAt,
          kind: 'docs',
          to: '/me/program',
        })
      }
      const submitted = (user.programChecklist || []).filter((d) => d.status === 'submitted')
      if (submitted.length) {
        list.push({
          id: `doc-wait-${submitted.length}`,
          title: `${submitted.length} баримт шалгагдаж байна`,
          text: 'Админ хариу өгөхөд энд харагдана.',
          at: submitted[0]?.updatedAt,
          kind: 'docs',
          to: '/me/program',
        })
      }
    }

    for (const n of data?.notifications || []) {
      list.push({
        id: `admin-${n.id}`,
        title: n.title || 'Мэдэгдэл',
        text: n.body || '',
        at: n.createdAt,
        kind: 'admin',
        to: n.url || '/news',
      })
    }

    for (const e of enrollments.slice(0, 4)) {
      const status = STATUS_LABELS.enrollments[e.status] || e.status
      list.push({
        id: `enroll-${e.id}-${e.status}`,
        title: e.courseTitle || 'Элсэлт',
        text: `Төлөв: ${status}`,
        at: e.updatedAt || e.createdAt,
        kind: 'enroll',
        to: '/me',
      })
    }

    for (const g of data?.classGroups || []) {
      const sched = g.schedule
      if (!sched?.time || !sched.weekdays?.length) continue
      const days = (sched.weekdays || [])
        .map((d) => ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'][d])
        .join(', ')
      const isAuPair = g.kind === 'country'
      list.push({
        id: `class-${g.courseId}-${sched.time}`,
        title: isAuPair ? `${g.courseTitle} · уулзалт` : `${g.courseTitle} · хичээл`,
        text: `${days} · ${sched.time}${sched.room ? ` · ${sched.room}` : ''}`,
        at: g.updatedAt,
        kind: 'class',
        to: isAuPair ? '/countries' : '/learn?tab=schedule',
      })
    }

    if (!list.length) {
      list.push({
        id: 'empty-tip',
        title: 'Шинэ мэдэгдэл алга',
        text: 'Элсэлт эсвэл хөтөлбөрийн явц өөрчлөгдөхөд энд гарна.',
        at: null,
        kind: 'tip',
        to: '/learn',
      })
    }

    return list
      .map((n) => ({
        ...n,
        unread: !readIds.has(n.id),
        when: relativeTime(n.at),
      }))
      .sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')))
  }, [user, data, readIds])

  const unread = items.filter((n) => n.unread && n.id !== 'empty-tip' && n.id !== 'guest-welcome').length

  const markRead = useCallback((id) => {
    setReadIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      saveRead(next)
      return next
    })
  }, [])

  const markAllRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev)
      for (const n of items) next.add(n.id)
      saveRead(next)
      return next
    })
  }, [items])

  return { items, unread, markRead, markAllRead }
}
