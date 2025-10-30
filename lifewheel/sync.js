(function (global) {
  const LW = (global.LW = global.LW || {});
  let processing = false;

  async function requestSync() {
    if (!('serviceWorker' in navigator)) return;
    const registration = await navigator.serviceWorker.ready;
    if ('sync' in registration) {
      try {
        await registration.sync.register('lw-sync');
      } catch (error) {
        console.warn('[LW] Background sync registration failed', error);
      }
    }
  }

  async function processPending() {
    if (processing) return;
    processing = true;
    try {
      const pending = await LWDB.getPendingOps();
      if (!pending || pending.length === 0) return;
      const client = await LW.supabase.getClient();
      for (const op of pending) {
        if (!client) {
          await LWDB.markOpSynced(op.id);
          continue;
        }
        try {
          // TODO: Replace with Supabase RPC or table writes when connected
          await LWDB.markOpSynced(op.id);
        } catch (error) {
          console.error('[LW] Failed to sync operation', op, error);
          break;
        }
      }
    } finally {
      processing = false;
    }
  }

  global.addEventListener('online', processPending);

  LW.sync = {
    requestSync,
    processPending
  };
})(window);
