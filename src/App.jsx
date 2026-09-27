import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  useLocation,
  useNavigationType,
  Navigate,
} from 'react-router-dom'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Capacitor } from '@capacitor/core'
import AppHeader from './components/AppHeader'
import BottomNav from './components/BottomNav'
import Footer from './components/Footer'
import OfflineBanner from './components/OfflineBanner'
import Onboarding from './components/Onboarding'
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
import Admin from './pages/Admin'
import { AuthProvider } from './auth'
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
  '/admin': 'Админ',
}

const TAB_PATHS = ['/', '/courses', '/universities', '/shop', '/profile']
const scrollPositions = new Map()

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

function AppFrame() {
  const shown = usePageTransition()
  const { pathname } = shown.location
  const dir = shown.dir
  useScrollMemory(pathname, dir)
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
        <div key={pathname} className={`page page--${shown.viewTransition ? 'none' : dir}`}>
          <Routes location={shown.location}>
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
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
