import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  useNavigationType,
  Navigate,
  generatePath,
  useParams,
} from 'react-router-dom'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { LayoutGroup } from 'motion/react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { Capacitor } from '@capacitor/core'
import AppHeader from './components/AppHeader'
import NavBar from './components/NavBar'
import TabBar, { TAB_PATHS } from './components/TabBar'
import Footer from './components/Footer'
import OfflineBanner from './components/OfflineBanner'
import Onboarding from './components/Onboarding'
import PullIndicator from './components/PullIndicator'
import usePullToRefresh from './hooks/usePullToRefresh'
import useSwipeBack from './hooks/useSwipeBack'
import { haptic, reloadIfUpdated } from './native'
import Home from './pages/Home'
import Learn from './pages/Learn'
import NotFound from './pages/NotFound'
import CourseDetail from './pages/CourseDetail'
import Universities from './pages/Universities'
import UniversityDetail from './pages/UniversityDetail'
import ProductDetail from './pages/ProductDetail'
import Profile from './pages/Profile'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Admin from './pages/Admin'
import { AuthProvider, useAuth } from './auth'
import './theme.css'

const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter

/** Nav bar config per route: tab roots show a compact title on scroll, push screens get a back button. */
function getRouteMeta(pathname) {
  switch (pathname) {
    case '/':
      return { root: true, minimal: true, title: 'Au Pair' }
    case '/learn':
      return { root: true, title: 'Сурах' }
    case '/countries':
      return { root: true, title: 'Улсууд' }
    case '/me':
      return { root: true, title: 'Би' }
    case '/me/help':
      return { title: 'Тусламж', backLabel: 'Би', parent: '/me' }
    case '/privacy':
      return { title: 'Нууцлал', backLabel: 'Би', parent: '/me' }
    case '/admin':
      return { title: 'Админ', backLabel: 'Нүүр', parent: '/' }
    default:
  }
  if (pathname.startsWith('/learn/course/') || pathname.startsWith('/courses/')) {
    return { title: 'Хөтөлбөр', backLabel: 'Сурах', parent: '/learn', transparent: true }
  }
  if (pathname.startsWith('/learn/item/') || pathname.startsWith('/shop/')) {
    return { title: 'Материал', backLabel: 'Сурах', parent: '/learn' }
  }
  if (pathname.startsWith('/countries/') || pathname.startsWith('/universities/')) {
    return { title: 'Улс', backLabel: 'Улсууд', parent: '/countries' }
  }
  // Legacy tab roots while <Navigate> redirects
  if (pathname === '/courses' || pathname === '/shop') return { root: true, title: 'Сурах' }
  if (pathname === '/universities') return { root: true, title: 'Улсууд' }
  if (pathname === '/profile' || pathname === '/stories' || pathname === '/videos') {
    return { root: true, title: 'Би' }
  }
  if (pathname === '/contact') return { title: 'Тусламж', backLabel: 'Би', parent: '/me' }
  return { title: 'Олдсонгүй', backLabel: 'Нүүр', parent: '/' }
}

const REFRESH_PATHS = ['/', '/learn', '/countries']

/** Old URLs keep working: /courses/:id → /learn/course/:id etc. */
function RedirectWithParams({ to }) {
  const params = useParams()
  const { search } = useLocation()
  return <Navigate to={generatePath(to, params) + search} replace />
}
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
      <Route path="/learn" element={<Learn />} />
      <Route path="/learn/course/:id" element={<CourseDetail />} />
      <Route path="/learn/item/:id" element={<ProductDetail />} />
      <Route path="/countries" element={<Universities />} />
      <Route path="/countries/:id" element={<UniversityDetail />} />
      <Route path="/me" element={<Profile />} />
      <Route path="/me/help" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/admin" element={<Admin />} />

      {/* Legacy URLs */}
      <Route path="/courses" element={<Navigate to="/learn" replace />} />
      <Route path="/courses/:id" element={<RedirectWithParams to="/learn/course/:id" />} />
      <Route path="/shop" element={<Navigate to="/learn?tab=materials" replace />} />
      <Route path="/shop/:id" element={<RedirectWithParams to="/learn/item/:id" />} />
      <Route path="/universities" element={<Navigate to="/countries" replace />} />
      <Route path="/universities/:id" element={<RedirectWithParams to="/countries/:id" />} />
      <Route path="/videos" element={<Navigate to="/" replace />} />
      <Route path="/stories" element={<Navigate to="/" replace />} />
      <Route path="/profile" element={<Navigate to="/me" replace />} />
      <Route path="/contact" element={<Navigate to="/me/help" replace />} />

      <Route path="*" element={<NotFound />} />
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

  const meta = getRouteMeta(pathname)
  const isHome = pathname === '/'
  const isPush = !TAB_PATHS.includes(pathname)

  const goBack = useCallback(() => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1)
    else navigate(meta.parent || '/', { replace: true })
  }, [navigate, meta.parent])

  const countriesTrailing =
    pathname === '/countries' ? (
      <button
        type="button"
        className="navbar__icon"
        aria-label="Хайх"
        onClick={() => {
          haptic('light')
          window.dispatchEvent(new Event('aupair:countries-search'))
        }}
      >
        <MagnifyingGlass size={20} weight="bold" aria-hidden />
      </button>
    ) : null

  return (
    <div className={isPush ? 'site site--push' : 'site'}>
      <AppHeader title={meta.title} showBrand={isHome} />
      <NavBar
        root={Boolean(meta.root)}
        minimal={Boolean(meta.minimal)}
        transparent={Boolean(meta.transparent)}
        title={meta.title}
        backLabel={meta.backLabel}
        onBack={goBack}
        trailing={countriesTrailing}
      />
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
      <TabBar />
      <Onboarding />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <LayoutGroup>
          <AppFrame />
        </LayoutGroup>
      </Router>
    </AuthProvider>
  )
}
