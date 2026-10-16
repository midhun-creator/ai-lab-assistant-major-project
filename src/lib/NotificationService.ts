import type { Notification } from './types';

type NotificationListener = (notification: Notification) => void;

class NotificationService {
  private listeners: Set<NotificationListener> = new Set();
  
  // This simulates what would normally be a WebSocket connection
  subscribe(listener: NotificationListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  notify(notification: Notification) {
    this.listeners.forEach(listener => listener(notification));
  }
}

export const notificationService = new NotificationService();
