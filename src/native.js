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

/** Native iOS/Android confirm dialog on device, window.confirm on web. Resolves to boolean. */
export async function confirmDialog(message, { title = 'Баталгаажуулах', okTitle = 'Тийм', cancelTitle = 'Болих' } = {}) {
  if (isNative) {
    try {
      const { Dialog } = await import('@capacitor/dialog')
      const { value } = await Dialog.confirm({
        title,
        message,
        okButtonTitle: okTitle,
        cancelButtonTitle: cancelTitle,
      })
      return value
    } catch {
      // fall through to window.confirm
    }
  }
  return window.confirm(message)
}

/**
 * Native ActionSheet, or web fallback via window.confirm chain.
 * options: [{ title, style?: 'destructive'|'cancel'|'default' }]
 * Resolves to selected index, or -1 if cancelled.
 */
export async function presentActionSheet({ title, message, options }) {
  if (isNative) {
    try {
      const { ActionSheet, ActionSheetButtonStyle } = await import('@capacitor/action-sheet')
      const { index } = await ActionSheet.showActions({
        title,
        message,
        options: options.map((o) => ({
          title: o.title,
          style:
            o.style === 'destructive'
              ? ActionSheetButtonStyle.Destructive
              : o.style === 'cancel'
                ? ActionSheetButtonStyle.Cancel
                : ActionSheetButtonStyle.Default,
        })),
      })
      return index
    } catch {
      // fall through
    }
  }
  const labels = options.filter((o) => o.style !== 'cancel').map((o) => o.title)
  const pick = window.prompt([title, message, ...labels.map((l, i) => `${i + 1}. ${l}`)].filter(Boolean).join('\n\n'))
  const n = Number(pick) - 1
  if (!Number.isFinite(n) || n < 0 || n >= labels.length) return -1
  return options.findIndex((o) => o.title === labels[n])
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

const SELECT_HAPTIC = '.page-filters__btn, .course-filters__btn, .pf-segment button, .admin-tab, .seg button, .chip'
const TAP_HAPTIC = [
  '.btn',
  '.sheet__close',
  '.home-course',
  '.home-country',
  '.learn-card',
  '.learn-material',
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
      if (!el || el.disabled || el.closest('.onb, [data-pressable]')) return
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

/**
 * Web / remote shell: reload if a newer HTML bundle is on the server.
 * Bundled native apps ship UI in the binary — skip (store update required).
 */
export async function reloadIfUpdated() {
  if (isNative) return false
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

/**
 * Dismiss the top-most overlay (sheet, auth, drawer, story, notifications).
 * Used by Android hardware back. Returns true if something closed.
 */
export function dismissTopOverlay() {
  const storyClose = document.querySelector('.story-viewer__close')
  if (storyClose) {
    storyClose.click()
    return true
  }

  if (document.querySelector('.auth')) {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    return true
  }

  if (document.querySelector('[data-vaul-drawer]')) {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    return true
  }

  const notifBackdrop = document.querySelector('.app-notif-sheet__backdrop')
  if (notifBackdrop) {
    notifBackdrop.click()
    return true
  }

  const drawerClose = document.querySelector('.app-drawer__close, .app-drawer__backdrop')
  if (drawerClose) {
    drawerClose.click()
    return true
  }

  const onb = document.querySelector('.onb')
  if (onb) {
    const back = onb.querySelector('.onb__back')
    if (back) {
      back.click()
      return true
    }
    const skip = onb.querySelector('.onb__skip')
    if (skip) {
      skip.click()
      return true
    }
  }

  return false
}

/** Keep focused inputs visible above the soft keyboard. */
export function installKeyboardAssist() {
  if (!isNative) return
  import('@capacitor/keyboard')
    .then(({ Keyboard }) => {
      Keyboard.addListener('keyboardWillShow', () => {
        const el = document.activeElement
        if (!(el instanceof HTMLElement)) return
        if (!el.matches('input, textarea, select, [contenteditable="true"]')) return
        requestAnimationFrame(() => {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        })
      })
    })
    .catch(() => {})
}

/**
 * Strip browser-like WebView habits so the shell feels like a native app:
 * no pinch/double-tap zoom, no link callouts, no image drag, no context menu.
 */
export function installNativeShell() {
  if (!isNative) return

  const block = (e) => e.preventDefault()
  document.addEventListener('gesturestart', block, { passive: false })
  document.addEventListener('gesturechange', block, { passive: false })
  document.addEventListener('gestureend', block, { passive: false })

  let lastTouchEnd = 0
  document.addEventListener(
    'touchend',
    (e) => {
      const interactive = e.target.closest?.(
        'input, textarea, select, button, a, [role="button"], [data-pressable], label',
      )
      const now = Date.now()
      // Block double-tap zoom on non-interactive surfaces only.
      if (!interactive && now - lastTouchEnd <= 280) e.preventDefault()
      lastTouchEnd = now
    },
    { passive: false },
  )

  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest?.('input, textarea, [contenteditable="true"]')) return
    e.preventDefault()
  })

  document.addEventListener('dragstart', (e) => {
    if (e.target.closest?.('img, a')) e.preventDefault()
  })
}
