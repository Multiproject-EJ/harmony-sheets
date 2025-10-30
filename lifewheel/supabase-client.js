(function (global) {
  const LW = (global.LW = global.LW || {});

  const PLACEHOLDER = 'https://placeholder.supabase.co';
  const PLACEHOLDER_KEY = 'public-anon-key';

  const envUrl = global.SUPABASE_URL || PLACEHOLDER;
  const envAnon = global.SUPABASE_ANON_KEY || PLACEHOLDER_KEY;

  const isDemo = !envUrl || envUrl === PLACEHOLDER || !envAnon || envAnon === PLACEHOLDER_KEY;

  let supabaseClient = null;

  async function getClient() {
    if (isDemo) {
      return null;
    }
    if (supabaseClient) return supabaseClient;
    try {
      const module = await import('./vendor/supabase-js.min.js');
      if (!module || typeof module.createClient !== 'function') {
        console.warn('[LW] Supabase library missing. Running in demo mode.');
        return null;
      }
      supabaseClient = module.createClient(envUrl, envAnon, {
        auth: {
          persistSession: true
        }
      });
      return supabaseClient;
    } catch (error) {
      console.error('[LW] Failed to load supabase client', error);
      return null;
    }
  }

  LW.supabase = {
    getClient,
    get url() {
      return envUrl;
    },
    get anonKey() {
      return envAnon;
    },
    get isDemo() {
      return isDemo;
    }
  };
})(window);
