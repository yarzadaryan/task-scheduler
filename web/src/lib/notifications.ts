export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  try {
    const perm = await Notification.requestPermission()
    return perm
  } catch {
    return Notification.permission
  }
}

export function notify(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') {
    new Notification(title, options)
  }
}
