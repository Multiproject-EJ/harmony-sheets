(function (global) {
  const LW = (global.LW = global.LW || {});
  const PUBLIC_KEY = global.VAPID_PUBLIC_KEY || 'VAPID_PUBLIC_KEY_PLACEHOLDER';

  async function subscribe() {
    if (LW.supabase.isDemo) {
      LW.ui?.showToast?.('Push disabled in demo mode');
      return null;
    }
    if (!('serviceWorker' in navigator) || !('PushManager' in global)) {
      throw new Error('Push not supported');
    }
    const registration = await navigator.serviceWorker.ready;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY)
    });
    await LWDB.put('push_subscriptions', {
      id: subscription.endpoint,
      user_id: LW.demoSeed.userId,
      endpoint: subscription.endpoint,
      keys_json: subscription.toJSON(),
      created_at: LW.utils.nowIso(),
      updated_at: LW.utils.nowIso()
    });
    if (!LW.supabase.isDemo) {
      await LWDB.addOp('push_subscriptions', 'upsert', subscription.toJSON());
    }
    return subscription;
  }

  async function unsubscribe() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      await LWDB.remove('push_subscriptions', subscription.endpoint);
    }
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = global.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  LW.push = {
    subscribe,
    unsubscribe
  };
})(window);
