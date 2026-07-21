(() => {
  window.ManchaApp = window.ManchaApp || {};
  window.__SUPABASE_CONFIG__ = window.__SUPABASE_CONFIG__ || {};

var it = {
            GK: "Goleiro",
            CWP: "Goleiro",
            CB: "Zagueiro",
            CBT: "Zagueiro",
            SB: "Lateral",
            WB: "Ala",
            DM: "Volante",
            DMF: "Volante",
            CM: "Meia",
            CMF: "Meia",
            SM: "Meia",
            SMF: "Meia (lateral)",
            AM: "Meia ofensivo",
            AMF: "Meia ofensivo",
            WG: "Ponta",
            WF: "Ponta",
            SS: "Segundo atacante",
            CF: "Centroavante",
          },
          se = [
            "var(--green)",
            "#4A7FC1",
            "var(--danger)",
            "var(--green)",
            "#9B59B6",
            "#E67E22",
            "#1ABC9C",
            "#95A5A6",
          ];        var W = {
            background: "var(--green)",
            color: "var(--surface)",
            fontWeight: 800,
          },
          P = {
            display: "block",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 1,
            color: "var(--muted)",
            marginBottom: 6,
          },
          q = {
            width: "100%",
            padding: "12px 14px",
            borderRadius: 9999,
            border: "2px solid #DEDEDE",
            backgroundColor: "var(--surface)",
            color: "var(--heading)",
            fontSize: 15,
            fontWeight: 600,
          },
          M = {
            width: "100%",
            padding: "13px 16px",
            borderRadius: 12,
            border: "2px solid transparent",
            fontSize: 15,
            cursor: "pointer",
            marginTop: 4,
            fontWeight: 800,
            letterSpacing: 0.2,
          },
          E = {
            background: "var(--surface)",
            border: "none",
            boxShadow: "inset 0 0 0 1px var(--border)",
            borderRadius: 10,
            padding: 24,
            marginBottom: 12,
          },
          V = (e) => ({
            padding: "6px 12px",
            borderRadius: 12,
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            background: e ? "var(--green)" : "var(--surface-soft)",
            color: e ? "var(--surface)" : "var(--muted)",
            border: e ? "none" : "1px solid #AFAFAF",
          }),
          O = { textAlign: "center", padding: "4px 4px" };
        const POSITION_COLORS = {
          GK: "#d6a600", CWP: "#377dff", CB: "#377dff", CBT: "#377dff", SB: "#2f8ee5", WB: "#20a9d6",
          DM: "#24a66a", DMF: "#24a66a", CM: "#00a86b", CMF: "#00a86b", SM: "#16a085", SMF: "#16a085",
          AM: "#69a900", AMF: "#69a900", WG: "#e74c3c", WF: "#e74c3c", SS: "#d92d20", CF: "#c81e1e"
        };
        function positionColor(position) {
          return POSITION_COLORS[position] || "#7e7e7d";
        }
        function overallColor(overall) {
          let value = Number(overall) || 0;
          if (value >= 90) return "#d92d20";
          if (value >= 85) return "#f06423";
          if (value >= 80) return "#d6a600";
          if (value >= 75) return "#1f9d55";
          return "#7e7e7d";
        }

  Object.assign(window.ManchaApp, { it, se, W, P, q, M, E, V, O, POSITION_COLORS, positionColor, overallColor });
})();
