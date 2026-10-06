import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  useNavigationType,
  Navigate,
} from 'react-router-dom'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Capacitor } from '@capacitor/core'
import AppHeader from './components/AppHeader'
import BottomNav from './components/BottomNav'
import Footer from './components/Footer'
import OfflineBanner from './components/OfflineBanner'
import Onboarding from './components/Onboarding'
import PullIndicator from './components/PullIndicator'
import usePullToRefresh from './hooks/usePullToRefresh'
import useSwipeBack from './hooks/useSwipeBack'
import { reloadIfUpdated } from './native'
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Universities from './pages/Universities'
import UniversityDetail from './pages/UniversityDetail'
import Videos from './pages/Videos'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Profile from './pages/Profile'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Admin from './pages/Admin'
import { AuthProvider, useAuth } from './auth'
import './theme.css'

const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter

const TITLES = {
  '/': 'Au Pair',
  '/courses': 'Хөтөлбөр',
  '/universities': 'Улс орнууд',
  '/videos': 'Бичлэг',
  '/shop': 'Дэлгүүр',
  '/profile': 'Профайл',
  '/contact': 'Холбоо барих',
  '/privacy': 'Нууцлал',
  '/admin': 'Админ',
}

const TAB_PATHS = ['/', '/courses', '/universities', '/shop', '/profile']
const REFRESH_PATHS = ['/', '/courses', '/universities', '/shop']
const SWIPE_BACK = Capacitor.isNativePlatform() || import.meta.env.DEV
const scrollPositions = new Map()
let skipNextTransition = false

const canViewTransition = () =>
  typeof document.startViewTransition === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Slide forward/back like a native stack; tab switches fade and keep their scroll.
 * The rendered location lags the URL until the view transition has captured the old page.
 */
function usePageTransition() {
  const location = useLocation()
  const navType = useNavigationType()
  const [shown, setShown] = useState({ location, dir: 'none' })

  useLayoutEffect(() => {
    const prev = shown.location
    if (location.key === prev.key && location.pathname === prev.pathname) return
    if (location.pathname === prev.pathname) {
      setShown({ location, dir: shown.dir })
      return
    }
    if (skipNextTransition) {
      skipNextTransition = false
      setShown({ location, dir: 'back', instant: true })
      return
    }
    const tabSwitch = TAB_PATHS.includes(prev.pathname) && TAB_PATHS.includes(location.pathname)
    const dir = tabSwitch ? 'fade' : navType === 'POP' ? 'back' : 'forward'

    if (!canViewTransition()) {
      setShown({ location, dir })
      return
    }
    const root = document.documentElement
    root.dataset.nav = dir
    const transition = document.startViewTransition(() => {
      flushSync(() => setShown({ location, dir, viewTransition: true }))
    })
    transition.finished.finally(() => {
      if (root.dataset.nav === dir) delete root.dataset.nav
    })
  }, [location, navType, shown])

  return shown
}

function useScrollMemory(pathname, dir) {
  const current = useRef(pathname)

  useEffect(() => {
    const onScroll = () => scrollPositions.set(current.current, window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useLayoutEffect(() => {
    current.current = pathname
    const restore = dir === 'back' || dir === 'fade'
    window.scrollTo({
      top: restore ? scrollPositions.get(pathname) || 0 : 0,
      behavior: 'instant',
    })
  }, [pathname, dir])
}

function AppRoutes({ location }) {
  return (
    <Routes location={location}>
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:id" element={<CourseDetail />} />
      <Route path="/universities" element={<Universities />} />
      <Route path="/universities/:id" element={<UniversityDetail />} />
      <Route path="/videos" element={<Videos />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/shop/:id" element={<ProductDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

/** Locations by history index, so an edge swipe can render the page it returns to. */
function useHistoryEntries() {
  const location = useLocation()
  const entries = useRef([])
  useEffect(() => {
    entries.current[window.history.state?.idx ?? 0] = location
  }, [location])
  return useCallback(() => entries.current[(window.history.state?.idx ?? 0) - 1], [])
}

function AppFrame() {
  const shown = usePageTransition()
  const { pathname } = shown.location
  const dir = shown.dir
  useScrollMemory(pathname, dir)

  const navigate = useNavigate()
  const getBack = useHistoryEntries()
  const pageRef = useRef(null)
  const underRef = useRef(null)
  const [underlay, setUnderlay] = useState(null)

  useSwipeBack({
    enabled: SWIPE_BACK && !TAB_PATHS.includes(pathname),
    canStart: () => Boolean(getBack()),
    pageRef,
    underRef,
    onStart: () => {
      const back = getBack()
      const main = document.querySelector('.site__main')
      const top = main.getBoundingClientRect().top + window.scrollY
      setUnderlay({
        fromKey: shown.location.key,
        location: back,
        offset: top - (scrollPositions.get(back.pathname) || 0),
      })
    },
    onFinish: (done) => {
      if (done) {
        skipNextTransition = true
        navigate(-1)
        return
      }
      setUnderlay(null)
      const page = pageRef.current
      if (page) {
        page.style.transition = ''
        page.style.transform = ''
      }
    },
  })

  const { refresh } = useAuth()
  const onRefresh = useCallback(async () => {
    if (await reloadIfUpdated()) return
    await Promise.all([refresh().catch(() => null), new Promise((r) => setTimeout(r, 600))])
    window.dispatchEvent(new Event('app:refresh'))
  }, [refresh])
  const ptr = usePullToRefresh(onRefresh, REFRESH_PATHS.includes(pathname))

  const title =
    TITLES[pathname] ||
    (pathname.startsWith('/courses/')
      ? 'Хөтөлбөр'
      : pathname.startsWith('/shop/')
        ? 'Дэлгүүр'
        : pathname.startsWith('/universities/')
          ? 'Улс орнууд'
          : 'Au Pair')
  const isHome = pathname === '/'

  return (
    <div className="site">
      <AppHeader title={title} showBrand={isHome} />
      <OfflineBanner />
      <main className="site__main">
        <div
          key={pathname}
          ref={pageRef}
          className={`page page--${shown.viewTransition || shown.instant ? 'none' : dir}`}
        >
          <PullIndicator {...ptr} />
          <AppRoutes location={shown.location} />
        </div>
      </main>
      {underlay?.fromKey === shown.location.key && (
        <div className="swipe-under" ref={underRef} aria-hidden>
          <div className="page" style={{ transform: `translateY(${underlay.offset}px)` }}>
            <AppRoutes location={underlay.location} />
          </div>
        </div>
      )}
      <Footer />
      <BottomNav />
      <Onboarding />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppFrame />
      </Router>
    </AuthProvider>
  )
}
