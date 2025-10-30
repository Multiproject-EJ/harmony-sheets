(function (global) {
  const LW = (global.LW = global.LW || {});

  async function bootstrap() {
    await LW.state.init();
    LW.router.init();
    if (!LW.supabase.isDemo) {
      LW.sync.processPending();
    }
    setupDemoNotice();
    setupMotionPreference();
  }

  function setupDemoNotice() {
    if (LW.supabase.isDemo) {
      LW.ui?.showToast?.('Running in demo mode with local data.');
    }
  }

  function setupMotionPreference() {
    const prefersReduced = global.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReduced.matches) {
      document.body.classList.add('lwapp-reduced-motion');
    }
    prefersReduced.addEventListener('change', (event) => {
      document.body.classList.toggle('lwapp-reduced-motion', event.matches);
    });
  }

  document.addEventListener('DOMContentLoaded', bootstrap);
})(window);
