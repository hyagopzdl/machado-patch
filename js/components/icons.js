(() => {
  window.ManchaApp = window.ManchaApp || {};
function C(e) {
          return function ({
            size: l = 16,
            color: a,
            style: n = {},
            className: r,
          }) {
            return React.createElement(
              "span",
              {
                className: r,
                style: {
                  fontSize: l,
                  color: a,
                  lineHeight: 1,
                  display: "inline-flex",
                  verticalAlign: "middle",
                  ...n,
                },
              },
              e,
            );
          };
        }
        function SvgIcon(paths) {
          return function ({ size = 20, color = "currentColor", style = {}, className }) {
            return React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round", style, className },
              paths.map((d, index) => React.createElement("path", { key: index, d }))
            );
          };
        }
        var _t = SvgIcon(["M3 11.5 12 4l9 7.5", "M5.5 10v9h13v-9", "M9.5 19v-5h5v5"]),
          Vt = SvgIcon(["M12 3 4.5 6v5.5c0 4.7 3.2 7.9 7.5 9.5 4.3-1.6 7.5-4.8 7.5-9.5V6L12 3Z", "M9 12h6", "M12 9v6"]),
          pe = SvgIcon(["M8 4h8v4a4 4 0 0 1-8 0V4Z", "M8 6H5v1a4 4 0 0 0 4 4", "M16 6h3v1a4 4 0 0 1-4 4", "M12 12v4", "M8 20h8", "M9 16h6"]),
          Xe = SvgIcon(["M7 7h11l-2.5-2.5", "M17 17H6l2.5 2.5", "M18 7a7 7 0 0 1 1 3.5", "M6 17a7 7 0 0 1-1-3.5"]),
          ze = SvgIcon(["M6 3h10a2 2 0 0 1 2 2v16H8a2 2 0 0 1-2-2V3Z", "M8 17h10", "M10 7h5", "M10 11h5"]),
          _e = C("\u2795"),
          Ye = C("\u2715"),
          ue = C("\u203A"),
          Ze = C("\u2304"),
          et = C("\u2713"),
          bo = C("\u2605"),
          qt = C("\u{1F464}"),
          Kt = C("\u23F3"),
          $t = C("\u{1F5D1}\uFE0F"),
          tt = C("\u{1F451}"),
          Jt = C("\u2192"),
          ot = C("\u{1F4C5}"),
          nt = C("\u{1F3AF}"),
          Ut = C("\u{1F6A9}"),
          at = C("\u26A0\uFE0F"),
          Qt = C("\u{1F4B0}"),
          ho = C("\u{1F3F7}\uFE0F"),
          Xt = C("\u{1F50E}"),
          SettingsIcon = SvgIcon(["M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z", "M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-3v-.08a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7 14.7a1.7 1.7 0 0 0-1.56-1.03H5v-3h.08A1.7 1.7 0 0 0 6.64 9.6 1.7 1.7 0 0 0 6.3 7.72l-.06-.06 2.12-2.12.06.06A1.7 1.7 0 0 0 10.3 5.94a1.7 1.7 0 0 0 1.03-1.56V4h3v.08a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06A1.7 1.7 0 0 0 19.06 9.3a1.7 1.7 0 0 0 1.56 1.03H21v3h-.08A1.7 1.7 0 0 0 19.4 15Z"]),
          ProfileIcon = SvgIcon(["M20 21a8 8 0 0 0-16 0", "M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"]),
          OfferIcon = SvgIcon(["M21 15a4 4 0 0 1-4 4H8l-5 3V8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v7Z", "M8 10h8", "M8 14h5"]),
          Star = SvgIcon(["m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z"]),
          FilterIcon = SvgIcon(["M4 6h16", "M7 12h10", "M10 18h4"]),
          FlagIcon = SvgIcon(["M5 21V4", "M5 5h10l-1.5 3L15 11H5"]),
          BankIcon = function ({ size = 14, color = "currentColor", style = {} }) {
            return React.createElement("svg", { width:size, height:size, viewBox:"0 0 24 24", fill:color, style, "aria-hidden":"true" },
              React.createElement("path", { d:"M12 2.8 2.5 7.6v2.1h19V7.6L12 2.8Zm-7.2 8.6v6.4H3v2.4h18v-2.4h-1.8v-6.4h-2.4v6.4h-2.3v-6.4h-2.4v6.4H9.8v-6.4H7.4v6.4H5.2v-6.4H4.8Z" })
            );
          },
          AdminIcon = SvgIcon(["M12 3 4.5 6v5.5c0 4.7 3.2 7.9 7.5 9.5 4.3-1.6 7.5-4.8 7.5-9.5V6L12 3Z", "M9 12l2 2 4-4"]),
          UserIcon = ProfileIcon,
          TrophyIcon = pe,
          TeamIcon = Vt,
          DatabaseIcon = ze,
          TrashIcon = SvgIcon(["M4 7h16", "M9 7V4h6v3", "M7 7l1 13h8l1-13", "M10 11v5", "M14 11v5"]),
          BaseRosterIcon = SvgIcon(["M12 3 4.5 6v5.5c0 4.7 3.2 7.9 7.5 9.5 4.3-1.6 7.5-4.8 7.5-9.5V6L12 3Z", "m12 7 .9 1.82 2.01.29-1.45 1.42.34 2-1.8-.95-1.8.95.34-2-1.45-1.42 2.01-.29L12 7Z"]);
  Object.assign(window.ManchaApp, { C, SvgIcon, _t, Vt, pe, Xe, ze, _e, Ye, ue, Ze, et, bo, qt, Kt, $t, tt, Jt, ot, nt, Ut, at, Qt, ho, Xt, SettingsIcon, ProfileIcon, OfferIcon, Star, FilterIcon, FlagIcon, BankIcon, AdminIcon, UserIcon, TrophyIcon, TeamIcon, DatabaseIcon, TrashIcon, BaseRosterIcon });
})();
