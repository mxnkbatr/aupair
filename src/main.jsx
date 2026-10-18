import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { registerSW } from 'virtual:pwa-register'
import './styles/tokens.css'
import './index.css'
import './styles/ui.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import { hydrateToken } from './api'
import {
  dismissTopOverlay,
  installImageFade,
  installKeyboardAssist,
  installNativeShell,
  installTapHaptics,
  interceptExternalLinks,
  reloadIfUpdated,
} from './native'
import { initPushNotifications, navigateFromNative } from './push'

document.documentElement.setAttribute('data-theme', 'light')
document.documentElement.style.colorScheme = 'light only'
if (Capacitor.isNativePlatform()) document.documentElement.classList.add('is-native')
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
// iOS WebKit only applies :active styles when a touch listener exists
document.addEventListener('touchstart', () => {}, { passive: true })
installNativeShell()
interceptExternalLinks()
installTapHaptics()
installImageFade()
installKeyboardAssist()

// Web PWA: cache app shell for offline; skip inside native Capacitor WebView
if (!Capacitor.isNativePlatform()) {
  registerSW({ immediate: true })
}

function syncStatusBar() {
  if (!Capacitor.isNativePlatform()) return
  import('@capacitor/status-bar')
    .then(({ StatusBar, Style }) => {
      // App is light-only
      StatusBar.setStyle({ style: Style.Light }).catch(() => {})
      if (Capacitor.getPlatform() === 'android') {
        StatusBar.setBackgroundColor({ color: '#f2f2f7' }).catch(() => {})
      }
    })
    .catch(() => {})
}

async function bootstrapNative() {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { StatusBar } = await import('@capacitor/status-bar')
    syncStatusBar()
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
      if (dismissTopOverlay()) return
      if (canGoBack) window.history.back()
      else CapApp.exitApp()
    })
    CapApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) return
      void reloadIfUpdated()
      window.dispatchEvent(new Event('app:refresh'))
    })
    CapApp.addListener('appUrlOpen', ({ url }) => {
      try {
        const u = new URL(url)
        navigateFromNative(u.hash?.replace(/^#/, '') || u.pathname)
      } catch {
        // ignore malformed deep links
      }
    })
  } catch {
    // ignore
  }
}

bootstrapNative()

hydrateToken().finally(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
  initPushNotifications()
})
