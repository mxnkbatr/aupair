import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import AppHeader from './components/AppHeader'
import BottomNav from './components/BottomNav'
import Footer from './components/Footer'
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Universities from './pages/Universities'
import UniversityDetail from './pages/UniversityDetail'
import Videos from './pages/Videos'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Profile from './pages/Profile'

const TITLES = {
  '/': 'Au Pair',
  '/courses': 'Хөтөлбөр',
  '/universities': 'Улс орнууд',
  '/videos': 'Бичлэг',
  '/shop': 'Дэлгүүр',
  '/profile': 'Холбоо',
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AppFrame() {
  const { pathname } = useLocation()
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
      <main className="site__main">
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
          <Route path="/contact" element={<Navigate to="/profile" replace />} />
        </Routes>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppFrame />
    </BrowserRouter>
  )
}
