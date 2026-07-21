(() => {
  window.ManchaApp = window.ManchaApp || {};
var _ = () =>
            Math.random().toString(36).slice(2, 10) +
            Date.now().toString(36).slice(-4);
        function Ie(e) {
          let t = [...e];
          for (let l = t.length - 1; l > 0; l--) {
            let a = Math.floor(Math.random() * (l + 1));
            [t[l], t[a]] = [t[a], t[l]];
          }
          return t;
        }
        function Ve(e) {
          let t = [...e];
          t.length % 2 !== 0 && t.push(null);
          let l = t.length,
            a = [];
          for (let n = 0; n < l - 1; n++) {
            let r = [];
            for (let p = 0; p < l / 2; p++) {
              let F = t[p],
                c = t[l - 1 - p];
              F !== null &&
                c !== null &&
                r.push(
                  n % 2 === 0 ? { home: F, away: c } : { home: c, away: F },
                );
            }
            a.push(r);
            let f = t[0],
              d = t.slice(1);
            (d.unshift(d.pop()), (t = [f, ...d]));
          }
          return a;
        }
        function Fe(e) {
          let t = Ie(e),
            l = [];
          for (let a = 0; a < t.length; a += 2)
            a + 1 < t.length
              ? l.push({ home: t[a], away: t[a + 1], bye: !1 })
              : l.push({ home: t[a], away: null, bye: !0 });
          return l;
        }
        function Yt(e, t) {
          let l = Ie(e),
            a = Array.from({ length: t }, () => []);
          return (l.forEach((n, r) => a[r % t].push(n)), a);
        }
        function we(e, t) {
          let l = {};
          return (
            e.forEach((a) => {
              l[a] = {
                id: a,
                pj: 0,
                v: 0,
                e: 0,
                d: 0,
                gp: 0,
                gc: 0,
                sg: 0,
                pts: 0,
              };
            }),
            t.forEach((a) => {
              if (!a.played || a.bye) return;
              let n = l[a.homeId],
                r = l[a.awayId];
              !n ||
                !r ||
                (n.pj++,
                r.pj++,
                (n.gp += a.homeScore),
                (n.gc += a.awayScore),
                (r.gp += a.awayScore),
                (r.gc += a.homeScore),
                a.homeScore > a.awayScore
                  ? (n.v++, r.d++, (n.pts += 3))
                  : a.homeScore < a.awayScore
                    ? (r.v++, n.d++, (r.pts += 3))
                    : (n.e++, r.e++, (n.pts += 1), (r.pts += 1)));
            }),
            Object.values(l).forEach((a) => (a.sg = a.gp - a.gc)),
            Object.values(l).sort(
              (a, n) => n.pts - a.pts || n.sg - a.sg || n.gp - a.gp,
            )
          );
        }
        function Zt(e) {
          return e.bye
            ? e.home
            : e.played
              ? e.homeScore > e.awayScore
                ? e.homeId
                : e.awayScore > e.homeScore
                  ? e.awayId
                  : e.penaltyWinner || null
              : null;
        }
        function L(e) {
          let value = Number(e);
          return `${Number.isFinite(value) ? value : 0}M`;
        }
        function trophyAssetFor(tournament) {
          return tournament && tournament.type === "cup" ? "assets/trofeu-copa.png" : "assets/trofeu-liga.png";
        }
        function TrophyAsset({ tournament, size = 92, style = {} }) {
          return React.createElement("img", { src:trophyAssetFor(tournament), alt:tournament && tournament.type === "cup" ? "Troféu da copa" : "Troféu do campeonato", style:{ width:size, height:size, objectFit:"contain", filter:"drop-shadow(0 14px 24px rgba(255,183,0,.22))", ...style } });
        }
        function offerStatusLabel(status) {
          return ({ pending: "Aguardando resposta", countered: "Contraproposta recebida", accepted: "Aceita", declined: "Recusada", cancelled: "Cancelada", expired: "Expirada", invalid: "Jogador indisponível", insufficient_funds: "Saldo insuficiente" })[status] || status;
        }
        function isOfferOpen(offer) {
          return offer && (offer.status === "pending" || offer.status === "countered") && (!offer.expiresAt || offer.expiresAt > Date.now());
        }

  Object.assign(window.ManchaApp, { _, Ie, Ve, Fe, Yt, we, Zt, L, trophyAssetFor, TrophyAsset, offerStatusLabel, isOfferOpen });
})();
