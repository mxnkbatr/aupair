import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import './index.css'
import App from './App.jsx'
import { installImageFade, installTapHaptics, interceptExternalLinks } from './native'

if (Capacitor.isNativePlatform()) document.documentElement.classList.add('is-native')
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
// iOS WebKit only applies :active styles when a touch listener exists
document.addEventListener('touchstart', () => {}, { passive: true })
interceptExternalLinks()
installTapHaptics()
installImageFade()

async function bootstrapNative() {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    // Light content chrome (dark icons on white) — matches iOS app chrome
    await StatusBar.setStyle({ style: Style.Light })
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#FFFFFF' })
    }
    try {
      await StatusBar.setOverlaysWebView({ overlay: true })
    } catch {
      // older plugin builds may not support overlay
    }
  } catch {
    // Status bar plugin optional on web preview
  }
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide()
  } catch {
    // ignore
  }
  try {
    const { App: CapApp } = await import('@capacitor/app')
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) window.history.back()
      else CapApp.exitApp()
    })
  } catch {
    // ignore
  }
}

bootstrapNative()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
