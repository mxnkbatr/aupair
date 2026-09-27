import { Capacitor } from '@capacitor/core'

export const isNative = Capacitor.isNativePlatform()

export async function haptic(kind = 'light') {
  if (!isNative) return
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics')
    if (kind === 'success') await Haptics.notification({ type: NotificationType.Success })
    else if (kind === 'error') await Haptics.notification({ type: NotificationType.Error })
    else await Haptics.impact({ style: kind === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light })
  } catch {
    // haptics unavailable
  }
}

export async function openExternal(url) {
  if (isNative) {
    try {
      const { Browser } = await import('@capacitor/browser')
      await Browser.open({ url, toolbarColor: '#CC2038' })
      return
    } catch {
      // fall through to window.open
    }
  }
  window.open(url, '_blank', 'noopener')
}

export async function shareLink({ title, text }) {
  const url = 'https://mongolianaupair.com/'
  if (isNative) {
    try {
      const { Share } = await import('@capacitor/share')
      await Share.share({ title, text, url, dialogTitle: 'Хуваалцах' })
      return true
    } catch {
      return false
    }
  }
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: window.location.href })
      return true
    } catch {
      return false
    }
  }
  try {
    await navigator.clipboard.writeText(window.location.href)
    return 'copied'
  } catch {
    return false
  }
}

/** Route external http(s) links through the in-app browser on native. */
export function interceptExternalLinks() {
  if (!isNative) return
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href]')
    if (!a) return
    const href = a.getAttribute('href')
    if (!/^https?:\/\//i.test(href)) return
    if (new URL(href).origin === window.location.origin) return
    e.preventDefault()
    openExternal(href)
  })
}
