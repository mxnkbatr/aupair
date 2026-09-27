import { Capacitor } from '@capacitor/core'

export const isNative = Capacitor.isNativePlatform()

export async function haptic(kind = 'light') {
  if (!isNative) return
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics')
    if (kind === 'success') await Haptics.notification({ type: NotificationType.Success })
    else if (kind === 'error') await Haptics.notification({ type: NotificationType.Error })
    else if (kind === 'selection') {
      await Haptics.selectionStart()
      await Haptics.selectionChanged()
      await Haptics.selectionEnd()
    }
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

const SELECT_HAPTIC = '.page-filters__btn, .course-filters__btn, .pf-segment button, .admin-tab'
const TAP_HAPTIC = [
  '.btn',
  '.sheet__close',
  '.home-shortcut',
  '.home-course',
  '.home-video',
  '.home-uni',
  '.home-shop-item',
  '.course-card',
  '.uni-card',
  '.product',
  '.reel-card',
  '.portal__side-item',
  '.portal__chip',
].join(', ')

export function installTapHaptics() {
  if (!isNative) return
  document.addEventListener(
    'click',
    (e) => {
      const el = e.target.closest?.(`${SELECT_HAPTIC}, ${TAP_HAPTIC}`)
      if (!el || el.disabled || el.closest('.onb')) return
      haptic(el.matches(SELECT_HAPTIC) ? 'selection' : 'light')
    },
    true,
  )
}

/** Fade images in once loaded instead of letting them pop in. */
export function installImageFade() {
  const mark = (img) => {
    if (img.complete && img.naturalWidth) return
    img.classList.add('img-pending')
  }
  const done = (e) => {
    const img = e.target
    if (img.tagName !== 'IMG' || !img.classList.contains('img-pending')) return
    img.classList.remove('img-pending')
    img.classList.add('img-in')
  }
  document.addEventListener('load', done, true)
  document.addEventListener('error', done, true)
  new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType !== 1) continue
        if (node.tagName === 'IMG') mark(node)
        else node.querySelectorAll('img').forEach(mark)
      }
    }
  }).observe(document.body, { childList: true, subtree: true })
}

/** Reload when a newer web build has been deployed (native loads it from server.url). */
export async function reloadIfUpdated() {
  const current = document.querySelector('script[type="module"][src*="/assets/index-"]')?.getAttribute('src')
  if (!current) return false
  try {
    const res = await fetch(`/?v=${Date.now()}`, { cache: 'no-store' })
    const latest = (await res.text()).match(/\/assets\/index-[^"']+\.js/)?.[0]
    if (latest && !current.endsWith(latest)) {
      window.location.reload()
      return true
    }
  } catch {
    // offline: keep the current build
  }
  return false
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
