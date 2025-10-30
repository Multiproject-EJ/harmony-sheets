(function (global) {
  const LW = (global.LW = global.LW || {});
  const DB_NAME = 'lifewheel-app';
  const DB_VERSION = 1;
  const STORES = {
    profiles: { keyPath: 'id' },
    categories: { keyPath: 'id', indexes: [['order', 'order']] },
    visions: { keyPath: 'id', indexes: [['category_id', 'category_id']] },
    goals: { keyPath: 'id', indexes: [['category_id', 'category_id'], ['vision_id', 'vision_id']] },
    steps: { keyPath: 'id', indexes: [['goal_id', 'goal_id']] },
    tasks: { keyPath: 'id', indexes: [['goal_id', 'goal_id'], ['step_id', 'step_id'], ['status', 'status']] },
    habits: { keyPath: 'id', indexes: [['category_id', 'category_id'], ['goal_id', 'goal_id']] },
    habit_logs: { keyPath: 'id', indexes: [['habit_id', 'habit_id'], ['date', 'date']] },
    questionnaires: { keyPath: 'id', indexes: [['period', 'period']] },
    questions: { keyPath: 'id', indexes: [['category_id', 'category_id']] },
    responses: { keyPath: 'id', indexes: [['questionnaire_id', 'questionnaire_id'], ['question_id', 'question_id']] },
    reminders: { keyPath: 'id', indexes: [['entity_id', 'entity_id'], ['channel', 'channel']] },
    push_subscriptions: { keyPath: 'id' },
    ai_summaries: { keyPath: 'id', indexes: [['source', 'source']] },
    media: { keyPath: 'id', indexes: [['linked_id', 'linked_id']] },
    oplog: { keyPath: 'id', indexes: [['table', 'table'], ['synced', 'synced']] }
  };

  let dbPromise = null;

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        Object.entries(STORES).forEach(([name, config]) => {
          if (!db.objectStoreNames.contains(name)) {
            const store = db.createObjectStore(name, { keyPath: config.keyPath });
            (config.indexes || []).forEach(([indexName, keyPath]) => {
              store.createIndex(indexName, keyPath);
            });
          }
        });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return dbPromise;
  }

  async function withStore(storeName, mode, callback) {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      let result;
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      try {
        const maybeRequest = callback(store, tx);
        if (maybeRequest instanceof IDBRequest) {
          maybeRequest.onsuccess = () => {
            result = maybeRequest.result;
          };
          maybeRequest.onerror = () => reject(maybeRequest.error);
        } else {
          result = maybeRequest;
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  async function get(store, id) {
    return await withStore(store, 'readonly', (storeRef) => storeRef.get(id));
  }

  async function getAll(store, indexName, query) {
    return await withStore(store, 'readonly', (storeRef) => {
      if (indexName) {
        return storeRef.index(indexName).getAll(query);
      }
      return storeRef.getAll();
    });
  }

  async function put(store, value) {
    return await withStore(store, 'readwrite', (storeRef) => storeRef.put(value));
  }

  async function bulkPut(store, values) {
    return await withStore(store, 'readwrite', (storeRef) => {
      values.forEach((value) => storeRef.put(value));
    });
  }

  async function remove(store, id) {
    return await withStore(store, 'readwrite', (storeRef) => storeRef.delete(id));
  }

  async function clear(store) {
    return await withStore(store, 'readwrite', (storeRef) => storeRef.clear());
  }

  async function addOp(table, operation, payload) {
    const entry = {
      id: payload.id || LW.utils.uuid(),
      table,
      operation,
      payload,
      synced: false,
      created_at: LW.utils.nowIso()
    };
    await put('oplog', entry);
    notifyServiceWorker(entry);
    return entry;
  }

  function notifyServiceWorker(op) {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return;
    navigator.serviceWorker.controller.postMessage({ type: 'LW_ENQUEUE_OP', payload: op });
  }

  async function getPendingOps() {
    return await getAll('oplog', 'synced', false);
  }

  async function markOpSynced(id) {
    const op = await get('oplog', id);
    if (!op) return;
    op.synced = true;
    await put('oplog', op);
  }

  async function seedDemoData(seed) {
    if (!seed) return;
    await Promise.all(
      Object.entries(seed).map(async ([store, records]) => {
        if (!records || !Array.isArray(records)) return;
        await bulkPut(store, records);
      })
    );
  }

  global.LWDB = {
    openDb,
    get,
    getAll,
    put,
    bulkPut,
    remove,
    clear,
    addOp,
    getPendingOps,
    markOpSynced,
    seedDemoData
  };
})(window);
