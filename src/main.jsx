import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import './styles/tokens.css'
import './index.css'
import './styles/ui.css'
import App from './App.jsx'
import { hydrateToken } from './api'
import { installImageFade, installTapHaptics, interceptExternalLinks } from './native'

if (Capacitor.isNativePlatform()) document.documentElement.classList.add('is-native')
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
// iOS WebKit only applies :active styles when a touch listener exists
document.addEventListener('touchstart', () => {}, { passive: true })
interceptExternalLinks()
installTapHaptics()
installImageFade()

function syncStatusBar() {
  if (!Capacitor.isNativePlatform()) return
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
  import('@capacitor/status-bar')
    .then(({ StatusBar, Style }) => {
      StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }).catch(() => {})
      if (Capacitor.getPlatform() === 'android') {
        StatusBar.setBackgroundColor({ color: dark ? '#000000' : '#FFFFFF' }).catch(() => {})
      }
    })
    .catch(() => {})
}

async function bootstrapNative() {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { StatusBar } = await import('@capacitor/status-bar')
    syncStatusBar()
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncStatusBar)
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

hydrateToken().finally(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
