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
import { LayoutGroup } from 'motion/react'
import { Capacitor } from '@capacitor/core'
import AppHeader from './components/AppHeader'
import NavBar from './components/NavBar'
import NotificationMenu from './components/NotificationMenu'
import TabBar, { TAB_PATHS, isDockRoute } from './components/TabBar'
import Footer from './components/Footer'
import OfflineBanner from './components/OfflineBanner'
import Onboarding from './components/Onboarding'
import PullIndicator from './components/PullIndicator'
import usePullToRefresh from './hooks/usePullToRefresh'
import useSwipeBack from './hooks/useSwipeBack'
import { reloadIfUpdated } from './native'
import Home from './pages/Home'
import Learn from './pages/Learn'
import NotFound from './pages/NotFound'
import CourseDetail from './pages/CourseDetail'
import Universities from './pages/Universities'
import UniversityDetail from './pages/UniversityDetail'
import ProductDetail from './pages/ProductDetail'
import Profile from './pages/Profile'
import Program from './pages/Program'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Admin from './pages/Admin'
import Shop from './pages/Shop'
import About from './pages/About'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import { AuthProvider, useAuth } from './auth'
import './theme.css'

const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter

/** Nav bar config per route: tab roots show a compact title on scroll, push screens get a back button. */
function getRouteMeta(pathname) {
  switch (pathname) {
    case '/':
      return { root: true, title: 'Нүүр' }
    case '/learn':
      return { root: true, title: 'Сургалт' }
    case '/countries':
      return { root: true, title: 'Au Pair' }
    case '/me':
      return { root: true, title: 'Би' }
    case '/me/help':
      return { title: 'Тусламж', backLabel: 'Би', parent: '/me' }
    case '/me/program':
      return { title: 'Миний аялал', backLabel: 'Би', parent: '/me' }
    case '/privacy':
      return { title: 'Нууцлал', backLabel: 'Би', parent: '/me' }
    case '/shop':
      return { root: true, title: 'Дэлгүүр' }
    case '/about':
      return { title: 'Бидний тухай', backLabel: 'Нүүр', parent: '/' }
    case '/news':
      return { root: true, title: 'Мэдээ' }
    case '/admin':
      return { title: 'Админ', backLabel: 'Нүүр', parent: '/' }
    default:
  }
  if (pathname.startsWith('/learn/course/') || pathname.startsWith('/courses/')) {
    return { title: 'Хөтөлбөр', backLabel: 'Сургалт', parent: '/learn', transparent: true }
  }
  if (pathname.startsWith('/news/')) {
    return { title: 'Мэдээ', backLabel: 'Мэдээ', parent: '/news', transparent: true }
  }
  if (pathname.startsWith('/learn/item/')) {
    return { title: 'Бараа', backLabel: 'Дэлгүүр', parent: '/shop', transparent: true }
  }
  if (pathname.startsWith('/shop/')) {
    return { title: 'Бараа', backLabel: 'Дэлгүүр', parent: '/shop', transparent: true }
  }
  if (pathname.startsWith('/countries/') || pathname.startsWith('/universities/')) {
    return { title: 'Au Pair', backLabel: 'Au Pair', parent: '/countries' }
  }
  // Legacy tab roots while <Navigate> redirects
  if (pathname === '/courses' || pathname === '/shop') return { root: true, title: 'Сургалт' }
  if (pathname === '/universities') return { root: true, title: 'Au Pair' }
  if (pathname === '/profile') {
    return { root: true, title: 'Би' }
  }
  if (pathname === '/contact') return { title: 'Тусламж', backLabel: 'Би', parent: '/me' }
  return { title: 'Олдсонгүй', backLabel: 'Нүүр', parent: '/' }
}

const REFRESH_PATHS = ['/', '/news', '/learn', '/countries', '/shop']

/** Old URLs keep working: /courses/:id → /learn/course/:id etc. */
function RedirectWithParams({ to }) {
  const params = useParams()
  const { search } = useLocation()
  return <Navigate to={generatePath(to, params) + search} replace />
}
const SWIPE_BACK = Capacitor.isNativePlatform() || import.meta.env.DEV
const scrollPositions = new Map()
let skipNextTransition = false

/**
 * Instant route swap — no View Transitions / opacity fades (they flash white).
 * Still tracks dir for scroll restore (tab/back keep position, push scrolls top).
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
      setShown({ location, dir: 'back' })
      return
    }
    const tabSwitch = isDockRoute(prev.pathname) && isDockRoute(location.pathname)
    const dir = tabSwitch ? 'fade' : navType === 'POP' ? 'back' : 'forward'
    setShown({ location, dir })
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
      <Route path="/me/program" element={<Program />} />
      <Route path="/me/help" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/shop/:id" element={<ProductDetail />} />
      <Route path="/about" element={<About />} />
      <Route path="/news" element={<News />} />
      <Route path="/news/:id" element={<NewsDetail />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/stories" element={<Navigate to="/news" replace />} />

      {/* Legacy URLs */}
      <Route path="/courses" element={<Navigate to="/learn" replace />} />
      <Route path="/courses/:id" element={<RedirectWithParams to="/learn/course/:id" />} />
      <Route path="/universities" element={<Navigate to="/countries" replace />} />
      <Route path="/universities/:id" element={<RedirectWithParams to="/countries/:id" />} />
      <Route path="/videos" element={<Navigate to="/news" replace />} />
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
    enabled: SWIPE_BACK && !isDockRoute(pathname),
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
  const isPush = !isDockRoute(pathname)
  const flushNav = Boolean(meta.transparent)
  const barTitle = meta.title

  const goBack = useCallback(() => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1)
    else navigate(meta.parent || '/', { replace: true })
  }, [navigate, meta.parent])

  // Push screens: keep notification bell in the trailing slot.
  const trailing = isPush ? <NotificationMenu variant="icon" /> : null

  const siteClass = [
    'site',
    isPush && 'site--push',
    flushNav && 'site--flush-nav',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={siteClass}>
      <AppHeader title={meta.title} showBrand={isHome} />
      <NavBar
        root={Boolean(meta.root)}
        largeTitle={Boolean(meta.largeTitle)}
        transparent={Boolean(meta.transparent)}
        title={barTitle}
        backLabel={meta.backLabel}
        onBack={goBack}
        trailing={trailing}
      />
      <OfflineBanner />
      <main className="site__main">
        <div key={pathname} ref={pageRef} className="page page--none">
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
