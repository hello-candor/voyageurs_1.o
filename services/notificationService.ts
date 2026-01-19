
export type NotificationChannel = 'email' | 'sms' | 'push';

interface NotificationPayload {
  to: string;
  subject?: string;
  body: string;
  channel: NotificationChannel;
  url?: string;
}

/**
 * Handles browser notifications, app badging, and simulates backend email/sms/push.
 */
export const notificationService = {
  
  requestPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  /**
   * Updates the PWA App Badge (if supported)
   */
  setAppBadge: async (count: number) => {
    if ('setAppBadge' in navigator) {
        try {
            if (count > 0) {
                await (navigator as any).setAppBadge(count);
            } else {
                await (navigator as any).clearAppBadge();
            }
        } catch (e) {
            // Badging not supported or failed
            console.debug('App Badging failed', e);
        }
    }
  },

  /**
   * Sends a notification using the Service Worker if available (Native PWA feel)
   */
  sendPush: async (title: string, body: string, url: string = '/') => {
    if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
            await reg.showNotification(title, {
                body,
                icon: 'https://ui-avatars.com/api/?name=B4&background=1E4472&color=fff&size=192&rounded=true&bold=true',
                badge: 'https://ui-avatars.com/api/?name=B4&background=1E4472&color=fff&size=96&rounded=true&bold=true',
                vibrate: [200, 100, 200],
                tag: 'voyageur-update',
                data: { url }
            } as any);
            return;
        }
    }
    // Fallback for non-SW environments
    if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: 'https://ui-avatars.com/api/?name=B4&background=1E4472&color=fff&size=192&rounded=true&bold=true' });
    }
  },

  send: async (payload: NotificationPayload): Promise<boolean> => {
    return new Promise((resolve) => {
      // 1. Simulate Network Latency for backend call
      setTimeout(() => {
        console.group('%c 📨 Notification Dispatch', 'color: #D67252; font-weight: bold; font-size: 12px;');
        console.log(`%cChannel: ${payload.channel.toUpperCase()}`, 'color: #1E4472; font-weight: bold;');
        console.log(`%cTo: ${payload.to}`, 'color: #555;');
        if (payload.subject) console.log(`%cSubject: ${payload.subject}`, 'font-weight: bold;');
        console.log(`%cBody: ${payload.body}`, 'color: #333; font-style: italic;');
        console.groupEnd();

        // 2. Trigger Real Device Notification for the user to see (simulation of receiving the message)
        if (payload.channel === 'email' || payload.channel === 'sms') {
            const title = payload.channel === 'email' ? `📧 New Email: ${payload.subject}` : `💬 New Message`;
            notificationService.sendPush(title, payload.body, payload.url);
        }

        resolve(true);
      }, 800);
    });
  },

  sendEmail: async (to: string, subject: string, body: string, url?: string) => {
    return notificationService.send({ to, subject, body, channel: 'email', url });
  },

  sendSMS: async (to: string, body: string, url?: string) => {
    return notificationService.send({ to, body, channel: 'sms', url });
  },

  scheduleReminder: (title: string, body: string, delayMs: number, url?: string) => {
      setTimeout(() => {
          notificationService.sendPush(title, body, url);
      }, delayMs);
  }
};
