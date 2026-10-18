import { Capacitor } from '@capacitor/core'
import { api, getToken } from './api'

let started = false

/** Open an in-app path. Native uses HashRouter (`#/path`). */
export function navigateFromNative(path) {
  if (!path || typeof path !== 'string') return
  let p = path.trim()
  try {
    if (/^https?:\/\//i.test(p)) p = new URL(p).pathname + (new URL(p).hash || '')
  } catch {
    return
  }
  // Accept `#/me` or `/me` or `/#/me`
  p = p.replace(/^\/#/, '#').replace(/^#/, '')
  if (!p.startsWith('/')) p = `/${p}`
  const hash = `#${p}`
  if (window.location.hash === hash) return
  window.location.hash = hash
}

/** Register for FCM/APNs push on native builds and sync token to the API. */
export async function initPushNotifications() {
  if (started || !Capacitor.isNativePlatform()) return
  started = true

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')

    const perm = await PushNotifications.checkPermissions()
    let status = perm.receive
    if (status === 'prompt' || status === 'prompt-with-rationale') {
      const req = await PushNotifications.requestPermissions()
      status = req.receive
    }
    if (status !== 'granted') return

    await PushNotifications.addListener('registration', async ({ value }) => {
      if (!value || !getToken()) return
      try {
        await api.registerPushToken({
          token: value,
          platform: Capacitor.getPlatform(),
        })
      } catch {
        // ignore offline / auth race
      }
    })

    await PushNotifications.addListener('registrationError', (err) => {
      console.warn('Push registration failed', err)
    })

    await PushNotifications.addListener('pushNotificationActionPerformed', (event) => {
      const url = event?.notification?.data?.url
      if (typeof url === 'string') navigateFromNative(url)
    })

    await PushNotifications.register()
  } catch (err) {
    console.warn('Push init skipped', err)
  }
}

/** Re-sync token after login (registration listener may have fired earlier). */
export async function syncPushToken() {
  if (!Capacitor.isNativePlatform() || !getToken()) return
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    await PushNotifications.register()
  } catch {
    // ignore
  }
}
