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

/** Slide forward/back like a native stack; tab switches fade and keep their scroll. */
function usePageTransition(pathname) {
  const navType = useNavigationType()
  const [state, setState] = useState({ path: pathname, dir: 'none' })
  if (state.path !== pathname) {
    const tabSwitch = TAB_PATHS.includes(state.path) && TAB_PATHS.includes(pathname)
    setState({
      path: pathname,
      dir: tabSwitch ? 'fade' : navType === 'POP' ? 'back' : 'forward',
    })
  }
  return state.dir
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
  const { pathname } = useLocation()
  const dir = usePageTransition(pathname)
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
        <div key={pathname} className={`page page--${dir}`}>
          <Routes>
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
