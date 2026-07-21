(() => {
  window.ManchaApp = window.ManchaApp || {};
        function eo(e) {
          try {
            let t = localStorage.getItem(e);
            return t ? JSON.parse(t) : null;
          } catch (t) {
            return null;
          }
        }
        function qe(e, t) {
          try {
            localStorage.setItem(e, JSON.stringify(t));
          } catch (l) {}
        }

  const APP_STATE_DEFAULTS = Object.freeze({
    selectedTournamentId: null,
    activeView: "table",
    theme: "dark",
    profile: null,
  });
  Object.assign(window.ManchaApp, { eo, qe, APP_STATE_DEFAULTS });
})();
