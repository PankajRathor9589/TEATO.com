import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as api from '../services/api';

export default function PushPrompt() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    const dismissedAt = localStorage.getItem('teato_push_dismissed');
    if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 7 * 24 * 60 * 60 * 1000) setDismissed(true);
    if (Notification.permission === 'default' && !dismissed) setVisible(true);
  }, [dismissed]);

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        const subscription = sub || await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY ? urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY) : undefined,
        });
        if (subscription && process.env.REACT_APP_VAPID_PUBLIC_KEY) {
          await api.pushSubscribe({
            endpoint: subscription.endpoint,
            keys: { p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))), auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')))) },
            userAgent: navigator.userAgent,
          });
        }
        toast.success('Notifications enabled');
      }
      setVisible(false);
    } catch (e) {
      toast.error('Could not enable notifications');
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem('teato_push_dismissed', String(Date.now()));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white border border-gray-200 rounded-2xl shadow-lg p-4 z-30 safe-bottom">
      <p className="font-semibold text-gray-900">Get order updates</p>
      <p className="text-gray-600 text-sm mt-1">Allow notifications for real-time order status.</p>
      <div className="flex gap-2 mt-3">
        <button type="button" onClick={handleEnable} className="btn-primary py-2 px-4 text-sm">Enable</button>
        <button type="button" onClick={handleDismiss} className="btn-secondary py-2 px-4 text-sm">Not now</button>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
