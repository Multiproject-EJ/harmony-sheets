(function (global) {
  const LW = (global.LW = global.LW || {});
  const tables = [
    'profiles',
    'categories',
    'visions',
    'goals',
    'steps',
    'tasks',
    'habits',
    'habit_logs',
    'questionnaires',
    'questions',
    'responses',
    'reminders',
    'push_subscriptions',
    'ai_summaries',
    'media'
  ];

  const state = {
    ready: false,
    demoMode: LW.supabase.isDemo,
    profile: null,
    categories: [],
    visions: [],
    goals: [],
    steps: [],
    tasks: [],
    habits: [],
    habit_logs: [],
    questionnaires: [],
    questions: [],
    responses: [],
    reminders: [],
    push_subscriptions: [],
    ai_summaries: [],
    media: [],
    preferences: {
      theme: 'light',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ai_tone: 'Encouraging'
    }
  };

  const subscribers = new Set();

  async function init() {
    await LWDB.openDb();
    if (state.demoMode) {
      const existing = await LWDB.getAll('categories');
      if (!existing || existing.length === 0) {
        await LWDB.seedDemoData(LW.demoSeed.data);
      }
    }
    await loadData();
    await maybeRegisterSW();
  }

  async function loadData() {
    const entries = await Promise.all(
      tables.map(async (table) => {
        const records = await LWDB.getAll(table);
        return [table, records || []];
      })
    );
    entries.forEach(([table, records]) => {
      state[table] = records;
    });
    state.profile = state.profiles[0] || null;
    if (state.profile) {
      state.preferences.theme = state.profile.theme || state.preferences.theme;
      state.preferences.timezone = state.profile.timezone || state.preferences.timezone;
      state.preferences.ai_tone = state.profile.ai_tone || state.preferences.ai_tone;
    }
    state.ready = true;
    notify();
  }

  function subscribe(callback) {
    subscribers.add(callback);
    callback(state);
    return () => subscribers.delete(callback);
  }

  function notify() {
    subscribers.forEach((callback) => callback(state));
  }

  async function setTheme(theme) {
    state.preferences.theme = theme;
    if (state.profile) {
      state.profile.theme = theme;
      await persist('profiles', state.profile);
    }
    notify();
  }

  async function setTimezone(timezone) {
    state.preferences.timezone = timezone;
    if (state.profile) {
      state.profile.timezone = timezone;
      await persist('profiles', state.profile);
    }
    notify();
  }

  async function persist(table, record) {
    record.updated_at = LW.utils.nowIso();
    await LWDB.put(table, record);
    if (!state.demoMode) {
      await LWDB.addOp(table, 'upsert', record);
      LW.sync?.requestSync?.();
    }
    await loadData();
  }

  async function createRecord(table, record) {
    const newRecord = { ...record };
    if (!newRecord.id) {
      newRecord.id = LW.utils.uuid();
    }
    newRecord.user_id = state.profile ? state.profile.id : LW.demoSeed.userId;
    newRecord.created_at = newRecord.created_at || LW.utils.nowIso();
    newRecord.updated_at = newRecord.updated_at || LW.utils.nowIso();
    await LWDB.put(table, newRecord);
    if (!state.demoMode) {
      await LWDB.addOp(table, 'insert', newRecord);
      LW.sync?.requestSync?.();
    }
    await loadData();
    return newRecord;
  }

  async function deleteRecord(table, id) {
    await LWDB.remove(table, id);
    if (!state.demoMode) {
      await LWDB.addOp(table, 'delete', { id });
      LW.sync?.requestSync?.();
    }
    await loadData();
  }

  async function logHabit(habitId, value) {
    const today = new Date().toISOString().slice(0, 10);
    const existing = state.habit_logs.find((log) => log.habit_id === habitId && log.date === today);
    if (existing) {
      existing.value = value;
      await persist('habit_logs', existing);
      return existing;
    }
    return await createRecord('habit_logs', {
      habit_id: habitId,
      date: today,
      value,
      note: value ? 'Logged in demo mode' : '',
      id: LW.utils.uuid()
    });
  }

  async function saveResponse(questionId, questionnaireId, payload) {
    const existing = state.responses.find(
      (response) => response.question_id === questionId && response.questionnaire_id === questionnaireId
    );
    if (existing) {
      Object.assign(existing, payload);
      await persist('responses', existing);
      return existing;
    }
    return await createRecord('responses', {
      question_id: questionId,
      questionnaire_id: questionnaireId,
      category_id: payload.category_id,
      rating: payload.rating || null,
      text: payload.text || null
    });
  }

  function getCurrentQuestionnaire(period) {
    return state.questionnaires.find((q) => q.period === period) || null;
  }

  function getCategoryColor(categoryId) {
    const category = state.categories.find((item) => item.id === categoryId);
    return category ? category.color : '#64748b';
  }

  function getRadarData() {
    const categories = state.categories;
    return categories.map((category) => {
      const ratings = state.responses
        .filter((response) => response.category_id === category.id)
        .map((response) => response.rating || 0);
      const average = ratings.length
        ? Math.round(ratings.reduce((acc, value) => acc + value, 0) / ratings.length)
        : 0;
      return {
        label: category.name,
        value: average,
        color: category.color
      };
    });
  }

  function getHabitStreak(habitId) {
    const logs = state.habit_logs
      .filter((log) => log.habit_id === habitId)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    let streak = 0;
    let expectedDate = new Date();
    for (const log of logs) {
      const logDate = new Date(log.date);
      if (log.value) {
        if (
          logDate.getFullYear() === expectedDate.getFullYear() &&
          logDate.getMonth() === expectedDate.getMonth() &&
          logDate.getDate() === expectedDate.getDate()
        ) {
          streak += 1;
          expectedDate.setDate(expectedDate.getDate() - 1);
        }
      }
    }
    return streak;
  }

  async function maybeRegisterSW() {
    if (!('serviceWorker' in navigator)) return;
    try {
      await navigator.serviceWorker.register('./sw.js', { scope: '/lifewheel/' });
    } catch (error) {
      console.error('[LW] Service worker registration failed', error);
    }
  }

  LW.state = {
    init,
    subscribe,
    setTheme,
    setTimezone,
    createRecord,
    deleteRecord,
    logHabit,
    saveResponse,
    getCurrentQuestionnaire,
    getCategoryColor,
    getRadarData,
    getHabitStreak
  };
})(window);
