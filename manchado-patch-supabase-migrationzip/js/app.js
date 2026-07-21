      (() => {
        var { useState: b, useEffect: He, useCallback: H, useMemo: X, useRef: Rf } = React;
        const {
          C, SvgIcon, _t, Vt, pe, Xe, ze, _e, Ye, ue, Ze, et, bo, qt, Kt, $t, tt, Jt, ot, nt, Ut, at, Qt, ho, Xt,
          SettingsIcon, ProfileIcon, OfferIcon, Star, FilterIcon, FlagIcon, BankIcon, AdminIcon, UserIcon, TrophyIcon, TeamIcon, DatabaseIcon, TrashIcon, BaseRosterIcon,
          it, se, W, P, q, M, E, V, O, POSITION_COLORS, _, Ie, Ve, Fe, Yt, we, Zt, Ee, U, Q, normalizeIdentityText, stableIdentityId, migrateStableIdentitySchema,
          eo, qe, L, trophyAssetFor, TrophyAsset, economySettingsOf, matchEconomyForTeam, prizeSettingsOf, championshipPrizeLadder, financeEntry,
          positionColor, overallColor, offerStatusLabel, isOfferOpen
        } = window.ManchaApp;
        const MagicWandIcon = SvgIcon(["M15 4l5 5", "M13.5 5.5 18.5 10.5", "M4 20l11-11", "M5 4v3", "M3.5 5.5h3", "M18 16v4", "M16 18h4"]);
        const EraserIcon = SvgIcon(["m4 15 8-8a2.5 2.5 0 0 1 3.5 0l2.5 2.5a2.5 2.5 0 0 1 0 3.5L11 20H7l-3-3a1.4 1.4 0 0 1 0-2Z", "m9 10 6 6", "M11 20h9"]);
        async function hashProfilePin(value) {
          if (!window.crypto || !window.crypto.subtle) throw new Error("Criptografia indisponível neste navegador.");
          let bytes = new TextEncoder().encode(`profile-pin:${String(value || "")}`);
          let digest = await window.crypto.subtle.digest("SHA-256", bytes);
          return Array.from(new Uint8Array(digest)).map((item) => item.toString(16).padStart(2, "0")).join("");
        }
        function to() {
          let [e, t] = b(!0),
            [l, a] = b(!1),
            [baseCatalog, setBaseCatalog] = b([]),
            [playerCatalogOverrides, setPlayerCatalogOverrides] = b({}),
            [playerReviews, setPlayerReviews] = b({}),
            [f, d] = b(!1),
            [baseTeams, setBaseTeams] = b([]),
            [baseOwnership, setBaseOwnership] = b({}),
            [baseStats, setBaseStats] = b({}),
            [m, g] = b([]),
            [baseTransfers, setBaseTransfers] = b([]),
            [B, u] = b({ currentTournamentId: null, seasonCounter: 1 }),
            [x, T] = b([]),
            [profileChampionshipPreferences, setProfileChampionshipPreferences] = b({}),
            [profilesLoaded, setProfilesLoaded] = b(!1),
            [tournamentsLoaded, setTournamentsLoaded] = b(!1),
            [identityReady, setIdentityReady] = b(!1),
            [te, me] = b(null),
            [selectedTournamentId, setSelectedTournamentId] = b(eo("pes-selected-tournament")),
            [lt, rt] = b(!1),
            [st, dt] = b(""),
            [Y, oe] = b("table"),
            [viewedTeamId, setViewedTeamId] = b(null),
            [ct, ge] = b(!1),
            [j, le] = b({ name: "", color: se[0], budget: 300 }),
            [Be, De] = b(null),
            [pt, fe] = b(!1),
            [Te, ye] = b({
              name: "",
              format: "liga",
              teamIds: [],
              numGroups: 2,
            }),
            [G, ve] = b(null),
            [K, re] = b({
              home: "",
              away: "",
              scorers: [],
              penaltyWinner: null,
            }),
            [ut, mt] = b(null),
            [gt, ft] = b(0),
            [Me, be] = b(null),
            [We, he] = b(null),
            [Re, Ae] = b(null),
            [offerModal, setOfferModal] = b(null),
            [saleModal, setSaleModal] = b(null),
            [balanceHistoryOpen, setBalanceHistoryOpen] = b(false),
            [rulesOpen, setRulesOpen] = b(false),
            [championshipSummary, setChampionshipSummary] = b(null),
            [matchWizard, setMatchWizard] = b(null),
            [cupMatchModal, setCupMatchModal] = b(null),
            [adminProfileName, setAdminProfileName] = b(""),
            [adminProfileColor, setAdminProfileColor] = b(se[0]),
            [adminProfileBudget, setAdminProfileBudget] = b(300),
            [adminTournamentName, setAdminTournamentName] = b(""),
            [setupAdminName, setSetupAdminName] = b("Admin"),
            [setupTournamentName, setSetupTournamentName] = b("Campeonato 1"),
            [setupSubmitting, setSetupSubmitting] = b(!1),
            [theme, setTheme] = b("dark"),
            [presence, setPresence] = b({}),
            [adminSecurity, setAdminSecurity] = b(null),
            [adminUnlocked, setAdminUnlocked] = b(() => {
              try { return sessionStorage.getItem("pes-admin-unlocked") === "1"; } catch (error) { return false; }
            }),
            [adminGate, setAdminGate] = b(null),
            [profilePinGate, setProfilePinGate] = b(null),
            [playerReportModal, setPlayerReportModal] = b(null),
            [playerReviewsOpen, setPlayerReviewsOpen] = b(false),
            [marketActionKey, setMarketActionKey] = b(null),
            marketActionRef = Rf(null);
          function signalImportantUpdate() {
            return Promise.resolve();
          }
          function beginMarketAction(key) {
            if (marketActionRef.current) return false;
            marketActionRef.current = key;
            setMarketActionKey(key);
            return true;
          }
          function endMarketAction(key) {
            if (!key || marketActionRef.current === key) {
              marketActionRef.current = null;
              setMarketActionKey(null);
            }
          }
          function applyConfirmedTournamentSnapshot(snapshot) {
            if (!snapshot) return [];
            let value = typeof snapshot.val === "function" ? snapshot.val() : snapshot;
            let list = Array.isArray(value)
              ? value.filter(Boolean)
              : value && typeof value === "object"
                ? Object.values(value).filter(Boolean)
                : [];
            g(list);
            setTournamentsLoaded(true);
            return list;
          }
          He(() => {
            document.documentElement.setAttribute("data-theme", theme);
            localStorage.setItem("pes-theme", JSON.stringify(theme));
          }, [theme]);
          He(() => {
            fetch("./players.json")
              .then((o) => {
                if (!o.ok) throw new Error("fail");
                return o.json();
              })
              .then((o) => setBaseCatalog(Array.isArray(o) ? o : []))
              .catch(() => d(!0));
          }, []);
          let n = X(() => (Array.isArray(baseCatalog) ? baseCatalog : []).map((player) => {
            if (!player || typeof player !== "object") return player;
            let override = playerCatalogOverrides && playerCatalogOverrides[player.id];
            if (!override || typeof override !== "object") return player;
            return { ...player, overall: override.overall != null ? Number(override.overall) : player.overall, value: override.value != null ? Number(override.value) : player.value };
          }), [baseCatalog, playerCatalogOverrides]);
          let xe = X(() => {
            let o = new Map();
            return (n.forEach((i) => o.set(i.id, i)), o);
          }, [n]);
          He(() => {
            if (!Ee()) {
              (a(!0), t(!1));
              return;
            }
            // A identidade ativa nunca deve ser restaurada automaticamente ao abrir o link.
            // Cada nova carga começa na seleção de campeonato e perfil.
            me(null);
            qe("pes-my-profile", null);
            try { sessionStorage.removeItem("pes-admin-unlocked"); } catch (error) {}
            setAdminUnlocked(false);
            rt(!0);
            migrateStableIdentitySchema().finally(() => setIdentityReady(!0));
            let o = [
              Q("teams", (i) => {
                (setBaseTeams(i || []), t(!1));
              }),
              Q("ownership", (i) => setBaseOwnership(i || {})),
              Q("playerStats", (i) => setBaseStats(i || {})),
              Q("tournaments", (i) => { let list = Array.isArray(i) ? i.filter(Boolean) : (i && typeof i === "object" ? Object.values(i).filter(Boolean) : []); g(list); setTournamentsLoaded(!0); }),
              Q("transfers", (i) => setBaseTransfers(i || [])),
              Q("meta", (i) =>
                u(i || { currentTournamentId: null, seasonCounter: 1 }),
              ),
              Q("presence", (i) => setPresence(i && typeof i === "object" ? i : {})),
              Q("adminSecurity", (i) => setAdminSecurity(i && typeof i === "object" ? i : null)),
              Q("playerCatalogOverrides", (i) => setPlayerCatalogOverrides(i && typeof i === "object" ? i : {})),
              Q("playerReviews", (i) => setPlayerReviews(i && typeof i === "object" ? i : {})),
              Q("profiles", (i) => {
                let list = Array.isArray(i) ? i : [];
                T(list);
                let storedProfile = eo("pes-my-profile");
                if (storedProfile) {
                  let storedName = normalizeIdentityText(typeof storedProfile === "object" ? storedProfile.name : storedProfile);
                  let resolvedProfile = list.find((profile) => profile && typeof profile === "object" && storedProfile.id && profile.id === storedProfile.id) || list.find((profile) => profile && typeof profile === "object" && normalizeIdentityText(profile.name) === storedName);
                  if (resolvedProfile) { me(resolvedProfile); qe("pes-my-profile", resolvedProfile); }
                }
                setProfilesLoaded(!0);
              }),
            ];
            return () => o.forEach((i) => i());
          }, []);
          He(() => {
            let db = Ee();
            if (!db || !te || !te.id) return;
            let connectedRef = db.ref(".info/connected");
            let presenceRef = db.ref("pes/presence/" + te.id);
            let handler = (snapshot) => {
              if (snapshot.val() !== true) return;
              presenceRef.onDisconnect().remove();
              presenceRef.set({ online: true, updatedAt: Date.now() });
            };
            connectedRef.on("value", handler);
            return () => {
              connectedRef.off("value", handler);
              presenceRef.remove().catch(() => {});
            };
          }, [te && te.id]);
          let R = X(
              () => m.find((o) => o.id === selectedTournamentId) || null,
              [m, selectedTournamentId],
            );
          He(() => {
            if (!tournamentsLoaded || !m.length) return;
            if (selectedTournamentId && m.some((item) => item && item.id === selectedTournamentId)) return;
            let ordered = [...m].sort((a,b) => (Number(b.createdAt || b.finishedAt) || 0) - (Number(a.createdAt || a.finishedAt) || 0));
            let preferred = ordered.find((item) => item.status !== "finished") || ordered[0];
            if (preferred && preferred.id) { setSelectedTournamentId(preferred.id); qe("pes-selected-tournament", preferred.id); }
          }, [tournamentsLoaded, m, selectedTournamentId]);
          He(() => {
            if (!R || !R.id || !te || typeof te !== "object" || !te.id || !Array.isArray(te.favoritePlayerIds) || te.favoritePlayerIds.length === 0) return;
            let db = Ee();
            if (!db) return;
            db.ref("pes").transaction((rootValue) => {
              if (!rootValue || typeof rootValue !== "object") return rootValue;
              let root = { ...rootValue };
              let profiles = Array.isArray(root.profiles) ? root.profiles.map((profile) => profile && typeof profile === "object" ? { ...profile } : profile) : [];
              let profileIndex = profiles.findIndex((profile) => profile && typeof profile === "object" && String(profile.id) === String(te.id));
              if (profileIndex < 0 || !Array.isArray(profiles[profileIndex].favoritePlayerIds) || profiles[profileIndex].favoritePlayerIds.length === 0) return;
              let legacyIds = profiles[profileIndex].favoritePlayerIds.map((id) => String(id));
              let preferences = root.profileChampionshipPreferences && typeof root.profileChampionshipPreferences === "object" ? { ...root.profileChampionshipPreferences } : {};
              let tournamentPreferences = preferences[R.id] && typeof preferences[R.id] === "object" ? { ...preferences[R.id] } : {};
              let profilePreferences = tournamentPreferences[te.id] && typeof tournamentPreferences[te.id] === "object" ? { ...tournamentPreferences[te.id] } : {};
              let favorites = profilePreferences.favorites && typeof profilePreferences.favorites === "object" ? { ...profilePreferences.favorites } : {};
              legacyIds.forEach((id) => { favorites[id] = true; });
              tournamentPreferences[te.id] = { ...profilePreferences, favorites, migratedFromGlobalAt: Date.now() };
              preferences[R.id] = tournamentPreferences;
              let nextProfile = { ...profiles[profileIndex] };
              delete nextProfile.favoritePlayerIds;
              profiles[profileIndex] = nextProfile;
              root.profiles = profiles;
              root.profileChampionshipPreferences = preferences;
              return root;
            }).catch((error) => console.error("favorite migration failed", error));
          }, [R && R.id, te && te.id, te && Array.isArray(te.favoritePlayerIds) ? te.favoritePlayerIds.join("|") : ""]);
          He(() => {
            if (!R || !R.id || !te || !te.id) {
              setProfileChampionshipPreferences({});
              return;
            }
            return Q(`profileChampionshipPreferences/${R.id}/${te.id}`, (value) => {
              setProfileChampionshipPreferences({
                [R.id]: { [te.id]: value && typeof value === "object" ? value : {} },
              });
            });
          }, [R && R.id, te && te.id]);
          let currentFavoriteIds = X(() => {
            if (!R || !R.id || !te || !te.id) return [];
            let favorites = profileChampionshipPreferences && profileChampionshipPreferences[R.id] && profileChampionshipPreferences[R.id][te.id] && profileChampionshipPreferences[R.id][te.id].favorites;
            return favorites && typeof favorites === "object" ? Object.keys(favorites).filter((id) => favorites[id]) : [];
          }, [profileChampionshipPreferences, R && R.id, te && te.id]);
          let linkedLeague = R && R.type === "cup" && R.linkedLeagueId ? m.find((item) => item && String(item.id) === String(R.linkedLeagueId)) : null,
            effectiveContext = linkedLeague && linkedLeague.context ? linkedLeague.context : (R && R.context ? R.context : null),
            p = effectiveContext ? (Array.isArray(effectiveContext.teams) ? effectiveContext.teams : []) : (Array.isArray(baseTeams) ? baseTeams : []),
            c = effectiveContext ? (effectiveContext.ownership && typeof effectiveContext.ownership === "object" ? effectiveContext.ownership : {}) : (baseOwnership && typeof baseOwnership === "object" ? baseOwnership : {}),
            s = R && R.context ? (R.context.playerStats && typeof R.context.playerStats === "object" ? R.context.playerStats : {}) : (baseStats && typeof baseStats === "object" ? baseStats : {}),
            k = effectiveContext ? (Array.isArray(effectiveContext.transfers) ? effectiveContext.transfers : []) : (Array.isArray(baseTransfers) ? baseTransfers : []),
            tradeOffers = effectiveContext && effectiveContext.tradeOffers && typeof effectiveContext.tradeOffers === "object" ? effectiveContext.tradeOffers : {},
            marketTournament = linkedLeague || R,
            marketTournamentId = marketTournament && marketTournament.id ? marketTournament.id : null;

          He(() => {
            if (!R || !R.id || R.type === "cup" || !R.context || R.context.originSchemaVersion >= 1) return;
            let db = Ee();
            if (!db) return;
            db.ref("pes/tournaments").transaction((serverValue) => {
              let isArray = Array.isArray(serverValue);
              let list = isArray ? [...serverValue] : Object.values(serverValue || {});
              let index = list.findIndex((item) => item && String(item.id) === String(R.id));
              if (index < 0) return;
              let tournament = list[index], context = tournament.context && typeof tournament.context === "object" ? { ...tournament.context } : {};
              if (Number(context.originSchemaVersion || 0) >= 1) return serverValue;
              let ownership = context.ownership && typeof context.ownership === "object" ? { ...context.ownership } : {};
              let transfers = Array.isArray(context.transfers) ? context.transfers : [];
              Object.keys(ownership).forEach((playerId) => {
                let item = ownership[playerId];
                if (!item || typeof item !== "object" || item.acquisitionSource) return;
                let origin = inferPlayerAcquisition(playerId, item, transfers);
                ownership[playerId] = { ...item, acquisitionSource:origin.acquisitionSource, initialTeamId:origin.initialTeamId || null, originMigratedAt:Date.now() };
              });
              list[index] = { ...tournament, context:{ ...context, ownership, originSchemaVersion:1, originMigratedAt:Date.now() } };
              return isArray ? list : Object.fromEntries(list.map((item,idx) => [item.id || String(idx), item]));
            }).catch((error) => console.error("player origin migration failed", error));
          }, [R && R.id]);

          He(() => {
            if (!R || R.type !== "cup" || !R.id) return;
            let linked = R.linkedLeagueId ? m.find((item) => item && String(item.id) === String(R.linkedLeagueId)) : null;
            let linkedTeams = linked && linked.context && Array.isArray(linked.context.teams) ? linked.context.teams.filter(Boolean) : [];
            let currentGroups = Array.isArray(R.groups) ? R.groups : [];
            let currentMatches = Array.isArray(R.matches) ? R.matches : [];
            let participantIds = Array.isArray(R.participants) ? R.participants.map((id) => String(id)) : [];
            let teamIds = Array.isArray(R.teamIds) ? R.teamIds.map((id) => String(id)) : [];
            let needsRepair = !Array.isArray(R.groups) || !Array.isArray(R.matches) || participantIds.some((id) => typeof id !== "string") || teamIds.some((id) => typeof id !== "string");
            if (!needsRepair && currentGroups.length && currentMatches.length) return;
            if (!linked || linkedTeams.length < 2) return;
            let selectedTeams = teamIds.length ? linkedTeams.filter((team) => teamIds.includes(String(team.id))) : linkedTeams.filter((team) => participantIds.includes(String(team.profileId)));
            if (selectedTeams.length < 2) return;
            let groupCount = Math.max(1, Number(R.cupConfig && R.cupConfig.groupCount) || cupGroupCount(selectedTeams.length));
            let repairedGroups = currentGroups.length ? currentGroups.map((group, index) => ({ ...group, name: group.name || `Grupo ${String.fromCharCode(65 + index)}`, teamIds: Array.isArray(group.teamIds) ? group.teamIds.map((id) => String(id)) : [] })) : (() => {
              let shuffled = cupShuffle(selectedTeams.map((team) => String(team.id)));
              let buckets = Array.from({ length: groupCount }, () => []);
              shuffled.forEach((teamId, index) => buckets[index % groupCount].push(teamId));
              return buckets.map((ids, index) => ({ name: `Grupo ${String.fromCharCode(65 + index)}`, teamIds: ids }));
            })();
            let repairedMatches = currentMatches.length ? currentMatches.map((match) => ({ ...match, homeId: match.homeId != null ? String(match.homeId) : null, awayId: match.awayId != null ? String(match.awayId) : null })) : repairedGroups.flatMap((group) => cupRoundRobin(group.teamIds, Number(R.cupConfig && R.cupConfig.groupLegs) === 2 ? 2 : 1, group.name));
            let repaired = { ...R, status: R.status || "ongoing", cupStage: R.cupStage || "groups", participants: selectedTeams.map((team) => String(team.profileId)), teamIds: selectedTeams.map((team) => String(team.id)), groups: repairedGroups, matches: repairedMatches, context: { ...(R.context || {}), teams: selectedTeams.map((team) => ({ ...team })) } };
            ae(m.map((item) => item && String(item.id) === String(R.id) ? repaired : item));
          }, [R && R.id]);

          function saveContextField(field, value) {
            if (!R) return false;
            let tournamentId = R.id;
            g((current) =>
              current.map((item) =>
                item.id === tournamentId
                  ? {
                      ...item,
                      context: { ...(item.context || {}), [field]: value },
                    }
                  : item,
              ),
            );
            let db = Ee();
            if (!db) return true;
            db.ref("pes/tournaments").transaction((serverList) => {
              let list = Array.isArray(serverList) ? [...serverList] : [];
              let index = list.findIndex((item) => item && item.id === tournamentId);
              if (index < 0) return serverList;
              let tournament = list[index] || {};
              list[index] = {
                ...tournament,
                context: { ...(tournament.context || {}), [field]: value },
              };
              return list;
            }).then((result) => {
              if (result && result.committed && result.snapshot) applyConfirmedTournamentSnapshot(result.snapshot);
            }).catch((error) => console.error("Supabase context transaction failed", field, error));
            return true;
          }

          function Se(o) {
            if (!saveContextField("teams", o)) {
              setBaseTeams(o);
              U("teams", o);
            }
          }
          function ne(o) {
            if (!saveContextField("ownership", o)) {
              setBaseOwnership(o);
              U("ownership", o);
            }
          }
          function yt(o) {
            if (!saveContextField("playerStats", o)) {
              setBaseStats(o);
              U("playerStats", o);
            }
          }
          function isPlainObject(value) {
            return !!value && typeof value === "object" && !Array.isArray(value);
          }
          function applySafeDiff(serverValue, previousValue, nextValue) {
            if (Array.isArray(previousValue) && Array.isArray(nextValue)) {
              let objectList = [...previousValue, ...nextValue].every(
                (item) => !item || (typeof item === "object" && item.id != null),
              );
              if (!objectList) return nextValue;
              let serverList = Array.isArray(serverValue) ? [...serverValue] : [];
              let previousById = new Map(previousValue.filter(Boolean).map((item) => [String(item.id), item]));
              let nextById = new Map(nextValue.filter(Boolean).map((item) => [String(item.id), item]));
              let serverById = new Map(serverList.filter(Boolean).map((item) => [String(item.id), item]));
              for (let id of previousById.keys()) {
                if (!nextById.has(id)) serverById.delete(id);
              }
              for (let [id, nextItem] of nextById) {
                let previousItem = previousById.get(id);
                if (!previousItem) serverById.set(id, nextItem);
                else if (JSON.stringify(previousItem) !== JSON.stringify(nextItem)) {
                  serverById.set(id, applySafeDiff(serverById.get(id), previousItem, nextItem));
                }
              }
              let nextOrder = nextValue.map((item) => String(item.id));
              let ordered = nextOrder.map((id) => serverById.get(id)).filter(Boolean);
              for (let item of serverList) {
                if (item && serverById.has(String(item.id)) && !nextOrder.includes(String(item.id))) {
                  ordered.push(serverById.get(String(item.id)));
                }
              }
              return ordered;
            }
            if (isPlainObject(previousValue) && isPlainObject(nextValue)) {
              let result = isPlainObject(serverValue) ? { ...serverValue } : {};
              for (let key of Object.keys(previousValue)) {
                if (!(key in nextValue)) delete result[key];
              }
              for (let key of Object.keys(nextValue)) {
                if (!(key in previousValue)) result[key] = nextValue[key];
                else if (JSON.stringify(previousValue[key]) !== JSON.stringify(nextValue[key])) {
                  result[key] = applySafeDiff(result[key], previousValue[key], nextValue[key]);
                }
              }
              return result;
            }
            return nextValue;
          }
          let ae = H((nextList) => {
            let previousList = Array.isArray(m) ? m : [];
            g(nextList);
            let db = Ee();
            if (!db) return;
            db.ref("pes/tournaments").transaction((serverList) =>
              applySafeDiff(Array.isArray(serverList) ? serverList : [], previousList, nextList),
            ).then((result) => {
              if (result && result.committed && result.snapshot) applyConfirmedTournamentSnapshot(result.snapshot);
            }).catch((error) => console.error("Supabase tournament transaction failed", error));
          }, [m]);
          function vt(o) {
            if (!saveContextField("transfers", o)) {
              setBaseTransfers(o);
              U("transfers", o);
            }
          }
          let Ne = H((o) => {
            (u(o), U("meta", o));
          }, []);

          async function completeInitialSetup() {
            if (setupSubmitting) return;
            let adminName = String(setupAdminName || "").trim();
            let tournamentName = String(setupTournamentName || "").trim();
            if (!adminName) {
              window.alert("Informe o nome do perfil administrador.");
              return;
            }
            setSetupSubmitting(!0);
            try {
              let adminProfile = {
                id: _(),
                name: adminName,
                color: se[0],
                role: "admin",
                active: true,
                avatar: null,
                createdAt: Date.now(),
              };
              let db = Ee();
              if (!db) throw new Error("Supabase indisponível");
              let createdAdmin = null;
              let profileResult = await db.ref("pes/profiles").transaction((serverProfiles) => {
                let current = Array.isArray(serverProfiles) ? serverProfiles.filter(Boolean) : [];
                if (current.length > 0) return;
                createdAdmin = adminProfile;
                return [adminProfile];
              });
              if (!profileResult || !profileResult.committed || !createdAdmin) {
                window.alert("Já existem perfis no app. A configuração inicial foi cancelada para preservar os dados.");
                return;
              }
              T([createdAdmin]);

              let targetTournamentId = m[0] && m[0].id ? m[0].id : null;
              if (!targetTournamentId && tournamentName) {
                let tournament = {
                  id: _(),
                  name: tournamentName,
                  format: "liga",
                  status: "active",
                  participants: [],
                  teamIds: [],
                  createdAt: Date.now(),
                  marketSettings: { depreciationPct: 10, initialRosterDepreciationPct: 50, isOpen: true, freePlayerOverallLimit: { enabled:false, maxOverall:99 } },
                  rosterSettings: { minPlayers: 23, maxPlayers: 30 },
                  economySettings: { version: 2, winReward: 5, scoringDrawReward: 3, scorelessDrawReward: 2, lossReward: 1, goalReward: 1, redCardPenalty: 1 },
                  finalPrizeSettings: { firstPlacePrize: 20, lastPlacePercentage: 50 },
                  context: { teams: [], ownership: {}, playerStats: {}, transfers: [], tradeOffers: {}, financialTransactions: [], matches: [] },
                };
                ae([...m, tournament]);
                targetTournamentId = tournament.id;
              }

              me(createdAdmin);
              qe("pes-my-profile", createdAdmin);
              setSelectedTournamentId(targetTournamentId);
              qe("pes-selected-tournament", targetTournamentId);
              De(null);
              oe("admin");
            } catch (error) {
              console.error("initial setup failed", error);
              window.alert("Não foi possível concluir a configuração inicial. Tente novamente.");
            } finally {
              setSetupSubmitting(!1);
            }
          }

          function isAdminProfile(profile) {
            let item = typeof profile === "object" && profile ? profile : { name: String(profile || "") };
            return item.role === "admin" || String(item.name || "").trim().toLowerCase() === "admin";
          }
          async function hashAdminPassword(value) {
            let bytes = new TextEncoder().encode(String(value || ""));
            let digest = await crypto.subtle.digest("SHA-256", bytes);
            return Array.from(new Uint8Array(digest)).map((item) => item.toString(16).padStart(2, "0")).join("");
          }
          function requestAdminAccess() {
            if (!isAdminProfile(te)) return;
            let unlocked = false;
            try { unlocked = sessionStorage.getItem("pes-admin-unlocked") === "1"; } catch (error) {}
            if (unlocked) { setAdminUnlocked(true); oe("admin"); return; }
            setAdminGate({ mode: adminSecurity && adminSecurity.passwordHash ? "verify" : "create", password: "", confirm: "", error: "", submitting: false });
          }
          async function submitAdminGate(passwordOverride = null, gateOverride = null) {
            let gate = gateOverride || adminGate;
            if (!gate || gate.submitting) return;
            let password = String(passwordOverride != null ? passwordOverride : gate.password || "");
            if (password.length < 6) { setAdminGate({ ...gate, password, error: "Use uma senha com pelo menos 6 caracteres." }); return; }
            if (gate.mode === "create" && password !== String(gate.confirm || "")) { setAdminGate({ ...gate, password, error: "As senhas não coincidem." }); return; }
            setAdminGate({ ...gate, password, submitting: true, error: "" });
            try {
              let passwordHash = await hashAdminPassword(password);
              if (gate.mode === "verify" && (!adminSecurity || passwordHash !== adminSecurity.passwordHash)) {
                setAdminGate({ ...gate, password:"", submitting: false, error: "Senha incorreta." });
                return;
              }
              if (gate.mode === "create") {
                let security = { passwordHash, updatedAt: Date.now(), updatedByProfileId: te && te.id ? te.id : null };
                await Promise.resolve(U("adminSecurity", security));
                setAdminSecurity(security);
              }
              try { sessionStorage.setItem("pes-admin-unlocked", "1"); } catch (error) {}
              setAdminUnlocked(true);
              setAdminGate(null);
              oe("admin");
            } catch (error) {
              console.error("admin access error", error);
              setAdminGate({ ...gate, password, submitting: false, error: "Não foi possível validar a senha. Tente novamente." });
            }
          }
          function pendingPlayerReviews() {
            return Object.values(playerReviews && typeof playerReviews === "object" ? playerReviews : {}).filter((review) => review && review.status === "pending");
          }
          function submitPlayerReview(player, values) {
            if (!player || !te || !te.id) return;
            let overallText = String(values && values.overall != null ? values.overall : "").trim();
            let valueText = String(values && values.value != null ? values.value : "").trim();
            let proposedOverall = overallText === "" ? null : Number(overallText);
            let proposedValue = valueText === "" ? null : Number(valueText);
            if (proposedOverall == null && proposedValue == null) { window.alert("Preencha pelo menos um novo valor."); return; }
            if (proposedOverall != null && (!Number.isInteger(proposedOverall) || proposedOverall < 1 || proposedOverall > 99)) { window.alert("O overall deve ser um número inteiro entre 1 e 99."); return; }
            if (proposedValue != null && (!Number.isFinite(proposedValue) || proposedValue <= 0)) { window.alert("O valor de mercado deve ser maior que zero."); return; }
            if ((proposedOverall == null || proposedOverall === Number(player.overall)) && (proposedValue == null || proposedValue === Number(player.value))) { window.alert("Informe pelo menos um valor diferente do atual."); return; }
            let duplicate = pendingPlayerReviews().find((review) => String(review.playerId) === String(player.id) && String(review.createdByProfileId) === String(te.id));
            if (duplicate) { window.alert("Você já possui uma revisão pendente para este jogador."); return; }
            let id = _(), now = Date.now();
            let review = { id, playerId:player.id, playerNameSnapshot:player.name, original:{ overall:Number(player.overall)||0, value:Number(player.value)||0 }, proposed:{ overall:proposedOverall, value:proposedValue }, createdByProfileId:te.id, createdByNameSnapshot:te.name||"Perfil", createdAt:now, status:"pending", votes:{} };
            let db = Ee();
            if (!db) { setPlayerReviews({ ...playerReviews, [id]:review }); setPlayerReportModal(null); return; }
            db.ref("pes/playerReviews/" + id).set(review).then(() => setPlayerReportModal(null)).catch((error) => { console.error("player review submit failed", error); window.alert("Não foi possível enviar a revisão. Tente novamente."); });
          }
          function removePlayerReview(reviewId) {
            if (!reviewId || !te || !te.id) return;
            let review = playerReviews && typeof playerReviews === "object" ? playerReviews[reviewId] : null;
            if (!review) { window.alert("Esta revisão não está mais disponível."); return; }
            let adminCanRemove = isAdminProfile(te);
            let ownPendingReview = String(review.createdByProfileId) === String(te.id) && review.status === "pending";
            if (!adminCanRemove && !ownPendingReview) { window.alert("Você não tem permissão para remover esta revisão."); return; }
            let actionLabel = adminCanRemove && !ownPendingReview ? "remover esta revisão" : "cancelar este pedido";
            if (!window.confirm(`Tem certeza que deseja ${actionLabel}?`)) return;
            let db = Ee();
            if (!db) {
              let next = { ...(playerReviews || {}) };
              delete next[reviewId];
              setPlayerReviews(next);
              return;
            }
            let failureReason = null;
            db.ref("pes/playerReviews/" + reviewId).transaction((reviewValue) => {
              let current = reviewValue && typeof reviewValue === "object" ? reviewValue : null;
              if (!current) { failureReason = "unavailable"; return; }
              let canRemoveCurrent = adminCanRemove || (String(current.createdByProfileId) === String(te.id) && current.status === "pending");
              if (!canRemoveCurrent) { failureReason = "forbidden"; return; }
              failureReason = null;
              return null;
            }, (error, committed) => {
              if (error) {
                console.error("player review removal failed", error);
                window.alert("Não foi possível remover a revisão. Tente novamente.");
                return;
              }
              if (!committed) {
                let messages = { unavailable:"Esta revisão não está mais disponível.", forbidden:"Você não tem permissão para remover esta revisão." };
                window.alert(messages[failureReason] || "A revisão não pôde ser removida.");
              }
            });
          }
          function votePlayerReview(reviewId, decision) {
            if (!te || !te.id || !["approve","reject"].includes(decision)) return;
            let db = Ee();
            if (!db) return;
            let voter = (Array.isArray(x) ? x : []).find((profile) => profile && String(profile.id) === String(te.id));
            if (!voter || voter.active === false) { window.alert("Este perfil não pode votar."); return; }
            let failureReason = null;
            let reviewRef = db.ref("pes/playerReviews/" + reviewId);
            reviewRef.transaction((reviewValue) => {
              let review = reviewValue && typeof reviewValue === "object" ? { ...reviewValue } : null;
              if (!review || review.status !== "pending") { failureReason="unavailable"; return; }
              if (String(review.createdByProfileId) === String(te.id)) { failureReason="own_review"; return; }
              let votes = review.votes && typeof review.votes === "object" ? { ...review.votes } : {};
              votes[te.id] = { decision, profileNameSnapshot:voter.name||te.name||"Perfil", avatarSnapshot:voter.avatar||null, colorSnapshot:voter.color||null, createdAt:Date.now() };
              let approvals = Object.values(votes).filter((vote) => vote && vote.decision === "approve").length;
              let rejections = Object.values(votes).filter((vote) => vote && vote.decision === "reject").length;
              let nextReview = { ...review, votes, updatedAt:Date.now() };
              if (approvals >= 3) nextReview = { ...nextReview, status:"applying", applyingAt:Date.now(), applyingByProfileId:te.id };
              else if (rejections >= 3) nextReview = { ...nextReview, status:"rejected", resolvedAt:Date.now(), resolvedByProfileId:te.id };
              failureReason=null;
              return nextReview;
            }, (error, committed, snapshot) => {
              if (error) { console.error("player review vote failed", error); window.alert("Não foi possível registrar seu voto. Tente novamente."); return; }
              if (!committed) {
                let messages={ own_review:"Você não pode votar na própria sugestão.", unavailable:"Esta revisão não está mais disponível." };
                window.alert(messages[failureReason]||"O voto não pôde ser registrado.");
                return;
              }
              let savedReview = snapshot && snapshot.val();
              if (!savedReview || savedReview.status !== "applying") return;
              let basePlayer = (Array.isArray(baseCatalog) ? baseCatalog : []).find((player) => player && String(player.id) === String(savedReview.playerId));
              if (!basePlayer) {
                reviewRef.update({ status:"outdated", resolvedAt:Date.now(), resolutionReason:"player_not_found" });
                return;
              }
              let overrideRef = db.ref("pes/playerCatalogOverrides/" + savedReview.playerId);
              let applyFailure = null;
              overrideRef.transaction((overrideValue) => {
                let currentOverride = overrideValue && typeof overrideValue === "object" ? { ...overrideValue } : {};
                let currentOverall = currentOverride.overall != null ? Number(currentOverride.overall) : Number(basePlayer.overall);
                let currentValue = currentOverride.value != null ? Number(currentOverride.value) : Number(basePlayer.value);
                if (currentOverall !== Number(savedReview.original && savedReview.original.overall) || currentValue !== Number(savedReview.original && savedReview.original.value)) {
                  applyFailure="player_changed";
                  return;
                }
                applyFailure=null;
                return { ...currentOverride, ...(savedReview.proposed && savedReview.proposed.overall != null ? { overall:Number(savedReview.proposed.overall) } : {}), ...(savedReview.proposed && savedReview.proposed.value != null ? { value:Number(savedReview.proposed.value) } : {}), updatedAt:Date.now(), approvedReviewId:savedReview.id };
              }, (applyError, applied) => {
                if (applyError) {
                  console.error("player review apply failed", applyError);
                  reviewRef.transaction((reviewValue) => reviewValue && reviewValue.status === "applying" ? { ...reviewValue, status:"pending", applyingAt:null, applyingByProfileId:null } : reviewValue);
                  window.alert("O voto foi registrado, mas não foi possível aplicar a correção. Tente novamente.");
                  return;
                }
                if (!applied || applyFailure === "player_changed") {
                  reviewRef.update({ status:"outdated", resolvedAt:Date.now(), resolutionReason:"player_changed", applyingAt:null, applyingByProfileId:null });
                  return;
                }
                reviewRef.update({ status:"approved", resolvedAt:Date.now(), resolvedByProfileId:te.id, applyingAt:null, applyingByProfileId:null });
              });
            });
          }
          function selectTournament(o) {
            let keepAdmin = isAdminProfile(te);
            setSelectedTournamentId(o || null);
            qe("pes-selected-tournament", o || null);
            De(null);
            if (keepAdmin) {
              oe("admin");
            } else {
              me(null);
              qe("pes-my-profile", null);
              oe("table");
            }
          }
          function profileBelongsToTournament(profile, tournament) {
            if (!tournament) return false;
            let item = typeof profile === "object" && profile ? profile : { name: String(profile) };
            if (isAdminProfile(item)) return true;
            if (item.active === false) return false;
            if (Array.isArray(tournament.participants) && item.id) {
              let participantIds = tournament.participants.map((id) => String(id));
              return participantIds.includes(String(item.id));
            }
            if (Array.isArray(item.tournamentIds)) return item.tournamentIds.includes(tournament.id);
            let contextTeams = (tournament.context && tournament.context.teams) || [];
            return !!contextTeams.find((team) => team.profileId === item.id || team.id === item.teamId || String(team.name || "").trim().toLowerCase() === String(item.name || "").trim().toLowerCase());
          }
          function enterProfile(o) {
            if (!R || !profileBelongsToTournament(o, R)) return;
            let i = typeof o === "object" && o ? o : { name: String(o) },
              y = String(i.name || "").trim();
            if (!y) return;
            let D =
              p.find((S) => S.profileId === i.id) ||
              p.find((S) => S.id === i.teamId) ||
              p.find(
                (S) =>
                  String(S.name || "")
                    .trim()
                    .toLowerCase() === y.toLowerCase(),
              );
            if (!D) {
              ((D = {
                id: _(),
                profileId: i.id,
                name: y,
                color: i.color || se[p.length % se.length],
                budget: 300,
                active: true,
              }),
                Se([...p, D]));
            }
            let A = { ...i, name: y, color: i.color || D.color };
            (me(A), qe("pes-my-profile", A));
            let w = x.findIndex(
                (S) =>
                  (S && typeof S === "object" && i.id && S.id === i.id) ||
                  (!i.id && String(typeof S === "object" && S ? S.name : S)
                    .trim()
                    .toLowerCase() === y.toLowerCase()),
              ),
              z = w >= 0 ? x.map((S, J) => (J === w ? A : S)) : [...x, A];
            (T(z), U("profiles", z), oe("table"), De(D.id));
          }
          function bt(o) {
            if (!R) return;
            let selected = typeof o === "object" && o ? o : { name: String(o) };
            let profile = selected && selected.id
              ? (x.find((item) => item && typeof item === "object" && String(item.id) === String(selected.id)) || selected)
              : selected;
            if (!profileBelongsToTournament(profile, R)) return;
            let storedPinHash = String(profile.pinHash || "").trim();
            if (storedPinHash) {
              setProfilePinGate({ profile:{ ...profile, pinHash:storedPinHash }, digits:"", error:"", checking:false, openedAt:Date.now() });
              return;
            }
            enterProfile(profile);
          }
          async function appendProfilePinDigit(digit) {
            let gate = profilePinGate;
            if (!gate || gate.checking || String(gate.digits || "").length >= 4) return;
            let digits = `${gate.digits || ""}${digit}`.replace(/\D/g, "").slice(0,4);
            let next = { ...gate, digits, error:"" };
            setProfilePinGate(next);
            if (digits.length !== 4) return;
            setProfilePinGate({ ...next, checking:true });
            try {
              let hash = await hashProfilePin(digits);
              let currentProfile = gate.profile && gate.profile.id
                ? (x.find((item) => item && typeof item === "object" && String(item.id) === String(gate.profile.id)) || gate.profile)
                : gate.profile;
              let expectedHash = String((currentProfile && currentProfile.pinHash) || gate.profile.pinHash || "").trim();
              if (hash === expectedHash) {
                setProfilePinGate(null);
                enterProfile(currentProfile || gate.profile);
                return;
              }
              window.setTimeout(() => setProfilePinGate((current) => current ? { ...current, digits:"", error:"PIN incorreto", checking:false } : current), 280);
            } catch (error) {
              console.error("profile pin validation failed", error);
              setProfilePinGate((current) => current ? { ...current, digits:"", error:"Não foi possível validar o PIN. Tente novamente.", checking:false } : current);
            }
          }
          function eraseProfilePinDigit() {
            setProfilePinGate((gate) => gate && !gate.checking ? { ...gate, digits:gate.digits.slice(0,-1), error:"" } : gate);
          }
          function ht() {
            try { sessionStorage.removeItem("pes-admin-unlocked"); } catch (error) {}
            setAdminUnlocked(false);
            setAdminGate(null);
            (me(null), qe("pes-my-profile", null), De(null), oe("table"));
          }
          let $ = H((o) => p.find((i) => i.id === o), [p]),
            Oe = H(
              (o) => n.filter((i) => c[i.id] && c[i.id].teamId === o),
              [n, c],
            ),
            ProfileName = X(
              () =>
                te ? String(typeof te === "object" && te ? te.name : te) : "",
              [te],
            ),
            ProfileTeam = X(() => {
              if (!te) return null;
              let o = typeof te === "object" && te ? te : {};
              return (
                p.find((i) => i.profileId === o.id) ||
                p.find((i) => i.id === o.teamId) ||
                p.find(
                  (i) =>
                    String(i.name || "")
                      .trim()
                      .toLowerCase() === ProfileName.trim().toLowerCase(),
                ) ||
                null
              );
            }, [te, p, ProfileName]),
            ProfileTeams = ProfileTeam ? [ProfileTeam] : [],
            unreadOfferCount = ProfileTeam ? Object.values(tradeOffers).filter((offer) => isOfferOpen(offer) && String(offer.lastActorTeamId) !== String(ProfileTeam.id) && (String(offer.buyerTeamId) === String(ProfileTeam.id) || String(offer.sellerTeamId) === String(ProfileTeam.id))).length : 0;
          function At() {
            (le({ name: "", color: se[p.length % se.length], budget: 300 }),
              ge(!0));
          }
          function xt() {
            if (!j.name.trim()) return;
            let o = {
              id: _(),
              name: j.name.trim(),
              color: j.color,
              budget: Math.max(0, Number(j.budget) || 0),
            };
            (Se([...p, o]), ge(!1));
          }
          function St(o) {
            Se(p.filter((y) => y.id !== o));
            let i = { ...c };
            (Object.keys(i).forEach((y) => {
              i[y].teamId === o && delete i[y];
            }),
              ne(i),
              Be === o && De(null));
          }
          function vo(o) {
            let i = c[o.id];
            return !i || !i.teamId ? o.value : i.forSale ? i.price : null;
          }
          function Pe(o) {
            let i = c[o.id];
            return !i || !i.teamId
              ? { kind: "free" }
              : i.forSale
                ? { kind: "listed", teamId: i.teamId, price: i.price }
                : { kind: "owned", teamId: i.teamId };
          }
          function fullSquadOverall(teamId, ownershipValue = c, catalogValue = n) { return window.ManchaApp.MarketFeature.fullSquadOverall(teamId, ownershipValue, catalogValue); }
          function marketBalanceSettings(tournament = R) { return window.ManchaApp.MarketFeature.marketBalanceSettings(tournament); }
          function marketAccessSettings(tournament = R) { return window.ManchaApp.MarketFeature.marketAccessSettings(tournament); }
          function inferPlayerAcquisition(playerId, ownershipItem, transfersValue = k) { return window.ManchaApp.MarketFeature.inferPlayerAcquisition(playerId, ownershipItem, transfersValue); }
          function isInitialRosterPlayer(playerId, teamId, ownershipValue = c, transfersValue = k) { return window.ManchaApp.MarketFeature.isInitialRosterPlayer(playerId, teamId, ownershipValue, transfersValue); }
          function marketSaleDepreciation(tournament, playerId, teamId, ownershipValue = c, transfersValue = k) { return window.ManchaApp.MarketFeature.marketSaleDepreciation(tournament, playerId, teamId, ownershipValue, transfersValue); }
          function marketOperationBlock(player, status, tournament = R) { return window.ManchaApp.MarketFeature.marketOperationBlock(player, status, tournament); }
          function evaluateMarketBalance(player, buyerTeamId, tournament = R, teamsValue = p, ownershipValue = c, catalogValue = n) { return window.ManchaApp.MarketFeature.evaluateMarketBalance(player, buyerTeamId, tournament, teamsValue, ownershipValue, catalogValue); }
          function marketBalanceMessage(check) { return window.ManchaApp.MarketFeature.marketBalanceMessage(check); }
          function kt(o) {
            let status = Pe(o);
            if (!ProfileTeam) return;
            let operationBlock = marketOperationBlock(o, status);
            if (operationBlock.blocked) { window.alert(operationBlock.message); return; }
            let maxPlayers = Math.max(1, Number(R && R.rosterSettings && R.rosterSettings.maxPlayers != null ? R.rosterSettings.maxPlayers : 30) || 30);
            let currentSize = Oe(ProfileTeam.id).length;
            if (status.kind === "free" && currentSize >= maxPlayers) {
              window.alert(`Seu elenco atingiu o limite de ${maxPlayers} jogadores. Venda alguém antes de comprar.`);
              return;
            }
            let balanceCheck = evaluateMarketBalance(o, ProfileTeam.id);
            if (!balanceCheck.allowed) {
              window.alert(marketBalanceMessage(balanceCheck));
              return;
            }
            if (status.kind === "free") {
              he({ player: o, status, balanceCheck });
              return;
            }
            if (status.teamId === ProfileTeam.id) return;
            setOfferModal({ player: o, status, amount: status.kind === "listed" && status.price ? status.price : o.value });
          }

          function mutateTradeOffersAtomic(actionKey, mutate, updateType = "trade_offer") {
            let db = Ee();
            if (!db || !marketTournamentId) return Promise.resolve({ committed:false, reason:"database_unavailable" });
            if (!beginMarketAction(actionKey)) {
              window.alert("Aguarde a operação atual ser concluída.");
              return Promise.resolve({ committed:false, reason:"busy" });
            }
            let failureReason = null;
            return new Promise((resolve) => {
              db.ref("pes/tournaments").transaction((serverValue) => {
                let isArray = Array.isArray(serverValue);
                let list = isArray ? [...serverValue] : Object.values(serverValue || {});
                let index = list.findIndex((item) => item && String(item.id) === String(marketTournamentId));
                if (index < 0) { failureReason = "championship_not_found"; return; }
                let tournament = list[index] || {}, context = tournament.context && typeof tournament.context === "object" ? { ...tournament.context } : {};
                let offers = context.tradeOffers && typeof context.tradeOffers === "object" ? { ...context.tradeOffers } : {};
                let nextOffers = mutate(offers, tournament, (reason) => { failureReason = reason; });
                if (!nextOffers) return;
                list[index] = { ...tournament, context:{ ...context, tradeOffers:nextOffers } };
                failureReason = null;
                return isArray ? list : Object.fromEntries(list.map((item, idx) => [item.id || String(idx), item]));
              }, (error, committed, snapshot) => {
                endMarketAction(actionKey);
                if (error) {
                  console.error("trade offer transaction failed", error);
                  resolve({ committed:false, reason:"Supabase_error", error });
                  return;
                }
                if (committed) {
                  applyConfirmedTournamentSnapshot(snapshot);
                  signalImportantUpdate(updateType, marketTournamentId);
                }
                resolve({ committed:!!committed, reason:failureReason, snapshot });
              }, false);
            });
          }
          async function sendTradeOffer(player, amount) {
            if (!R || !ProfileTeam || !marketTournamentId) return;
            let status = Pe(player), sellerTeamId = status.teamId;
            let operationBlock = marketOperationBlock(player, status, marketTournament || R);
            if (operationBlock.blocked) { window.alert(operationBlock.message); return; }
            let value = Math.max(1, Number(amount) || player.value);
            if (!sellerTeamId || String(sellerTeamId) === String(ProfileTeam.id)) return;
            if ((Number(ProfileTeam.budget) || 0) < value) {
              window.alert("Seu saldo é insuficiente para enviar esta oferta.");
              return;
            }
            let balanceCheck = evaluateMarketBalance(player, ProfileTeam.id, marketTournament || R);
            if (!balanceCheck.allowed) {
              window.alert(marketBalanceMessage(balanceCheck));
              return;
            }
            let id = _(), now = Date.now();
            let offer = {
              id, championshipId: marketTournamentId, playerId: player.id, playerName: player.name,
              buyerTeamId: ProfileTeam.id, sellerTeamId,
              status: "pending", currentAmount: value,
              marketValueAtCreation: player.value, createdAt: now, updatedAt: now,
              expiresAt: now + 48 * 60 * 60 * 1000,
              lastActorTeamId: ProfileTeam.id,
              history: [{ id: _(), type: "offer", amount: value, actorTeamId: ProfileTeam.id, createdAt: now }]
            };
            let result = await mutateTradeOffersAtomic(`offer-send:${marketTournamentId}:${player.id}:${ProfileTeam.id}`, (offers, tournament, fail) => {
              let duplicate = Object.values(offers).find((item) => item && isOfferOpen(item) && String(item.playerId) === String(player.id) && String(item.buyerTeamId) === String(ProfileTeam.id));
              if (duplicate) { fail("duplicate"); return null; }
              let owner = tournament.context && tournament.context.ownership && tournament.context.ownership[player.id];
              let actualSellerId = owner && owner.teamId != null ? owner.teamId : sellerTeamId;
              if (!actualSellerId || String(actualSellerId) === String(ProfileTeam.id)) { fail("owner_changed"); return null; }
              return { ...offers, [id]:{ ...offer, sellerTeamId:actualSellerId } };
            }, "trade_offer_created");
            if (result.committed) {
              setOfferModal(null);
              return;
            }
            let messages = {
              duplicate:"Você já possui uma negociação em andamento por este jogador.",
              owner_changed:"O jogador não pertence mais ao time selecionado.",
              championship_not_found:"O campeonato da negociação não foi encontrado.",
              database_unavailable:"Não foi possível acessar o Supabase."
            };
            if (result.reason !== "busy") window.alert(messages[result.reason] || "Não foi possível enviar a proposta. Tente novamente.");
          }
          async function updateTradeOffer(offerId, action, amount) {
            if (!ProfileTeam || !marketTournamentId) return;
            if (!marketAccessSettings(marketTournament || R).isOpen) { window.alert("O mercado está fechado pela administração."); return; }
            let result = await mutateTradeOffersAtomic(`offer-update:${marketTournamentId}:${offerId}`, (offers, tournament, fail) => {
              let offer = offers[offerId];
              if (!offer || !isOfferOpen(offer)) { fail("unavailable"); return null; }
              let isBuyer = String(offer.buyerTeamId) === String(ProfileTeam.id), isSeller = String(offer.sellerTeamId) === String(ProfileTeam.id);
              if (!isBuyer && !isSeller) { fail("forbidden"); return null; }
              let now = Date.now(), next = { ...offer, updatedAt:now };
              if (action === "decline") {
                if (!isSeller) { fail("forbidden"); return null; }
                next.status = "declined";
              } else if (action === "cancel") {
                if (!isBuyer) { fail("forbidden"); return null; }
                next.status = "cancelled";
              } else if (action === "counter") {
                if (String(offer.lastActorTeamId) === String(ProfileTeam.id)) { fail("not_your_turn"); return null; }
                let value = Math.max(1, Number(amount) || offer.currentAmount);
                next.status = "countered";
                next.currentAmount = value;
                next.lastActorTeamId = ProfileTeam.id;
                next.history = [...(offer.history || []), { id:_(), type:"counteroffer", amount:value, actorTeamId:ProfileTeam.id, createdAt:now }];
              } else { fail("invalid_action"); return null; }
              return { ...offers, [offerId]:next };
            }, "trade_offer_updated");
            if (!result.committed && result.reason !== "busy") {
              let messages = { unavailable:"A proposta não está mais disponível.", forbidden:"Você não pode alterar esta proposta.", not_your_turn:"Aguarde a resposta do outro usuário." };
              window.alert(messages[result.reason] || "Não foi possível atualizar a proposta.");
            }
          }
          function acceptTradeOffer(offerId) {
            if (!R || !ProfileTeam) return;
            if (!marketAccessSettings(R).isOpen) { window.alert("O mercado está fechado pela administração."); return; }
            let localOffer = tradeOffers[offerId];
            if (!localOffer || localOffer.lastActorTeamId === ProfileTeam.id || (String(localOffer.buyerTeamId) !== String(ProfileTeam.id) && String(localOffer.sellerTeamId) !== String(ProfileTeam.id))) return;

            // Fast UX validation. The same rules are checked again atomically in Supabase.
            let localOwnership = c && typeof c === "object" ? c : {};
            let localTeams = Array.isArray(p) ? p : [];
            let localBuyer = localTeams.find((team) => team && String(team.id) === String(localOffer.buyerTeamId));
            let localSeller = localTeams.find((team) => team && String(team.id) === String(localOffer.sellerTeamId));
            let minPlayers = Math.max(0, Number(R.rosterSettings && R.rosterSettings.minPlayers != null ? R.rosterSettings.minPlayers : 23) || 0);
            let maxPlayers = Math.max(minPlayers, Number(R.rosterSettings && R.rosterSettings.maxPlayers != null ? R.rosterSettings.maxPlayers : 30) || 30);
            let localBuyerSize = Object.values(localOwnership).filter((item) => item && String(item.teamId) === String(localOffer.buyerTeamId)).length;
            let localSellerSize = Object.values(localOwnership).filter((item) => item && String(item.teamId) === String(localOffer.sellerTeamId)).length;
            if (!localBuyer || !localSeller) {
              window.alert("Não foi possível localizar os times desta negociação no campeonato atual.");
              return;
            }
            if (localBuyerSize >= maxPlayers) {
              window.alert(`O comprador já possui ${maxPlayers} jogadores. A proposta continuará aberta até que haja espaço no elenco.`);
              return;
            }
            if (localSellerSize <= minPlayers) {
              window.alert(`Seu elenco possui o mínimo de ${minPlayers} jogadores. Contrate pelo menos mais um jogador antes de aceitar esta proposta.`);
              return;
            }
            if ((Number(localBuyer.budget) || 0) < Number(localOffer.currentAmount || 0)) {
              window.alert("O comprador não possui saldo suficiente neste momento. A proposta continuará aberta.");
              return;
            }
            let localPlayer = n.find((player) => player && String(player.id) === String(localOffer.playerId));
            let localBalanceCheck = evaluateMarketBalance(localPlayer, localBuyer.id, R, localTeams, localOwnership, n);
            if (!localBalanceCheck.allowed) {
              window.alert(marketBalanceMessage(localBalanceCheck) + " A proposta continuará aberta.");
              return;
            }

            let db = Ee();
            if (!db) return;
            let actionKey = `offer:${marketTournamentId}:${offerId}`;
            if (!beginMarketAction(actionKey)) { window.alert("Aguarde a operação atual ser concluída."); return; }
            let failureReason = null;
            db.ref("pes/tournaments").transaction((serverValue) => {
              let isArray = Array.isArray(serverValue);
              let list = isArray ? [...serverValue] : Object.values(serverValue || {});
              let index = list.findIndex((item) => item && String(item.id) === String(marketTournamentId));
              if (index < 0) { failureReason = "championship_not_found"; return; }
              let tournament = list[index], context = tournament.context || {};
              if (!marketAccessSettings(tournament).isOpen) { failureReason = "market_closed"; return; }
              let offers = { ...(context.tradeOffers || {}) }, offer = offers[offerId];
              if (!offer || !isOfferOpen(offer)) { failureReason = "offer_unavailable"; return; }
              if (offer.championshipId && String(offer.championshipId) !== String(tournament.id)) { failureReason = "wrong_championship"; return; }

              let playerKey = Object.keys(context.ownership || {}).find((key) => String(key) === String(offer.playerId));
              let ownership = { ...(context.ownership || {}) };
              let owner = playerKey != null ? ownership[playerKey] : null;
              if (!owner || String(owner.teamId) !== String(offer.sellerTeamId)) {
                failureReason = "owner_changed";
                return;
              }

              let teams = Array.isArray(context.teams) ? context.teams.map((team) => ({ ...team })) : [];
              let buyer = teams.find((team) => team && String(team.id) === String(offer.buyerTeamId));
              let seller = teams.find((team) => team && String(team.id) === String(offer.sellerTeamId));
              if (!buyer || !seller) { failureReason = "team_not_found"; return; }

              let minPlayers = Math.max(0, Number(tournament.rosterSettings && tournament.rosterSettings.minPlayers != null ? tournament.rosterSettings.minPlayers : 23) || 0);
              let maxPlayers = Math.max(minPlayers, Number(tournament.rosterSettings && tournament.rosterSettings.maxPlayers != null ? tournament.rosterSettings.maxPlayers : 30) || 30);
              let buyerSize = Object.values(ownership).filter((item) => item && String(item.teamId) === String(buyer.id)).length;
              let sellerSize = Object.values(ownership).filter((item) => item && String(item.teamId) === String(seller.id)).length;
              if (buyerSize >= maxPlayers) { failureReason = "buyer_roster_full"; return; }
              if (sellerSize <= minPlayers) { failureReason = "seller_min_roster"; return; }
              if ((Number(buyer.budget) || 0) < Number(offer.currentAmount || 0)) { failureReason = "insufficient_funds"; return; }
              let offerPlayer = n.find((player) => player && String(player.id) === String(offer.playerId));
              let atomicBalanceCheck = evaluateMarketBalance(offerPlayer, buyer.id, tournament, teams, ownership, n);
              if (!atomicBalanceCheck.allowed) { failureReason = "market_balance_lock"; return; }

              buyer.budget = (Number(buyer.budget) || 0) - Number(offer.currentAmount || 0);
              seller.budget = (Number(seller.budget) || 0) + Number(offer.currentAmount || 0);
              ownership[playerKey] = { ...(owner || {}), teamId: buyer.id, forSale: false, price: null, acquisitionSource:"user_transfer", acquiredAt:Date.now() };
              let now = Date.now();
              Object.keys(offers).forEach((id) => {
                let item = offers[id];
                if (item && String(item.playerId) === String(offer.playerId) && isOfferOpen(item)) {
                  offers[id] = { ...item, status: id === offerId ? "accepted" : "invalid", invalidReason: id === offerId ? null : "player_transferred", updatedAt: now };
                }
              });
              let transfers = [{ id: _(), championshipId: tournament.id, playerId: offer.playerId, playerName: offer.playerName, fromTeamId: seller.id, toTeamId: buyer.id, price: Number(offer.currentAmount) || 0, type: "user_transfer", createdAt: now, date: new Date().toLocaleDateString("pt-BR"), offerId }, ...(Array.isArray(context.transfers) ? context.transfers : [])];
              let financialTransactions = Array.isArray(context.financialTransactions) ? [...context.financialTransactions] : [];
              financialTransactions.unshift(financeEntry("player_purchase", buyer.id, -Number(offer.currentAmount || 0), `Compra de ${offer.playerName}`, offer.id, (Number(buyer.budget)||0) + Number(offer.currentAmount || 0), now));
              financialTransactions.unshift(financeEntry("player_sale", seller.id, Number(offer.currentAmount || 0), `Venda de ${offer.playerName}`, offer.id, (Number(seller.budget)||0) - Number(offer.currentAmount || 0), now));
              list[index] = { ...tournament, context: { ...context, teams, ownership, tradeOffers: offers, transfers, financialTransactions } };
              failureReason = null;
              return isArray ? list : Object.fromEntries(list.map((item, idx) => [item.id || String(idx), item]));
            }, (error, committed, snapshot) => {
              endMarketAction(actionKey);
              if (error) {
                window.alert("Não foi possível concluir a transferência. Tente novamente.");
                return;
              }
              if (committed) {
                applyConfirmedTournamentSnapshot(snapshot);
                signalImportantUpdate("player_transfer", marketTournamentId);
                return;
              }
              let messages = {
                seller_min_roster: `O vendedor precisa manter pelo menos ${minPlayers} jogadores. A proposta continua aberta.`,
                buyer_roster_full: `O comprador atingiu o máximo de ${maxPlayers} jogadores. A proposta continua aberta.`,
                insufficient_funds: "O comprador não possui saldo suficiente. A proposta continua aberta.",
                owner_changed: "O jogador não pertence mais ao vendedor neste campeonato.",
                wrong_championship: "Esta proposta pertence a outro campeonato.",
                team_not_found: "Um dos times da negociação não existe mais neste campeonato.",
                championship_not_found: "O campeonato desta proposta não foi encontrado.",
                offer_unavailable: "A proposta não está mais disponível.",
                market_balance_lock: "A transferência está bloqueada pela regra de equilíbrio do mercado. A proposta continua aberta.",
                market_closed: "O mercado está fechado. A proposta continuará aberta até a reabertura."
              };
              window.alert(messages[failureReason] || "A transferência não pôde ser concluída.");
            }, false);
          }
          function Ft(o, i, y) {
            if (!R || !o || !y) return;
            let buyerLocal = $(y);
            if (!buyerLocal) return;
            let operationBlock = marketOperationBlock(o, i);
            if (operationBlock.blocked) { window.alert(operationBlock.message); return; }
            let maxPlayers = Math.max(1, Number(R.rosterSettings && R.rosterSettings.maxPlayers != null ? R.rosterSettings.maxPlayers : 30) || 30);
            if (Oe(y).length >= maxPlayers) { window.alert(`Este elenco atingiu o limite de ${maxPlayers} jogadores.`); return; }
            let price = i.kind === "free" ? Number(o.value)||0 : Number(i.price)||Number(o.value)||0;
            if ((Number(buyerLocal.budget)||0) < price) { window.alert("Saldo insuficiente para esta compra."); return; }
            let check = evaluateMarketBalance(o, y);
            if (!check.allowed) { window.alert(marketBalanceMessage(check)); return; }
            let tournamentId = R.id, failureReason = null;
            let db = Ee();
            let applyPurchase = (tournament) => {
              let context = { ...(tournament.context || {}) };
              let atomicOperationBlock = marketOperationBlock(o, i, tournament);
              if (atomicOperationBlock.blocked) { failureReason = atomicOperationBlock.reason; return null; }
              let ownership = { ...(context.ownership || {}) };
              let teams = Array.isArray(context.teams) ? context.teams.map((team)=>({...team})) : [];
              let buyer = teams.find((team)=>team && String(team.id)===String(y));
              if (!buyer) { failureReason="team_not_found"; return null; }
              let playerKey = Object.keys(ownership).find((key)=>String(key)===String(o.id)) || String(o.id);
              let currentOwner = ownership[playerKey];
              if (i.kind === "free" && currentOwner && currentOwner.teamId) { failureReason="player_unavailable"; return null; }
              if ((Number(buyer.budget)||0) < price) { failureReason="insufficient_funds"; return null; }
              let rosterSize = Object.values(ownership).filter((item)=>item && String(item.teamId)===String(buyer.id)).length;
              let localMax = Math.max(1, Number(tournament.rosterSettings && tournament.rosterSettings.maxPlayers != null ? tournament.rosterSettings.maxPlayers : 30)||30);
              if (rosterSize >= localMax) { failureReason="buyer_roster_full"; return null; }
              let atomicCheck = evaluateMarketBalance(o, buyer.id, tournament, teams, ownership, n);
              if (!atomicCheck.allowed) { failureReason="market_balance_lock"; return null; }
              buyer.budget = (Number(buyer.budget)||0) - price;
              ownership[playerKey] = { ...(currentOwner||{}), teamId:buyer.id, forSale:false, price:null, acquisitionSource:i.kind === "free" ? "market_purchase" : "user_transfer", acquiredAt:Date.now() };
              let now=Date.now();
              let transfers=[{ id:_(), championshipId:tournament.id, playerId:o.id, playerName:o.name, fromTeamId:currentOwner&&currentOwner.teamId?currentOwner.teamId:null, toTeamId:buyer.id, price, type:i.kind === "free" ? "market_purchase" : "user_transfer", createdAt:now, date:new Date().toLocaleDateString("pt-BR") }, ...(Array.isArray(context.transfers)?context.transfers:[])];
              let financialTransactions=Array.isArray(context.financialTransactions)?[...context.financialTransactions]:[];
              financialTransactions.unshift(financeEntry("market_purchase",buyer.id,-price,`Compra de ${o.name}`,o.id,(Number(buyer.budget)||0)+price,now));
              failureReason=null;
              return { ...tournament, context:{ ...context, teams, ownership, transfers, financialTransactions } };
            };
            if (!db) {
              let updated=applyPurchase(R);
              if (!updated) { window.alert("A compra não pôde ser concluída."); return; }
              ae(m.map((item)=>String(item.id)===String(tournamentId)?updated:item));
              he(null);
              return;
            }
            let actionKey = `purchase:${tournamentId}:${o.id}`;
            if (!beginMarketAction(actionKey)) { window.alert("Aguarde a operação atual ser concluída."); return; }
            db.ref("pes/tournaments").transaction((serverValue)=>{
              let isArray=Array.isArray(serverValue);
              let list=isArray?[...serverValue]:Object.values(serverValue||{});
              let index=list.findIndex((item)=>item&&String(item.id)===String(tournamentId));
              if(index<0){failureReason="championship_not_found";return;}
              let updated=applyPurchase(list[index]);
              if(!updated)return;
              list[index]=updated;
              return isArray?list:Object.fromEntries(list.map((item,idx)=>[item.id||String(idx),item]));
            },(error,committed,snapshot)=>{
              endMarketAction(actionKey);
              if(error){window.alert("Não foi possível concluir a compra. Tente novamente.");return;}
              if(committed){
                applyConfirmedTournamentSnapshot(snapshot);
                he(null);
                signalImportantUpdate("player_purchase", tournamentId);
                return;
              }
              let messages={market_closed:"O mercado está fechado pela administração.",overall_limit:"Este jogador está acima do limite de overall permitido para jogadores livres.",market_balance_lock:"Esta compra está bloqueada pela regra de equilíbrio do mercado.",insufficient_funds:"Saldo insuficiente para esta compra.",buyer_roster_full:"Seu elenco atingiu o limite máximo de jogadores.",player_unavailable:"Este jogador não está mais livre no mercado.",team_not_found:"Seu time não foi encontrado.",championship_not_found:"O campeonato não foi encontrado."};
              window.alert(messages[failureReason]||"A compra não pôde ser concluída.");
            }, false);
          }
          function Ct(o, i) {
            Ae({ player: o, teamId: i, price: o.value });
          }
          function wt(o, i, y) {
            if (!marketAccessSettings(R).isOpen) { window.alert("O mercado está fechado pela administração."); return; }
            let D = Math.max(1, Number(y) || o.value);
            (ne({ ...c, [o.id]: { ...(c[o.id] || {}), teamId: i, forSale: !0, price: D } }),
              Ae(null));
          }
          function zt(o, i) {
            if (!marketAccessSettings(R).isOpen) { window.alert("O mercado está fechado pela administração."); return; }
            ne({ ...c, [o.id]: { ...(c[o.id] || {}), teamId: i, forSale: !1, price: null } });
          }
          function It(o) {
            if (!R || !ProfileTeam || !o) return;
            if (!marketAccessSettings(R).isOpen) { window.alert("O mercado está fechado pela administração."); return; }
            let minPlayers = Math.max(0, Number(R.rosterSettings && R.rosterSettings.minPlayers != null ? R.rosterSettings.minPlayers : 23) || 0);
            if (Oe(ProfileTeam.id).length <= minPlayers) {
              window.alert(`Você precisa manter no mínimo ${minPlayers} jogadores no elenco.`);
              return;
            }
            let saleRule = marketSaleDepreciation(R, o.id, ProfileTeam.id);
            let amount = Math.ceil((Number(o.value) || 0) * (1 - saleRule.depreciationPct / 100));
            setSaleModal({ player: o, depreciationPct:saleRule.depreciationPct, amount, initialRoster:saleRule.initialRoster });
          }
          function confirmMarketSale(o) {
            if (!R || !ProfileTeam || !o) return;
            if (!marketAccessSettings(R).isOpen) { window.alert("O mercado está fechado pela administração."); return; }
            let localSaleRule = marketSaleDepreciation(R, o.id, ProfileTeam.id);
            let amount = Math.ceil((Number(o.value) || 0) * (1 - localSaleRule.depreciationPct / 100));
            let depreciationPct = localSaleRule.depreciationPct;
            let tournamentId = R.id, teamId = ProfileTeam.id, now = Date.now();
            let applySale = (tournament) => {
              let context = { ...(tournament.context || {}) };
              let ownership = { ...(context.ownership || {}) };
              let current = ownership[o.id];
              if (!current || current.teamId !== teamId) return null;
              let serverTransfers = Array.isArray(context.transfers) ? context.transfers : [];
              let serverRule = marketSaleDepreciation(tournament, o.id, teamId, ownership, serverTransfers);
              depreciationPct = serverRule.depreciationPct;
              amount = Math.ceil((Number(o.value) || 0) * (1 - depreciationPct / 100));
              let minPlayers = Math.max(0, Number(tournament.rosterSettings && tournament.rosterSettings.minPlayers != null ? tournament.rosterSettings.minPlayers : 23) || 0);
              let rosterSize = Object.values(ownership).filter((item) => item && item.teamId === teamId).length;
              if (rosterSize <= minPlayers) return null;
              let teams = Array.isArray(context.teams) ? context.teams.map((team) => team.id === teamId ? { ...team, budget: (Number(team.budget) || 0) + amount } : team) : [];
              delete ownership[o.id];
              let tradeOffers = { ...(context.tradeOffers || {}) };
              Object.keys(tradeOffers).forEach((offerId) => {
                let offer = tradeOffers[offerId];
                if (offer && offer.playerId === o.id && ["pending", "countered"].includes(offer.status)) {
                  tradeOffers[offerId] = { ...offer, status: "invalid", invalidReason: "sold_to_market", updatedAt: now };
                }
              });
              let transfers = [{ id: _(), playerId: o.id, playerName: o.name, fromTeamId: teamId, toTeamId: null, price: amount, marketValue: o.value, depreciationPct, type: "market_sale", date: new Date().toLocaleDateString("pt-BR"), createdAt: now }, ...(Array.isArray(context.transfers) ? context.transfers : [])];
              let financialTransactions = Array.isArray(context.financialTransactions) ? [...context.financialTransactions] : [];
              let currentTeam = (Array.isArray(context.teams) ? context.teams : []).find((team) => team.id === teamId);
              financialTransactions.unshift(financeEntry("market_sale", teamId, amount, `Venda de ${o.name} ao mercado`, o.id, Number(currentTeam && currentTeam.budget) || 0, now));
              return { ...tournament, context: { ...context, teams, ownership, tradeOffers, transfers, financialTransactions } };
            };
            let db = Ee();
            if (!db) {
              let updated = applySale(R);
              if (!updated) { window.alert("O jogador não pertence mais ao seu elenco. Atualize a página."); return; }
              ae(m.map((item) => item.id === tournamentId ? updated : item));
              setSaleModal(null);
              window.alert(`${o.name} foi vendido ao mercado por ${L(amount)}.`);
              return;
            }
            let actionKey = `sale:${tournamentId}:${o.id}`;
            if (!beginMarketAction(actionKey)) { window.alert("Aguarde a operação atual ser concluída."); return; }
            db.ref("pes/tournaments").transaction((serverList) => {
              let isArray = Array.isArray(serverList);
              let list = isArray ? [...serverList] : Object.values(serverList || {});
              let index = list.findIndex((item) => item && String(item.id) === String(tournamentId));
              if (index < 0) return;
              let updated = applySale(list[index]);
              if (!updated) return;
              list[index] = updated;
              return isArray ? list : Object.fromEntries(list.map((item, index) => [item.id || String(index), item]));
            }, (error, committed, snapshot) => {
              endMarketAction(actionKey);
              if (error) window.alert("Não foi possível concluir a venda. Tente novamente.");
              else if (!committed) window.alert("A venda foi cancelada porque o jogador não pertence mais ao seu elenco.");
              else {
                applyConfirmedTournamentSnapshot(snapshot);
                setSaleModal(null);
                signalImportantUpdate("player_sale", tournamentId);
                window.alert(`${o.name} foi vendido ao mercado por ${L(amount)}.`);
              }
            }, false);
          }
          function importRosterPlan(plan, mode) {
            if (!R || !plan || !Array.isArray(plan.entries) || !plan.entries.length) return;
            let tournamentId = R.id;
            let targetTeamIds = [...new Set(plan.entries.map((entry) => entry.teamId))];
            let applyImport = (tournament) => {
              let context = { ...(tournament.context || {}) };
              let ownership = { ...(context.ownership || {}) };
              if (mode === "replace") {
                Object.keys(ownership).forEach((playerId) => {
                  if (ownership[playerId] && targetTeamIds.includes(ownership[playerId].teamId)) delete ownership[playerId];
                });
              }
              for (let entry of plan.entries) {
                let current = ownership[entry.playerId];
                if (current && current.teamId && current.teamId !== entry.teamId && !targetTeamIds.includes(current.teamId)) {
                  return null;
                }
                ownership[entry.playerId] = { teamId: entry.teamId, forSale: false, price: null, squadRole: entry.squadRole || null, acquisitionSource:"initial_roster", initialTeamId:entry.teamId, importedAt:Date.now() };
              }
              let imports = Array.isArray(context.adminImports) ? [...context.adminImports] : [];
              imports.unshift({ id: _(), type: "roster_txt", importedAt: Date.now(), importedByProfileId: te && te.id ? te.id : null, mode, playerCount: plan.entries.length, teamCount: targetTeamIds.length });
              return { ...tournament, context: { ...context, ownership, adminImports: imports.slice(0, 20) } };
            };
            let db = Ee();
            if (!db) {
              let updated = applyImport(R);
              if (!updated) { window.alert("A importação encontrou um jogador que já pertence a outro time."); return; }
              ae(m.map((item) => item.id === tournamentId ? updated : item));
              window.alert("Elencos importados com sucesso.");
              return;
            }
            db.ref("pes/tournaments").transaction((serverList) => {
              let list = Array.isArray(serverList) ? [...serverList] : [];
              let index = list.findIndex((item) => item && item.id === tournamentId);
              if (index < 0) return;
              let updated = applyImport(list[index]);
              if (!updated) return;
              list[index] = updated;
              return list;
            }, (error, committed) => {
              if (error) window.alert("Não foi possível importar os elencos. Tente novamente.");
              else if (!committed) window.alert("A importação foi cancelada porque um jogador já pertence a outro time. Atualize a prévia e tente novamente.");
              else window.alert("Elencos importados com sucesso.");
            });
          }


          function importHistoricalCompetition(payload) {
            if (!payload || !payload.competition || !Array.isArray(payload.rows) || !payload.rows.length) return;
            let parsed = payload.competition;
            let mappings = payload.mappings || {};
            let name = String(parsed.name || "").trim();
            if (!name) { window.alert("Informe o nome da competição no TXT."); return; }
            if (m.some((item) => String(item && item.name || "").trim().toLowerCase() === name.toLowerCase())) { window.alert("Já existe uma competição com este nome."); return; }
            let now = Date.now(), competitionId = _();
            let allNames = payload.rows.map((row) => row.originalName);
            let profileForName = (originalName) => x.find((profile) => profile && String(profile.id) === String(mappings[originalName]));
            let missing = allNames.filter((originalName) => !profileForName(originalName));
            if (missing.length) { window.alert("Vincule todos os participantes antes de importar."); return; }
            let teamIdForName = (originalName) => `history-${competitionId}-${String(mappings[originalName])}`;
            let snapshotForName = (originalName) => {
              let profile = profileForName(originalName) || {};
              return { profileId:profile.id||null, profileNameSnapshot:profile.name||originalName, originalName, avatarSnapshot:profile.avatar||null, colorSnapshot:profile.color||null, teamId:teamIdForName(originalName), teamNameSnapshot:profile.name||originalName };
            };
            let contextTeams = allNames.map((originalName) => { let snap=snapshotForName(originalName); return { id:snap.teamId, profileId:snap.profileId, name:snap.profileNameSnapshot, color:snap.colorSnapshot, budget:0, active:false, historical:true }; });
            let tournament;
            if (parsed.type === "cup") {
              let groups = (parsed.groups || []).map((group) => ({ name:group.name, teamIds:group.names.map(teamIdForName) }));
              let matches = (parsed.matches || []).map((match) => ({ id:_(), stage:match.stage, round:match.round||1, groupName:match.groupName||null, homeId:teamIdForName(match.home), awayId:match.away ? teamIdForName(match.away) : null, homeScore:match.homeScore == null ? null : Number(match.homeScore), awayScore:match.awayScore == null ? null : Number(match.awayScore), played:true, status:"confirmed", historical:true, winnerId:match.winner ? teamIdForName(match.winner) : null }));
              let championSnap=snapshotForName(parsed.champion);
              let runnerName=parsed.runner || null;
              let finalStandings=[{ position:1, ...championSnap, points:0, prize:0 }];
              if (runnerName) finalStandings.push({ position:2, ...snapshotForName(runnerName), points:0, prize:0 });
              tournament={ id:competitionId,type:"cup",format:"historical",name,status:"finished",createdAt:now,finishedAt:parsed.finishedAt||now,participants:allNames.map((n)=>mappings[n]),teamIds:allNames.map(teamIdForName),groups,matches,champion:championSnap.teamId,cupStage:"finished",finalStandings,cupSnapshot:{groups,matches,championTeamId:championSnap.teamId,runnerTeamId:runnerName?teamIdForName(runnerName):null,historical:true},context:{teams:contextTeams,ownership:{},playerStats:{},transfers:[],tradeOffers:{},financialTransactions:[],historicalImport:{version:parsed.version||2,source:"txt",importedAt:now}} };
            } else {
              let finalStandings=(parsed.standings||[]).map((row)=>({ position:Number(row.position), ...snapshotForName(row.originalName), played:Number(row.played)||0, wins:Number(row.wins)||0, draws:Number(row.draws)||0, losses:Number(row.losses)||0, goalDifference:Number(row.goalDifference)||0, points:Number(row.points)||0, prize:0 }));
              tournament={ id:competitionId,type:"league",format:"historical",name,status:"finished",createdAt:now,finishedAt:parsed.finishedAt||now,participants:allNames.map((n)=>mappings[n]),champion:finalStandings[0]&&finalStandings[0].teamId,finalStandings,context:{teams:contextTeams,matches:[],ownership:{},playerStats:{},transfers:[],tradeOffers:{},financialTransactions:[],historicalImport:{version:parsed.version||2,source:"txt",importedAt:now}} };
            }
            let db=Ee();
            if (!db) { ae([...m,tournament]); window.alert(`${name} foi importado como competição encerrada.`); return; }
            db.ref("pes/tournaments").transaction((serverList)=>{ let list=Array.isArray(serverList)?[...serverList]:[]; if(list.some((item)=>item&&String(item.name||"").trim().toLowerCase()===name.toLowerCase())) return; list.push(tournament); return list; },(error,committed,snapshot)=>{ if(error) window.alert("Não foi possível importar a competição. Tente novamente."); else if(!committed) window.alert("A importação foi cancelada porque já existe uma competição com este nome."); else { applyConfirmedTournamentSnapshot(snapshot); window.alert(`${name} foi importado como competição encerrada.`); } });
          }

          function cupShuffle(values) {
            let list = [...values];
            for (let index = list.length - 1; index > 0; index--) {
              let swap = Math.floor(Math.random() * (index + 1));
              [list[index], list[swap]] = [list[swap], list[index]];
            }
            return list;
          }
          function cupGroupCount(size) {
            if (size <= 4) return 1;
            if (size <= 8) return 2;
            if (size <= 16) return 4;
            return 8;
          }
          function cupRoundRobin(teamIds, legs, groupName) {
            let ids = [...teamIds];
            if (ids.length % 2) ids.push(null);
            let rounds = ids.length - 1, half = ids.length / 2, fixtures = [];
            let rotation = [...ids];
            for (let round = 0; round < rounds; round++) {
              for (let index = 0; index < half; index++) {
                let home = rotation[index], away = rotation[rotation.length - 1 - index];
                if (home && away) fixtures.push({ id:_(), stage:"group", groupName, round:round+1, leg:1, homeId:home, awayId:away, homeScore:0, awayScore:0, played:false, bye:false, status:"scheduled", createdAt:Date.now() });
              }
              rotation = [rotation[0], rotation[rotation.length-1], ...rotation.slice(1,-1)];
            }
            if (Number(legs) === 2) {
              let returnFixtures = fixtures.map((match) => ({ ...match, id:_(), round:match.round+rounds, leg:2, homeId:match.awayId, awayId:match.homeId }));
              fixtures.push(...returnFixtures);
            }
            return fixtures;
          }
          function cupStandings(group, matches) {
            return we(group.teamIds, (matches || []).filter((match) => match.stage === "group" && match.groupName === group.name && match.played && match.status !== "voided"));
          }
          function cupWinner(match) {
            if (!match || !match.played) return null;
            if (Number(match.homeScore) > Number(match.awayScore)) return match.homeId;
            if (Number(match.awayScore) > Number(match.homeScore)) return match.awayId;
            return match.penaltyWinner || null;
          }
          function buildCupKnockout(tournament) {
            if (!tournament || !Array.isArray(tournament.groups)) return tournament;
            let qualified = tournament.groups.map((group) => cupStandings(group, tournament.matches).slice(0,2));
            if (qualified.some((rows) => rows.length < 2)) return tournament;
            let pairings = [];
            if (qualified.length === 1) pairings.push([qualified[0][0].id, qualified[0][1].id]);
            else {
              for (let index = 0; index < qualified.length; index += 2) {
                let left = qualified[index], right = qualified[index+1];
                if (!right) continue;
                pairings.push([left[0].id, right[1].id], [right[0].id, left[1].id]);
              }
            }
            let knockout = pairings.map(([homeId,awayId]) => ({ id:_(), stage:"knockout", round:1, homeId, awayId, homeScore:0, awayScore:0, played:false, bye:false, status:"scheduled", createdAt:Date.now() }));
            return { ...tournament, cupStage:"knockout", matches:[...(tournament.matches||[]),...knockout], knockoutGeneratedAt:Date.now() };
          }
          function saveCupMatchResult(data) {
            if (!R || R.type !== "cup" || !data || !data.matchId) return;
            let homeScore=Math.max(0,Number(data.homeScore)||0), awayScore=Math.max(0,Number(data.awayScore)||0);
            let target=(R.matches||[]).find((match)=>String(match.id)===String(data.matchId));
            if (!target) return;
            if (target.stage === "knockout" && homeScore === awayScore && !data.penaltyWinner) { window.alert("Escolha quem avançou nos pênaltis."); return; }
            let now=Date.now(), finishedCup=null, linkedLeagueUpdate=null;
            let cup={...R,matches:(R.matches||[]).map((match)=>String(match.id)===String(target.id)?{...match,homeScore,awayScore,played:true,status:"confirmed",penaltyWinner:homeScore===awayScore?data.penaltyWinner:null,playedAt:now,updatedAt:now}:match)};
            if (target.stage === "group") {
              let groupMatches=cup.matches.filter((match)=>match.stage==="group");
              if (groupMatches.length && groupMatches.every((match)=>match.played)) cup=buildCupKnockout(cup);
            } else {
              let currentRound=target.round||1;
              let roundMatches=cup.matches.filter((match)=>match.stage==="knockout" && (match.round||1)===currentRound);
              if (roundMatches.length && roundMatches.every((match)=>match.played)) {
                let winners=roundMatches.map(cupWinner).filter(Boolean);
                if (winners.length===1) {
                  let championTeamId=winners[0], runnerMatch=roundMatches[0], runnerTeamId=String(runnerMatch.homeId)===String(championTeamId)?runnerMatch.awayId:runnerMatch.homeId;
                  let league=m.find((item)=>item&&String(item.id)===String(cup.linkedLeagueId));
                  let leagueTeams=league&&league.context&&Array.isArray(league.context.teams)?league.context.teams:[];
                  let championTeam=leagueTeams.find((team)=>String(team.id)===String(championTeamId))||p.find((team)=>String(team.id)===String(championTeamId))||{};
                  let runnerTeam=leagueTeams.find((team)=>String(team.id)===String(runnerTeamId))||p.find((team)=>String(team.id)===String(runnerTeamId))||{};
                  let championProfile=x.find((profile)=>profile&&String(profile.id)===String(championTeam.profileId))||{};
                  let runnerProfile=x.find((profile)=>profile&&String(profile.id)===String(runnerTeam.profileId))||{};
                  let prize=Math.max(0,Number(cup.cupConfig&&cup.cupConfig.prize)||0);
                  cup={...cup,status:"finished",champion:championTeamId,finishedAt:now,finalStandings:[
                    {position:1,teamId:championTeamId,profileId:championTeam.profileId||null,profileNameSnapshot:championProfile.name||championTeam.name||"Campeão",teamNameSnapshot:championTeam.name||"Time",avatarSnapshot:championProfile.avatar||null,colorSnapshot:championProfile.color||championTeam.color||null,points:0,prize},
                    {position:2,teamId:runnerTeamId,profileId:runnerTeam.profileId||null,profileNameSnapshot:runnerProfile.name||runnerTeam.name||"Vice",teamNameSnapshot:runnerTeam.name||"Time",avatarSnapshot:runnerProfile.avatar||null,colorSnapshot:runnerProfile.color||runnerTeam.color||null,points:0,prize:0}
                  ],cupSnapshot:{groups:cup.groups,matches:cup.matches,championTeamId,runnerTeamId,linkedLeagueId:cup.linkedLeagueId}};
                  finishedCup=cup;
                  if (league && prize>0) {
                    let before=Number(championTeam.budget)||0;
                    let nextTeams=leagueTeams.map((team)=>String(team.id)===String(championTeamId)?{...team,budget:before+prize}:team);
                    let transactions=Array.isArray(league.context.financialTransactions)?[...league.context.financialTransactions]:[];
                    transactions.unshift(financeEntry("cup_prize",championTeamId,prize,`Premiação · ${cup.name}`,cup.id,before,now));
                    linkedLeagueUpdate={...league,context:{...league.context,teams:nextTeams,financialTransactions:transactions}};
                  }
                } else if (winners.length>1) {
                  let nextRound=currentRound+1, next=[];
                  for(let index=0;index<winners.length;index+=2){
                    if (!winners[index+1]) break;
                    next.push({id:_(),stage:"knockout",round:nextRound,homeId:winners[index],awayId:winners[index+1],homeScore:0,awayScore:0,played:false,bye:false,status:"scheduled",createdAt:now});
                  }
                  cup={...cup,matches:[...cup.matches,...next]};
                }
              }
            }
            ae(m.map((item)=>String(item.id)===String(cup.id)?cup:(linkedLeagueUpdate&&String(item.id)===String(linkedLeagueUpdate.id)?linkedLeagueUpdate:item)));
            setCupMatchModal(null);
            if (finishedCup) window.alert(`🏆 ${finishedCup.finalStandings[0].profileNameSnapshot} venceu ${finishedCup.name}!`);
          }

          function createAdminTournament(options = {}) {
            let name = adminTournamentName.trim();
            if (!name) return;
            if (m.some((item) => String(item.name || "").trim().toLowerCase() === name.toLowerCase())) {
              window.alert("Já existe um campeonato com este nome.");
              return;
            }
            let mode = options.mode === "continue" ? "continue" : "new";
            let source = mode === "continue" ? m.find((item) => item && String(item.id) === String(options.sourceTournamentId)) : null;
            if (mode === "continue" && !source) {
              window.alert("Selecione um campeonato-base válido.");
              return;
            }
            if (options.competitionType === "cup") {
              let linked = m.find((item) => item && String(item.id) === String(options.linkedLeagueId) && item.type !== "cup" && item.status !== "finished");
              if (!linked) { window.alert("Selecione uma liga ativa para vincular a copa."); return; }
              let linkedTeams = Array.isArray(linked.context && linked.context.teams) ? linked.context.teams.filter((team)=>team&&team.active!==false&&team.profileId) : [];
              let selectedProfiles = Array.isArray(options.cupParticipantIds) && options.cupParticipantIds.length ? options.cupParticipantIds.map(String) : linkedTeams.map((team)=>String(team.profileId));
              let selectedTeams = linkedTeams.filter((team)=>selectedProfiles.includes(String(team.profileId)));
              if (selectedTeams.length < 4) { window.alert("Selecione pelo menos quatro participantes para criar a copa."); return; }
              let groupCount = cupGroupCount(selectedTeams.length);
              let shuffled = cupShuffle(selectedTeams.map((team)=>String(team.id)));
              let groupBuckets = Array.from({length:groupCount},()=>[]);
              shuffled.forEach((teamId,index)=>groupBuckets[index%groupCount].push(teamId));
              let groups = groupBuckets.map((teamIds,index)=>({name:`Grupo ${String.fromCharCode(65+index)}`,teamIds}));
              let groupLegs = Number(options.groupLegs)===2?2:1;
              let matches = groups.flatMap((group)=>cupRoundRobin(group.teamIds,groupLegs,group.name));
              let cup = {
                id:_(), type:"cup", format:"grupos", name, status:"ongoing", createdAt:Date.now(), linkedLeagueId:linked.id,
                participants:selectedTeams.map((team)=>String(team.profileId)), teamIds:selectedTeams.map((team)=>String(team.id)), groups, matches, champion:null, cupStage:"groups",
                cupConfig:{groupLegs,groupCount,qualifiersPerGroup:2,knockoutLegs:1,prize:Math.max(0,Number(options.cupPrize)||0)},
                context:{teams:selectedTeams.map((team)=>({...team})),ownership:{},playerStats:{},transfers:[],tradeOffers:{},financialTransactions:[]}
              };
              let db = Ee();
              let nextList = [...m, cup];
              if (!db) {
                g(nextList);
                setAdminTournamentName("");
                setSelectedTournamentId(cup.id);
                qe("pes-selected-tournament", cup.id);
                oe("table");
                return Promise.resolve(true);
              }
              return new Promise((resolve) => db.ref("pes/tournaments").transaction((serverList) => {
                let list = Array.isArray(serverList) ? [...serverList] : [];
                if (list.some((item) => item && String(item.id) === String(cup.id))) return list;
                list.push(cup);
                return list;
              }, (error, committed, snapshot) => {
                if (error || !committed) {
                  console.error("cup creation failed", error);
                  window.alert("Não foi possível criar a Copa. Nenhum dado foi alterado. Tente novamente.");
                  resolve(false);
                  return;
                }
                let savedList = snapshot && Array.isArray(snapshot.val()) ? snapshot.val() : nextList;
                g(savedList);
                setAdminTournamentName("");
                setSelectedTournamentId(cup.id);
                qe("pes-selected-tournament", cup.id);
                oe("table");
                resolve(true);
              }));
            }
            let inheritance = {
              participants: options.inheritance ? options.inheritance.participants !== false : true,
              balances: options.inheritance ? options.inheritance.balances !== false : true,
              rosters: options.inheritance ? options.inheritance.rosters !== false : true,
              teamNames: options.inheritance ? options.inheritance.teamNames !== false : true,
            };
            let overrides = options.participantOverrides && typeof options.participantOverrides === "object" ? options.participantOverrides : {};
            let teams = [];
            let participants = [];
            let ownership = {};
            let financialTransactions = [];
            if (source) {
              let sourceContext = source.context || {};
              let sourceTeams = Array.isArray(sourceContext.teams) ? sourceContext.teams.filter((team) => team && team.active !== false && team.profileId) : [];
              let sourceParticipants = Array.isArray(source.participants) ? source.participants.map(String) : sourceTeams.map((team) => String(team.profileId));
              let selectedSourceTeams = sourceTeams.filter((team) => {
                let override = overrides[String(team.profileId)] || {};
                let hasGlobalProfile = x.some((profile) => profile && typeof profile === "object" && String(profile.id) === String(team.profileId) && profile.active !== false);
                return hasGlobalProfile && override.include !== false && sourceParticipants.includes(String(team.profileId));
              });
              if (selectedSourceTeams.length < 2) {
                window.alert("Selecione pelo menos dois participantes para a nova temporada.");
                return;
              }
              let oldToNewTeamId = {};
              selectedSourceTeams.forEach((oldTeam, index) => {
                let profileId = String(oldTeam.profileId);
                let override = overrides[profileId] || {};
                let newTeamId = _();
                oldToNewTeamId[String(oldTeam.id)] = newTeamId;
                let profile = x.find((item) => item && typeof item === "object" && String(item.id) === profileId);
                let inheritedName = inheritance.teamNames ? oldTeam.name : (profile && profile.name ? profile.name : oldTeam.name);
                let teamName = String(override.teamName || inheritedName || "Time").trim();
                let inheritedBudget = inheritance.balances ? Number(oldTeam.budget) || 0 : Math.max(0, Number(adminProfileBudget) || 300);
                let budget = Number.isFinite(Number(override.budget)) ? Math.max(0, Number(override.budget)) : inheritedBudget;
                teams.push({
                  ...oldTeam,
                  id: newTeamId,
                  profileId,
                  name: teamName,
                  budget,
                  active: true,
                  inheritedFromTeamId: oldTeam.id,
                  inheritedFromChampionshipId: source.id,
                  createdAt: Date.now(),
                });
                participants.push(profileId);
                financialTransactions.unshift(financeEntry("initial_balance", newTeamId, budget, `Saldo inicial herdado de ${source.name}`, { sourceChampionshipId: source.id }));
              });
              if (inheritance.rosters) {
                let sourceOwnership = sourceContext.ownership && typeof sourceContext.ownership === "object" ? sourceContext.ownership : {};
                Object.keys(sourceOwnership).forEach((playerId) => {
                  let owner = sourceOwnership[playerId];
                  let newTeamId = owner && oldToNewTeamId[String(owner.teamId)];
                  if (!newTeamId) return;
                  let oldTeam = sourceTeams.find((team) => String(team.id) === String(owner.teamId));
                  let override = oldTeam ? (overrides[String(oldTeam.profileId)] || {}) : {};
                  if (override.inheritRoster === false) return;
                  ownership[playerId] = { ...owner, teamId: newTeamId, forSale: false, price: null };
                });
              }
            } else if (Array.isArray(options.newParticipantIds) && options.newParticipantIds.length) {
              let selectedIds = options.newParticipantIds.map(String).filter((id)=>x.some((profile)=>profile&&typeof profile==="object"&&profile.active!==false&&String(profile.id)===id));
              if (selectedIds.length < 2) { window.alert("Selecione pelo menos dois participantes para criar a competição."); return; }
              let drafts = options.newParticipantDrafts && typeof options.newParticipantDrafts === "object" ? options.newParticipantDrafts : {};
              selectedIds.forEach((profileId)=>{
                let profile = x.find((item)=>item&&typeof item==="object"&&String(item.id)===profileId);
                let draft = drafts[profileId] || {};
                let teamId = _();
                let budget = Math.max(0, Number(draft.budget));
                if (!Number.isFinite(budget)) budget = Math.max(0, Number(adminProfileBudget)||300);
                teams.push({ id:teamId, profileId, name:String(draft.teamName || (profile&&profile.name) || "Time").trim(), budget, active:true, createdAt:Date.now() });
                participants.push(profileId);
                financialTransactions.unshift(financeEntry("initial_balance", teamId, budget, "Saldo inicial da competição"));
              });
            }
            let tournament = {
              id: _(), name, format: source ? (source.format || "liga") : "liga", season: B.seasonCounter,
              teamIds: teams.map((team) => team.id), participants, groups: null, matches: [], status: "ongoing",
              champion: null, createdAt: Date.now(),
              sourceChampionshipId: source ? source.id : null,
              inheritance: source ? inheritance : null,
              marketSettings: source && source.marketSettings ? { ...source.marketSettings } : { depreciationPct: 10, initialRosterDepreciationPct:50, isOpen:true, freePlayerOverallLimit:{enabled:false,maxOverall:99} },
              rosterSettings: source && source.rosterSettings ? { ...source.rosterSettings } : { minPlayers: 23, maxPlayers: 30 },
              economySettings: source && source.economySettings ? { ...source.economySettings } : { winReward: 5, scoringDrawReward: 3, scorelessDrawReward: 2, lossReward: 1, goalReward: 1, redCardPenalty: 1 },
              finalPrizeSettings: source && source.finalPrizeSettings ? { ...source.finalPrizeSettings } : { firstPlacePrize: 20, lastPlacePercentage: 50 },
              context: { teams, ownership, playerStats: {}, transfers: [], tradeOffers: {}, financialTransactions },
            };
            ae([...m, tournament]);
            setAdminTournamentName("");
            setSelectedTournamentId(tournament.id);
            qe("pes-selected-tournament", tournament.id);
            De(null);
            he(null);
            Ae(null);
            ve(null);
            oe("admin");
          }
          function deleteAdminTournament(id) {
            if (!window.confirm("Excluir este campeonato e todos os dados dele?")) return;
            let next = m.filter((item) => item.id !== id);
            ae(next);
            if (selectedTournamentId === id) {
              let nextId = next[0] ? next[0].id : null;
              setSelectedTournamentId(nextId); qe("pes-selected-tournament", nextId);
            }
          }
          function createAdminProfile() {
            let name = adminProfileName.trim();
            if (!name) return;
            if (x.some((profile) => String(typeof profile === "object" && profile ? profile.name : profile).trim().toLowerCase() === name.toLowerCase())) {
              window.alert("Já existe um perfil global com este nome.");
              return;
            }
            let profile = { id: _(), name, color: adminProfileColor, role: "player", active: true, avatar: null };
            let updatedProfiles = [...x, profile];
            T(updatedProfiles); U("profiles", updatedProfiles);
            setAdminProfileName(""); setAdminProfileColor(se[updatedProfiles.length % se.length]);
          }
          function toggleTournamentParticipant(profileId) {
            if (!R) return;
            let profile = x.find((item) => item && typeof item === "object" && item.id === profileId);
            if (!profile) return;
            let participants = Array.isArray(R.participants)
              ? [...R.participants]
              : x.filter((candidate) => candidate && typeof candidate === "object" && (Array.isArray(candidate.tournamentIds) ? candidate.tournamentIds.includes(R.id) : ((R.context && R.context.teams) || []).some((team) => team.profileId === candidate.id || team.id === candidate.teamId || String(team.name || "").trim().toLowerCase() === String(candidate.name || "").trim().toLowerCase()))).map((candidate) => candidate.id);
            let teams = Array.isArray(R.context && R.context.teams) ? R.context.teams.map((team) => ({ ...team })) : [];
            let team = teams.find((item) => item.profileId === profileId) || teams.find((item) => item.id === profile.teamId);
            let adding = !participants.includes(profileId);
            if (adding) {
              participants.push(profileId);
              if (team) team.active = true;
              else {
                team = { id: _(), profileId, name: profile.name, color: profile.color || se[teams.length % se.length], budget: Math.max(0, Number(adminProfileBudget) || 300), active: true };
                teams.push(team);
              }
            } else {
              participants = participants.filter((id) => id !== profileId);
              if (team) team.active = false;
            }
            let updated = { ...R, participants, teamIds: teams.filter((item) => item.active !== false && participants.includes(item.profileId)).map((item) => item.id), context: { ...(R.context || {}), teams } };
            ae(m.map((item) => item.id === R.id ? updated : item));
          }
          function toggleFavoritePlayer(player) {
            if (!te || typeof te !== "object" || !te.id || !R || !R.id || !player || player.id == null) return;
            let db = Ee();
            if (!db) return;
            let playerId = String(player.id);
            db.ref(`pes/profileChampionshipPreferences/${R.id}/${te.id}/favorites/${playerId}`).transaction((current) => current ? null : true).catch((error) => {
              console.error("favorite update failed", error);
              window.alert("Não foi possível atualizar o favorito agora.");
            });
          }
          async function updateGlobalProfile(profileId, updates) {
            let previousProfiles = x;
            let previousActiveProfile = te;
            let updatedProfiles = x.map((profile) => profile && typeof profile === "object" && profile.id === profileId ? { ...profile, ...updates } : profile);
            T(updatedProfiles);
            if (te && typeof te === "object" && te.id === profileId) {
              let next = { ...te, ...updates };
              me(next); qe("pes-my-profile", next);
            }
            try {
              await U("profiles", updatedProfiles);
              return updatedProfiles.find((profile) => profile && typeof profile === "object" && profile.id === profileId) || null;
            } catch (error) {
              T(previousProfiles);
              if (previousActiveProfile && typeof previousActiveProfile === "object" && previousActiveProfile.id === profileId) {
                me(previousActiveProfile); qe("pes-my-profile", previousActiveProfile);
              }
              throw error;
            }
          }
          function rollbackMarketPurchase(transactionId) {
            if (!R || !isAdminProfile(te) || !transactionId) return;
            let transaction = Array.isArray(R.context && R.context.financialTransactions)
              ? R.context.financialTransactions.find((item) => item && String(item.id) === String(transactionId))
              : null;
            if (!transaction || !["market_purchase","player_purchase","market_sale"].includes(transaction.type)) {
              window.alert("Esta movimentação não pode ser revertida.");
              return;
            }
            if (transaction.rolledBackAt) {
              window.alert("Esta movimentação já foi revertida.");
              return;
            }
            let playerName = String(transaction.label || "jogador").replace(/^(Compra|Venda) de\s+/i, "").replace(/\s+ao mercado$/i, "");
            let rollbackLabel = transaction.type === "market_sale" ? "venda ao mercado" : "compra";
            if (!window.confirm(`Reverter a ${rollbackLabel} de ${playerName}? O jogador e o saldo voltarão ao estado anterior.`)) return;
            let db = Ee(), tournamentId = R.id, failureReason = null, rollbackId = _(), now = Date.now();
            let applyRollback = (tournament) => {
              let context = { ...(tournament.context || {}) };
              let transactions = Array.isArray(context.financialTransactions) ? context.financialTransactions.map((item) => ({ ...item })) : [];
              let purchaseIndex = transactions.findIndex((item) => item && String(item.id) === String(transactionId));
              if (purchaseIndex < 0) { failureReason = "transaction_not_found"; return null; }
              let purchase = transactions[purchaseIndex];
              if (purchase.rolledBackAt) { failureReason = "already_rolled_back"; return null; }
              if (!["market_purchase","player_purchase","market_sale"].includes(purchase.type)) { failureReason = "invalid_type"; return null; }
              let transfers = Array.isArray(context.transfers) ? context.transfers.map((item) => ({ ...item })) : [];
              let transfer = transfers.find((item) => item && !item.rolledBackAt && (
                purchase.type === "player_purchase"
                  ? (String(item.offerId || "") === String(purchase.referenceId || purchase.refId || "") || (String(item.toTeamId) === String(purchase.teamId) && Math.abs(Number(item.createdAt || 0) - Number(purchase.createdAt || 0)) < 5000 && item.type === "user_transfer"))
                  : purchase.type === "market_sale"
                    ? (String(item.playerId) === String(purchase.referenceId || purchase.refId || "") && String(item.fromTeamId) === String(purchase.teamId) && item.type === "market_sale" && Math.abs(Number(item.createdAt || 0) - Number(purchase.createdAt || 0)) < 10000)
                    : (String(item.playerId) === String(purchase.referenceId || purchase.refId || "") && String(item.toTeamId) === String(purchase.teamId) && item.type === "market_purchase" && Math.abs(Number(item.createdAt || 0) - Number(purchase.createdAt || 0)) < 10000)
              ));
              if (!transfer) { failureReason = "transfer_not_found"; return null; }
              let playerKey = String(transfer.playerId);
              let ownership = { ...(context.ownership || {}) };
              let ownershipKey = Object.keys(ownership).find((key) => String(key) === playerKey) || playerKey;
              let owner = ownership[ownershipKey];
              let teams = Array.isArray(context.teams) ? context.teams.map((team) => ({ ...team })) : [];
              let price = Math.abs(Number(transfer.price != null ? transfer.price : purchase.amount) || 0);
              let buyer = null, seller = null;
              if (purchase.type === "market_sale") {
                if (owner && owner.teamId != null && owner.teamId !== "") { failureReason = "player_changed"; return null; }
                seller = teams.find((team) => team && String(team.id) === String(transfer.fromTeamId || purchase.teamId));
                if (!seller) { failureReason = "seller_not_found"; return null; }
                seller.budget = (Number(seller.budget) || 0) - price;
                ownership[ownershipKey] = { teamId:seller.id, forSale:false, price:null, acquisitionSource:"rollback", acquiredAt:now };
              } else {
                if (!owner || String(owner.teamId) !== String(transfer.toTeamId)) { failureReason = "player_changed"; return null; }
                buyer = teams.find((team) => team && String(team.id) === String(transfer.toTeamId));
                if (!buyer) { failureReason = "buyer_not_found"; return null; }
                buyer.budget = (Number(buyer.budget) || 0) + price;
                if (transfer.fromTeamId != null && transfer.fromTeamId !== "") {
                  seller = teams.find((team) => team && String(team.id) === String(transfer.fromTeamId));
                  if (!seller) { failureReason = "seller_not_found"; return null; }
                  seller.budget = (Number(seller.budget) || 0) - price;
                  ownership[ownershipKey] = { ...owner, teamId:seller.id, forSale:false, price:null, acquisitionSource:"rollback", acquiredAt:now };
                } else {
                  delete ownership[ownershipKey];
                }
              }
              let relatedReference = purchase.referenceId != null ? purchase.referenceId : purchase.refId;
              transactions = transactions.map((item) => {
                let samePurchase = String(item.id) === String(purchase.id);
                let matchingSale = purchase.type === "player_purchase" && item.type === "player_sale" && String(item.referenceId != null ? item.referenceId : item.refId) === String(relatedReference) && Math.abs(Number(item.createdAt || 0) - Number(purchase.createdAt || 0)) < 5000;
                return samePurchase || matchingSale ? { ...item, rolledBackAt:now, rolledBackByProfileId:te && te.id, rollbackId } : item;
              });
              if (purchase.type === "market_sale") {
                let sellerBefore = (Number(seller.budget) || 0) + price;
                transactions.unshift(financeEntry("market_sale_rollback", seller.id, -price, `Estorno da venda de ${transfer.playerName || playerName} ao mercado`, rollbackId, sellerBefore, now));
              } else {
                let buyerBefore = (Number(buyer.budget) || 0) - price;
                transactions.unshift(financeEntry("purchase_rollback", buyer.id, price, `Estorno da compra de ${transfer.playerName || playerName}`, rollbackId, buyerBefore, now));
                if (seller) {
                  let sellerBefore = (Number(seller.budget) || 0) + price;
                  transactions.unshift(financeEntry("sale_rollback", seller.id, -price, `Estorno da venda de ${transfer.playerName || playerName}`, rollbackId, sellerBefore, now));
                }
              }
              transfers = transfers.map((item) => String(item.id) === String(transfer.id) ? { ...item, rolledBackAt:now, rolledBackByProfileId:te && te.id, rollbackId } : item);
              let tradeOffers = { ...(context.tradeOffers || {}) };
              if (transfer.offerId && tradeOffers[transfer.offerId]) tradeOffers[transfer.offerId] = { ...tradeOffers[transfer.offerId], status:"rolled_back", rolledBackAt:now, updatedAt:now };
              failureReason = null;
              return { ...tournament, context:{ ...context, teams, ownership, transfers, financialTransactions:transactions, tradeOffers } };
            };
            if (!db) {
              let updated = applyRollback(R);
              if (!updated) { window.alert("Não foi possível reverter esta compra."); return; }
              ae(m.map((item) => String(item.id) === String(tournamentId) ? updated : item));
              return;
            }
            db.ref("pes/tournaments").transaction((serverValue) => {
              let isArray = Array.isArray(serverValue), list = isArray ? [...serverValue] : Object.values(serverValue || {});
              let index = list.findIndex((item) => item && String(item.id) === String(tournamentId));
              if (index < 0) { failureReason = "tournament_not_found"; return; }
              let updated = applyRollback(list[index]);
              if (!updated) return;
              list[index] = updated;
              return isArray ? list : Object.fromEntries(list.map((item, idx) => [item.id || String(idx), item]));
            }, (error, committed, snapshot) => {
              if (error) { console.error("market rollback failed", error); window.alert("Não foi possível reverter a compra. Tente novamente."); return; }
              if (committed) {
                applyConfirmedTournamentSnapshot(snapshot);
                signalImportantUpdate("market_purchase_rollback", tournamentId);
                window.alert("Movimentação revertida com sucesso.");
                return;
              }
              let messages = {
                already_rolled_back:"Esta movimentação já foi revertida.",
                player_changed:"O jogador já saiu do time comprador. O rollback foi bloqueado para evitar inconsistência.",
                transfer_not_found:"Não foi possível localizar a transferência vinculada a esta compra.",
                seller_not_found:"O time de origem não existe mais neste campeonato.",
                buyer_not_found:"O time comprador não existe mais neste campeonato.",
                transaction_not_found:"A movimentação não existe mais no histórico."
              };
              window.alert(messages[failureReason] || "A compra não pôde ser revertida.");
            }, false);
          }
          function deleteGlobalProfile(profileId) {
            let profile = x.find((item) => item && typeof item === "object" && item.id === profileId);
            if (!profile || isAdminProfile(profile)) {
              window.alert("O perfil administrador não pode ser excluído por esta ação.");
              return;
            }
            let confirmation = window.prompt(`Para excluir o perfil global ${profile.name}, digite EXCLUIR.`);
            if (confirmation !== "EXCLUIR") return;
            let updatedProfiles = x.filter((item) => !(item && typeof item === "object" && item.id === profileId));
            let updatedTournaments = m.map((tournament) => {
              let participants = Array.isArray(tournament.participants) ? tournament.participants.filter((id) => id !== profileId) : tournament.participants;
              let context = tournament.context || {};
              let teams = Array.isArray(context.teams) ? context.teams.map((team) => team.profileId === profileId ? { ...team, active: false, archivedProfileName: profile.name } : team) : [];
              let affectedTeamIds = teams.filter((team) => team.profileId === profileId).map((team) => team.id);
              let tradeOffers = { ...(context.tradeOffers || {}) };
              Object.keys(tradeOffers).forEach((offerId) => {
                let offer = tradeOffers[offerId];
                if (offer && ["pending", "countered"].includes(offer.status) && (affectedTeamIds.includes(offer.buyerTeamId) || affectedTeamIds.includes(offer.sellerTeamId))) {
                  tradeOffers[offerId] = { ...offer, status: "cancelled", updatedAt: Date.now(), closedReason: "profile_deleted" };
                }
              });
              return {
                ...tournament,
                participants,
                teamIds: teams.filter((team) => team.active !== false && (!Array.isArray(participants) || participants.includes(team.profileId))).map((team) => team.id),
                context: { ...context, teams, tradeOffers },
              };
            });
            T(updatedProfiles); U("profiles", updatedProfiles);
            ae(updatedTournaments);
          }
          function removeOrphanParticipant(teamId) {
            if (!R) return;
            let team = p.find((item) => item && String(item.id) === String(teamId));
            if (!team) return;
            let confirmation = window.confirm(`Remover ${team.archivedProfileName || team.name || "este participante"} da classificação ativa? Partidas e histórico serão preservados.`);
            if (!confirmation) return;
            let participants = Array.isArray(R.participants) ? R.participants.filter((id) => String(id) !== String(team.profileId)) : [];
            let teams = p.map((item) => item && String(item.id) === String(teamId) ? { ...item, active: false, archivedProfileName: item.archivedProfileName || item.name } : item);
            let context = R.context || {};
            let updated = { ...R, participants, teamIds: (R.teamIds || []).filter((id) => String(id) !== String(teamId)), context: { ...context, teams } };
            ae(m.map((item) => item.id === R.id ? updated : item));
          }
          function restoreOrphanProfile(teamId) {
            if (!R) return;
            let team = p.find((item) => item && String(item.id) === String(teamId));
            if (!team || !team.profileId) return;
            if (x.some((profile) => profile && String(profile.id) === String(team.profileId))) return;
            let name = window.prompt("Nome do perfil que será restaurado:", team.archivedProfileName || team.profileName || team.name || "Perfil recuperado");
            if (!name || !name.trim()) return;
            let profile = { id: String(team.profileId), name: name.trim(), color: team.profileColor || team.color || se[x.length % se.length], avatar: team.profileAvatar || team.avatar || null, role: team.profileRole === "admin" ? "admin" : "player", active: true, restoredAt: Date.now() };
            let updatedProfiles = [...x, profile];
            T(updatedProfiles); U("profiles", updatedProfiles);
            let participants = Array.isArray(R.participants) ? Array.from(new Set([...R.participants, profile.id])) : [profile.id];
            let teams = p.map((item) => item && String(item.id) === String(teamId) ? { ...item, active: true, archivedProfileName: name.trim() } : item);
            let context = R.context || {};
            let updated = { ...R, participants, teamIds: Array.from(new Set([...(R.teamIds || []), team.id])), context: { ...context, teams } };
            ae(m.map((item) => item.id === R.id ? updated : item));
          }
          function resetCurrentTournament() {
            if (!R) return;
            let confirmation = window.prompt(`Esta ação apagará partidas, elencos, mercado, propostas, transferências e estatísticas de ${R.name}. Os participantes serão mantidos. Digite RESETAR para continuar.`);
            if (confirmation !== "RESETAR") return;
            let resetBudgetRaw = window.prompt("Informe o saldo que cada participante deverá receber após o reset:", String(Math.max(0, Number(adminProfileBudget) || 300)));
            if (resetBudgetRaw === null) return;
            let resetBudget = Number(resetBudgetRaw);
            if (!Number.isFinite(resetBudget) || resetBudget < 0) {
              window.alert("Informe um saldo válido, igual ou maior que zero.");
              return;
            }
            let context = R.context || {};
            let teams = Array.isArray(context.teams) ? context.teams.map((team) => ({ ...team, budget: resetBudget })) : [];
            let resetTournament = {
              ...R,
              matches: [],
              champion: null,
              status: "ongoing",
              groups: null,
              teamIds: teams.filter((team) => team.active !== false && (!Array.isArray(R.participants) || R.participants.includes(team.profileId))).map((team) => team.id),
              resetAt: Date.now(),
              resetByProfileId: te && typeof te === "object" ? te.id : null,
              context: { ...context, teams, ownership: {}, playerStats: {}, transfers: [], tradeOffers: {}, financialTransactions: [] },
            };
            ae(m.map((item) => item.id === R.id ? resetTournament : item));
            he(null); Ae(null); ve(null); setMatchWizard(null);
            window.alert("Campeonato resetado com sucesso.");
          }
          function updateCurrentTeamName(teamId, name) {
            let clean = String(name || "").trim();
            if (!clean || !teamId) return;
            Se(p.map((team) => team.id === teamId ? { ...team, name: clean } : team));
          }
          function updateAdminBudget(teamId, value) {
            let amount = Math.max(0, Number(value) || 0);
            let current = p.find((team) => team.id === teamId);
            let before = Number(current && current.budget) || 0;
            Se(p.map((team) => team.id === teamId ? { ...team, budget: amount } : team));
            if (amount !== before) {
              let transactions = Array.isArray(R && R.context && R.context.financialTransactions) ? [...R.context.financialTransactions] : [];
              transactions.unshift(financeEntry("admin_adjustment", teamId, amount - before, "Ajuste manual do administrador", null, before));
              saveContextField("financialTransactions", transactions);
            }
          }
          function updateEconomyRules(winReward, scoringDrawReward, scorelessDrawReward, lossReward, goalReward, redCardPenalty, championPrize, topScorerPrize) {
            if (!R) return;
            let economySettings = { version: 2, winReward: Math.max(0, Number(winReward)||0), scoringDrawReward: Math.max(0, Number(scoringDrawReward)||0), scorelessDrawReward: Math.max(0, Number(scorelessDrawReward)||0), lossReward: Math.max(0, Number(lossReward)||0), goalReward: Math.max(0, Number(goalReward)||0), redCardPenalty: Math.max(0, Number(redCardPenalty)||0) };
            let finalPrizeSettings = { championPrize:Math.max(0,Number(championPrize)||0), firstPlacePrize:Math.max(0,Number(championPrize)||0), lastPlacePercentage:50, topScorerPrize:Math.max(0,Number(topScorerPrize)||0) };
            ae(m.map((item)=>item.id===R.id ? { ...item, economySettings, finalPrizeSettings } : item));
          }
          let pendingEconomyMigrationKey = R && Array.isArray(R.matches) ? R.matches.filter((match)=>match&&match.played&&match.status!=="voided"&&!match.bye&&(!match.economySettlement||Number(match.economySettlement.version)<2)).map((match)=>match.id).join("|") : "";
          He(()=>{
            if (!R || !pendingEconomyMigrationKey) return;
            let settings=economySettingsOf(R), context=R.context||{}, teams=Array.isArray(context.teams)?context.teams.map((team)=>({...team})):[], transactions=Array.isArray(context.financialTransactions)?[...context.financialTransactions]:[], now=Date.now(), changed=false;
            let matches=(Array.isArray(R.matches)?R.matches:[]).map((match)=>{
              if(!match||!match.played||match.status==="voided"||match.bye||(match.economySettlement&&Number(match.economySettlement.version)>=2)) return match;
              let rewards={...(match.economyRewards||{})}, breakdown={}, previousPaid={};
              [match.homeId,match.awayId].filter(Boolean).forEach((teamId)=>{
                let detail=matchEconomyForTeam(match,teamId,settings), already=Number(rewards[teamId])||0, delta=Math.max(0,detail.total-already), team=teams.find((item)=>String(item.id)===String(teamId));
                previousPaid[teamId]=already; breakdown[teamId]=detail;
                if(delta>0&&team){let before=Number(team.budget)||0;team.budget=before+delta;transactions.unshift(financeEntry("match_reward_migration",teamId,delta,"Ajuste retroativo de recompensas da partida",match.id,before,now));rewards[teamId]=already+delta;}
              });
              changed=true;
              return {...match,economyRewards:rewards,economySettlement:{version:2,settledAt:now,retroactive:true,settingsSnapshot:{...settings},breakdown,previousPaid}};
            });
            if(changed) ae(m.map((item)=>item.id===R.id?{...item,matches,context:{...(item.context||{}),teams,financialTransactions:transactions}}:item));
          },[R&&R.id,pendingEconomyMigrationKey]);
          function finishCurrentTournament() {
            if (!R || R.status === "finished") return;
            let activeTeams = p.filter((team)=>team && team.active !== false);
            let played = (Array.isArray(R.matches)?R.matches:[]).filter((match)=>match && match.played && match.status !== "voided" && !match.bye);
            let missing = activeTeams.filter((team)=>!played.some((match)=>match.homeId===team.id || match.awayId===team.id));
            if (missing.length && !window.confirm(`${missing.length} participante(s) ainda não jogaram. Encerrar mesmo assim?`)) return;
            let rows = buildStandings(R, activeTeams);
            if (!rows.length) return;
            let prize = prizeSettingsOf(R), positionPrizes=championshipPrizeLadder(prize.championPrize,rows.length);
            let awards = rows.map((row,index)=>({ teamId:row.id, position:index+1, amount:Number(positionPrizes[index])||0 })).filter((award)=>award.amount>0);
            let preview = awards.map((award)=>`${award.position}º ${($(award.teamId)||{}).name || "Time"}: ${L(award.amount)}`).join("\n");
            if (!window.confirm(`Encerrar ${R.name} e distribuir a premiação?\n\n${preview}`)) return;
            let now=Date.now();
            let teams = p.map((team)=>{ let award=awards.find((item)=>item.teamId===team.id); return award?{...team,budget:(Number(team.budget)||0)+award.amount}:team; });
            let transactions = Array.isArray(R.context && R.context.financialTransactions)?[...R.context.financialTransactions]:[];
            awards.forEach((award)=>{ let team=p.find((item)=>item.id===award.teamId); transactions.unshift(financeEntry("final_prize",award.teamId,award.amount,`${award.position}º lugar em ${R.name}`,R.id,Number(team&&team.budget)||0,now)); });
            let nextStats={...((R.context&&R.context.playerStats)||{})}, scorerEntries=Object.values(nextStats).filter((item)=>item&&Number(item.goals)>0).sort((a,b)=>(Number(b.goals)||0)-(Number(a.goals)||0)||String(a.playerNameSnapshot||"").localeCompare(String(b.playerNameSnapshot||""),"pt-BR")), topGoals=scorerEntries.length?Number(scorerEntries[0].goals)||0:0, topScorers=scorerEntries.filter((item)=>(Number(item.goals)||0)===topGoals);
            if(prize.topScorerPrize>0&&topScorers.length){ let each=Math.round((prize.topScorerPrize/topScorers.length)*100)/100; topScorers.forEach((scorer)=>{ let team=teams.find((item)=>String(item.id)===String(scorer.teamId)); if(!team)return; let before=Number(team.budget)||0; team.budget=before+each; transactions.unshift(financeEntry("top_scorer_prize",team.id,each,`Artilheiro · ${scorer.playerNameSnapshot||"Jogador"}`,R.id,before,now)); }); }
            let finalStandings = rows.map((row,index)=>{
              let team = p.find((item)=>item.id===row.id) || row.team || {};
              let profile = x.find((item)=>item && typeof item === "object" && String(item.id)===String(team.profileId)) || {};
              let award = awards.find((item)=>item.teamId===row.id);
              return { position:index+1, teamId:row.id, profileId:team.profileId||null, profileNameSnapshot:profile.name||team.archivedProfileName||team.name||"Perfil", teamNameSnapshot:team.name||"Time", avatarSnapshot:profile.avatar||null, colorSnapshot:profile.color||team.color||null, points:row.pts, played:row.played, wins:row.wins, draws:row.draws, losses:row.losses, goalsFor:row.gf, goalsAgainst:row.ga, goalDifference:row.gd, prize:award?award.amount:0, finalBalance:(Number(team.budget)||0)+(award?award.amount:0) };
            });
            ae(m.map((item)=>item.id===R.id?{...item,status:"finished",champion:rows[0].id,finishedAt:now,finalAwards:awards,finalStandings,context:{...(item.context||{}),teams,playerStats:nextStats,financialTransactions:transactions}}:item));
          }
          function updateMarketDepreciation(value, field = "depreciationPct") {
            if (!R) return;
            let pct = Math.min(100, Math.max(0, Math.round(Number(value) || 0)));
            let safeField = field === "initialRosterDepreciationPct" ? "initialRosterDepreciationPct" : "depreciationPct";
            ae(m.map((item) => item.id === R.id ? { ...item, marketSettings: { ...(item.marketSettings || {}), [safeField]: pct } } : item));
          }
          function updateMarketAccessRules(isOpen, limitEnabled, maxOverall) {
            if (!R) return;
            let nextSettings = { ...(R.marketSettings || {}), isOpen: isOpen === true, freePlayerOverallLimit: { enabled: limitEnabled === true, maxOverall: Math.min(99, Math.max(1, Math.round(Number(maxOverall) || 99))) } };
            ae(m.map((item) => item.id === R.id ? { ...item, marketSettings: nextSettings } : item));
          }
          function updateMarketBalanceRules(enabled, maxDifference) {
            if (!R) return;
            let next = { enabled: enabled === true, maxDifference: Math.max(0, Number(maxDifference) || 0) };
            ae(m.map((item) => item.id === R.id ? { ...item, marketBalanceSettings: next } : item));
          }
          function updateRosterRules(minValue, maxValue) {
            if (!R) return;
            let minPlayers = Math.max(0, Math.round(Number(minValue) || 0));
            let maxPlayers = Math.max(1, Math.round(Number(maxValue) || 0));
            if (maxPlayers < minPlayers) maxPlayers = minPlayers;
            ae(m.map((item) => item.id === R.id ? { ...item, rosterSettings: { minPlayers, maxPlayers } } : item));
          }
          function viewTournament(tournamentId) {
            setSelectedTournamentId(tournamentId || null);
            qe("pes-selected-tournament", tournamentId || null);
            setMatchWizard(null);
            oe("table");
          }
          function openMatchWizard() {
            if (!R || R.status === "finished") return;
            let availableTeams = p.filter((team) => team && team.active !== false && (!Array.isArray(R.participants) || !team.profileId || R.participants.includes(team.profileId)));
            if (availableTeams.length < 2) {
              window.alert("Adicione pelo menos dois participantes ao campeonato antes de registrar uma partida.");
              return;
            }
            setMatchWizard({ step: 1, leftTeamId: null, rightTeamId: null, leftScore: 0, rightScore: 0, leftScorers: [], rightScorers: [], scorerPanel: null, hadCrime: false, leftRedCards: [], rightRedCards: [], playedAt: Date.now() });
          }
          function saveQuickMatch(data) {
            if (!R || !data) return;
            let left = p.find((team) => team.id === data.leftTeamId), right = p.find((team) => team.id === data.rightTeamId);
            if (!left || !right || left.id === right.id) return;
            let leftScore = Math.max(0, Number(data.leftScore) || 0), rightScore = Math.max(0, Number(data.rightScore) || 0);
            let now = Date.now(), matchId = _(), rewards = economySettingsOf(R);
            let leftScorerIds = Array.isArray(data.leftScorers) ? data.leftScorers.slice(0,leftScore) : [], rightScorerIds = Array.isArray(data.rightScorers) ? data.rightScorers.slice(0,rightScore) : [];
            while (leftScorerIds.length < leftScore) leftScorerIds.push("__unknown__"); while (rightScorerIds.length < rightScore) rightScorerIds.push("__unknown__");
            let leftRedCardIds = data.hadCrime && Array.isArray(data.leftRedCards) ? [...new Set(data.leftRedCards.filter(Boolean))] : [], rightRedCardIds = data.hadCrime && Array.isArray(data.rightRedCards) ? [...new Set(data.rightRedCards.filter(Boolean))] : [];
            let playerSnapshot = (playerId) => { let player=xe.get(playerId)||xe.get(Number(playerId)); return player ? (player.name || player.fullName || `Jogador ${playerId}`) : `Jogador ${playerId}`; };
            let scorerEvent=(playerId,teamId)=>{let special=playerId==="__own_goal__"||playerId==="__unknown__"||!playerId;return {playerId:special?null:playerId,teamId,playerNameSnapshot:special?null:playerSnapshot(playerId),type:playerId==="__own_goal__"?"own_goal":special?"unknown":"normal"};};
            let scorers = [...leftScorerIds.map((playerId)=>scorerEvent(playerId,left.id)),...rightScorerIds.map((playerId)=>scorerEvent(playerId,right.id))];
            let redCards = [...leftRedCardIds.map((playerId)=>({ playerId, teamId:left.id, playerNameSnapshot:playerSnapshot(playerId) })),...rightRedCardIds.map((playerId)=>({ playerId, teamId:right.id, playerNameSnapshot:playerSnapshot(playerId) }))];
            let baseMatch = { id: matchId, stage:"league", round:0, manual:true, played:true, bye:false, homeId:left.id, awayId:right.id, homeScore:leftScore, awayScore:rightScore, homeTeamNameSnapshot:left.name, awayTeamNameSnapshot:right.name, homeProfileId:left.profileId||null, awayProfileId:right.profileId||null, scorers, redCards, playedAt:data.playedAt||now, createdAt:now, createdByProfileId:te&&typeof te==="object"?te.id:null, status:"confirmed" };
            let leftBreakdown=matchEconomyForTeam(baseMatch,left.id,rewards), rightBreakdown=matchEconomyForTeam(baseMatch,right.id,rewards), economyRewards={ [left.id]:leftBreakdown.total,[right.id]:rightBreakdown.total };
            let match={...baseMatch,economyRewards,economySettlement:{version:2,settledAt:now,retroactive:false,settingsSnapshot:{...rewards},breakdown:{[left.id]:leftBreakdown,[right.id]:rightBreakdown}}};
            let context = R.context || {}, teams = p.map((team)=>team.id===left.id?{...team,budget:(Number(team.budget)||0)+leftBreakdown.total}:team.id===right.id?{...team,budget:(Number(team.budget)||0)+rightBreakdown.total}:team);
            let nextStats = { ...(context.playerStats && typeof context.playerStats === "object" ? context.playerStats : {}) };
            scorers.filter((event)=>event&&event.playerId&&event.type!=="own_goal").forEach((event)=>{ let current=nextStats[event.playerId]&&typeof nextStats[event.playerId]==="object"?nextStats[event.playerId]:{}; nextStats[event.playerId]={...current,playerId:event.playerId,playerNameSnapshot:event.playerNameSnapshot,teamId:event.teamId,goals:(Number(current.goals)||0)+1,redCards:Number(current.redCards)||0,updatedAt:now}; });
            redCards.forEach((event)=>{ let current=nextStats[event.playerId]&&typeof nextStats[event.playerId]==="object"?nextStats[event.playerId]:{}; nextStats[event.playerId]={...current,playerId:event.playerId,playerNameSnapshot:event.playerNameSnapshot,teamId:event.teamId,goals:Number(current.goals)||0,redCards:(Number(current.redCards)||0)+1,updatedAt:now}; });
            let transactions = Array.isArray(context.financialTransactions)?[...context.financialTransactions]:[];
            [[left,right,leftBreakdown],[right,left,rightBreakdown]].forEach(([team,opponent,detail])=>{if(detail.total!==0){let result=leftScore===rightScore?(leftScore>0?"Empate com gols":"Empate sem gols"):(team.id===left.id?(leftScore>rightScore?"Vitória":"Derrota"):(rightScore>leftScore?"Vitória":"Derrota"));transactions.unshift(financeEntry("match_reward",team.id,detail.total,`${result} contra ${opponent.name} · ${detail.eligibleGoals} gol(s) · ${detail.redCards} vermelho(s)`,matchId,Number(team.budget)||0,now));}});
            ae(m.map((item)=>item.id===R.id?{...item,matches:[...(Array.isArray(item.matches)?item.matches:[]),match],context:{...(item.context||{}),teams,playerStats:nextStats,financialTransactions:transactions}}:item));
            setMatchWizard(null);
          }
          function deleteQuickMatch(match) {
            if (!R || !match) return;
            let currentProfileId = te && typeof te === "object" ? te.id : null;
            let allowed = isAdminProfile(te) || (match.createdByProfileId && match.createdByProfileId === currentProfileId);
            if (!allowed) { window.alert("Apenas quem registrou a partida ou um administrador pode excluí-la."); return; }
            if (!window.confirm("Excluir esta partida? A tabela e as estatísticas serão recalculadas.")) return;
            let nextStats = { ...s };
            (Array.isArray(match.scorers) ? match.scorers : []).forEach((item) => {
              if (!item || !item.playerId) return;
              let current=nextStats[item.playerId]&&typeof nextStats[item.playerId]==="object"?nextStats[item.playerId]:{};
              nextStats[item.playerId] = { ...current, goals: Math.max(0, (Number(current.goals)||0) - 1) };
            });
            (Array.isArray(match.redCards) ? match.redCards : []).forEach((item) => {
              if (!item || !item.playerId) return;
              let current=nextStats[item.playerId]&&typeof nextStats[item.playerId]==="object"?nextStats[item.playerId]:{};
              nextStats[item.playerId] = { ...current, redCards: Math.max(0, (Number(current.redCards)||0) - 1) };
            });
            let context = R.context || {}, rewards = match.economyRewards || {}, teams = p.map((team)=>{ let amount=Number(rewards[team.id])||0; return amount?{...team,budget:(Number(team.budget)||0)-amount}:team; });
            let transactions = Array.isArray(context.financialTransactions)?[...context.financialTransactions]:[];
            Object.entries(rewards).forEach(([teamId,amount])=>{ if(Number(amount)!==0){ let team=p.find((item)=>item.id===teamId); transactions.unshift(financeEntry("match_reward_reversal",teamId,-Number(amount),`Estorno de partida anulada`,match.id,Number(team&&team.budget)||0)); }});
            ae(m.map((item) => item.id === R.id ? {
              ...item,
              matches: (Array.isArray(item.matches) ? item.matches : []).map((entry) => entry.id === match.id ? { ...entry, status: "voided", voidedAt: Date.now(), voidedByProfileId: currentProfileId } : entry),
              context: { ...(item.context || {}), playerStats: nextStats, teams, financialTransactions: transactions }
            } : item));
          }
          function Et() {
            (ye({
              name: `Temporada ${B.seasonCounter}`,
              format: "liga",
              teamIds: [],
              numGroups: 2,
            }),
              fe(!0));
          }
          function Bt(o) {
            ye((i) => ({
              ...i,
              teamIds: i.teamIds.includes(o)
                ? i.teamIds.filter((y) => y !== o)
                : [...i.teamIds, o],
            }));
          }
          function Dt() {
            let { name: o, format: i, teamIds: y, numGroups: D } = Te;
            if (!o.trim() || y.length < 2) return;
            let S = [],
              A = null;
            if (i === "liga")
              Ve(y).forEach((z, Ge) =>
                z.forEach((J) => {
                  S.push({
                    id: _(),
                    stage: "league",
                    round: Ge + 1,
                    homeId: J.home,
                    awayId: J.away,
                    homeScore: 0,
                    awayScore: 0,
                    played: !1,
                    bye: !1,
                    scorers: [],
                  });
                }),
              );
            else if (i === "mata-mata")
              S = Fe(y).map((z) => ({
                id: _(),
                stage: "knockout",
                round: 1,
                homeId: z.home,
                awayId: z.away,
                homeScore: 0,
                awayScore: 0,
                played: z.bye,
                bye: z.bye,
                scorers: [],
              }));
            else if (i === "grupos") {
              let z = y.length >= 8 ? D : 2;
              ((A = Yt(y, z).map((J, ke) => ({
                name: `Grupo ${String.fromCharCode(65 + ke)}`,
                teamIds: J,
              }))),
                A.forEach((J) => {
                  Ve(J.teamIds).forEach((ke, Ht) =>
                    ke.forEach((Le) => {
                      S.push({
                        id: _(),
                        stage: "group",
                        groupName: J.name,
                        round: Ht + 1,
                        homeId: Le.home,
                        awayId: Le.away,
                        homeScore: 0,
                        awayScore: 0,
                        played: !1,
                        bye: !1,
                        scorers: [],
                      });
                    }),
                  );
                }));
            }
            let w = {
              id: _(),
              name: o.trim(),
              format: i,
              season: B.seasonCounter,
              teamIds: y,
              groups: A,
              matches: S,
              status: "ongoing",
              champion: null,
              createdAt: Date.now(),
              context: {
                teams: y
                  .map((teamId) =>
                    structuredClone(
                      baseTeams.find((team) => team.id === teamId) ||
                        p.find((team) => team.id === teamId),
                    ),
                  )
                  .filter(Boolean),
                ownership: Object.fromEntries(
                  Object.entries(baseOwnership).filter(
                    ([, state]) => state && y.includes(state.teamId),
                  ),
                ),
                playerStats: {},
                transfers: [],
              },
            };
            (ae([...m, w]),
              setSelectedTournamentId(w.id),
              qe("pes-selected-tournament", w.id),
              fe(!1),
              oe("tournament"));
          }
          function Tt(o) {
            (ve(o),
              re({
                home: o.played ? String(o.homeScore) : "",
                away: o.played ? String(o.awayScore) : "",
                scorers: o.scorers || [],
                penaltyWinner: o.penaltyWinner || null,
              }));
          }
          function Mt(o, i) {
            re((y) => ({
              ...y,
              scorers: [...y.scorers, { teamId: o, playerId: i }],
            }));
          }
          function Wt(o) {
            re((i) => ({ ...i, scorers: i.scorers.filter((y, D) => D !== o) }));
          }
          function Rt() {
            if (!G) return;
            let o = parseInt(K.home, 10),
              i = parseInt(K.away, 10);
            if (
              isNaN(o) ||
              isNaN(i) ||
              (o === i && G.stage === "knockout" && !K.penaltyWinner)
            )
              return;
            let y = { ...s };
            (G.played &&
              G.scorers &&
              G.scorers.length &&
              G.scorers.forEach((A) => {
                y[A.playerId] &&
                  (y[A.playerId] = {
                    goals: Math.max(0, (y[A.playerId].goals || 0) - 1),
                  });
              }),
              K.scorers.forEach((A) => {
                y[A.playerId] = {
                  goals: ((y[A.playerId] && y[A.playerId].goals) || 0) + 1,
                };
              }));
            let D = {
                ...G,
                played: !0,
                homeScore: o,
                awayScore: i,
                scorers: K.scorers,
                penaltyWinner: K.penaltyWinner,
              },
              S = R.matches.map((A) => (A.id === G.id ? D : A));
            (ae(
              m.map((A) =>
                A.id === R.id
                  ? {
                      ...R,
                      matches: S,
                      context: {
                        ...(R.context || {}),
                        playerStats: y,
                      },
                    }
                  : A,
              ),
            ),
              ve(null));
          }
          function Nt() {
            let o = R,
              i = Math.max(
                ...o.matches
                  .filter((w) => w.stage === "knockout")
                  .map((w) => w.round),
              ),
              D = o.matches
                .filter((w) => w.stage === "knockout" && w.round === i)
                .map(Zt);
            if (D.length === 1) {
              je(D[0]);
              return;
            }
            let A = Fe(D).map((w) => ({
              id: _(),
              stage: "knockout",
              round: i + 1,
              homeId: w.home,
              awayId: w.away,
              homeScore: 0,
              awayScore: 0,
              played: w.bye,
              bye: w.bye,
              scorers: [],
            }));
            ae(
              m.map((w) =>
                w.id === o.id ? { ...o, matches: [...o.matches, ...A] } : w,
              ),
            );
          }
          function Ot() {
            let o = R,
              i = [];
            o.groups.forEach((S) => {
              let A = o.matches.filter(
                  (z) => z.stage === "group" && z.groupName === S.name,
                ),
                w = we(S.teamIds, A);
              i.push(...w.slice(0, 2).map((z) => z.id));
            });
            let D = Fe(Ie(i)).map((S) => ({
              id: _(),
              stage: "knockout",
              round: 1,
              homeId: S.home,
              awayId: S.away,
              homeScore: 0,
              awayScore: 0,
              played: S.bye,
              bye: S.bye,
              scorers: [],
            }));
            ae(
              m.map((S) =>
                S.id === o.id ? { ...o, matches: [...o.matches, ...D] } : S,
              ),
            );
          }
          function je(o) {
            ae(
              m.map((i) =>
                i.id === R.id ? { ...R, status: "finished", champion: o } : i,
              ),
            );
          }
          function Pt() {
            (Ne({
              currentTournamentId: null,
              seasonCounter: B.seasonCounter + 1,
            }),
              oe("table"));
          }
          let jt = X(() => {
              let o = [];
              return (
                Object.entries(s).forEach(([i, y]) => {
                  if (!y || !y.goals) return;
                  let D = xe.get(i);
                  if (!D) return;
                  let S = c[i],
                    A = S && S.teamId ? $(S.teamId) : null;
                  o.push({
                    ...D,
                    goals: y.goals,
                    teamName: A ? A.name : "Livre",
                    teamColor: A ? A.color : "#555",
                  });
                }),
                o.sort((i, y) => y.goals - i.goals).slice(0, 10)
              );
            }, [s, xe, c, $]),
            Gt = X(
              () =>
                R && Array.isArray(R.matches)
                  ? R.matches.filter((o) => !o.played && !o.bye).slice(0, 6)
                  : [],
              [R],
            ),
            Lt = X(() => Object.values(c).filter((o) => o.teamId).length, [c]);
          return l
            ? React.createElement(
                "div",
                {
                  style: {
                    background: "var(--surface)",
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                  },
                },
                React.createElement(
                  "div",
                  {
                    style: {
                      color: "var(--heading)",
                      maxWidth: 420,
                      textAlign: "center",
                      fontFamily: "Manrope,system-ui",
                    },
                  },
                  React.createElement(
                    "div",
                    { style: { fontSize: 30, marginBottom: 10 } },
                    "\u26A0\uFE0F",
                  ),
                  React.createElement(
                    "div",
                    {
                      style: { fontWeight: 800, fontSize: 17, marginBottom: 8 },
                    },
                    "Configura\xE7\xE3o pendente",
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 13.5,
                        color: "var(--muted)",
                        lineHeight: 1.5,
                      },
                    },
                    "Preencha o ",
                    React.createElement(
                      "code",
                      { style: { color: "var(--green)" } },
                      "SupabaseConfig",
                    ),
                    " no topo do ",
                    React.createElement(
                      "code",
                      { style: { color: "var(--green)" } },
                      "index.html",
                    ),
                    ".",
                  ),
                ),
              )
            : (e || (lt && (!profilesLoaded || !tournamentsLoaded || !identityReady)))
              ? React.createElement(
                  "div",
                  {
                    style: {
                      background: "var(--surface)",
                      minHeight: "100vh",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        color: "var(--green)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 12,
                      },
                    },
                    React.createElement(Kt, {
                      size: 32,
                      className: "animate-spin",
                    }),
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontFamily: "Manrope,system-ui",
                          letterSpacing: 2,
                          fontSize: 13,
                          textTransform: "uppercase",
                          color: "var(--muted)",
                        },
                      },
                      "Carregando temporada...",
                    ),
                  ),
                )
              : lt && !te
                ? (x.length === 0
                  ? React.createElement(InitialSetup, {
                      adminName: setupAdminName,
                      setAdminName: setSetupAdminName,
                      tournamentName: setupTournamentName,
                      setTournamentName: setSetupTournamentName,
                      hasTournaments: m.length > 0,
                      submitting: setupSubmitting,
                      onSubmit: completeInitialSetup,
                    })
                  : React.createElement(React.Fragment, null,
                    React.createElement(oo, {
                      profiles: x,
                      tournaments: m,
                      selectedTournamentId,
                      onSelectTournament: selectTournament,
                      onPick: bt,
                      belongsToTournament: profileBelongsToTournament,
                    }),
                    profilePinGate && React.createElement(ProfilePinLock, {
                      gate: profilePinGate,
                      onDigit: appendProfilePinDigit,
                      onErase: eraseProfilePinDigit,
                    })
                  ))
                : React.createElement(
                    "div",
                    {
                      className: "app-shell",
                      style: {
                        minHeight: "100vh",
                        color: "var(--heading)",
                        fontFamily:
                          "Manrope,system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
                        position: "relative",
                      },
                    },
                    React.createElement(
                      "style",
                      null,
                      `
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        .scoreboard { font-variant-numeric: tabular-nums; letter-spacing: 1px; }
        .tapbtn:active { transform: translateY(2px); }
        input, select { outline: none; }
        input::placeholder { color: #afafaf; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `,
                    ),
                    f &&
                      React.createElement(
                        "div",
                        {
                          style: {
                            margin: "0 16px 12px",
                            background: "rgba(193,68,61,0.15)",
                            border: "1px solid #EA2B2B",
                            borderRadius: 10,
                            padding: 10,
                            fontSize: 12.5,
                            color: "var(--danger)",
                          },
                        },
                        "N\xE3o encontrei o arquivo ",
                        React.createElement("code", null, "players.json"),
                        " ao lado do index.html. Sem ele o cat\xE1logo de jogadores n\xE3o carrega.",
                      ),
                    React.createElement(
                      "div",
                      { className: "app-content" },
                      Y === "table" &&
                        React.createElement(TableArea, {
                          tournament: R, tournaments: m, teams: p,
                          teamById: $, profiles: x, squadOf: Oe, onSelectTournament: viewTournament, onDeleteMatch: deleteQuickMatch, currentProfile: te, isAdmin: isAdminProfile(te),
                          onOpenTeam: (teamId) => setViewedTeamId(teamId),
                          onOpenRules: () => setRulesOpen(true), presence,
                          onOpenSummary: (tournament) => setChampionshipSummary(tournament),
                          onOpenCupMatch: (match) => setCupMatchModal({ matchId:match.id, homeScore:match.played?match.homeScore:0, awayScore:match.played?match.awayScore:0, penaltyWinner:match.penaltyWinner||null }),
                        }),
                      Y === "teams" &&
                        React.createElement(io, {
                          teams: ProfileTeams,
                          activeTeamId: ProfileTeam ? ProfileTeam.id : null,
                          setActiveTeamId: () => {},
                          onNewTeam: null,
                          onDeleteTeam: () => {},
                          squadOf: Oe,
                          onSellToMarket: It,
                          depreciationPct: R && R.marketSettings && R.marketSettings.depreciationPct != null ? R.marketSettings.depreciationPct : 10,
                          ownership: c,
                          onOpenDetail: be,
                          onGoMarket: () => oe("market"),
                          rosterSettings: R && R.rosterSettings ? R.rosterSettings : { minPlayers: 23, maxPlayers: 30 },
                          readOnly: !!(R && (R.status === "finished" || R.type === "cup")),
                          baseRosterPlayerIds: ProfileTeam ? Oe(ProfileTeam.id).filter((player) => isInitialRosterPlayer(player.id, ProfileTeam.id)).map((player) => String(player.id)) : [],
                          onSaveLineup: (teamId, lineup) => Se(p.map((team) => team && String(team.id) === String(teamId) ? { ...team, lineup } : team)),
                        }),

                      Y === "market" &&
                        React.createElement(lo, {
                          catalog: n,
                          catalogMap: xe,
                          ownership: c,
                          teamById: $,
                          teams: ProfileTeams,
                          statusOf: Pe,
                          onBuy: kt,
                          onOpenDetail: (player) => { let status = Pe(player); let balanceCheck = ProfileTeam ? evaluateMarketBalance(player, ProfileTeam.id) : { allowed:true }; be({ player, marketStatus: status, fromOtherTeam: !!(status.teamId && ProfileTeam && status.teamId !== ProfileTeam.id), canBuy: status.kind === "free", balanceCheck }); },
                          transfers: k,
                          activeTeam: ProfileTeam,
                          offers: tradeOffers,
                          unreadOffers: unreadOfferCount,
                          onAcceptOffer: acceptTradeOffer,
                          onUpdateOffer: updateTradeOffer,
                          onOpenBalanceHistory: () => setBalanceHistoryOpen(true),
                          favoritePlayerIds: currentFavoriteIds,
                          onToggleFavorite: toggleFavoritePlayer,
                          balanceCheckFor: (player) => ProfileTeam ? evaluateMarketBalance(player, ProfileTeam.id) : { allowed:true },
                          pendingReviews: pendingPlayerReviews(),
                          marketRules: marketAccessSettings(R),
                          onOpenReviews: () => setPlayerReviewsOpen(true),
                          isAdmin: isAdminProfile(te),
                        }),
                      Y === "admin" && isAdminProfile(te) && adminUnlocked &&
                        React.createElement(AdminArea, {
                          currentTournament: R, tournaments: m, teams: p, profiles: x,
                          profileName: adminProfileName, setProfileName: setAdminProfileName,
                          profileColor: adminProfileColor, setProfileColor: setAdminProfileColor,
                          profileBudget: adminProfileBudget, setProfileBudget: setAdminProfileBudget,
                          tournamentName: adminTournamentName, setTournamentName: setAdminTournamentName,
                          onCreateProfile: createAdminProfile, onCreateTournament: createAdminTournament,
                          onDeleteTournament: deleteAdminTournament, onSelectTournament: selectTournament,
                          onUpdateBudget: updateAdminBudget, onToggleParticipant: toggleTournamentParticipant,
                          onDeleteProfile: deleteGlobalProfile, onResetTournament: resetCurrentTournament, onRemoveOrphanParticipant: removeOrphanParticipant, onRestoreOrphanProfile: restoreOrphanProfile,
                          onUpdateMarketDepreciation: updateMarketDepreciation,
                          onUpdateInitialRosterDepreciation: (value) => updateMarketDepreciation(value, "initialRosterDepreciationPct"),
                          onUpdateMarketBalanceRules: updateMarketBalanceRules,
                          onUpdateMarketAccessRules: updateMarketAccessRules,
                          onUpdateRosterRules: updateRosterRules,
                          onUpdateEconomyRules: updateEconomyRules,
                          onFinishTournament: finishCurrentTournament,
                          catalog: n, onImportRosters: importRosterPlan, onImportHistoricalCompetition: importHistoricalCompetition,
                        }),
                      Y === "profile" &&
                        React.createElement(ProfileArea, {
                          profile: te, team: ProfileTeam, tournament: R, squad: ProfileTeam ? Oe(ProfileTeam.id) : [],
                          stats: s, matches: R && Array.isArray(R.matches) ? R.matches : [], transfers: k,
                          theme: theme, setTheme: setTheme, onUpdateProfile: updateGlobalProfile,
                          onUpdateTeamName: updateCurrentTeamName, onSwitchProfile: ht,
                          onOpenBalanceHistory: () => setBalanceHistoryOpen(true),
                          tournaments: m,
                          onOpenChampionshipSummary: (tournament) => setChampionshipSummary(tournament),
                        }),
                    ),
                    Y === "table" && R && R.type !== "cup" && R.status !== "finished" && (ProfileTeam || isAdminProfile(te)) && p.filter((team) => team && team.active !== false).length >= 2 &&
                      React.createElement("button", { onClick: openMatchWizard, className: "tapbtn sports-fab", title: "Adicionar partida", "aria-label": "Adicionar partida", style: { position: "fixed", left: "50%", bottom: 62, transform: "translateX(-50%)", width: 58, height: 58, borderRadius: "50%", border: "5px solid var(--surface)", background: "var(--green)", color: "white", fontSize: 32, lineHeight: 1, display: "grid", placeItems: "center", cursor: "pointer", zIndex: 140, boxShadow: "0 8px 20px rgba(0,0,0,.18)" } }, "+"),
                    React.createElement(mo, { tab: Y, setTab: (nextTab) => nextTab === "admin" ? requestAdminAccess() : oe(nextTab), isAdmin: isAdminProfile(te), unreadOffers: unreadOfferCount, profile: te, presence, tournamentFinished: !!(R && (R.status === "finished" || R.type === "cup")) }),
                    championshipSummary && React.createElement(ChampionshipSummaryModal, { tournament: championshipSummary, profiles: x, onClose: () => setChampionshipSummary(null) }),
                    cupMatchModal && R && R.type === "cup" && React.createElement(CupScoreModal, { data:cupMatchModal, setData:setCupMatchModal, tournament:R, teams:p, profiles:x, onClose:()=>setCupMatchModal(null), onSave:saveCupMatchResult }),
                    adminGate && React.createElement(ee, { title: adminGate.mode === "create" ? "Criar senha de administrador" : "Acessar administração", onClose: () => setAdminGate(null) },
                      React.createElement("div", { style: { color: "var(--muted)", fontSize: 13.5, lineHeight: 1.55, marginBottom: 16 } }, adminGate.mode === "create" ? "Defina uma senha para proteger o painel administrativo neste app." : "Digite a senha de administrador para continuar."),
                      React.createElement("label", { style: P }, "Senha"),
                      React.createElement("input", { type: "password", autoFocus: true, inputMode:"numeric", maxLength:adminGate.mode === "verify" ? 6 : undefined, value: adminGate.password, onChange: (event) => { let password=event.target.value; let next={ ...adminGate, password, error:"" }; setAdminGate(next); if(adminGate.mode === "verify" && password.length === 6) submitAdminGate(password,next); }, onKeyDown: (event) => { if (event.key === "Enter" && adminGate.mode === "verify") submitAdminGate(); }, style: { ...q, marginBottom: adminGate.mode === "create" ? 12 : 4 }, placeholder: adminGate.mode === "verify" ? "Digite os 6 dígitos" : "Mínimo de 6 caracteres" }),
                      adminGate.mode === "create" && React.createElement(React.Fragment, null,
                        React.createElement("label", { style: P }, "Confirmar senha"),
                        React.createElement("input", { type: "password", value: adminGate.confirm, onChange: (event) => setAdminGate({ ...adminGate, confirm: event.target.value, error: "" }), onKeyDown: (event) => { if (event.key === "Enter") submitAdminGate(); }, style: q, placeholder: "Digite novamente" })
                      ),
                      adminGate.error && React.createElement("div", { style: { color: "var(--danger)", fontSize: 12.5, marginTop: 10 } }, adminGate.error),
                      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 } },
                        React.createElement("button", { onClick: () => setAdminGate(null), style: { ...M, marginTop: 0, background: "var(--surface-soft)", color: "var(--heading)" } }, "Cancelar"),
                        React.createElement("button", { onClick: submitAdminGate, disabled: adminGate.submitting, style: { ...M, ...W, marginTop: 0, opacity: adminGate.submitting ? .55 : 1 } }, adminGate.submitting ? "Validando..." : adminGate.mode === "create" ? "Criar senha" : "Entrar")
                      ),
                      React.createElement("div", { style: { marginTop: 14, fontSize: 11.5, color: "var(--muted)", lineHeight: 1.45 } }, "A senha protege a interface administrativa. Para segurança completa dos dados, use Supabase Authentication e regras de acesso no banco.")
                    ),
                    profilePinGate && React.createElement(ProfilePinLock, { gate:profilePinGate, onDigit:appendProfilePinDigit, onErase:eraseProfilePinDigit }),
                    viewedTeamId && $(viewedTeamId) && React.createElement(TeamViewer, {
                      team: $(viewedTeamId),
                      squadOf: Oe,
                      ownership: c,
                      onOpenDetail: be,
                      profiles: x,
                      tournament: R,
                      tournaments: m,
                      onOpenChampionshipSummary: (item) => setChampionshipSummary(item),
                      onOfferPlayer: (player) => { setViewedTeamId(null); kt(player); },
                      onClose: () => setViewedTeamId(null),
                    }),
                    matchWizard && React.createElement(MatchWizard, { data: matchWizard, setData: setMatchWizard, teams: p.filter((team) => team && team.active !== false), profiles: x, presence, players: n, ownership: c, onClose: () => setMatchWizard(null), onSave: saveQuickMatch }),
                    ct &&
                      React.createElement(
                        ee,
                        { title: "Novo time", onClose: () => ge(!1) },
                        React.createElement(
                          "label",
                          { style: P },
                          "Nome do time",
                        ),
                        React.createElement("input", {
                          style: q,
                          value: j.name,
                          onChange: (o) => le({ ...j, name: o.target.value }),
                          placeholder: "Ex: Furac\xE3o FC",
                          autoFocus: !0,
                        }),
                        React.createElement(
                          "label",
                          { style: { ...P, marginTop: 14 } },
                          "Cor",
                        ),
                        React.createElement(
                          "div",
                          {
                            style: {
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                              marginBottom: 14,
                            },
                          },
                          se.map((o) =>
                            React.createElement("button", {
                              key: o,
                              onClick: () => le({ ...j, color: o }),
                              style: {
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: o,
                                border:
                                  j.color === o
                                    ? "2px solid #4B4B4B"
                                    : "2px solid transparent",
                                cursor: "pointer",
                              },
                            }),
                          ),
                        ),
                        React.createElement(
                          "label",
                          { style: P },
                          "Or\xE7amento inicial (em milh\xF5es)",
                        ),
                        React.createElement("input", {
                          type: "number",
                          min: 0,
                          style: q,
                          value: j.budget,
                          onChange: (o) => le({ ...j, budget: o.target.value }),
                        }),
                        React.createElement(
                          "button",
                          {
                            className: "tapbtn",
                            style: { ...M, ...W },
                            onClick: xt,
                          },
                          "Criar time",
                        ),
                      ),
                    pt &&
                      React.createElement(go, {
                        teams: p,
                        tourForm: Te,
                        setTourForm: ye,
                        onClose: () => fe(!1),
                        onToggleTeam: Bt,
                        onCreate: Dt,
                      }),
                    G &&
                      React.createElement(fo, {
                        match: G,
                        teamById: $,
                        squadOf: Oe,
                        catalogMap: xe,
                        scoreDraft: K,
                        setScoreDraft: re,
                        onClose: () => ve(null),
                        onSave: Rt,
                        addScorer: Mt,
                        removeScorer: Wt,
                      }),
                    Me &&
                      React.createElement(ro, {
                        player: Me,
                        onClose: () => be(null),
                        onOffer: (player) => { be(null); kt(player); },
                        onBuy: (player) => { be(null); kt(player); },
                        activeTeam: ProfileTeam,
                        onReport: (player) => setPlayerReportModal(player),
                      }),
                    playerReportModal && React.createElement(PlayerReportModal, { player:playerReportModal, onClose:()=>setPlayerReportModal(null), onSubmit:submitPlayerReview }),
                    playerReviewsOpen && React.createElement(PlayerReviewsModal, { reviews:pendingPlayerReviews(), catalogMap:xe, profiles:x, currentProfile:te, isAdmin:isAdminProfile(te), onClose:()=>setPlayerReviewsOpen(false), onVote:votePlayerReview, onRemove:removePlayerReview }),
                    We &&
                      React.createElement(so, {
                        data: We,
                        activeTeam: ProfileTeam,
                        onClose: () => he(null),
                        onConfirm: Ft,
                      }),
                    offerModal &&
                      React.createElement(TradeOfferModal, {
                        data: offerModal,
                        activeTeam: ProfileTeam,
                        sellerTeam: offerModal.status && offerModal.status.teamId ? $(offerModal.status.teamId) : null,
                        onClose: () => setOfferModal(null),
                        onConfirm: sendTradeOffer,
                      }),
                    balanceHistoryOpen && (ProfileTeam || isAdminProfile(te)) && React.createElement(BalanceHistoryModal, { team: ProfileTeam || null, transactions: R && R.context && Array.isArray(R.context.financialTransactions) ? R.context.financialTransactions : [], teams:p, canRollback:isAdminProfile(te), showAll:isAdminProfile(te)&&!ProfileTeam, onRollback:rollbackMarketPurchase, onClose:()=>setBalanceHistoryOpen(false) }),
                    rulesOpen && R && React.createElement(ChampionshipRulesModal, { tournament:R, teams:p, ownership:c, catalog:n, onClose:()=>setRulesOpen(false) }),
                    saleModal &&
                      React.createElement(MarketSaleModal, {
                        data: saleModal,
                        onClose: () => setSaleModal(null),
                        onConfirm: () => confirmMarketSale(saleModal.player),
                      }),
                    Re &&
                      React.createElement(co, {
                        data: Re,
                        onClose: () => Ae(null),
                        onConfirm: wt,
                      }),
                  );
        }

        function InitialSetup({ adminName, setAdminName, tournamentName, setTournamentName, hasTournaments, submitting, onSubmit }) {
          return React.createElement("div", { style: { minHeight: "100vh", background: "var(--surface)", color: "var(--heading)", fontFamily: "Manrope,system-ui,-apple-system,Segoe UI,Roboto,sans-serif", padding: 24, display: "flex", alignItems: "center", justifyContent: "center" } },
            React.createElement("div", { style: { width: "100%", maxWidth: 520, background: "var(--card)", borderRadius: 20, padding: 28, boxShadow: "inset 0 0 0 1px var(--border)" } },
              React.createElement("div", { style: { width: 52, height: 52, borderRadius: 18, background: "var(--green)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, marginBottom: 20 } }, "+"),
              React.createElement("h1", { style: { margin: 0, fontSize: 28, lineHeight: 1.15 } }, "Vamos configurar o app"),
              React.createElement("p", { style: { color: "var(--muted)", lineHeight: 1.5, margin: "10px 0 24px" } }, "Nenhum perfil global foi encontrado. Crie um administrador para recuperar o acesso e continuar gerenciando campeonatos e participantes."),
              React.createElement("label", { style: P }, "Nome do administrador"),
              React.createElement("input", { style: { ...q, width: "100%", boxSizing: "border-box", marginBottom: 18 }, value: adminName, maxLength: 30, placeholder: "Ex.: Hyago", onChange: (event) => setAdminName(event.target.value) }),
              !hasTournaments && React.createElement(React.Fragment, null,
                React.createElement("label", { style: P }, "Primeiro campeonato (opcional)"),
                React.createElement("input", { style: { ...q, width: "100%", boxSizing: "border-box" }, value: tournamentName, maxLength: 50, placeholder: "Ex.: Campeonato 1", onChange: (event) => setTournamentName(event.target.value) }),
                React.createElement("div", { style: { color: "var(--muted)", fontSize: 12, lineHeight: 1.4, marginTop: 8 } }, "Você poderá criar ou editar campeonatos depois no painel admin.")
              ),
              hasTournaments && React.createElement("div", { style: { padding: 14, borderRadius: 12, background: "var(--surface-2)", color: "var(--muted)", fontSize: 13, lineHeight: 1.45 } }, "Seus campeonatos existentes serão preservados. Apenas um novo perfil administrador será criado."),
              React.createElement("button", { onClick: onSubmit, disabled: submitting || !String(adminName || "").trim(), style: { ...M, ...W, width: "100%", marginTop: 22, opacity: submitting ? .65 : 1 } }, submitting ? "Configurando..." : "Criar administrador e continuar"),
              React.createElement("div", { style: { color: "var(--muted)", fontSize: 12, textAlign: "center", marginTop: 14, lineHeight: 1.4 } }, "Este fluxo aparece somente quando não existe nenhum perfil global.")
            )
          );
        }

        function oo({ profiles: e, tournaments: t, selectedTournamentId: l, onSelectTournament: a, onPick: n, belongsToTournament: r }) {
          let [pickerOpen, setPickerOpen] = b(false);
          let ordered = [...(t || [])].sort((x,y)=>(Number(y.createdAt || y.finishedAt)||0)-(Number(x.createdAt || x.finishedAt)||0));
          let selected = ordered.find((item) => item.id === l) || ordered.find((item)=>item.status !== "finished") || ordered[0] || null;
          let ctaWords = ["tanga", "paçoca", "peba", "spritflai"];
          let [ctaWord] = b(() => ctaWords[Math.floor(Math.random() * ctaWords.length)]);
          let visibleProfiles = selected ? e.map((profile, index) => {
            let item = typeof profile === "object" && profile ? profile : { name: String(profile) };
            return { raw: profile, name: String(item.name || "").trim(), color: item.color || se[index % se.length] };
          }).filter((profile) => profile.name && r(profile.raw, selected)) : [];
          let active = ordered.filter((item)=>item.status !== "finished"), finished = ordered.filter((item)=>item.status === "finished");
          function chooseTournament(id){ a(id); setPickerOpen(false); }
          function tournamentRow(item){
            let champion = item.finalStandings && item.finalStandings[0] ? item.finalStandings[0].profileNameSnapshot : null;
            return React.createElement("button", { key:item.id, onClick:()=>chooseTournament(item.id), style:{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, padding:"14px 4px", border:0, borderBottom:"1px solid var(--border)", background:"transparent", color:"var(--heading)", cursor:"pointer", textAlign:"left" } },
              React.createElement("div", null, React.createElement("div", { style:{ fontWeight:800, fontSize:15 } }, item.name), React.createElement("div", { style:{ color:"var(--muted)", fontSize:12, marginTop:3 } }, item.status === "finished" ? `Encerrado${champion ? ` · Campeão: ${champion}` : ""}` : "Em andamento")),
              item.id === (selected&&selected.id) && React.createElement("span", { style:{ color:"var(--green)", fontWeight:900 } }, "✓")
            );
          }
          return React.createElement("div", { className: "profile-gate", style: { minHeight: "100vh", color: "var(--heading)", fontFamily: "Manrope,system-ui,-apple-system,Segoe UI,Roboto,sans-serif", padding: "clamp(24px,5vw,64px) 24px", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center" } },
            React.createElement("div", { style: { width:"min(100%,980px)", textAlign:"center" } },
              React.createElement("div", { style: { marginBottom: "clamp(28px,5vw,52px)" } }, React.createElement("div", { style: { fontSize: "clamp(13px,1.2vw,15px)", textTransform:"uppercase", letterSpacing:".22em", color:"var(--muted)", fontWeight:800, marginBottom:14 } }, "MANCHADO PATCH"), React.createElement("h1", { style: { margin:0, fontSize:"clamp(32px,5vw,58px)", lineHeight:1.05, fontWeight:700, letterSpacing:"-.045em" } }, `Quem é o ${ctaWord} da vez?`)),
              selected ? React.createElement("button", { onClick:()=>setPickerOpen(true), className:"tapbtn", style:{ minWidth:"min(100%,340px)", padding:"13px 20px", borderRadius:999, border:"1px solid var(--border)", background:"color-mix(in srgb,var(--surface) 92%,transparent)", color:"var(--heading)", cursor:"pointer", textAlign:"center", boxShadow:"0 12px 36px rgba(0,0,0,.16)", backdropFilter:"blur(16px)", marginBottom:"clamp(34px,5vw,56px)" } }, React.createElement("div", { style:{ fontSize:14, fontWeight:850 } }, selected.name), React.createElement("div", { style:{ fontSize:11, color:selected.status === "finished" ? "#ffbb26" : "var(--green)", marginTop:3, fontWeight:750 } }, selected.status === "finished" ? "Encerrado · Ver histórico" : "Em andamento · Trocar campeonato")) : React.createElement("div", { className:"family-card", style:{ padding:24, color:"var(--muted)", marginBottom:36 } }, "Nenhum campeonato foi encontrado."),
              !selected ? React.createElement("div", { style:{ color:"var(--muted)", padding:28 } }, "Selecione um campeonato.") : visibleProfiles.length ? React.createElement("div", { style:{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"clamp(26px,4vw,46px)" } }, visibleProfiles.map((profile) => React.createElement("button", { key:(profile.raw&&profile.raw.id)||profile.name, onClick:()=>n(profile.raw), className:"profile-choice tapbtn", style:{ width:"clamp(112px,15vw,154px)", background:"none", border:0, color:"var(--heading)", cursor:"pointer", padding:0, textAlign:"center" } }, React.createElement("div", { className:"profile-choice-avatar", style:{ width:"clamp(104px,14vw,146px)", height:"clamp(104px,14vw,146px)", margin:"0 auto", borderRadius:"50%", background:profile.color, overflow:"hidden", display:"grid", placeItems:"center", fontSize:"clamp(38px,5vw,56px)", fontWeight:800, border:"3px solid transparent", boxShadow:"0 18px 46px rgba(0,0,0,.28)" } }, profile.raw && profile.raw.avatar ? React.createElement("img", { src:profile.raw.avatar, alt:profile.name, style:{ width:"100%", height:"100%", objectFit:"cover" } }) : profile.name.charAt(0).toUpperCase()), React.createElement("div", { style:{ fontSize:"clamp(15px,1.6vw,18px)", fontWeight:750, marginTop:14, color:"var(--heading)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } }, profile.name)))) : React.createElement("div", { className:"family-card", style:{ padding:24, color:"var(--muted)" } }, "Nenhum perfil pertence a este campeonato."),
              pickerOpen && React.createElement(ee, { title:"Escolher campeonato", onClose:()=>setPickerOpen(false) }, active.length ? React.createElement(React.Fragment,null,React.createElement("div", { style:{ color:"var(--muted)",fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:".12em",marginBottom:4 } },"Em andamento"),active.map(tournamentRow)) : null, finished.length ? React.createElement(React.Fragment,null,React.createElement("div", { style:{ color:"var(--muted)",fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:".12em",margin:"20px 0 4px" } },"Encerrados"),finished.map(tournamentRow)) : null)
            )
          );
        }
        function no({
          meta: e,
          currentTournament: t,
          myProfile: l,
          onSwitchProfile: a,
        }) {
          return React.createElement(
            "div",
            {
              style: {
                padding: "22px 16px 16px",
                position: "sticky",
                top: 0,
                zIndex: 5,
                background: "rgba(255,255,255,.96)",
                borderBottom: "2px solid #F0F0F0",
              },
            },
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                },
              },
              React.createElement(
                "div",
                null,
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 22,
                      fontWeight: 900,
                      letterSpacing: 1.5,
                      color: "var(--heading)",
                    },
                  },
                  "PES ",
                  React.createElement(
                    "span",
                    { style: { color: "var(--green)" } },
                    "MANAGER",
                  ),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 11,
                      letterSpacing: 2,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      marginTop: 2,
                    },
                  },
                  "Temporada ",
                  e.seasonCounter,
                ),
              ),
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                t &&
                  t.status === "ongoing" &&
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "var(--surface-soft)",
                        padding: "6px 10px",
                        borderRadius: 20,
                        border: "1px solid #58CC02",
                      },
                    },
                    React.createElement("span", {
                      style: {
                        width: 7,
                        height: 7,
                        borderRadius: 99,
                        background: "var(--green)",
                        boxShadow: "0 0 6px #58CC02",
                        display: "inline-block",
                      },
                    }),
                    React.createElement(
                      "span",
                      {
                        style: {
                          fontSize: 11,
                          color: "var(--green)",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        },
                      },
                      "Em andamento",
                    ),
                  ),
                l &&
                  React.createElement(
                    "button",
                    {
                      onClick: a,
                      style: {
                        background: "var(--surface-soft)",
                        border: "1px solid #AFAFAF",
                        color: "var(--heading)",
                        borderRadius: 20,
                        padding: "6px 10px",
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      },
                      title: "Trocar perfil",
                    },
                    React.createElement(qt, { size: 12, color: "var(--green)" }),
                    " ",
                    l,
                  ),
              ),
            ),
          );
        }
        function Ke({ value: e }) {
          return React.createElement(
            "span",
            {
              className: "scoreboard",
              style: {
                background: "var(--surface)",
                border: "1px solid #D7FFB8",
                borderRadius: 6,
                padding: "3px 9px",
                color: "#A5ED6E",
                fontWeight: 800,
                fontSize: 17,
                minWidth: 30,
                textAlign: "center",
                display: "inline-block",
              },
            },
            e,
          );
        }
        function $e({ team: e }) {
          return React.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 8 } },
            React.createElement("span", {
              style: {
                width: 9,
                height: 9,
                borderRadius: 3,
                background: (e == null ? void 0 : e.color) || "#555",
                display: "inline-block",
                flexShrink: 0,
              },
            }),
            React.createElement(
              "span",
              { style: { fontSize: 14, fontWeight: 600 } },
              (e == null ? void 0 : e.name) || "?",
            ),
          );
        }
        function ce({ match: e, teamById: t, onOpen: l }) {
          let a = t(e.homeId),
            n = t(e.awayId);
          return e.bye
            ? React.createElement(
                "div",
                {
                  style: {
                    ...E,
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    opacity: 0.75,
                  },
                },
                React.createElement(
                  "span",
                  { style: { fontSize: 13.5, color: "var(--muted)" } },
                  React.createElement(
                    "b",
                    { style: { color: "var(--heading)" } },
                    a == null ? void 0 : a.name,
                  ),
                  " avan\xE7ou de bye",
                ),
                React.createElement(Ut, { size: 14, color: "var(--muted)" }),
              )
            : React.createElement(
                "button",
                {
                  className: "tapbtn",
                  onClick: () => l(e),
                  style: {
                    ...E,
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    cursor: "pointer",
                    textAlign: "left",
                    border: e.played
                      ? "1px solid #DEDEDE"
                      : "1px solid #D7FFB8",
                  },
                },
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      flex: 1,
                    },
                  },
                  React.createElement($e, { team: a }),
                  React.createElement($e, { team: n }),
                ),
                e.played
                  ? React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 6,
                        },
                      },
                      React.createElement(Ke, { value: e.homeScore }),
                      React.createElement(Ke, { value: e.awayScore }),
                    )
                  : React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          color: "var(--green)",
                          fontSize: 12.5,
                          fontWeight: 700,
                        },
                      },
                      "JOGAR ",
                      React.createElement(ue, { size: 16 }),
                    ),
              );
        }
        function ao({
          teams: e,
          currentTournament: t,
          nextMatches: l,
          topScorers: a,
          onGoTournament: n,
          squadCount: r,
          catalogCount: f,
        }) {
          return React.createElement(
            "div",
            null,
            t
              ? React.createElement(
                  React.Fragment,
                  null,
                  React.createElement(
                    "div",
                    {
                      style: {
                        ...E,
                        background: "var(--surface-soft)",
                      },
                    },
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        },
                      },
                      React.createElement(
                        "div",
                        null,
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 11,
                              color: "var(--green)",
                              textTransform: "uppercase",
                              letterSpacing: 1,
                              fontWeight: 700,
                            },
                          },
                          t.format === "liga"
                            ? "Liga"
                            : t.format === "mata-mata"
                              ? "Mata-mata"
                              : "Grupos + Mata-mata",
                        ),
                        React.createElement(
                          "div",
                          { style: { fontSize: 18, fontWeight: 800 } },
                          t.name,
                        ),
                      ),
                      React.createElement(
                        "button",
                        {
                          className: "tapbtn",
                          onClick: n,
                          style: {
                            background: "var(--surface-soft)",
                            border: "1px solid #58CC02",
                            color: "var(--green)",
                            borderRadius: 10,
                            padding: "8px 12px",
                            fontSize: 12.5,
                            fontWeight: 700,
                            cursor: "pointer",
                          },
                        },
                        "Ver ",
                        React.createElement(ue, {
                          size: 13,
                          style: { verticalAlign: -2 },
                        }),
                      ),
                    ),
                  ),
                  React.createElement(Z, {
                    icon: React.createElement(ot, { size: 15 }),
                    text: "Pr\xF3ximas partidas",
                  }),
                  l.length === 0
                    ? React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 13,
                            color: "var(--muted)",
                            marginBottom: 12,
                          },
                        },
                        "Nenhuma partida pendente. Confira a aba Campeonato.",
                      )
                    : l.map((d) =>
                        React.createElement(ce, {
                          key: d.id,
                          match: d,
                          teamById: (p) => e.find((F) => F.id === p),
                          onOpen: n,
                        }),
                      ),
                )
              : React.createElement(
                  "div",
                  { style: { ...E, textAlign: "center", padding: 26 } },
                  React.createElement(pe, {
                    size: 30,
                    color: "var(--green)",
                    style: { marginBottom: 10 },
                  }),
                  React.createElement(
                    "div",
                    {
                      style: { fontWeight: 700, fontSize: 16, marginBottom: 6 },
                    },
                    "Nenhum campeonato ativo",
                  ),
                  React.createElement(
                    "div",
                    { style: { fontSize: 13, color: "var(--muted)" } },
                    "Contrate jogadores no mercado e depois inicie um campeonato.",
                  ),
                ),
            a.length > 0 &&
              React.createElement(
                React.Fragment,
                null,
                React.createElement(Z, {
                  icon: React.createElement(nt, { size: 15 }),
                  text: "Artilheiros",
                }),
                React.createElement(
                  "div",
                  { style: E },
                  a.slice(0, 5).map((d, p) =>
                    React.createElement(
                      "div",
                      {
                        key: d.id,
                        style: {
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 0",
                          borderBottom: p < 4 ? "1px solid #DEDEDE" : "none",
                        },
                      },
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          },
                        },
                        React.createElement(
                          "span",
                          {
                            style: {
                              fontSize: 12,
                              color: "var(--muted)",
                              width: 16,
                            },
                          },
                          p + 1,
                        ),
                        React.createElement("span", {
                          style: {
                            width: 8,
                            height: 8,
                            borderRadius: 3,
                            background: d.teamColor,
                          },
                        }),
                        React.createElement(
                          "span",
                          { style: { fontSize: 14, fontWeight: 600 } },
                          d.name,
                        ),
                        React.createElement(
                          "span",
                          { style: { fontSize: 11.5, color: "var(--muted)" } },
                          d.teamName,
                        ),
                      ),
                      React.createElement(
                        "span",
                        { style: { fontWeight: 800, color: "var(--green)" } },
                        d.goals,
                      ),
                    ),
                  ),
                ),
              ),
            React.createElement(
              "div",
              { style: { display: "flex", gap: 12, marginTop: 6 } },
              React.createElement(Ce, { label: "Times", value: e.length }),
              React.createElement(Ce, { label: "Contratados", value: r }),
              React.createElement(Ce, { label: "No cat\xE1logo", value: f }),
            ),
          );
        }
        function Ce({ label: e, value: t }) {
          return React.createElement(
            "div",
            { style: { ...E, flex: 1, textAlign: "center" } },
            React.createElement(
              "div",
              { style: { fontSize: 20, fontWeight: 900, color: "var(--green)" } },
              t,
            ),
            React.createElement(
              "div",
              {
                style: {
                  fontSize: 10.5,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                },
              },
              e,
            ),
          );
        }
        function Z({ icon: e, text: t }) {
          return React.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                margin: "18px 0 10px",
                color: "var(--muted)",
              },
            },
            e,
            React.createElement(
              "span",
              {
                style: {
                  fontSize: 12.5,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  fontWeight: 700,
                },
              },
              t,
            ),
          );
        }
        function nationalityFlag(value) {
          let raw = String(value || "").trim();
          if (!raw) return "🌐";
          if (/^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase().replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt()));
          let normalized = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          let codes = {
            brazil:"BR",brasil:"BR",argentina:"AR",portugal:"PT",spain:"ES",espanha:"ES",france:"FR",franca:"FR",germany:"DE",alemanha:"DE",italy:"IT",italia:"IT",england:"GB",inglaterra:"GB",netherlands:"NL",holanda:"NL",belgium:"BE",belgica:"BE",croatia:"HR",croacia:"HR",serbia:"RS",uruguay:"UY",paraguay:"PY",chile:"CL",colombia:"CO",mexico:"MX",usa:"US","united states":"US",japan:"JP",japao:"JP",southkorea:"KR","south korea":"KR",coreia:"KR",turkey:"TR",turquia:"TR",greece:"GR",grecia:"GR",sweden:"SE",suecia:"SE",norway:"NO",noruega:"NO",denmark:"DK",dinamarca:"DK",switzerland:"CH",suica:"CH",austria:"AT",poland:"PL",polonia:"PL",czech:"CZ","czech republic":"CZ",romania:"RO",russia:"RU",ukraine:"UA",nigeria:"NG",cameroon:"CM",camaroon:"CM",ghana:"GH","ivory coast":"CI",senegal:"SN",morocco:"MA",marrocos:"MA",algeria:"DZ",egito:"EG",egypt:"EG",australia:"AU",ireland:"IE",scotland:"GB",wales:"GB"
          };
          let code = codes[normalized];
          return code ? code.replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt())) : "🌐";
        }
        function UnifiedPlayerCard({ player, actionLabel, actionDisabled=false, onAction=null, onOpen=null, className="", isFavorite=false, onToggleFavorite=null, dimmed=false, isInitialRoster=false, currentTeamName=null }) {
          let flag = nationalityFlag(player.nationality);
          return React.createElement("article", {
            className:`tapbtn unified-player-card ${className}`.trim(),
            onClick:()=>onOpen&&onOpen(player),
            style:{ position:"relative", cursor:onOpen?"pointer":"default", overflow:"hidden", background:`linear-gradient(155deg, color-mix(in srgb, ${overallColor(player.overall)} 19%, var(--surface)) 0%, var(--surface-soft) 52%, var(--surface) 100%)`, border:`1px solid color-mix(in srgb, ${overallColor(player.overall)} 45%, var(--border))`, boxShadow:`0 18px 44px color-mix(in srgb, ${overallColor(player.overall)} 10%, transparent)`, textAlign:"left", color:"var(--heading)", opacity:dimmed?.62:1, filter:dimmed?"saturate(.65)":undefined }
          },
            React.createElement("div", { style:{ position:"absolute", width:120, height:120, right:-45, top:-45, borderRadius:999, background:overallColor(player.overall), opacity:.12, filter:"blur(18px)" } }),
            isInitialRoster && React.createElement("span", { title:"Elenco-base · jogador do elenco inicial", style:{ position:"absolute", zIndex:3, top:10, right:onToggleFavorite?48:10, width:30, height:30, borderRadius:999, display:"grid", placeItems:"center", border:"1px solid color-mix(in srgb, var(--yellow) 45%, var(--border))", background:"color-mix(in srgb, var(--yellow) 14%, var(--surface))", color:"var(--yellow)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)" } }, React.createElement(BaseRosterIcon,{ size:16,color:"currentColor" })),
            onToggleFavorite && React.createElement("button", {
              className:"tapbtn", title:isFavorite?"Remover dos favoritos":"Adicionar aos favoritos", "aria-label":isFavorite?"Remover dos favoritos":"Adicionar aos favoritos",
              onClick:(event)=>{event.stopPropagation();onToggleFavorite(player)},
              style:{ position:"absolute", zIndex:3, top:10, right:10, width:32, height:32, padding:0, borderRadius:999, display:"grid", placeItems:"center", cursor:"pointer", border:isFavorite?"1px solid rgba(255,205,108,.55)":"1px solid var(--border)", background:isFavorite?"rgba(255,187,38,.16)":"color-mix(in srgb, var(--surface) 82%, transparent)", color:isFavorite?"#ffbb26":"var(--muted)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)" }
            }, React.createElement("svg", { width:17,height:17,viewBox:"0 0 24 24",fill:isFavorite?"currentColor":"none",stroke:"currentColor",strokeWidth:1.9,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true" }, React.createElement("path", { d:"m12 2.8 2.8 5.68 6.27.91-4.54 4.42 1.07 6.24L12 17.1l-5.6 2.95 1.07-6.24-4.54-4.42 6.27-.91L12 2.8Z" }))),
            React.createElement("div", { style:{ position:"relative", alignSelf:"start", fontSize:38, lineHeight:1, fontWeight:850, letterSpacing:"-1.8px", color:overallColor(player.overall) } }, player.overall),
            React.createElement("div", { style:{ position:"relative", minWidth:0, display:"flex", flexDirection:"column", alignItems:"stretch", rowGap:3 } },
              React.createElement("span", { style:{ justifySelf:"start", alignSelf:"start", display:"inline-flex", alignItems:"center", minHeight:20, fontSize:10.5, fontWeight:800, background:positionColor(player.position), color:"white", padding:"3px 7px", borderRadius:7 } }, player.position),
              React.createElement("div", { style:{ display:"flex", alignItems:"flex-start", gap:5, minWidth:0, marginTop:1 } },
                React.createElement("div", { style:{ minWidth:0, fontSize:17, fontWeight:800, lineHeight:1.08, letterSpacing:"-.4px", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" } }, player.name),
                React.createElement("span", { title:player.nationality||"Nacionalidade não informada", style:{ flex:"0 0 auto", fontSize:14, lineHeight:1.1 } }, flag)
              ),
              React.createElement("div", { style:{ fontSize:10.5, color:"var(--muted)", lineHeight:1.25, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } }, player.club || "Clube não informado"),
              currentTeamName && React.createElement("div", { title:currentTeamName, style:{ fontSize:10.5, color:"var(--green)", fontWeight:800, lineHeight:1.25, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } }, `Time atual · ${currentTeamName}`),
              React.createElement("div", { style:{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, color:"var(--heading)", fontWeight:750 } }, React.createElement(BankIcon,{ size:13,color:"currentColor" }), L(player.value))
            ),
            actionLabel ? React.createElement("button", {
              className:"tapbtn unified-player-action", disabled:actionDisabled,
              onClick:(event)=>{event.stopPropagation();if(!actionDisabled&&onAction)onAction(player)},
              style:{ border:"1px solid rgba(88,204,2,.38)", background:actionDisabled?"var(--surface-soft)":"rgba(88,204,2,.12)", color:actionDisabled?"var(--muted)":"var(--green)", cursor:actionDisabled?"not-allowed":"pointer", opacity:actionDisabled?.5:1 }
            }, actionLabel) : React.createElement("div", { style:{ height:38 } })
          );
        }
        function io({
          teams: e,
          activeTeamId: t,
          setActiveTeamId: l,
          onNewTeam: a,
          onDeleteTeam: n,
          squadOf: r,
          onSellToMarket: p,
          depreciationPct: Dp,
          ownership: F,
          onOpenDetail: c,
          onGoMarket: v,
          rosterSettings,
          readOnly = false,
          onBack = null,
          viewerProfile = null,
          viewerTrophies = null,
          readOnlyActionLabel = null,
          onReadOnlyAction = null,
          baseRosterPlayerIds = [],
          onSaveLineup = null,
        }) {
          let s = e.find((h) => h.id === t);
          if (!s) return React.createElement("div", { style: E }, "Nenhum time selecionado.");
          let squad = r(s.id).slice();
          let [squadView, setSquadView] = b("roster");
          let savedLineup = s.lineup && typeof s.lineup === "object" ? s.lineup : {};
          let [formation, setFormation] = b(savedLineup.formation || "4-3-3");
          let [assignments, setAssignments] = b(savedLineup.assignments && typeof savedLineup.assignments === "object" ? savedLineup.assignments : {});
          let [lineupPicker, setLineupPicker] = b(null);
          let [lineupDrag, setLineupDrag] = b(null);
          let [lineupDragOver, setLineupDragOver] = b(null);
          let [lineupDragGhost, setLineupDragGhost] = b(null);
          let [lineupEditMode, setLineupEditMode] = b(false);
          let [lineupEditingSlotId, setLineupEditingSlotId] = b(null);
          let [customPositions, setCustomPositions] = b(savedLineup.customPositions && typeof savedLineup.customPositions === "object" ? savedLineup.customPositions : {});
          let lineupGestureRef = Rf({ timer:null, active:false, payload:null, pointerId:null, startX:0, startY:0, moved:false });
          let lineupSuppressClickRef = Rf(false);
          let lineupFieldRef = Rf(null);
          let customPositionsRef = Rf(customPositions);
          let lineupSlotEditRef = Rf({ active:false, slotId:null, pointerId:null });
          He(() => {
            let current = s.lineup && typeof s.lineup === "object" ? s.lineup : {};
            setFormation(current.formation || "4-3-3");
            setAssignments(current.assignments && typeof current.assignments === "object" ? current.assignments : {});
            let nextCustomPositions = current.customPositions && typeof current.customPositions === "object" ? current.customPositions : {};
            setCustomPositions(nextCustomPositions);
            customPositionsRef.current = nextCustomPositions;
            setLineupEditMode(false);
            setLineupEditingSlotId(null);
          }, [s.id, s.lineup && s.lineup.updatedAt]);
          He(() => () => {
            let gesture = lineupGestureRef.current;
            if (gesture && gesture.timer) window.clearTimeout(gesture.timer);
            document.body.classList.remove("is-lineup-dragging");
          }, []);
          let presetFormation = formation === "Personalizada" ? (savedLineup.baseFormation || "4-3-3") : formation;
          let baseLineupSlots = window.PESLineups ? window.PESLineups.slots(presetFormation) : [];
          const LINEUP_GRID_X = [16, 33, 50, 67, 84];
          const LINEUP_GRID_Y = [11, 22, 33, 44, 56, 67, 78, 89];
          function nearestGridValue(value, grid) {
            let numeric = Number(value);
            return grid.reduce((closest, item) => Math.abs(item - numeric) < Math.abs(closest - numeric) ? item : closest, grid[0]);
          }
          function gridAlignedPosition(slot, position) {
            let source = position && Number.isFinite(Number(position.x)) && Number.isFinite(Number(position.y)) ? position : slot;
            return { ...slot, x:nearestGridValue(source.x, LINEUP_GRID_X), y:nearestGridValue(source.y, LINEUP_GRID_Y) };
          }
          let lineupSlots = baseLineupSlots.map((slot) => gridAlignedPosition(slot, customPositions && customPositions[slot.id]));
          let playerById = new Map(squad.map((player) => [String(player.id), player]));
          let starterIds = new Set(Object.values(assignments || {}).filter(Boolean).map(String));
          let benchPlayers = squad.filter((player) => !starterIds.has(String(player.id))).sort((x,y)=>(y.overall||0)-(x.overall||0));
          function lineupAdjustedOverall(player, slotPosition) {
            if (!player) return 0;
            let overall = Number(player.overall) || 0;
            if (!window.PESLineups || !slotPosition) return overall;
            let scoreValue = Number(window.PESLineups.score(player, slotPosition)) || 0;
            let fitLevel = Math.max(0, Math.floor(scoreValue / 1000));
            let penaltyByFit = { 8:0, 7:1, 6:2, 5:3, 4:5, 3:7, 2:10, 1:13, 0:18 };
            let penalty = penaltyByFit[fitLevel] != null ? penaltyByFit[fitLevel] : 18;
            return Math.max(0, overall - penalty);
          }
          function lineupQuality(assignmentValue) {
            let values = lineupSlots.map((slot) => {
              let player = playerById.get(String(assignmentValue && assignmentValue[slot.id] || ""));
              return player ? lineupAdjustedOverall(player, slot.position) : null;
            }).filter((value) => value != null);
            return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
          }
          let currentLineupOverall = lineupQuality(assignments);
          let maximumAssignments = window.PESLineups ? window.PESLineups.autoAssign(squad, presetFormation) : {};
          let maximumLineupPotential = lineupQuality(maximumAssignments);
          function positionTagStyle(position) {
            return { background:positionColor(position), color:"white" };
          }
          function saveLineup(nextFormation = formation, nextAssignments = assignments, nextCustomPositions = customPositions, nextBaseFormation = presetFormation) {
            let payload = { formation:nextFormation, assignments:nextAssignments, customPositions:nextCustomPositions || {}, baseFormation:nextBaseFormation || "4-3-3", updatedAt:Date.now() };
            setFormation(nextFormation);
            setAssignments(nextAssignments);
            setCustomPositions(nextCustomPositions || {});
            customPositionsRef.current = nextCustomPositions || {};
            if (onSaveLineup) onSaveLineup(s.id, payload);
          }
          function autoOrganize(nextFormation = formation) {
            let targetFormation = nextFormation === "Personalizada" ? presetFormation : nextFormation;
            let next = window.PESLineups ? window.PESLineups.autoAssign(squad, targetFormation) : {};
            saveLineup(nextFormation, next, nextFormation === "Personalizada" ? customPositions : {}, targetFormation);
          }
          function clearLineup() {
            if (readOnly || !Object.keys(assignments || {}).length) return;
            if (!window.confirm("Limpar todos os jogadores escalados?")) return;
            saveLineup(formation, {});
          }
          function startLineupEditor() {
            if (readOnly) return;
            let seeded = {};
            lineupSlots.forEach((slot) => { seeded[slot.id] = { x:Number(slot.x), y:Number(slot.y) }; });
            setLineupEditMode(true);
            saveLineup("Personalizada", assignments, seeded, presetFormation);
          }
          function stopLineupEditor() {
            setLineupEditMode(false);
            setLineupEditingSlotId(null);
            lineupSlotEditRef.current = { active:false, slotId:null, pointerId:null };
          }
          function resetCustomFormation() {
            if (readOnly) return;
            let reset = {};
            baseLineupSlots.forEach((slot) => { reset[slot.id] = { x:Number(slot.x), y:Number(slot.y) }; });
            saveLineup("Personalizada", assignments, reset, presetFormation);
          }
          function safeSlotPosition(slotId, x, y) {
            let slot = lineupSlots.find((item) => item.id === slotId);
            let isGoalkeeper = slot && slot.position === "GK";
            let nextX = nearestGridValue(x, LINEUP_GRID_X);
            let nextY = nearestGridValue(y, LINEUP_GRID_Y);
            if (isGoalkeeper && nextY < 78) return null;
            if (!isGoalkeeper && nextY > 78) nextY = 78;
            let collision = lineupSlots.some((item) => item.id !== slotId && Number(item.x) === nextX && Number(item.y) === nextY);
            if (collision) return null;
            return { x:nextX, y:nextY };
          }
          function updateSlotPositionFromPoint(slotId, clientX, clientY, persist = false) {
            if (readOnly || !lineupFieldRef.current) return false;
            let rect = lineupFieldRef.current.getBoundingClientRect();
            let position = safeSlotPosition(slotId, ((clientX - rect.left) / rect.width) * 100, ((clientY - rect.top) / rect.height) * 100);
            if (!position) return false;
            let nextPositions = { ...(customPositionsRef.current || {}) };
            lineupSlots.forEach((slot) => {
              if (!nextPositions[slot.id]) nextPositions[slot.id] = { x:Number(slot.x), y:Number(slot.y) };
            });
            nextPositions[slotId] = position;
            customPositionsRef.current = nextPositions;
            setCustomPositions(nextPositions);
            if (persist) saveLineup("Personalizada", assignments, nextPositions, presetFormation);
            return true;
          }
          function beginSlotEdit(event, slotId) {
            if (readOnly) return;
            event.preventDefault();
            lineupSlotEditRef.current = { active:true, slotId, pointerId:event.pointerId };
            setLineupEditingSlotId(slotId);
            try { event.currentTarget.setPointerCapture(event.pointerId); } catch (error) {}
          }
          function moveSlotEdit(event) {
            let gesture = lineupSlotEditRef.current;
            if (!gesture.active || gesture.pointerId !== event.pointerId || !lineupFieldRef.current) return;
            event.preventDefault();
            updateSlotPositionFromPoint(gesture.slotId, event.clientX, event.clientY, false);
          }
          function endSlotEdit(event) {
            let gesture = lineupSlotEditRef.current;
            if (!gesture.active || gesture.pointerId !== event.pointerId) return;
            lineupSlotEditRef.current = { active:false, slotId:null, pointerId:null };
            setLineupEditingSlotId(null);
            saveLineup("Personalizada", assignments, customPositionsRef.current, presetFormation);
          }
          function cancelSlotEdit(event) {
            let gesture = lineupSlotEditRef.current;
            if (event && gesture.pointerId != null && gesture.pointerId !== event.pointerId) return;
            lineupSlotEditRef.current = { active:false, slotId:null, pointerId:null };
            setLineupEditingSlotId(null);
          }
          function chooseLineupPlayer(slotId, playerId) {
            let next = { ...(assignments || {}) };
            Object.keys(next).forEach((key) => { if (String(next[key]) === String(playerId)) delete next[key]; });
            if (playerId) next[slotId] = String(playerId); else delete next[slotId];
            saveLineup(formation, next);
            setLineupPicker(null);
          }
          function moveLineupPlayer(payload, targetSlotId) {
            if (readOnly || !payload || !payload.playerId || !targetSlotId) return;
            let next = { ...(assignments || {}) };
            let sourceSlotId = payload.sourceSlotId || Object.keys(next).find((key)=>String(next[key])===String(payload.playerId)) || null;
            let targetPlayerId = next[targetSlotId] || null;
            Object.keys(next).forEach((key) => { if (String(next[key]) === String(payload.playerId)) delete next[key]; });
            if (sourceSlotId && sourceSlotId !== targetSlotId && targetPlayerId) next[sourceSlotId] = String(targetPlayerId);
            next[targetSlotId] = String(payload.playerId);
            saveLineup(formation, next);
          }
          function moveLineupPlayerToBench(payload) {
            if (readOnly || !payload || !payload.playerId) return;
            let next = { ...(assignments || {}) };
            Object.keys(next).forEach((key) => { if (String(next[key]) === String(payload.playerId)) delete next[key]; });
            saveLineup(formation, next);
          }
          function lineupFitClass(player, slot) {
            if (!lineupDrag || lineupDrag.kind === "slot-position" || !player || !slot || !window.PESLineups) return "";
            let value = window.PESLineups.score(player, slot.position);
            return value >= 7000 ? " is-compatible" : value >= 1000 ? " is-secondary" : " is-incompatible";
          }
          function clearLineupDrag() {
            let gesture = lineupGestureRef.current;
            if (gesture && gesture.timer) window.clearTimeout(gesture.timer);
            lineupGestureRef.current = { timer:null, active:false, payload:null, pointerId:null, startX:0, startY:0, moved:false };
            setLineupDrag(null);
            setLineupDragOver(null);
            setLineupDragGhost(null);
            setLineupEditingSlotId(null);
            document.body.classList.remove("is-lineup-dragging");
          }
          function activateLineupPointerDrag(payload, pointerId, clientX, clientY, target) {
            let current = lineupGestureRef.current;
            lineupGestureRef.current = { ...current, timer:null, active:true, payload, pointerId, moved:false };
            setLineupDrag(payload);
            if (payload && payload.kind === "slot-position") setLineupEditingSlotId(payload.slotId);
            if (payload && payload.kind === "player") {
              let player = playerById.get(String(payload.playerId));
              setLineupDragGhost(player ? { x:clientX, y:clientY, player } : null);
            }
            document.body.classList.add("is-lineup-dragging");
            try { target.setPointerCapture(pointerId); } catch (error) {}
          }
          function beginLineupPointerDrag(event, payload) {
            if (readOnly || event.button > 0) return;
            let pointerId = event.pointerId;
            let target = event.currentTarget;
            let base = { timer:null, active:false, payload, pointerId, startX:event.clientX, startY:event.clientY, moved:false };
            if (event.pointerType === "mouse" || event.pointerType === "pen") {
              event.preventDefault();
              lineupGestureRef.current = base;
              activateLineupPointerDrag(payload, pointerId, event.clientX, event.clientY, target);
              return;
            }
            let timer = window.setTimeout(() => {
              activateLineupPointerDrag(payload, pointerId, base.startX, base.startY, target);
              if (navigator.vibrate) navigator.vibrate(20);
            }, 300);
            lineupGestureRef.current = { ...base, timer };
          }
          function moveLineupPointerDrag(event) {
            let gesture = lineupGestureRef.current;
            if (!gesture || gesture.pointerId !== event.pointerId) return;
            let distance = Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY);
            if (!gesture.active) {
              if (distance > 8) {
                if (gesture.timer) window.clearTimeout(gesture.timer);
                lineupGestureRef.current = { timer:null, active:false, payload:null, pointerId:null, startX:0, startY:0, moved:false };
              }
              return;
            }
            event.preventDefault();
            if (distance > 3 && !gesture.moved) {
              gesture.moved = true;
              lineupSuppressClickRef.current = true;
            }
            if (gesture.payload && gesture.payload.kind === "slot-position") {
              updateSlotPositionFromPoint(gesture.payload.slotId, event.clientX, event.clientY, false);
              return;
            }
            let player = playerById.get(String(gesture.payload && gesture.payload.playerId));
            setLineupDragGhost(player ? { x:event.clientX, y:event.clientY, player } : null);
            let target = document.elementFromPoint(event.clientX, event.clientY);
            let slot = target && target.closest ? target.closest("[data-lineup-slot]") : null;
            setLineupDragOver(slot ? slot.getAttribute("data-lineup-slot") : (target && target.closest && target.closest("[data-lineup-bench]") ? "bench" : null));
          }
          function endLineupPointerDrag(event) {
            let gesture = lineupGestureRef.current;
            if (!gesture || gesture.pointerId !== event.pointerId) return;
            if (gesture.timer) window.clearTimeout(gesture.timer);
            if (gesture.active) {
              event.preventDefault();
              if (gesture.payload && gesture.payload.kind === "slot-position") {
                updateSlotPositionFromPoint(gesture.payload.slotId, event.clientX, event.clientY, true);
              } else {
                let target = document.elementFromPoint(event.clientX, event.clientY);
                let slot = target && target.closest ? target.closest("[data-lineup-slot]") : null;
                if (slot) moveLineupPlayer(gesture.payload, slot.getAttribute("data-lineup-slot"));
                else if (target && target.closest && target.closest("[data-lineup-bench]")) moveLineupPlayerToBench(gesture.payload);
              }
            }
            clearLineupDrag();
            window.setTimeout(() => { lineupSuppressClickRef.current = false; }, 0);
          }
          let minPlayers = Math.max(0, Number(rosterSettings && rosterSettings.minPlayers != null ? rosterSettings.minPlayers : 23) || 0);
          let maxPlayers = Math.max(minPlayers, Number(rosterSettings && rosterSettings.maxPlayers != null ? rosterSettings.maxPlayers : 30) || 30);
          let groups = {
            attack: { label: "Atacantes", positions: ["SS","CF","ATA_LEVE","WF","WG","RWF","LWF"], players: [] },
            midfield: { label: "Meias", positions: ["DM","DMF","CM","CMF","AM","AMF","SM","SMF","RMF","LMF"], players: [] },
            fullbacks: { label: "Laterais/Alas", positions: ["SB","WB","SB_D","SB_E","RB","LB"], players: [] },
            defense: { label: "Zagueiros", positions: ["CBT","CB","CWP","SW"], players: [] },
            goalkeepers: { label: "Goleiros", positions: ["GK"], players: [] },
          };
          function groupOf(position) {
            let pos = String(position || "").toUpperCase();
            return Object.keys(groups).find((key) => groups[key].positions.includes(pos)) || "midfield";
          }
          squad.forEach((player) => groups[groupOf(player.position)].players.push(player));
          Object.values(groups).forEach((group) => group.players.sort((x,y) => (y.overall||0)-(x.overall||0) || String(x.name).localeCompare(String(y.name))));
          function average(players) { return players.length ? Math.round((players.reduce((sum,player)=>sum+(Number(player.overall)||0),0)/players.length)*10)/10 : 0; }
          let overall = average(squad), totalValue = squad.reduce((sum,player)=>sum+(Number(player.value)||0),0);
          let sectorData = Object.entries(groups).map(([key,group]) => ({ key, label:group.label, average:average(group.players), count:group.players.length }));
          let weakest = sectorData.filter((item)=>item.count).sort((x,y)=>x.average-y.average || x.count-y.count)[0];
          let tip = weakest
            ? `${weakest.label} é o setor com menor média (${weakest.average.toFixed(1)}). Esse é hoje o principal ponto técnico a melhorar.`
            : "Monte seu elenco para receber uma análise técnica dos setores.";
          function statCard(label,value,accent,isWeakest=false) {
            return React.createElement("div", { style:{ padding:16, borderRadius:16, background:isWeakest?"color-mix(in srgb, var(--muted) 10%, var(--surface))":"var(--surface)", border:isWeakest?"1px solid color-mix(in srgb, var(--muted) 42%, var(--border))":"1px solid var(--border)", minWidth:0, position:"relative" } },
              isWeakest && React.createElement("span", { title:"Setor que mais precisa de atenção", style:{ position:"absolute", right:10, top:10, width:20, height:20, borderRadius:999, display:"grid", placeItems:"center", background:"color-mix(in srgb, var(--muted) 18%, var(--surface-soft))", color:"var(--muted)", fontSize:12, fontWeight:900 } }, "!"),
              React.createElement("div", { style:{ fontSize:11, color:"var(--muted)", marginBottom:6, paddingRight:isWeakest?22:0 } }, label),
              React.createElement("strong", { style:{ fontSize:20, color:accent||"var(--heading)", letterSpacing:"-.4px" } }, value)
            );
          }
          function playerCard(player) {
            let cannotSell = squad.length <= minPlayers;
            return React.createElement(UnifiedPlayerCard, {
              key:player.id, player, onOpen:c,
              actionLabel:readOnly?readOnlyActionLabel:"Vender ao mercado",
              actionDisabled:readOnly?!onReadOnlyAction:cannotSell,
              isInitialRoster:baseRosterPlayerIds.includes(String(player.id)),
              currentTeamName:s && s.name ? s.name : null,
              onAction:()=>{ if(readOnly){ if(onReadOnlyAction) onReadOnlyAction(player); } else if(!cannotSell) p(player); }
            });
          }
          if (squadView === "formation") {
            let selectedSlot = lineupPicker ? lineupSlots.find((slot)=>slot.id===lineupPicker.slotId) : null;
            let recommended = selectedSlot && window.PESLineups ? squad.slice().sort((a,b)=>window.PESLineups.score(b,selectedSlot.position)-window.PESLineups.score(a,selectedSlot.position)) : squad;
            return React.createElement("div", null,
              onBack && React.createElement("button", { onClick:onBack, className:"tapbtn", style:{ marginBottom:16, border:"1px solid var(--border)", background:"var(--surface)", color:"var(--heading)", borderRadius:999, padding:"9px 14px", fontWeight:750, cursor:"pointer" } }, "← Voltar para a tabela"),
              React.createElement("div", { className:"squad-segmented" },
                React.createElement("button", { onClick:()=>setSquadView("roster") }, "Elenco"),
                React.createElement("button", { className:"is-active", onClick:()=>setSquadView("formation") }, "Formação")
              ),
              React.createElement("section", { style:{ ...E, padding:"clamp(16px,3vw,26px)" } },
                React.createElement("div", { className:"lineup-toolbar" },
                  React.createElement("div", { className:"lineup-toolbar-heading" },
                    React.createElement("div", null, "Escalação"),
                    React.createElement("h1", null, s.name)
                  ),
                  React.createElement("div", { className:"lineup-toolbar-controls" },
                    React.createElement("select", { value:formation === "Personalizada" ? presetFormation : formation, disabled:readOnly, onChange:(event)=>{let value=event.target.value;setLineupEditMode(false);saveLineup(value,window.PESLineups?window.PESLineups.autoAssign(squad,value):{}, {}, value)}, style:q, "aria-label":"Selecionar formação" }, Object.keys((window.PESLineups&&window.PESLineups.presets)||{}).map((name)=>React.createElement("option",{key:name,value:name},name))),
                    React.createElement("button", { type:"button", title:"Auto organizar", "aria-label":"Auto organizar", disabled:readOnly||!squad.length, onClick:()=>autoOrganize(), className:"lineup-icon-button family-pill-primary" }, React.createElement(MagicWandIcon,{size:19})),
                    React.createElement("button", { type:"button", title:"Limpar escalação", "aria-label":"Limpar escalação", disabled:readOnly||!Object.keys(assignments||{}).length, onClick:clearLineup, className:"lineup-icon-button family-pill-secondary" }, React.createElement(EraserIcon,{size:19})),
                    !readOnly && formation === "Personalizada" && React.createElement("button", { onClick:()=>{let reset={};baseLineupSlots.forEach((slot)=>{reset[slot.id]={x:Number(slot.x),y:Number(slot.y)}});saveLineup(presetFormation,assignments,{},presetFormation)}, className:"family-pill-secondary lineup-reset-button" }, "Restaurar posições")
                  )
                ),
                !squad.length ? React.createElement("div", { style:{ padding:30, textAlign:"center", color:"var(--muted)" } }, "Seu elenco está vazio.") : React.createElement(React.Fragment,null,
                  React.createElement("div", { className:"lineup-workspace" },
                    React.createElement("div", { className:"lineup-field-column" },
                      React.createElement("div", {
                        ref:lineupFieldRef,
                        className:`lineup-field${lineupDrag?" is-drag-active":""}${lineupEditingSlotId?" is-moving-slot":""}`,
                        onDragOver:(event)=>{if(lineupDrag&&lineupDrag.kind==="slot-position"){event.preventDefault();updateSlotPositionFromPoint(lineupDrag.slotId,event.clientX,event.clientY,false)}},
                        onDrop:(event)=>{if(lineupDrag&&lineupDrag.kind==="slot-position"){event.preventDefault();updateSlotPositionFromPoint(lineupDrag.slotId,event.clientX,event.clientY,true);clearLineupDrag()}}
                      },
                        React.createElement("div", { className:"lineup-field-markings", "aria-hidden":"true" },
                          React.createElement("span", { className:"lineup-penalty-area lineup-penalty-area-top" }),
                          React.createElement("span", { className:"lineup-penalty-area lineup-penalty-area-bottom" })
                        ),
                        lineupEditingSlotId && React.createElement("div", { className:"lineup-grid-targets", "aria-hidden":"true" }, LINEUP_GRID_Y.flatMap((gridY)=>LINEUP_GRID_X.map((gridX)=>{
                          let allowed = !!safeSlotPosition(lineupEditingSlotId, gridX, gridY);
                          let current = lineupSlots.some((item)=>item.id===lineupEditingSlotId&&Number(item.x)===gridX&&Number(item.y)===gridY);
                          return allowed && !current ? React.createElement("span", { key:`${gridX}-${gridY}`, className:"lineup-grid-target is-available", style:{left:`${gridX}%`,top:`${gridY}%`} }) : null;
                        }))),
                        lineupSlots.map((slot)=>{let player=playerById.get(String(assignments[slot.id]||""));let draggedPlayer=lineupDrag&&playerById.get(String(lineupDrag.playerId));return React.createElement("button", {
                          key:slot.id,
                          "data-lineup-slot":slot.id,
                          className:`lineup-slot${player?"":" is-empty"}${lineupFitClass(draggedPlayer,slot)}${lineupDragOver===slot.id?" is-drag-over":""}${lineupDrag&&String(lineupDrag.playerId)===String(player&&player.id)?" is-drag-source":""}${lineupEditMode?" is-editable":""}${lineupEditingSlotId===slot.id?" is-being-edited":""}`,
                          disabled:readOnly,
                          draggable:false,
                          onClick:()=>{if(lineupSuppressClickRef.current)return;if(!lineupDrag)setLineupPicker({slotId:slot.id})},
                          onPointerDown:(event)=>beginLineupPointerDrag(event,{kind:"slot-position",slotId:slot.id,playerId:player?String(player.id):null}),
                          onPointerMove:moveLineupPointerDrag,
                          onPointerUp:endLineupPointerDrag,
                          onPointerCancel:clearLineupDrag,
                          style:{left:`${slot.x}%`,top:`${slot.y}%`}
                        },
                          React.createElement("span", { className:"lineup-slot-avatar" }, player&&player.photo?React.createElement("img",{src:player.photo,alt:""}):player?String(player.name||"?").slice(0,2).toUpperCase():slot.position),
                          player&&React.createElement("span",{className:"lineup-slot-overall",style:{color:overallColor(player.overall),borderColor:overallColor(player.overall)}},player.overall||"—"),
                          React.createElement("span",{className:"lineup-slot-name"},player?(player.name||"Jogador"):slot.position),
                          player&&React.createElement("span",{className:"lineup-slot-position",style:positionTagStyle(player.position||slot.position)},player.position||slot.position)
                        )})
                      ),
                      lineupDrag && React.createElement("div",{className:"lineup-drag-hint"},"Solte em uma posição destacada ou arraste para Reservas")
                    ),
                    React.createElement("div", {
                      className:`lineup-bench${lineupDragOver==="bench"?" is-drag-over":""}`,
                      "data-lineup-bench":"true",
                      onDragOver:(event)=>{if(!readOnly){event.preventDefault();setLineupDragOver("bench")}},
                      onDragLeave:()=>{if(lineupDragOver==="bench")setLineupDragOver(null)},
                      onDrop:(event)=>{event.preventDefault();moveLineupPlayerToBench(lineupDrag);clearLineupDrag()}
                    },
                      React.createElement("div", { className:"lineup-bench-header" },React.createElement("div",null,React.createElement("h2",null,"Reservas"),React.createElement("p",null,"Arraste um jogador para o campo")),React.createElement("span",null,benchPlayers.length)),
                      React.createElement("div", { className:"lineup-bench-list" }, benchPlayers.map((player)=>React.createElement("article", {
                        key:player.id,
                        className:`lineup-bench-player${lineupDrag&&String(lineupDrag.playerId)===String(player.id)?" is-drag-source":""}`,
                        draggable:false,
                        onPointerDown:(event)=>beginLineupPointerDrag(event,{kind:"player",playerId:String(player.id),sourceSlotId:null}),
                        onPointerMove:moveLineupPointerDrag,
                        onPointerUp:endLineupPointerDrag,
                        onPointerCancel:clearLineupDrag
                      },
                        React.createElement("div",{className:"lineup-bench-player-ball"},
                          React.createElement("span",{className:"lineup-slot-avatar"},player.photo?React.createElement("img",{src:player.photo,alt:""}):String(player.name||"?").slice(0,2).toUpperCase()),
                          React.createElement("span",{className:"lineup-slot-overall",style:{color:overallColor(player.overall),borderColor:overallColor(player.overall)}},player.overall||"—")
                        ),
                        React.createElement("div",{className:"lineup-bench-player-info"},
                          React.createElement("div",{className:"lineup-bench-player-name"},player.name),
                          React.createElement("div",{className:"lineup-bench-player-position",style:positionTagStyle(player.position||"—")},player.position||"—")
                        )
                      ))),
                      React.createElement("div",{className:"lineup-team-quality"},
                        React.createElement("div",null,
                          React.createElement("span",null,"Overall escalado"),
                          React.createElement("strong",null,currentLineupOverall?currentLineupOverall.toFixed(1):"—")
                        ),
                        React.createElement("div",null,
                          React.createElement("span",null,"Potencial máximo"),
                          React.createElement("strong",null,maximumLineupPotential?maximumLineupPotential.toFixed(1):"—")
                        ),
                        React.createElement("small",null,"Considera o encaixe de cada jogador na posição da formação atual.")
                      )
                    )
                  ),
                  lineupDragGhost && React.createElement("div", { className:"lineup-pointer-ghost", style:{ left:lineupDragGhost.x, top:lineupDragGhost.y, borderColor:overallColor(lineupDragGhost.player.overall) } },
                    React.createElement("span", { style:{ color:overallColor(lineupDragGhost.player.overall), borderColor:overallColor(lineupDragGhost.player.overall) } }, lineupDragGhost.player.overall || "—"),
                    React.createElement("strong", null, lineupDragGhost.player.name),
                    React.createElement("small", null, lineupDragGhost.player.position || "—")
                  )
                )
              ),
              lineupPicker && selectedSlot && React.createElement("div", { className:"sports-modal-overlay", onClick:()=>setLineupPicker(null), style:{position:"fixed",inset:0,background:"var(--overlay)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000} },
                React.createElement("div", { className:"sports-modal", onClick:(event)=>event.stopPropagation(), style:{width:"min(620px,100%)",maxHeight:"88vh",overflow:"hidden"} },
                  React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}},React.createElement("div",null,React.createElement("div",{style:{fontSize:11,color:"var(--green)",fontWeight:850,textTransform:"uppercase"}},selectedSlot.position),React.createElement("h2",{style:{margin:"4px 0 0"}},"Escolher titular")),React.createElement("button",{onClick:()=>setLineupPicker(null),style:{border:0,background:"transparent",color:"var(--heading)",fontSize:22,cursor:"pointer"}},"×")),
                  assignments[selectedSlot.id]&&React.createElement("button",{onClick:()=>chooseLineupPlayer(selectedSlot.id,null),style:{...M,margin:"0 0 10px",background:"var(--surface-soft)",color:"var(--danger)"}},"Remover desta posição"),
                  React.createElement("div",{className:"lineup-picker-list"},recommended.map((player,index)=>React.createElement("button",{key:player.id,className:"lineup-picker-item",onClick:()=>chooseLineupPlayer(selectedSlot.id,player.id)},player.photo?React.createElement("img",{src:player.photo,alt:""}):React.createElement("div",{style:{width:46,height:46,borderRadius:"50%",display:"grid",placeItems:"center",background:"var(--surface-soft)",fontWeight:900}},String(player.name||"?").slice(0,2)),React.createElement("div",null,React.createElement("div",{style:{fontWeight:850}},player.name),React.createElement("div",{style:{fontSize:11,color:"var(--muted)",marginTop:3}},`${player.position}${index<4?" · Recomendado":""}`)),React.createElement("strong",{style:{fontSize:16,color:overallColor(player.overall)}},player.overall))))
                )
              )
            );
          }
          return React.createElement("div", null,
            onBack && React.createElement("button", { onClick:onBack, className:"tapbtn", style:{ marginBottom:16, border:"1px solid var(--border)", background:"var(--surface)", color:"var(--heading)", borderRadius:999, padding:"9px 14px", fontWeight:750, cursor:"pointer" } }, "← Voltar para a tabela"),
            React.createElement("div", { className:"squad-segmented" },
              React.createElement("button", { className:"is-active", onClick:()=>setSquadView("roster") }, "Elenco"),
              React.createElement("button", { onClick:()=>setSquadView("formation") }, "Formação")
            ),
            React.createElement("section", { style:{ ...E, padding:"clamp(18px,3vw,28px)", marginBottom:24, background:"linear-gradient(145deg, color-mix(in srgb, var(--green) 7%, var(--surface)), var(--surface) 44%, color-mix(in srgb, var(--accent) 5%, var(--surface)))" } },
              React.createElement("div", { style:{ textAlign:"center", padding:"4px 0 22px" } },
                React.createElement("div", { style:{ fontSize:11, color:"var(--muted)", marginBottom:7, textTransform:"uppercase", letterSpacing:".08em", fontWeight:750 } }, readOnly ? (viewerProfile ? `Time de ${viewerProfile.name}` : "Elenco do participante") : "Meu elenco"),
                React.createElement("h1", { style:{ margin:0, fontSize:"clamp(28px,5vw,42px)", lineHeight:1, letterSpacing:"-.045em" } }, s.name),
                React.createElement("div", { style:{ color:"var(--muted)", fontSize:12.5, marginTop:9 } }, `${squad.length}/${maxPlayers} jogadores${readOnly ? "" : ` · ${L(s.budget)} disponíveis`}`),
                viewerTrophies
              ),
              React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(135px,1fr))", gap:10 } },
                statCard("Overall do elenco", overall ? overall.toFixed(1) : "—", overall?overallColor(overall):null),
                statCard("Valor do elenco", L(totalValue)),
                ...sectorData.map((item)=>statCard(item.label, item.count ? item.average.toFixed(1) : "—", item.count?overallColor(item.average):null, !!(weakest && weakest.key===item.key)))
              ),
              !readOnly && React.createElement("div", { style:{ marginTop:10, padding:"14px 16px", borderRadius:16, border:"1px solid color-mix(in srgb, var(--muted) 40%, var(--border))", background:"color-mix(in srgb, var(--muted) 9%, var(--surface-soft))", display:"flex", gap:11, alignItems:"flex-start" } },
                React.createElement("span", { style:{ flex:"0 0 auto", marginTop:1, width:26, height:26, borderRadius:999, display:"grid", placeItems:"center", background:"color-mix(in srgb, var(--muted) 18%, var(--surface))", color:"var(--muted)", fontSize:14, fontWeight:900 } }, "!"),
                React.createElement("div", null,
                  React.createElement("div", { style:{ fontSize:10.5, fontWeight:800, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:5 } }, weakest ? `Atenção em ${weakest.label}` : "Análise do time"),
                  React.createElement("div", { style:{ fontSize:14, lineHeight:1.5, color:"var(--heading)" } }, tip)
                )
              )
            ),
            squad.length===0 && React.createElement("div", { style:{ ...E, textAlign:"center", color:"var(--muted)", padding:28 } }, "Elenco vazio. Vá ao mercado para contratar jogadores."),
            Object.values(groups).map((group)=>group.players.length ? React.createElement("section", { key:group.label, style:{ marginBottom:26 } },
              React.createElement("div", { style:{ display:"flex", justifyContent:"space-between", alignItems:"end", marginBottom:10 } }, React.createElement("div", null, React.createElement("h2", { style:{ margin:0, fontSize:19 } }, group.label), React.createElement("div", { style:{ fontSize:11.5, color:"var(--muted)", marginTop:3 } }, `${group.players.length} jogadores · média ${average(group.players).toFixed(1)}`))),
              React.createElement("div", { className:"unified-player-grid" }, group.players.map(playerCard))
            ) : null)
          );
        }
        function DualRange({ min, max, step=1, minValue, maxValue, onChangeMin, onChangeMax, formatValue=(value)=>value }) {
          let span = Math.max(1, Number(max) - Number(min));
          let left = ((Number(minValue) - Number(min)) / span) * 100;
          let right = 100 - ((Number(maxValue) - Number(min)) / span) * 100;
          let shared = { position:"absolute", inset:0, width:"100%", height:30, margin:0, background:"transparent", pointerEvents:"none", WebkitAppearance:"none", appearance:"none" };
          return React.createElement("div", null,
            React.createElement("div", { style:{ display:"flex", justifyContent:"space-between", gap:10, fontSize:10.5, color:"var(--muted)", marginBottom:9 } },
              React.createElement("span", null, formatValue(minValue)), React.createElement("strong", { style:{ color:"var(--heading)" } }, `${formatValue(minValue)} – ${formatValue(maxValue)}`), React.createElement("span", null, formatValue(maxValue))
            ),
            React.createElement("div", { style:{ position:"relative", height:30 } },
              React.createElement("div", { style:{ position:"absolute", left:0, right:0, top:13, height:4, borderRadius:999, background:"var(--surface-soft)", boxShadow:"inset 0 0 0 1px var(--border)" } }),
              React.createElement("div", { style:{ position:"absolute", left:`${left}%`, right:`${right}%`, top:13, height:4, borderRadius:999, background:"var(--green)" } }),
              React.createElement("input", { className:"dual-range-input dual-range-min", type:"range", min, max, step, value:minValue, onChange:(event)=>onChangeMin(Number(event.target.value)), style:{...shared,zIndex:Number(minValue)>=Number(maxValue)-Number(step)?5:3} }),
              React.createElement("input", { className:"dual-range-input dual-range-max", type:"range", min, max, step, value:maxValue, onChange:(event)=>onChangeMax(Number(event.target.value)), style:{...shared,zIndex:4} })
            )
          );
        }
        function lo({
          catalog: e,
          catalogMap: catalogMap,
          ownership: t,
          teamById: l,
          teams: a,
          statusOf: n,
          onBuy: r,
          onOpenDetail: f,
          transfers: d,
          activeTeam: activeTeam,
          offers: offers,
          unreadOffers: unreadOffers,
          onAcceptOffer: onAcceptOffer,
          onUpdateOffer: onUpdateOffer,
          onOpenBalanceHistory: onOpenBalanceHistory,
          favoritePlayerIds: favoritePlayerIds = [],
          onToggleFavorite: onToggleFavorite,
          balanceCheckFor: balanceCheckFor,
          pendingReviews: pendingReviews = [],
          marketRules = { isOpen:true, freePlayerOverallLimit:{enabled:false,maxOverall:99} },
          onOpenReviews: onOpenReviews,
          isAdmin: isAdmin = false,
        }) {
          let catalogValueCeiling = Math.max(333, ...(Array.isArray(e) ? e : []).map((player) => Number(player && player.value) || 0));
          let [marketSection, setMarketSection] = b("all"),
            [clubQuery, setClubQuery] = b(""),
            [positionFilter, setPositionFilter] = b("all"),
            [sortBy, setSortBy] = b("overall"),
            [visibleCount, setVisibleCount] = b(24),
            [filtersOpen, setFiltersOpen] = b(false),
            [overallMin, setOverallMin] = b(70),
            [overallMax, setOverallMax] = b(() => marketRules.freePlayerOverallLimit && marketRules.freePlayerOverallLimit.enabled ? Number(marketRules.freePlayerOverallLimit.maxOverall || 99) : 99),
            [valueMin, setValueMin] = b(3),
            [valueMax, setValueMax] = b(catalogValueCeiling),
            loadMoreSentinel = React.useRef(null);
          let defaultMarketOverallMax = marketRules.freePlayerOverallLimit && marketRules.freePlayerOverallLimit.enabled ? Math.min(99, Math.max(1, Number(marketRules.freePlayerOverallLimit.maxOverall || 99))) : 99;
          He(() => { setOverallMax(defaultMarketOverallMax); setOverallMin((current)=>Math.min(Number(current)||1,defaultMarketOverallMax)); }, [defaultMarketOverallMax]);

          let favoriteSet = X(() => new Set((Array.isArray(favoritePlayerIds) ? favoritePlayerIds : []).map((id) => String(id))), [favoritePlayerIds]);
          let deferredClubQuery = React.useDeferredValue ? React.useDeferredValue(clubQuery) : clubQuery;
          function normalizeMarketSearch(value) {
            return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
          }
          let marketSearchIndex = X(() => {
            let index = new Map();
            (Array.isArray(e) ? e : []).forEach((player) => {
              let owner = t && t[player.id];
              let ownerTeam = owner && owner.teamId ? l(owner.teamId) : null;
              index.set(String(player.id), normalizeMarketSearch(`${player.name || ""} ${player.club || ""} ${ownerTeam && ownerTeam.name || ""}`));
            });
            return index;
          }, [e, t, a]);
          let favoritePlayers = X(() => e.filter((player) => favoriteSet.has(String(player.id)) && !(activeTeam && t[player.id] && String(t[player.id].teamId) === String(activeTeam.id))), [e, favoriteSet, activeTeam, t]);
          function favoriteSectionOf(position) {
            let value = String(position || "").toUpperCase();
            if (["SS","CF","ATA_LEVE","WF","WG","RWF","LWF"].includes(value)) return "attack";
            if (["DM","DMF","CM","CMF","AM","AMF","SM","SMF","RMF","LMF"].includes(value)) return "midfield";
            if (["SB","WB","SB_D","SB_E","RB","LB"].includes(value)) return "fullbacks";
            if (["CBT","CB","CWP","SW"].includes(value)) return "defense";
            if (value === "GK") return "goalkeepers";
            return "midfield";
          }
          let favoriteSections = X(() => {
            let sections = [
              { key:"attack", label:"Atacantes", players:[] },
              { key:"midfield", label:"Meias", players:[] },
              { key:"fullbacks", label:"Laterais/Alas", players:[] },
              { key:"defense", label:"Zagueiros", players:[] },
              { key:"goalkeepers", label:"Goleiros", players:[] },
            ];
            let byKey = Object.fromEntries(sections.map((section) => [section.key, section]));
            favoritePlayers.forEach((player) => byKey[favoriteSectionOf(player.position)].players.push(player));
            sections.forEach((section) => section.players.sort((left,right) => (Number(right.overall)||0)-(Number(left.overall)||0) || String(left.name||"").localeCompare(String(right.name||""),"pt-BR")));
            return sections.filter((section) => section.players.length);
          }, [favoritePlayers]);

          let positions = X(() => [...new Set(e.map((u) => u.position).filter(Boolean))].sort(), [e]);
          let activeSquad = X(
            () => activeTeam ? e.filter((player) => t[player.id] && t[player.id].teamId === activeTeam.id) : [],
            [e, t, activeTeam],
          );
          let maxCatalogValue = catalogValueCeiling;

          function positionGroup(position) {
            let value = String(position || "").toUpperCase();
            if (value === "GK") return "gk";
            if (["CB", "CBT", "SB", "SB_D", "SB_E", "LB", "RB", "SW"].includes(value)) return "def";
            if (["DMF", "CMF", "AMF", "SMF", "LMF", "RMF"].includes(value)) return "mid";
            return "att";
          }
          let groupLabels = { gk: "Goleiros", def: "Defesa", mid: "Meio-campo", att: "Ataque" };
          let groupTargets = { gk: 3, def: 8, mid: 8, att: 4 };
          let squadAnalysis = X(() => {
            let groups = { gk: [], def: [], mid: [], att: [] };
            activeSquad.forEach((player) => groups[positionGroup(player.position)].push(player));
            let analysis = {};
            Object.keys(groups).forEach((group) => {
              let players = groups[group];
              let average = players.length ? players.reduce((sum, player) => sum + Number(player.overall || 0), 0) / players.length : 0;
              analysis[group] = {
                count: players.length,
                average,
                weakest: players.length ? Math.min(...players.map((player) => Number(player.overall || 0))) : 0,
                deficit: Math.max(0, groupTargets[group] - players.length),
              };
            });
            return analysis;
          }, [activeSquad]);

          let recommendationData = X(() => {
            if (marketSection !== "recommended" || !activeTeam) return [];
            return e
              .map((player) => {
                let status = n(player);
                if (status.teamId === activeTeam.id) return null;
                let price = Number(status.kind === "listed" && status.price ? status.price : player.value) || 0;
                if (price > Number(activeTeam.budget || 0)) return null;
                let operationBlock = marketRules.isOpen ? (status.kind === "free" && marketRules.freePlayerOverallLimit.enabled && Number(player.overall||0) > marketRules.freePlayerOverallLimit.maxOverall) : true;
                if (operationBlock) return null;
                let balanceCheck = typeof balanceCheckFor === "function" ? balanceCheckFor(player) : { allowed:true };
                if (!balanceCheck.allowed) return null;
                let group = positionGroup(player.position), need = squadAnalysis[group] || { deficit: 0, weakest: 0, average: 0, count: 0 };
                let reference = need.weakest || need.average || 60;
                let upgrade = Math.max(0, Number(player.overall || 0) - reference);
                let coverageScore = need.deficit * 18 + (need.count === 0 ? 20 : 0);
                let upgradeScore = upgrade * 5;
                let valueScore = price > 0 ? (Number(player.overall || 0) / price) * 3 : 15;
                let availabilityScore = status.kind === "free" ? 8 : status.kind === "listed" ? 5 : 0;
                return { player, status, price, group, need, upgrade, score: coverageScore + upgradeScore + valueScore + availabilityScore };
              })
              .filter(Boolean)
              .sort((left, right) => right.score - left.score || right.player.overall - left.player.overall);
          }, [marketSection, e, n, activeTeam, squadAnalysis, marketRules]);

          let filteredPlayers = X(() => {
            let result = e.filter((player) => {
              if (activeTeam && t[player.id] && String(t[player.id].teamId) === String(activeTeam.id)) return false;
              if (positionFilter !== "all" && player.position !== positionFilter) return false;
              if (Number(player.overall || 0) < Number(overallMin || 0) || Number(player.overall || 0) > Number(overallMax || 99)) return false;
              if (Number(player.value || 0) < Number(valueMin || 0) || Number(player.value || 0) > Number(valueMax || 999)) return false;
              if (deferredClubQuery.trim()) {
                let query = normalizeMarketSearch(deferredClubQuery);
                if (!(marketSearchIndex.get(String(player.id)) || "").includes(query)) return false;
              }
              return true;
            });
            result = result.slice();
            if (sortBy === "overall") result.sort((left, right) => right.overall - left.overall);
            if (sortBy === "value") result.sort((left, right) => right.value - left.value);
            if (sortBy === "club") result.sort((left, right) => String(left.club || "").localeCompare(String(right.club || "")));
            return result;
          }, [e, positionFilter, overallMin, overallMax, valueMin, valueMax, deferredClubQuery, sortBy, marketSearchIndex, activeTeam, t]);

          let activeFilterCount =
            (positionFilter !== "all" ? 1 : 0) +
            (Number(overallMin) > 70 || Number(overallMax) < 99 ? 1 : 0) +
            (Number(valueMin) > 3 || Number(valueMax) < maxCatalogValue ? 1 : 0) +
            (clubQuery.trim() ? 1 : 0);
          He(() => {
            setValueMax((current) => Number(current) === 333 && maxCatalogValue > 333 ? maxCatalogValue : Math.min(Number(current) || maxCatalogValue, maxCatalogValue));
          }, [maxCatalogValue]);
          He(() => {
            let node = loadMoreSentinel.current;
            if (!node || visibleCount >= filteredPlayers.length || !window.IntersectionObserver) return;
            let loading = false;
            let observer = new IntersectionObserver((entries) => {
              if (!entries[0].isIntersecting || loading) return;
              loading = true;
              window.requestAnimationFrame(() => {
                setVisibleCount((count) => Math.min(count + 24, filteredPlayers.length));
                loading = false;
              });
            }, { rootMargin:"500px 0px" });
            observer.observe(node);
            return () => observer.disconnect();
          }, [visibleCount, filteredPlayers.length, marketSection, clubQuery, positionFilter, overallMin, overallMax, valueMin, valueMax]);

          function resetFilters() {
            setClubQuery("");
            setPositionFilter("all");
            setOverallMin(70);
            setOverallMax(99);
            setValueMin(3);
            setValueMax(maxCatalogValue);
            setVisibleCount(24);
          }

          let segmentStyle = (active) => ({
            flex: "0 0 auto",
            minWidth: 112,
            border: 0,
            borderRadius: 999,
            padding: "10px 12px",
            background: active ? "var(--ink)" : "transparent",
            color: active ? "var(--surface)" : "var(--muted)",
            fontSize: 12.5,
            fontWeight: active ? 750 : 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            whiteSpace: "nowrap",
          });

          function playerAction(player, status, activeOffer) {
            if (!(status.kind === "free" || (status.teamId && (!activeTeam || status.teamId !== activeTeam.id)))) return null;
            let price = status.kind === "free" ? player.value : status.kind === "listed" && status.price ? status.price : player.value;
            let insufficient = status.kind === "free" && activeTeam && Number(activeTeam.budget || 0) < Number(price || 0);
            let balanceCheck = activeTeam && typeof balanceCheckFor === "function" ? balanceCheckFor(player) : { allowed:true };
            let balanceBlocked = !balanceCheck.allowed;
            return React.createElement(
              "button",
              {
                className: "tapbtn",
                disabled: insufficient || balanceBlocked,
                title: balanceBlocked ? "Bloqueado pela regra de equilíbrio" : undefined,
                onClick: (event) => {
                  if (insufficient || balanceBlocked) return;
                  event.stopPropagation();
                  activeOffer ? setMarketSection("negotiations") : r(player);
                },
                style: {
                  width: "100%",
                  background: "rgba(88,204,2,.12)",
                  border: "1px solid rgba(88,204,2,.38)",
                  color: "var(--green)",
                  borderRadius: 12,
                  padding: "9px 10px",
                  fontSize: 11.5,
                  fontWeight: 750,
                  cursor: insufficient || balanceBlocked ? "not-allowed" : "pointer",
                  opacity: insufficient || balanceBlocked ? .45 : 1,
                },
              },
              balanceBlocked ? "Bloqueado pelo equilíbrio" : status.kind === "free" ? `Comprar · ${L(price)}` : activeOffer ? "Ver negociação" : `Ofertar · ${L(price)}`,
            );
          }

          function recommendationCard(item, index) {
            let player = item.player, status = item.status;
            let activeOffer = Object.values(offers || {}).find((offer) => isOfferOpen(offer) && String(offer.playerId) === String(player.id) && activeTeam && String(offer.buyerTeamId) === String(activeTeam.id));
            let price = status.kind === "listed" && status.price ? status.price : player.value;
            let insufficient = status.kind === "free" && activeTeam && Number(activeTeam.budget || 0) < Number(price || 0);
            let balanceCheck = activeTeam && typeof balanceCheckFor === "function" ? balanceCheckFor(player) : { allowed:true };
            let balanceBlocked = !balanceCheck.allowed;
            let label = balanceBlocked ? "Bloqueado pelo equilíbrio" : status.kind === "free" ? (insufficient ? "Saldo insuficiente" : `Comprar · ${L(price)}`) : activeOffer ? "Ver negociação" : `Ofertar · ${L(price)}`;
            return React.createElement(UnifiedPlayerCard, {
              key:player.id, player, onOpen:f, className:"market-highlight-card",
              currentTeamName:status.teamId && l(status.teamId) ? l(status.teamId).name : null,
              actionLabel:label, actionDisabled:insufficient || balanceBlocked,
              isFavorite:favoriteSet.has(String(player.id)), onToggleFavorite,
              onAction:()=>{ activeOffer ? setMarketSection("negotiations") : r(player); }
            });
          }

          function recommendationRail(title, subtitle, items) {
            if (!items.length) return null;
            return React.createElement(
              "section",
              { style: { marginBottom: 24 } },
              React.createElement(
                "div",
                { style: { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-end", marginBottom: 12 } },
                React.createElement("div", null,
                  React.createElement("div", { style: { fontSize: 17, fontWeight: 800, color: "var(--heading)", letterSpacing: "-.3px" } }, title),
                  React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)", marginTop: 3 } }, subtitle),
                ),
                React.createElement("button", { className: "tapbtn", onClick: () => setMarketSection("all"), style: { border: 0, background: "none", color: "var(--green)", fontSize: 11.5, fontWeight: 750, cursor: "pointer" } }, "Ver todos"),
              ),
              React.createElement("div", { className:"market-recommendation-rail" }, items.map(recommendationCard)),
            );
          }

          let weakestGroup = Object.entries(squadAnalysis).sort((left, right) => {
            let leftScore = left[1].deficit * 20 + (99 - left[1].average);
            let rightScore = right[1].deficit * 20 + (99 - right[1].average);
            return rightScore - leftScore;
          })[0];
          let priorityItems = recommendationData.filter((item) => !weakestGroup || item.group === weakestGroup[0]).slice(0, 8);
          let valueItems = recommendationData.slice().sort((left, right) => (right.player.overall / Math.max(1, right.price)) - (left.player.overall / Math.max(1, left.price))).slice(0, 8);
          let freeItems = recommendationData.filter((item) => item.status.kind === "free").slice(0, 8);

          return React.createElement(
            "div",
            null,
            React.createElement("header", { style:{ position:"relative", minHeight:64, display:"grid", placeItems:"center", marginBottom:18, padding:"4px 0" } },
              React.createElement("button", { className:"tapbtn", onClick:()=>setMarketSection("negotiations"), title:"Abrir negociações", style:{ position:"absolute", left:0, top:"50%", transform:"translateY(-50%)", border:"1px solid color-mix(in srgb, #ffbb26 42%, var(--border))", background:marketSection==="negotiations"?"color-mix(in srgb, #ffbb26 22%, var(--surface))":"color-mix(in srgb, #ffbb26 10%, var(--surface))", color:"#ffcc4d", borderRadius:999, padding:"9px 12px", display:"inline-flex", alignItems:"center", gap:7, cursor:"pointer", fontWeight:800, boxShadow:"0 10px 26px rgba(0,0,0,.12)" } },
                React.createElement(OfferIcon,{ size:16,color:"#ffcc4d" }),
                React.createElement("span", { className:"market-header-action-label" }, "Negociações"),
                unreadOffers>0&&React.createElement("span", { style:{ minWidth:18,height:18,padding:"0 5px",borderRadius:999,background:"var(--danger)",color:"white",display:"grid",placeItems:"center",fontSize:10,fontWeight:850 } }, unreadOffers>9?"9+":unreadOffers)
              ),
              React.createElement("h1", { style:{ margin:0, padding:"0 112px", fontSize:"clamp(32px,5vw,48px)", lineHeight:1, letterSpacing:"-.055em", textAlign:"center" } }, "Mercado"),
              (activeTeam || isAdmin) && React.createElement("button", { className:"tapbtn", onClick:onOpenBalanceHistory, title:isAdmin&&!activeTeam?"Ver histórico de transações":"Ver histórico de saldo", style:{ position:"absolute", right:0, top:"50%", transform:"translateY(-50%)", border:"1px solid color-mix(in srgb, var(--green) 30%, var(--border))", background:"color-mix(in srgb, var(--green) 10%, var(--surface))", color:"var(--heading)", borderRadius:999, padding:"9px 12px", display:"inline-flex", alignItems:"center", gap:7, cursor:"pointer", fontWeight:800, boxShadow:"0 10px 26px rgba(0,0,0,.12)" } }, React.createElement(BankIcon,{ size:15,color:"var(--green)" }), isAdmin&&!activeTeam?React.createElement("span",{className:"market-header-action-label"},"Histórico"):L(activeTeam.budget))
            ),
            !marketRules.isOpen && React.createElement("div", { style:{ ...E, padding:14, marginBottom:14, border:"1px solid color-mix(in srgb, var(--yellow) 45%, var(--border))", background:"color-mix(in srgb, var(--yellow) 10%, var(--surface))", display:"flex", gap:10, alignItems:"flex-start" } }, React.createElement(at,{size:18,color:"var(--yellow)"}), React.createElement("div",null,React.createElement("strong",null,"Mercado fechado"),React.createElement("div",{style:{fontSize:12,color:"var(--muted)",marginTop:3}},"Compras, vendas e negociações estão temporariamente pausadas pela administração."))),
            React.createElement(
              "div",
              { style: { display: "flex", gap: 4, padding: 4, marginBottom: 18, background: "var(--surface-soft)", border: "1px solid var(--border)", borderRadius: 999, overflowX: "auto" } },
              React.createElement("button", { className: "tapbtn", onClick: () => setMarketSection("all"), style: segmentStyle(marketSection === "all") }, React.createElement(Xe, { size: 15 }), "Jogadores"),
              React.createElement("button", { className: "tapbtn", onClick: () => setMarketSection("favorites"), style: segmentStyle(marketSection === "favorites") }, React.createElement("svg", { width:15,height:15,viewBox:"0 0 24 24",fill:"currentColor",stroke:"currentColor",strokeWidth:1.7,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true" }, React.createElement("path", { d:"m12 2.8 2.8 5.68 6.27.91-4.54 4.42 1.07 6.24L12 17.1l-5.6 2.95 1.07-6.24-4.54-4.42 6.27-.91L12 2.8Z" })), "Favoritos"),
              React.createElement("button", { className: "tapbtn", onClick: () => setMarketSection("recommended"), style: segmentStyle(marketSection === "recommended") }, React.createElement(Star, { size: 15 }), "Recomendados"),
            ),
            marketSection === "negotiations"
              ? React.createElement(TradeOffersArea, { offers, catalog: catalogMap, teamById: l, activeTeam, transfers: d, onAccept: onAcceptOffer, onUpdate: onUpdateOffer, onOpenDetail: f, onExplorePlayers: () => setMarketSection("all") })
              : marketSection === "favorites"
                ? React.createElement(React.Fragment, null,
                    React.createElement("div", { style:{ display:"flex",justifyContent:"space-between",alignItems:"end",gap:12,marginBottom:14 } },
                      React.createElement("div", null, React.createElement("h2", { style:{ margin:0,fontSize:20,letterSpacing:"-.45px" } }, "Seus favoritos"), React.createElement("div", { style:{ marginTop:4,fontSize:12,color:"var(--muted)" } }, `${favoritePlayers.length} jogador${favoritePlayers.length===1?"":"es"} salvo${favoritePlayers.length===1?"":"s"}`))),
                    favoriteSections.length ? favoriteSections.map((section) => React.createElement("section", { key:section.key, style:{ marginBottom:24 } },
                      React.createElement("div", { style:{ display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:12,marginBottom:10 } },
                        React.createElement("h3", { style:{ margin:0,fontSize:17,fontWeight:850,letterSpacing:"-.35px" } }, section.label),
                        React.createElement("span", { style:{ color:"var(--muted)",fontSize:11.5 } }, `${section.players.length} jogador${section.players.length===1?"":"es"}`)
                      ),
                      React.createElement("div", { className:"unified-player-grid" }, section.players.map((player) => {
                        let status=n(player); let activeOffer=Object.values(offers||{}).find((offer)=>isOfferOpen(offer)&&offer.playerId===player.id&&activeTeam&&offer.buyerTeamId===activeTeam.id);
                        let price=status.kind==="listed"&&status.price?status.price:player.value;
                        let insufficient=status.kind==="free"&&activeTeam&&Number(activeTeam.budget||0)<Number(price||0);
                        let own=!!(activeTeam&&status.teamId===activeTeam.id);
                        let balanceCheck=activeTeam&&typeof balanceCheckFor==="function"?balanceCheckFor(player):{allowed:true};
                        let balanceBlocked=!balanceCheck.allowed;
                        let overallBlocked=status.kind==="free"&&marketRules.freePlayerOverallLimit.enabled&&Number(player.overall||0)>marketRules.freePlayerOverallLimit.maxOverall;
                        let closed=!marketRules.isOpen;
                        let label=own?null:closed?"Mercado fechado":overallBlocked?"Acima do limite":balanceBlocked?"Bloqueado pelo equilíbrio":status.kind==="free"?(insufficient?"Saldo insuficiente":`Comprar · ${L(price)}`):activeOffer?"Ver negociação":`Ofertar · ${L(price)}`;
                        return React.createElement(UnifiedPlayerCard,{ key:player.id,player,onOpen:f,currentTeamName:status.teamId&&l(status.teamId)?l(status.teamId).name:null,actionLabel:label,actionDisabled:closed||insufficient||balanceBlocked||overallBlocked,dimmed:overallBlocked,isFavorite:true,onToggleFavorite,onAction:()=>{activeOffer?setMarketSection("negotiations"):r(player)}});
                      }))
                    )) : React.createElement("div", { style:{ ...E,padding:24,textAlign:"center",color:"var(--muted)" } }, "Você ainda não adicionou jogadores aos favoritos."))
              : marketSection === "recommended"
                ? React.createElement(
                    React.Fragment,
                    null,
                    !activeTeam
                      ? React.createElement("div", { style: { ...E, padding: 24, textAlign: "center", color: "var(--muted)" } }, "Selecione um perfil participante para receber recomendações personalizadas.")
                      : React.createElement(
                          React.Fragment,
                          null,
                          React.createElement(
                            "div",
                            { style: { ...E, padding: 18, marginBottom: 24, background: "linear-gradient(135deg, rgba(88,204,2,.14), var(--surface) 58%, rgba(0,134,252,.08))", border: "1px solid rgba(88,204,2,.25)" } },
                            React.createElement("div", { style: { fontSize: 11, color: "var(--green)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".8px" } }, "Análise do seu elenco"),
                            React.createElement("div", { style: { fontSize: 21, fontWeight: 850, color: "var(--heading)", marginTop: 6, letterSpacing: "-.65px" } }, weakestGroup ? `${groupLabels[weakestGroup[0]]} é sua maior prioridade` : "Recomendações para seu elenco"),
                            React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5, marginTop: 7, maxWidth: 680 } }, weakestGroup ? `Encontramos opções que cabem no seu saldo de ${L(activeTeam.budget)} e podem melhorar a média atual de ${weakestGroup[1].average ? weakestGroup[1].average.toFixed(1) : "—"} nessa área.` : `Encontramos jogadores compatíveis com seu saldo de ${L(activeTeam.budget)}.`),
                            React.createElement(
                              "div",
                              { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8, marginTop: 16 } },
                              Object.entries(squadAnalysis).map(([group, data]) =>
                                React.createElement(
                                  "div",
                                  { key: group, style: { padding: "10px 11px", borderRadius: 13, background: "rgba(0,0,0,.10)", border: "1px solid var(--border)" } },
                                  React.createElement("div", { style: { fontSize: 10, color: "var(--muted)" } }, groupLabels[group]),
                                  React.createElement(
                                    "div",
                                    { style: { fontSize: 16, fontWeight: 800, color: "var(--heading)", marginTop: 3 } },
                                    data.average ? data.average.toFixed(1) : "—",
                                    React.createElement("span", { style: { fontSize: 9.5, color: "var(--muted)", fontWeight: 600, marginLeft: 5 } }, `${data.count} jog.`),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          recommendationData.length === 0
                            ? React.createElement("div", { style: { ...E, padding: 24, textAlign: "center", color: "var(--muted)" } }, "Não encontramos jogadores disponíveis dentro do seu orçamento neste momento.")
                            : React.createElement(
                                React.Fragment,
                                null,
                                recommendationRail("Prioridade para seu time", weakestGroup ? `Opções para reforçar ${groupLabels[weakestGroup[0]].toLowerCase()}.` : "Melhores reforços disponíveis.", priorityItems),
                                recommendationRail("Melhor custo-benefício", "Mais overall por moeda dentro do seu orçamento.", valueItems),
                                recommendationRail("Disponíveis agora", "Jogadores livres que podem ser contratados imediatamente.", freeItems),
                              ),
                        ),
                  )
                : React.createElement(
                    React.Fragment,
                    null,
                    pendingReviews.length > 0 && React.createElement("button", { className:"tapbtn family-card", onClick:onOpenReviews, style:{ width:"100%", marginBottom:14, padding:16, border:"1px solid color-mix(in srgb, var(--yellow) 38%, var(--border))", background:"linear-gradient(135deg, color-mix(in srgb, var(--yellow) 15%, var(--surface)), var(--surface))", color:"var(--heading)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, cursor:"pointer", textAlign:"left" } },
                      React.createElement("div", { style:{ display:"flex", alignItems:"center", gap:12, minWidth:0 } }, React.createElement("span", { style:{ width:42,height:42,borderRadius:14,display:"grid",placeItems:"center",background:"color-mix(in srgb, var(--yellow) 22%, var(--surface-soft))",color:"var(--yellow)",flex:"0 0 auto" } }, React.createElement(FlagIcon,{size:20})), React.createElement("div", { style:{ minWidth:0 } }, React.createElement("strong", { style:{ display:"block",fontSize:15 } }, `${pendingReviews.length} ${pendingReviews.length===1?"revisão pendente":"revisões pendentes"}`), React.createElement("span", { style:{ display:"block",fontSize:11.5,color:"var(--muted)",marginTop:3 } }, "Ajude a revisar correções sugeridas pela comunidade."))), React.createElement(ue,{size:22,color:"var(--muted)"})
                    ),
                    React.createElement(
                      "div",
                      { style: { display: "flex", gap: 8, marginBottom: 12, alignItems: "stretch" } },
                      React.createElement(
                        "div",
                        { style: { position: "relative", flex: 1 } },
                        React.createElement("input", { style: { ...q, paddingLeft: 34 }, placeholder: "Buscar jogador, clube ou time...", value: clubQuery, onChange: (event) => { setClubQuery(event.target.value); setVisibleCount(24); } }),
                        React.createElement("span", { style: { position: "absolute", left: 10, top: 12 } }, React.createElement(Xt, { size: 15, color: "var(--muted)" })),
                      ),
                      React.createElement(
                        "button",
                        { className: "tapbtn", onClick: () => setFiltersOpen(!filtersOpen), style: { ...M, width: "auto", margin: 0, padding: "0 14px", display: "flex", alignItems: "center", gap: 7, background: filtersOpen ? "var(--ink)" : "var(--surface-soft)", color: filtersOpen ? "var(--surface)" : "var(--heading)", border: "1px solid var(--border)" } },
                        React.createElement(FilterIcon, { size: 16 }), "Filtros",
                        activeFilterCount > 0 && React.createElement("span", { style: { minWidth: 18, height: 18, borderRadius: 999, display: "grid", placeItems: "center", background: "var(--green)", color: "#071104", fontSize: 10, fontWeight: 850 } }, activeFilterCount),
                      ),
                    ),
                    filtersOpen && React.createElement(
                      "div",
                      { style: { ...E, padding: 16, marginBottom: 14 } },
                      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 } }, React.createElement("div", { style: { fontSize: 14, fontWeight: 800 } }, "Refinar mercado"), React.createElement("button", { className: "tapbtn", onClick: resetFilters, style: { border: 0, background: "none", color: "var(--green)", fontSize: 11.5, fontWeight: 750, cursor: "pointer" } }, "Limpar")),
                      React.createElement("div", { style: { fontSize: 10.5, color: "var(--muted)", marginBottom: 7 } }, "Posição"),
                      React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 10 } }, React.createElement("span", { onClick: () => { setPositionFilter("all"); setVisibleCount(24); }, style: V(positionFilter === "all") }, "Todas"), positions.map((position) => React.createElement("span", { key: position, onClick: () => { setPositionFilter(position); setVisibleCount(24); }, style: V(positionFilter === position) }, position))),
                      React.createElement(
                        "div",
                        { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 } },
                        React.createElement("div", null,
                          React.createElement("div", { style:{ fontSize:10.5,color:"var(--muted)",marginBottom:7 } }, "Overall"),
                          React.createElement(DualRange, { min:70,max:99,step:1,minValue:overallMin,maxValue:overallMax,formatValue:(value)=>String(value),onChangeMin:(value)=>{setOverallMin(Math.min(value,overallMax));setVisibleCount(24);},onChangeMax:(value)=>{setOverallMax(Math.max(value,overallMin));setVisibleCount(24);} })
                        ),
                        React.createElement("div", null,
                          React.createElement("div", { style:{ fontSize:10.5,color:"var(--muted)",marginBottom:7 } }, "Valor"),
                          React.createElement(DualRange, { min:3,max:maxCatalogValue,step:1,minValue:valueMin,maxValue:valueMax,formatValue:(value)=>`${value}M`,onChangeMin:(value)=>{setValueMin(Math.min(value,valueMax));setVisibleCount(24);},onChangeMax:(value)=>{setValueMax(Math.max(value,valueMin));setVisibleCount(24);} })
                        ),
                      ),
                    ),
                    React.createElement(
                      "div",
                      { style: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 12 } },
                      React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)" } }, `${filteredPlayers.length} jogadores encontrados`),
                      React.createElement("select", { value: sortBy, onChange: (event) => setSortBy(event.target.value), style: { ...q, width: "auto", minWidth: 130, padding: "8px 30px 8px 10px", fontSize: 11.5 } }, React.createElement("option", { value: "overall" }, "Maior overall"), React.createElement("option", { value: "value" }, "Maior valor"), React.createElement("option", { value: "club" }, "Clube A–Z")),
                    ),
                    React.createElement("div", { className:"unified-player-grid" }, filteredPlayers.slice(0, visibleCount).map((player) => {
                      let status = n(player);
                      let activeOffer = Object.values(offers || {}).find((offer) => isOfferOpen(offer) && String(offer.playerId) === String(player.id) && activeTeam && String(offer.buyerTeamId) === String(activeTeam.id));
                      let price = status.kind === "listed" && status.price ? status.price : player.value;
                      let insufficient = status.kind === "free" && activeTeam && Number(activeTeam.budget || 0) < Number(price || 0);
                      let balanceCheck = activeTeam && typeof balanceCheckFor === "function" ? balanceCheckFor(player) : { allowed:true };
                      let balanceBlocked = !balanceCheck.allowed;
                      let overallBlocked = status.kind === "free" && marketRules.freePlayerOverallLimit.enabled && Number(player.overall || 0) > marketRules.freePlayerOverallLimit.maxOverall;
                      let closed = !marketRules.isOpen;
                      let label = closed ? "Mercado fechado" : overallBlocked ? "Acima do limite" : balanceBlocked ? "Bloqueado pelo equilíbrio" : status.kind === "free" ? (insufficient ? "Saldo insuficiente" : `Comprar · ${L(price)}`) : activeOffer ? "Ver negociação" : `Ofertar · ${L(price)}`;
                      return React.createElement(UnifiedPlayerCard, {
                        key:player.id, player, onOpen:f, actionLabel:label,
                        currentTeamName:status.teamId && l(status.teamId) ? l(status.teamId).name : null, actionDisabled:closed || insufficient || balanceBlocked || overallBlocked, dimmed:overallBlocked,
                        isFavorite:favoriteSet.has(String(player.id)), onToggleFavorite,
                        onAction:()=>{ activeOffer ? setMarketSection("negotiations") : r(player); }
                      });
                    })),
                    filteredPlayers.length === 0 && React.createElement("div", { style: { ...E, padding: 24, textAlign: "center", color: "var(--muted)" } }, "Nenhum jogador corresponde aos filtros selecionados."),
                    filteredPlayers.length > visibleCount && React.createElement("div", { ref:loadMoreSentinel, style:{ minHeight:72, display:"grid", placeItems:"center", color:"var(--muted)", fontSize:12, gap:8 } }, React.createElement("span", { className:"animate-spin", style:{ width:20,height:20,borderRadius:999,border:"2px solid var(--border)",borderTopColor:"var(--green)",display:"block" } }), React.createElement("span", null, "Carregando mais jogadores...")),
                  ),
          );
        }
        function attributeValueColor(value, max = 99) {
          const n = Number(value);
          if (!Number.isFinite(n)) return "var(--muted)";
          if (max <= 10) {
            if (n >= 8) return "#ff2b3a";
            if (n >= 7) return "#ff3e00";
            if (n >= 6) return "#ffbb26";
            if (n >= 5) return "#00c978";
            return "#a7a7a7";
          }
          if (n >= 95) return "#ff2b3a";
          if (n >= 90) return "#ff3e00";
          if (n >= 80) return "#ffbb26";
          if (n >= 75) return "#00c978";
          return "#a7a7a7";
        }
        function N({ label: e, value: t, max: l = 99 }) {
          const a = Number(t), n = Number.isFinite(a);
          return React.createElement(
            "div",
            {
              style: {
                minHeight: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 18,
                padding: "9px 2px",
                borderBottom: "1px solid var(--border)",
              },
            },
            React.createElement("span", { style: { color: "var(--heading)", fontSize: 13.5, lineHeight: 1.3 } }, e),
            React.createElement(
              "strong",
              {
                style: {
                  flex: "0 0 auto",
                  minWidth: 34,
                  textAlign: "right",
                  fontSize: 17,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                  color: attributeValueColor(a, l),
                },
              },
              n ? a : "—",
            ),
          );
        }
        function ProfileVoteAvatar({ vote }) {
          let label=String(vote&&vote.profileNameSnapshot||"?");
          return React.createElement("span", { title:label, style:{ width:30,height:30,borderRadius:"50%",overflow:"hidden",display:"grid",placeItems:"center",background:vote&&vote.colorSnapshot||"var(--surface-soft)",color:"white",fontSize:11,fontWeight:850,border:"2px solid var(--surface)",marginLeft:-6 } }, vote&&vote.avatarSnapshot?React.createElement("img",{src:vote.avatarSnapshot,alt:"",style:{width:"100%",height:"100%",objectFit:"cover"}}):label.charAt(0).toUpperCase());
        }
        function PlayerReportModal({ player, onClose, onSubmit }) {
          let [overall,setOverall]=b(""),[value,setValue]=b("");
          return React.createElement(ee,{title:"Sugerir correção",onClose},
            React.createElement("div",{style:{...E,padding:16,marginBottom:14}},React.createElement("strong",{style:{fontSize:17}},player.name),React.createElement("div",{style:{fontSize:12,color:"var(--muted)",marginTop:4}},"A sugestão será analisada por outros usuários.")),
            React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12}},
              React.createElement("div",null,React.createElement("label",{style:P},"Novo overall"),React.createElement("input",{type:"number",min:1,max:99,step:1,value:overall,placeholder:`Atual: ${player.overall}`,onChange:(ev)=>setOverall(ev.target.value),style:q})),
              React.createElement("div",null,React.createElement("label",{style:P},"Novo valor de mercado"),React.createElement("input",{type:"number",min:1,step:1,value:value,placeholder:`Atual: ${L(player.value)}`,onChange:(ev)=>setValue(ev.target.value),style:q}))
            ),
            React.createElement("div",{style:{fontSize:11.5,color:"var(--muted)",lineHeight:1.5,marginTop:12}},"Você pode preencher apenas um dos campos. O valor de mercado é informado em milhões."),
            React.createElement("button",{className:"tapbtn",onClick:()=>onSubmit(player,{overall,value}),style:{...M,...W,width:"100%",marginTop:18}},"Enviar para revisão")
          );
        }
        function PlayerReviewsModal({ reviews, catalogMap, currentProfile, isAdmin, onClose, onVote, onRemove }) {
          let ordered=[...(reviews||[])].sort((a,b)=>Number(a.createdAt||0)-Number(b.createdAt||0));
          let voteAvatars=(items)=>items.length?React.createElement("div",{style:{position:"absolute",top:-16,left:"50%",transform:"translateX(-50%)",display:"flex",justifyContent:"center",paddingLeft:6,zIndex:2}},items.slice(0,5).map((vote,i)=>React.createElement(ProfileVoteAvatar,{key:`${vote.profileNameSnapshot||i}-${i}`,vote}))):null;
          let overallBadge=(value,isOld)=>{
            let color=overallColor(value);
            return React.createElement("span",{style:{minWidth:48,height:42,padding:"0 11px",borderRadius:14,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:19,fontWeight:900,fontVariantNumeric:"tabular-nums",color,border:`2px solid ${color}`,background:`color-mix(in srgb, ${color} ${isOld?6:12}%, transparent)`,opacity:isOld?.48:1}},Number(value)||0);
          };
          let comparisonArrow=()=>React.createElement("span",{style:{color:"var(--muted)",fontSize:22,fontWeight:500,lineHeight:1}},"→");
          let valueBadge=(value,isOld,isNew)=>React.createElement("span",{style:{height:42,padding:"0 12px",borderRadius:14,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,fontSize:15,fontWeight:850,fontVariantNumeric:"tabular-nums",color:isOld?"var(--muted)":"var(--heading)",border:"1px solid var(--border)",background:"var(--surface-soft)",opacity:isOld?.5:1}},isNew&&React.createElement(BankIcon,{size:15,color:"var(--heading)"}),L(value));
          let reviewCard=(review)=>{
            let player=catalogMap.get(review.playerId)||{name:review.playerNameSnapshot};
            let votes=Object.values(review.votes||{}), approvals=votes.filter(v=>v&&v.decision==="approve"), rejections=votes.filter(v=>v&&v.decision==="reject"), own=String(review.createdByProfileId)===String(currentProfile&&currentProfile.id), myVote=review.votes&&currentProfile&&review.votes[currentProfile.id];
            let canRemove=own||isAdmin;
            let removeLabel=own?"Cancelar pedido":"Remover revisão";
            let changedOverall=review.proposed&&review.proposed.overall!=null;
            let changedValue=review.proposed&&review.proposed.value!=null;
            return React.createElement("article",{key:review.id,className:"family-card",style:{padding:"20px 18px 18px",borderRadius:22,overflow:"visible"}},
              React.createElement("div",{style:{display:"flex",justifyContent:"space-between",gap:14,alignItems:"flex-start",marginBottom:18}},
                React.createElement("div",{style:{minWidth:0}},React.createElement("h3",{style:{fontSize:19,margin:0,lineHeight:1.2}},player.name||review.playerNameSnapshot),React.createElement("div",{style:{fontSize:11.5,color:"var(--muted)",marginTop:5}},`Sugestão de ${review.createdByNameSnapshot||"um usuário"}`)),
                React.createElement("span",{style:{fontSize:10.5,fontWeight:800,color:"var(--muted)",padding:"6px 9px",borderRadius:999,background:"var(--surface-soft)",whiteSpace:"nowrap"}},`${approvals.length}/3 aprovações`)
              ),
              changedOverall&&React.createElement("div",{style:{padding:"14px 0",borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}},React.createElement("strong",{style:{fontSize:12.5}},"Overall"),React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginLeft:"auto"}},overallBadge(review.original&&review.original.overall,true),comparisonArrow(),overallBadge(review.proposed.overall,false))),
              changedValue&&React.createElement("div",{style:{padding:"14px 0",borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}},React.createElement("strong",{style:{fontSize:12.5}},"Valor de mercado"),React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginLeft:"auto"}},valueBadge(review.original&&review.original.value,true,false),comparisonArrow(),valueBadge(review.proposed.value,false,true))),
              own&&React.createElement("div",{style:{fontSize:12,color:"var(--muted)",textAlign:"center",padding:"13px 10px 2px",borderTop:"1px solid var(--border)"}},"Você enviou esta sugestão e não pode votar nela."),
              !own&&React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:20,paddingTop:8}},
                React.createElement("div",{style:{position:"relative"}},voteAvatars(rejections),React.createElement("button",{className:"tapbtn",onClick:()=>onVote(review.id,"reject"),style:{...M,width:"100%",margin:0,minHeight:50,background:myVote&&myVote.decision==="reject"?"var(--danger)":"color-mix(in srgb,var(--danger) 10%,var(--surface))",color:myVote&&myVote.decision==="reject"?"white":"var(--danger)",border:"1px solid color-mix(in srgb,var(--danger) 38%,var(--border))"}},"Recusar")),
                React.createElement("div",{style:{position:"relative"}},voteAvatars(approvals),React.createElement("button",{className:"tapbtn",onClick:()=>onVote(review.id,"approve"),style:{...M,...W,width:"100%",margin:0,minHeight:50}},"Aprovar"))
              ),
              canRemove&&React.createElement("button",{className:"tapbtn",onClick:()=>onRemove(review.id),style:{width:"100%",minHeight:42,marginTop:14,border:0,background:"transparent",color:"var(--danger)",fontSize:12.5,fontWeight:800,cursor:"pointer",borderRadius:12}},React.createElement(TrashIcon,{size:15,style:{marginRight:7}}),removeLabel)
            );
          };
          return React.createElement("div",{className:"sports-modal-overlay",style:{position:"fixed",inset:0,zIndex:1200,background:"var(--canvas)",overflowY:"auto",padding:0}},
            React.createElement("header",{style:{position:"sticky",top:0,zIndex:3,background:"color-mix(in srgb,var(--canvas) 88%,transparent)",backdropFilter:"blur(22px)",WebkitBackdropFilter:"blur(22px)",borderBottom:"1px solid var(--border)"}},React.createElement("div",{style:{width:"min(100%,900px)",margin:"0 auto",minHeight:72,padding:"calc(14px + env(safe-area-inset-top)) 18px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}},React.createElement("div",null,React.createElement("h2",{style:{margin:0,fontSize:22}},"Revisões pendentes"),React.createElement("div",{style:{fontSize:12,color:"var(--muted)",marginTop:3}},ordered.length?`${ordered.length} ${ordered.length===1?"jogador aguardando revisão":"jogadores aguardando revisão"}`:"Nenhuma revisão pendente")),React.createElement("button",{onClick:onClose,"aria-label":"Fechar revisões",style:{width:42,height:42,borderRadius:999,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--heading)",display:"grid",placeItems:"center",cursor:"pointer"}},React.createElement(Ye,{size:18})))),
            React.createElement("main",{style:{width:"min(100%,900px)",margin:"0 auto",padding:"22px 16px calc(40px + env(safe-area-inset-bottom))"}},ordered.length?React.createElement("div",{style:{display:"grid",gap:16}},ordered.map(reviewCard)):React.createElement("div",{className:"family-card",style:{padding:28,textAlign:"center",color:"var(--muted)"}},"Nenhuma revisão pendente."))
          );
        }
        function ro({ player: e, onClose: t, onOffer, onBuy, activeTeam, onReport }) {
          let detailContext = e && e.player ? e : { player:e, fromOtherTeam:false };
          e = detailContext.player;
          let l = e.attrs || {},
            attributes = [
              ["Ataque", e.attack], ["Defesa", e.defense], ["Equilíbrio", l.balance], ["Fôlego", l.stamina],
              ["Velocidade máxima", l.topSpeed], ["Aceleração", l.acceleration], ["Resposta", l.response], ["Agilidade", l.agility],
              ["Precisão no drible", l.dribbleAccuracy], ["Velocidade no drible", l.dribbleSpeed],
              ["Precisão no passe curto", l.shortPassAccuracy], ["Velocidade do passe curto", l.shortPassSpeed],
              ["Precisão no passe longo", l.longPassAccuracy], ["Velocidade do passe longo", l.longPassSpeed],
              ["Precisão do chute", l.shotAccuracy], ["Força do chute", l.shotPower], ["Técnica de chute", l.shotTechnique],
              ["Precisão em cobranças de falta", l.freeKickAccuracy], ["Curva", l.curve], ["Cabeceio", l.heading], ["Impulsão", l.jump],
              ["Técnica", l.technique], ["Agressividade", l.aggression], ["Mentalidade", l.mentality],
              ["Habilidade de goleiro", l.goalKeepingSkills], ["Trabalho em equipe", l.teamwork],
              ["Consistência", l.consistency, 8], ["Condição física", l.conditionFitness, 8],
              ["Precisão com o pé ruim", l.weakFootAccuracy, 8], ["Frequência de uso do pé ruim", l.weakFootFrequency, 8],
            ];
          let flag = nationalityFlag(e.nationality);
          let footLabel = e.foot === "Right" ? "Direito" : e.foot === "Left" ? "Esquerdo" : "Ambos";
          let sideValue = String(e.favouredSide || "").trim().toLowerCase();
          let sideLabel = sideValue === "right" ? "Direito" : sideValue === "left" ? "Esquerdo" : sideValue === "both" ? "Ambos" : (e.favouredSide || "—");
          let detailBalanceBlocked = detailContext.balanceCheck && detailContext.balanceCheck.allowed === false;
          let footerAction = detailContext.canBuy
            ? React.createElement("button", { className:"tapbtn", disabled: !activeTeam || Number(activeTeam.budget || 0) < Number(e.value || 0) || detailBalanceBlocked, title:detailBalanceBlocked?"Bloqueado pela regra de equilíbrio":undefined, onClick:()=>onBuy&&onBuy(e), style:{ ...M, ...W, width:"100%", margin:0, opacity: activeTeam && Number(activeTeam.budget || 0) >= Number(e.value || 0) && !detailBalanceBlocked ? 1 : .45, cursor: activeTeam && Number(activeTeam.budget || 0) >= Number(e.value || 0) && !detailBalanceBlocked ? "pointer" : "not-allowed" } }, detailBalanceBlocked ? "Bloqueado pelo equilíbrio" : activeTeam && Number(activeTeam.budget || 0) < Number(e.value || 0) ? "Saldo insuficiente" : `Comprar · ${L(e.value)}`)
            : detailContext.fromOtherTeam && onOffer
              ? React.createElement("button", { className:"tapbtn", disabled:detailBalanceBlocked, title:detailBalanceBlocked?"Bloqueado pela regra de equilíbrio":undefined, onClick:()=>!detailBalanceBlocked&&onOffer(e), style:{ ...M, ...W, width:"100%", margin:0, opacity:detailBalanceBlocked?.45:1, cursor:detailBalanceBlocked?"not-allowed":"pointer" } }, detailBalanceBlocked?"Bloqueado pelo equilíbrio":"Fazer proposta")
              : null;
          return React.createElement(
            ee,
            { onClose:t, hideHeader:true, closeOutside:true, modalClassName:"player-detail-modal" },
            React.createElement(
              React.Fragment,
              null,
              React.createElement(
                "div",
                { className:"player-detail-scroll" },
                React.createElement("button", { className:"tapbtn", onClick:()=>onReport&&onReport(e), title:"Reportar problema", "aria-label":"Reportar problema no jogador", style:{ position:"fixed", top:"max(16px,env(safe-area-inset-top))", right:16, zIndex:1002, width:42, height:42, borderRadius:999, border:"1px solid var(--border)", background:"color-mix(in srgb,var(--surface) 88%,transparent)", color:"var(--yellow)", display:"grid", placeItems:"center", boxShadow:"var(--shadow-soft)", backdropFilter:"blur(18px)", cursor:"pointer" } }, React.createElement(FlagIcon,{size:20})),
                React.createElement(
                  "header",
                  { style:{ textAlign:"center", padding:"4px 8px 20px" } },
                  React.createElement("div", { style:{ display:"flex", alignItems:"center", justifyContent:"center", gap:9, minWidth:0 } },
                    React.createElement("h2", { style:{ margin:0, fontSize:"clamp(26px,5vw,36px)", lineHeight:1.08, letterSpacing:"-.045em", color:"var(--heading)", overflowWrap:"anywhere" } }, e.name),
                    React.createElement("span", { title:e.nationality||"Nacionalidade não informada", style:{ fontSize:24, lineHeight:1, flex:"0 0 auto" } }, flag)
                  ),
                  React.createElement("span", { style:{ display:"inline-flex", marginTop:12, alignItems:"center", justifyContent:"center", minHeight:27, padding:"5px 11px", borderRadius:9, background:positionColor(e.position), color:"#fff", fontSize:12, fontWeight:850, letterSpacing:".04em" } }, e.position || "—")
                ),
                React.createElement("section", { style:{ ...E, padding:16, marginBottom:12 } },
                  React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:8, alignItems:"stretch" } },
                    React.createElement("div", { style:{ display:"grid", placeItems:"center", textAlign:"center", border:`1.5px solid ${overallColor(e.overall)}`, borderRadius:14, minHeight:78, background:`color-mix(in srgb, ${overallColor(e.overall)} 10%, var(--surface-soft))`, padding:8 } },
                      React.createElement("div", null,
                        React.createElement("strong", { style:{ display:"block", fontSize:30, lineHeight:1, color:overallColor(e.overall), fontVariantNumeric:"tabular-nums" } }, e.overall),
                        React.createElement("span", { style:{ display:"block", marginTop:5, fontSize:9, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em" } }, "Overall")
                      )
                    ),
                    React.createElement("div", { style:{ display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center", minWidth:0, border:"1px solid var(--border)", borderRadius:14, padding:8, background:"var(--surface-soft)" } },
                      React.createElement("span", { style:{ fontSize:9, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 } }, "Valor"),
                      React.createElement("strong", { style:{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, fontSize:18, color:"var(--heading)" } }, React.createElement(BankIcon,{ size:16,color:"var(--green)" }), L(e.value))
                    ),
                    React.createElement("div", { style:{ display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center", minWidth:0, border:"1px solid var(--border)", borderRadius:14, padding:8, background:"var(--surface-soft)" } },
                      React.createElement("span", { style:{ fontSize:9, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 } }, "Clube"),
                      React.createElement("strong", { style:{ fontSize:12.5, lineHeight:1.25, color:"var(--heading)", overflowWrap:"anywhere" } }, e.club || "—")
                    )
                  )
                ),
                React.createElement("section", { style:{ ...E, padding:14, marginBottom:12 } },
                  React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"repeat(5,minmax(0,1fr))", gap:6 } },
                    [["Idade", e.age ? `${e.age}` : "—"], ["Altura", e.height ? `${e.height} cm` : "—"], ["Peso", e.weight ? `${e.weight} kg` : "—"], ["Pé bom", footLabel === "Direito" ? "D" : footLabel === "Esquerdo" ? "E" : "Ambos"], ["Lado bom", sideLabel]].map(item => React.createElement("div", { key:item[0], style:{ minWidth:0, textAlign:"center", padding:"7px 3px", borderRadius:10, background:"var(--surface-soft)" } },
                      React.createElement("div", { style:{ fontSize:8.5, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".045em", marginBottom:5, whiteSpace:"nowrap" } }, item[0]),
                      React.createElement("strong", { style:{ display:"block", fontSize:11.5, lineHeight:1.2, color:"var(--heading)", overflowWrap:"anywhere" } }, item[1])
                    ))
                  )
                ),
                React.createElement("section", { style:{ ...E, padding:"8px 16px 10px" } },
                  React.createElement("div", { style:{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, padding:"8px 2px 10px", borderBottom:"1px solid var(--border)" } },
                    React.createElement("strong", { style:{ fontSize:14, color:"var(--heading)" } }, "Atributos"),
                    React.createElement("span", { style:{ fontSize:13, color:"var(--muted)", fontWeight:800 } }, "#")
                  ),
                  attributes.map(attribute => React.createElement(N, { key:attribute[0], label:attribute[0], value:attribute[1], max:attribute[2] || 99 }))
                )
              ),
              footerAction && React.createElement("footer", { className:"player-detail-footer" }, detailBalanceBlocked && React.createElement("div", { style:{ fontSize:11.5,color:"var(--muted)",lineHeight:1.4,marginBottom:9,textAlign:"center" } }, `Esta contratação deixaria a diferença entre os times em ${detailContext.balanceCheck.futureGap.toFixed(1)} OVR. Limite atual: ${(detailContext.balanceCheck.currentGap > detailContext.balanceCheck.maxDifference ? detailContext.balanceCheck.currentGap : detailContext.balanceCheck.maxDifference).toFixed(1)} OVR.`), footerAction)
            )
          );
        }
        function ie({ label: e }) {
          return React.createElement(
            "span",
            {
              style: {
                fontSize: 11.5,
                color: "var(--muted)",
                background: "var(--surface-soft)",
                border: "1px solid #AFAFAF",
                borderRadius: 20,
                padding: "4px 10px",
              },
            },
            e,
          );
        }
        function so({ data: e, activeTeam, onClose: l, onConfirm: a }) {
          let { player: n, status: r } = e,
            p = r.kind === "free" ? n.value : r.price,
            currentBalance = Number(activeTeam && activeTeam.budget || 0),
            remainingBalance = currentBalance - Number(p || 0),
            insufficient = !activeTeam || remainingBalance < 0;
          return React.createElement(
            ee,
            { title: `Comprar ${n.name}`, onClose: l },
            React.createElement("div", { style: { ...E, padding: 18, marginBottom: 14, background: `linear-gradient(145deg, color-mix(in srgb, ${overallColor(n.overall)} 10%, var(--surface)), var(--surface))` } },
              React.createElement("div", { style: { display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, alignItems: "center" } },
                React.createElement("div", { style: { width: 58, height: 66, borderRadius: 16, display: "grid", placeItems: "center", background: `linear-gradient(155deg, color-mix(in srgb, ${overallColor(n.overall)} 25%, var(--surface-soft)), var(--surface-soft))`, border: `1px solid color-mix(in srgb, ${overallColor(n.overall)} 45%, var(--border))` } }, React.createElement("strong", { style: { fontSize: 24, color: overallColor(n.overall) } }, n.overall)),
                React.createElement("div", null,
                  React.createElement("span", { style: { display: "inline-flex", fontSize: 10, fontWeight: 800, background: positionColor(n.position), color: "white", padding: "3px 7px", borderRadius: 6, marginBottom: 5 } }, n.position),
                  React.createElement("div", { style: { fontWeight: 800, fontSize: 17 } }, n.name),
                  React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)", marginTop: 3 } }, n.club || "Jogador livre")
                )
              )
            ),
            React.createElement("div", { style: { ...E, padding: 18, marginBottom: 14 } },
              React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, marginBottom: 12 } }, React.createElement("span", { style: { color: "var(--muted)" } }, "Saldo atual"), React.createElement("strong", null, L(currentBalance))),
              React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, marginBottom: 12 } }, React.createElement("span", { style: { color: "var(--muted)" } }, "Valor da compra"), React.createElement("strong", { style: { color: "var(--danger)" } }, `− ${L(p)}`)),
              React.createElement("div", { style: { height: 1, background: "var(--border)", margin: "4px 0 12px" } }),
              React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" } }, React.createElement("span", { style: { color: "var(--muted)", fontSize: 13 } }, "Saldo após a compra"), React.createElement("strong", { style: { fontSize: 20, color: insufficient ? "var(--danger)" : "var(--green)" } }, L(Math.max(0, remainingBalance))))
            ),
            insufficient && React.createElement("div", { style: { fontSize: 12.5, color: "var(--danger)", marginBottom: 12, display: "flex", gap: 6, alignItems: "center" } }, React.createElement(at, { size: 14 }), " Saldo insuficiente para concluir esta compra."),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
              React.createElement("button", { className: "tapbtn", onClick: l, style: { ...M, background: "var(--surface-soft)", color: "var(--heading)", border: "1px solid var(--border)" } }, "Cancelar"),
              React.createElement("button", { className: "tapbtn", disabled: insufficient, onClick: () => a(n, r, activeTeam.id), style: { ...M, ...W, opacity: insufficient ? .45 : 1, cursor: insufficient ? "not-allowed" : "pointer" } }, "Confirmar compra")
            )
          );
        }

        function EconomyAdminForm({ tournament, onSave }) {
          let economy=economySettingsOf(tournament), prize=prizeSettingsOf(tournament);
          let [values,setValues]=b(()=>({...economy,...prize}));
          He(()=>setValues({...economySettingsOf(tournament),...prizeSettingsOf(tournament)}),[tournament&&tournament.id]);
          let set=(key)=>(event)=>setValues((current)=>({...current,[key]:event.target.value}));
          let field=(label,key)=>React.createElement("label",{key,style:{fontSize:11,color:"var(--muted)"}},label,React.createElement("input",{type:"number",min:0,max:999,value:values[key],onChange:set(key),style:{...q,marginTop:6}}));
          let section=(title,subtitle,fields)=>React.createElement("div",{style:{padding:16,borderRadius:16,background:"var(--surface-soft)",border:"1px solid var(--border)",marginBottom:12}},React.createElement("div",{style:{fontWeight:850,fontSize:14}},title),subtitle&&React.createElement("div",{style:{fontSize:11.5,color:"var(--muted)",marginTop:3,marginBottom:12}},subtitle),React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:10}},fields.map(([label,key])=>field(label,key))));
          return React.createElement("div",null,
            section("Resultado da partida","Recompensas concedidas a cada time após o resultado.",[["Vitória","winReward"],["Empate com gols","scoringDrawReward"],["Empate sem gols","scorelessDrawReward"],["Derrota","lossReward"]]),
            section("Eventos","Gols contra e gols sem autoria não geram moedas.",[["Cada gol com autoria","goalReward"],["Cartão vermelho (desconto)","redCardPenalty"]]),
            section("Premiações finais","O campeão recebe o valor definido e o último colocado recebe metade. As posições intermediárias formam uma escada, com valores quebrados arredondados para cima.",[["Campeão","championPrize"],["Artilheiro","topScorerPrize"]]),
            React.createElement("div",{style:{padding:"0 4px 14px",fontSize:11.5,color:"var(--muted)",lineHeight:1.5}},`Último colocado: ${L(Math.ceil((Number(values.championPrize)||0)/2))} · distribuição automática para todos os participantes.`),
            React.createElement("button",{onClick:()=>onSave(values.winReward,values.scoringDrawReward,values.scorelessDrawReward,values.lossReward,values.goalReward,values.redCardPenalty,values.championPrize,values.topScorerPrize),style:{...M,marginTop:4}},"Salvar regras e premiações")
          );
        }
        function BalanceHistoryModal({ team, transactions, teams = [], canRollback, showAll = false, onRollback, onClose }) {
          let reversibleTypes=["market_purchase","player_purchase","market_sale"];
          let allItems=(Array.isArray(transactions)?transactions:[]).filter(Boolean);
          let items=(showAll||!team?allItems:allItems.filter((item)=>String(item.teamId)===String(team.id))).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
          let teamName=(teamId)=>{let found=(Array.isArray(teams)?teams:[]).find((entry)=>entry&&String(entry.id)===String(teamId));return found&&found.name?found.name:"Time";};
          let rollbackButton=(item)=>{
            if(!canRollback||!reversibleTypes.includes(item.type)) return null;
            let disabled=!!item.rolledBackAt;
            return React.createElement("button",{type:"button",title:disabled?"Movimentação já revertida":"Dar rollback", "aria-label":disabled?"Movimentação já revertida":"Dar rollback",disabled,onClick:()=>onRollback&&onRollback(item.id),style:{width:30,height:30,borderRadius:"50%",border:"1px solid var(--border)",background:disabled?"var(--surface-soft)":"var(--heading)",color:disabled?"var(--muted)":"var(--surface)",display:"grid",placeItems:"center",fontSize:16,fontWeight:900,cursor:disabled?"default":"pointer",opacity:disabled?.5:1,flex:"0 0 auto"}},"↶");
          };
          return ReactDOM.createPortal(React.createElement("div", { className:"sports-modal-overlay",onClick:onClose,style:{ position:"fixed",inset:0,zIndex:1200,display:"grid",placeItems:"center",padding:16,background:"rgba(0,0,0,.72)",backdropFilter:"blur(12px)" } }, React.createElement("div", { onClick:(e)=>e.stopPropagation(),style:{ width:"min(560px,100%)",maxHeight:"82vh",overflow:"auto",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:24,padding:20 } }, React.createElement("div", { style:{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 } }, React.createElement("div", null, React.createElement("div", { style:{ fontSize:12,color:"var(--muted)" } }, showAll?"Mercado":"Saldo atual"), React.createElement("strong", { style:{ fontSize:showAll?22:28,color:showAll?"var(--heading)":"var(--green)" } }, showAll?"Histórico de transações":L(team&&team.budget||0))), React.createElement("button", { onClick:onClose,style:{ width:34,height:34,borderRadius:"50%",border:"1px solid var(--border)",background:"var(--surface-soft)",color:"var(--heading)" } }, "×")), items.map((item)=>React.createElement("div", { key:item.id,style:{ display:"grid",gridTemplateColumns:"minmax(0,1fr) auto",gap:12,alignItems:"center",padding:"12px 0",borderBottom:"1px solid var(--border)" } }, React.createElement("div", null, React.createElement("div", { style:{ fontWeight:750,fontSize:13.5 } }, item.label||"Movimentação"), showAll&&React.createElement("div",{style:{fontSize:11,color:"var(--muted)",marginTop:3}},teamName(item.teamId)), React.createElement("div", { style:{ fontSize:10.5,color:"var(--muted)",marginTop:3 } }, new Date(item.createdAt||Date.now()).toLocaleString("pt-BR")), item.rolledBackAt&&React.createElement("div",{style:{fontSize:10.5,color:"var(--green)",fontWeight:800,marginTop:4}},"Movimentação revertida")), React.createElement("div",{style:{display:"flex",alignItems:"center",gap:9}},React.createElement("strong", { style:{ color:Number(item.amount)>=0?"var(--green)":"var(--danger)" } }, `${Number(item.amount)>=0?"+ ":"− "}${L(Math.abs(Number(item.amount)||0))}`),rollbackButton(item)))), !items.length&&React.createElement("div", { style:{ color:"var(--muted)",textAlign:"center",padding:24 } }, "Nenhuma movimentação registrada ainda."))), document.body);
        }
        function ChampionshipRulesModal({ tournament, teams = [], ownership = {}, catalog = [], onClose }) {
          let economy=economySettingsOf(tournament), prize=prizeSettingsOf(tournament), roster=tournament.rosterSettings||{minPlayers:23,maxPlayers:30}, market=tournament.marketSettings||{}, balance=tournament.marketBalanceSettings||{}, isCup=tournament&&tournament.type==="cup";
          let ruleTeams=(Array.isArray(teams)?teams:[]).filter((team)=>team&&team.active!==false);
          let ruleOwnership=ownership&&typeof ownership==="object"?ownership:{};
          let ruleCatalog=Array.isArray(catalog)?catalog:[];
          let calculateTeamOverall=(teamId)=>{try{return Number(window.ManchaApp&&window.ManchaApp.MarketFeature&&window.ManchaApp.MarketFeature.fullSquadOverall?window.ManchaApp.MarketFeature.fullSquadOverall(teamId,ruleOwnership,ruleCatalog):0)||0}catch(error){console.error("Falha ao calcular equilíbrio no modal de regras",error);return 0}};
          let balanceTable=ruleTeams.map((team)=>({team,overall:calculateTeamOverall(team.id)})).filter((entry)=>entry.overall>0).sort((a,b)=>b.overall-a.overall);
          let strongestTeam=balanceTable[0]||null, weakestTeam=balanceTable.length?balanceTable[balanceTable.length-1]:null, currentBalanceDifference=strongestTeam&&weakestTeam?Math.max(0,strongestTeam.overall-weakestTeam.overall):null;
          let row=(label,value,accent=false,danger=false)=>React.createElement("div",{key:label,style:{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:16,padding:"10px 0",borderBottom:"1px solid var(--border)",fontSize:13}},React.createElement("span",{style:{color:"var(--muted)"}},label),React.createElement("strong",{style:{textAlign:"right",color:danger?"var(--danger)":accent?"var(--green)":"var(--heading)"}},value));
          let section=(icon,title,children)=>React.createElement("section",{style:{padding:16,borderRadius:18,background:"var(--surface-soft)",border:"1px solid var(--border)",marginBottom:12}},React.createElement("div",{style:{display:"flex",alignItems:"center",gap:9,fontWeight:900,fontSize:15,marginBottom:12}},React.createElement("span",{style:{fontSize:18}},icon),title),children);
          let rewardCard=(label,value,danger=false)=>React.createElement("div",{key:label,style:{minHeight:86,padding:14,borderRadius:15,background:"var(--surface)",border:"1px solid var(--border)",display:"flex",flexDirection:"column",justifyContent:"space-between",gap:12}},React.createElement("span",{style:{fontSize:12,color:"var(--muted)",lineHeight:1.3}},label),React.createElement("strong",{style:{fontSize:18,color:danger?"var(--danger)":"var(--green)",fontVariantNumeric:"tabular-nums"}},`${danger?"−":"+"} ${L(value)}`));
          let participantCount=Math.max(1,((tournament&&tournament.context&&Array.isArray(tournament.context.teams))?tournament.context.teams.filter((team)=>team&&team.active!==false).length:0)||0), ladder=championshipPrizeLadder(prize.championPrize,participantCount), prizes=ladder.map((value,index)=>[index===0?"Campeão":index===1?"Vice":`${index+1}º lugar`,value]);
          return React.createElement(ee,{title:"Regras da competição",onClose},
            React.createElement("div",{style:{textAlign:"center",padding:"4px 8px 22px"}},React.createElement(TrophyAsset,{tournament,size:150}),React.createElement("h2",{style:{margin:"8px 0 5px",fontSize:22}},tournament.name||"Competição"),React.createElement("div",{style:{fontSize:16,fontWeight:900,color:"var(--green)",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7}},React.createElement(BankIcon,{size:17,color:"var(--green)"}),`${L(prize.championPrize)} ao campeão`)),
            section("💰","Economia",React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}},rewardCard("Vitória",economy.winReward),rewardCard("Empate com gols",economy.scoringDrawReward),rewardCard("Empate sem gols",economy.scorelessDrawReward),rewardCard("Derrota",economy.lossReward),rewardCard("Gol com autoria",economy.goalReward),rewardCard("Cartão vermelho",economy.redCardPenalty,true))),
            section("👥","Elencos",row("Jogadores por time",`${roster.minPlayers} a ${roster.maxPlayers} jogadores`)),
            !isCup&&section("💸","Mercado",React.createElement(React.Fragment,null,
              row("Mercado",market.isOpen===false?"Fechado":"Aberto",market.isOpen!==false),
              row("Overall máximo para contratação",market.freePlayerOverallLimit&&market.freePlayerOverallLimit.enabled?String(Number(market.freePlayerOverallLimit.maxOverall||99)):"Sem limite"),
              row("Equilíbrio entre elencos",balance.enabled===true?`Diferença máxima de ${Number(balance.maxDifference!=null?balance.maxDifference:10)} OVR`:"Desativado"),
              React.createElement("div",{style:{marginTop:10,padding:12,borderRadius:14,background:"var(--surface)",border:"1px solid var(--border)",fontSize:11.5,color:"var(--muted)",lineHeight:1.45}},balance.enabled===true?`Compras que fariam a diferença entre o melhor e o pior elenco passar de ${Number(balance.maxDifference!=null?balance.maxDifference:10)} OVR são bloqueadas.`:"A trava de equilíbrio entre os elencos está desativada nesta competição."),
              balance.enabled===true&&React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8,marginTop:10}},
                React.createElement("div",{style:{padding:10,borderRadius:12,background:"var(--surface)",border:"1px solid var(--border)",minWidth:0}},React.createElement("span",{style:{display:"block",fontSize:9.5,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}},"Maior overall"),React.createElement("strong",{style:{display:"block",fontSize:16,fontVariantNumeric:"tabular-nums"}},strongestTeam?strongestTeam.overall.toFixed(1):"—"),React.createElement("span",{style:{display:"block",fontSize:10.5,color:"var(--muted)",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},strongestTeam&&strongestTeam.team?strongestTeam.team.name||"Time":"Sem dados")),
                React.createElement("div",{style:{padding:10,borderRadius:12,background:"var(--surface)",border:"1px solid var(--border)",minWidth:0}},React.createElement("span",{style:{display:"block",fontSize:9.5,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}},"Menor overall"),React.createElement("strong",{style:{display:"block",fontSize:16,fontVariantNumeric:"tabular-nums"}},weakestTeam?weakestTeam.overall.toFixed(1):"—"),React.createElement("span",{style:{display:"block",fontSize:10.5,color:"var(--muted)",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},weakestTeam&&weakestTeam.team?weakestTeam.team.name||"Time":"Sem dados")),
                React.createElement("div",{style:{padding:10,borderRadius:12,background:"var(--surface)",border:`1px solid ${currentBalanceDifference!=null&&currentBalanceDifference>Number(balance.maxDifference!=null?balance.maxDifference:10)?"var(--danger)":"var(--border)"}`,minWidth:0}},React.createElement("span",{style:{display:"block",fontSize:9.5,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}},"Diferença"),React.createElement("strong",{style:{display:"block",fontSize:16,fontVariantNumeric:"tabular-nums",color:currentBalanceDifference!=null&&currentBalanceDifference>Number(balance.maxDifference!=null?balance.maxDifference:10)?"var(--danger)":"var(--green)"}},currentBalanceDifference!=null?currentBalanceDifference.toFixed(1):"—"),React.createElement("span",{style:{display:"block",fontSize:10.5,color:"var(--muted)",marginTop:3}},`Limite: ${Number(balance.maxDifference!=null?balance.maxDifference:10).toFixed(1)}`))
              ),
              React.createElement("div",{style:{fontSize:10.5,fontWeight:850,textTransform:"uppercase",letterSpacing:".08em",color:"var(--muted)",marginTop:14}},"Taxas do Lobo Pidão"),
              row("Depreciação",`${market.depreciationPct!=null?market.depreciationPct:10}%`,false,true),
              row("Elenco-base",`${market.initialRosterDepreciationPct!=null?market.initialRosterDepreciationPct:50}%`,false,true)
            )),
            section("🏆","Premiações",React.createElement(React.Fragment,null,...prizes.map(([label,value])=>row(label,L(value),label==="Campeão")),prize.topScorerPrize>0&&React.createElement("div",{style:{height:1,background:"var(--border)",margin:"10px 0 2px"}}),prize.topScorerPrize>0&&row("Artilheiro",L(prize.topScorerPrize),true)))
          );
        }
        function MarketAccessAdminForm({ tournament, onSave }) {
          let settings=tournament&&tournament.marketSettings&&typeof tournament.marketSettings==="object"?tournament.marketSettings:{};
          let limit=settings.freePlayerOverallLimit&&typeof settings.freePlayerOverallLimit==="object"?settings.freePlayerOverallLimit:{};
          let [isOpen,setIsOpen]=b(settings.isOpen!==false),[limitEnabled,setLimitEnabled]=b(limit.enabled===true),[maxOverall,setMaxOverall]=b(limit.maxOverall!=null?limit.maxOverall:99);
          He(()=>{setIsOpen(settings.isOpen!==false);setLimitEnabled(limit.enabled===true);setMaxOverall(limit.maxOverall!=null?limit.maxOverall:99)},[tournament&&tournament.id,settings.isOpen,limit.enabled,limit.maxOverall]);
          return React.createElement("div",{style:{marginTop:18,paddingTop:18,borderTop:"1px solid var(--border)"}},
            React.createElement("h3",{style:{margin:"0 0 6px"}},"Mercado"),
            React.createElement("div",{style:{fontSize:12,color:"var(--muted)",lineHeight:1.5,marginBottom:14}},"Controle quando as negociações podem acontecer e o overall máximo para compras diretas de jogadores livres."),
            React.createElement("label",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,padding:"12px 0"}},React.createElement("span",null,React.createElement("strong",null,"Mercado aberto"),React.createElement("div",{style:{fontSize:11.5,color:"var(--muted)",marginTop:3}},"Quando fechado, nenhuma compra, venda, oferta ou contraproposta pode ser concluída.")),React.createElement("input",{type:"checkbox",checked:isOpen,onChange:(event)=>setIsOpen(event.target.checked)})),
            React.createElement("label",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,padding:"12px 0"}},React.createElement("span",null,React.createElement("strong",null,"Limitar overall de jogadores livres"),React.createElement("div",{style:{fontSize:11.5,color:"var(--muted)",marginTop:3}},"Não afeta ofertas e transferências entre usuários.")),React.createElement("input",{type:"checkbox",checked:limitEnabled,onChange:(event)=>setLimitEnabled(event.target.checked)})),
            limitEnabled&&React.createElement(React.Fragment,null,React.createElement("label",{style:P},"Overall máximo permitido"),React.createElement("input",{type:"number",min:1,max:99,step:1,value:maxOverall,onChange:(event)=>setMaxOverall(event.target.value),style:q})),
            React.createElement("button",{onClick:()=>onSave(isOpen,limitEnabled,maxOverall),style:{...M,...W,marginTop:12}},"Salvar regras do mercado")
          );
        }
        function MarketBalanceAdminForm({ tournament, teams, catalog, onSave }) {
          let settings = tournament && tournament.marketBalanceSettings ? tournament.marketBalanceSettings : {};
          let [enabled,setEnabled]=b(settings.enabled===true), [maxDifference,setMaxDifference]=b(settings.maxDifference!=null?settings.maxDifference:10);
          He(()=>{ setEnabled(settings.enabled===true); setMaxDifference(settings.maxDifference!=null?settings.maxDifference:10); },[tournament&&tournament.id,settings.enabled,settings.maxDifference]);
          let ownership=tournament&&tournament.context&&tournament.context.ownership&&typeof tournament.context.ownership==="object"?tournament.context.ownership:{};
          function avg(teamId){ let ids=new Set(Object.entries(ownership).filter(([,item])=>item&&String(item.teamId)===String(teamId)).map(([id])=>String(id))); let players=(catalog||[]).filter((player)=>player&&ids.has(String(player.id))); return players.length?players.reduce((sum,player)=>sum+(Number(player.overall)||0),0)/players.length:0; }
          let rows=(teams||[]).filter((team)=>team&&team.active!==false).map((team)=>({team,overall:avg(team.id)})).filter((item)=>item.overall>0).sort((a,b)=>b.overall-a.overall);
          let gap=rows.length>1?rows[0].overall-rows[rows.length-1].overall:0;
          return React.createElement("div",{style:{marginTop:18,paddingTop:18,borderTop:"1px solid var(--border)"}},
            React.createElement("h3",{style:{margin:"0 0 6px"}},"Equilíbrio do mercado"),
            React.createElement("div",{style:{fontSize:12,color:"var(--muted)",lineHeight:1.5,marginBottom:14}},"Limita contratações que aumentariam demais a diferença de overall médio entre os elencos completos."),
            React.createElement("label",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,padding:"12px 0"}},React.createElement("span",null,React.createElement("strong",null,"Ativar trava"),React.createElement("div",{style:{fontSize:11.5,color:"var(--muted)",marginTop:3}},"Campeonatos acima do limite podem continuar se a operação não piorar a diferença.")),React.createElement("input",{type:"checkbox",checked:enabled,onChange:(event)=>setEnabled(event.target.checked)})),
            React.createElement("label",{style:P},"Diferença máxima de overall"),
            React.createElement("input",{type:"number",min:0,step:.1,value:maxDifference,onChange:(event)=>setMaxDifference(event.target.value),style:q}),
            rows.length>1&&React.createElement("div",{style:{...E,padding:14,marginTop:12,display:"grid",gap:7,fontSize:12}},React.createElement("div",{style:{display:"flex",justifyContent:"space-between",gap:12}},React.createElement("span",{style:{color:"var(--muted)"}},"Mais forte"),React.createElement("strong",null,rows[0].team.name," · ",rows[0].overall.toFixed(1))),React.createElement("div",{style:{display:"flex",justifyContent:"space-between",gap:12}},React.createElement("span",{style:{color:"var(--muted)"}},"Mais fraco"),React.createElement("strong",null,rows[rows.length-1].team.name," · ",rows[rows.length-1].overall.toFixed(1))),React.createElement("div",{style:{display:"flex",justifyContent:"space-between",gap:12}},React.createElement("span",{style:{color:"var(--muted)"}},"Diferença atual"),React.createElement("strong",{style:{color:gap>Number(maxDifference||0)?"var(--danger)":"var(--green)"}},gap.toFixed(1)," OVR"))),
            React.createElement("button",{onClick:()=>onSave(enabled,maxDifference),style:{...M,...W,marginTop:12}},"Salvar equilíbrio")
          );
        }
        function MarketSaleModal({ data, onClose, onConfirm }) {
          let player = data && data.player;
          if (!player) return null;
          return ReactDOM.createPortal(
            React.createElement(
              "div",
              {
                className: "sports-modal-overlay",
                onClick: onClose,
                style: {
                  position: "fixed",
                  inset: 0,
                  zIndex: 1000,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  padding: 0,
                  background: "var(--overlay)",
                },
              },
              React.createElement(
                "div",
                {
                  className: "sports-modal",
                  role: "dialog",
                  "aria-modal": "true",
                  "aria-labelledby": "market-sale-modal-title",
                  onClick: (event) => event.stopPropagation(),
                  style: {
                    width: "100%",
                    maxWidth: 480,
                    maxHeight: "90vh",
                    overflowY: "auto",
                    background: "var(--surface)",
                    borderRadius: "26px 26px 0 0",
                    padding: 20,
                  },
                },
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22 } },
                React.createElement("div", null,
                  React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 750, marginBottom: 7 } }, "Venda imediata"),
                  React.createElement("h2", { id: "market-sale-modal-title", style: { margin: 0, color: "var(--heading)", fontSize: 24, lineHeight: 1.15 } }, "Vender ao mercado?"),
                  React.createElement("p", { style: { margin: "8px 0 0", color: "var(--muted)", fontSize: 13.5, lineHeight: 1.5 } }, player.name, " voltará a ficar disponível para contratação."),
                ),
                React.createElement("button", { onClick: onClose, "aria-label": "Fechar", style: { width: 38, height: 38, borderRadius: 999, border: "1px solid var(--border)", background: "var(--surface-soft)", color: "var(--heading)", fontSize: 20, cursor: "pointer", flexShrink: 0 } }, "×"),
              ),
              React.createElement(
                "div",
                { style: { padding: 18, borderRadius: 18, background: "var(--surface-soft)", border: "1px solid var(--border)", marginBottom: 18 } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 16, paddingBottom: 12 } },
                  React.createElement("span", { style: { color: "var(--muted)", fontSize: 13 } }, "Valor de mercado"),
                  React.createElement("strong", { style: { color: "var(--heading)" } }, L(player.value)),
                ),
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 16, padding: "12px 0", borderTop: "1px solid var(--border)" } },
                  React.createElement("span", { style: { color: "var(--muted)", fontSize: 13 } }, data.initialRoster ? "Depreciação do elenco-base" : "Taxa do Lobo Pidão 🐺"),
                  React.createElement("strong", { style: { color: "var(--danger)" } }, "−", data.depreciationPct, "%"),
                ),
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, paddingTop: 14, borderTop: "1px solid var(--border)" } },
                  React.createElement("span", { style: { color: "var(--heading)", fontSize: 14, fontWeight: 750 } }, "Você recebe"),
                  React.createElement("strong", { style: { color: "var(--green)", fontSize: 26, lineHeight: 1 } }, L(data.amount)),
                ),
              ),
              data.initialRoster && React.createElement("div", { style:{ padding:"12px 14px", borderRadius:14, background:"color-mix(in srgb, var(--yellow) 10%, transparent)", border:"1px solid color-mix(in srgb, var(--yellow) 28%, var(--border))", color:"var(--body)", fontSize:12.5, lineHeight:1.45, marginBottom:10 } }, "Este jogador fazia parte do seu elenco inicial e possui uma taxa de venda diferente."),
              React.createElement("div", { style: { padding: "12px 14px", borderRadius: 14, background: "color-mix(in srgb, var(--danger) 9%, transparent)", color: "var(--muted)", fontSize: 12.5, lineHeight: 1.45, marginBottom: 20 } }, "A venda é imediata e não pode ser desfeita. Propostas abertas por este jogador serão encerradas."),
              React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
                React.createElement("button", { className: "tapbtn", onClick: onClose, style: { ...M, margin: 0, background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--heading)" } }, "Cancelar"),
                React.createElement("button", { className: "tapbtn", onClick: onConfirm, style: { ...M, ...W, margin: 0 } }, "Confirmar venda"),
              ),
            ),
            ),
            document.body,
          );
        }

        function TradeOfferModal({ data, activeTeam, sellerTeam, onClose, onConfirm }) {
          let player = data.player,
            suggested = data.amount || player.value,
            [amount, setAmount] = b(suggested),
            value = Math.max(0, Number(amount) || 0),
            insufficient = !activeTeam || activeTeam.budget < value,
            invalid = value <= 0;
          return React.createElement(
            ee,
            { title: `Fazer oferta por ${player.name}`, onClose },
            React.createElement("div", { style: E },
              React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
                React.createElement("span", { style: { background: positionColor(player.position), color: "#fff", borderRadius: 6, padding: "4px 8px", fontWeight: 700, fontSize: 12 } }, player.position),
                React.createElement("div", { style: { flex: 1 } },
                  React.createElement("div", { style: { fontWeight: 700 } }, player.name),
                  React.createElement("div", { style: { color: "var(--muted)", fontSize: 12 } }, sellerTeam ? `Pertence a ${sellerTeam.name}` : "Outro time")
                ),
                React.createElement("strong", { style: { color: overallColor(player.overall), fontSize: 18 } }, player.overall)
              )
            ),
            React.createElement("label", { style: P }, "Valor da oferta"),
            React.createElement("input", { type: "number", min: 1, style: q, value: amount, onChange: (event) => setAmount(event.target.value), autoFocus: true }),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 12, color: "var(--muted)", fontSize: 12, marginTop: 7 } },
              React.createElement("span", null, `Valor de mercado: ${L(player.value)}`),
              React.createElement("span", null, `Seu saldo: ${L(activeTeam ? activeTeam.budget : 0)}`)
            ),
            React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", margin: "14px 0" } }, "O saldo só será descontado se a proposta for aceita. Ela expira em 48 horas."),
            insufficient && React.createElement("div", { style: { color: "var(--danger)", fontSize: 12, marginBottom: 10 } }, "Saldo insuficiente para esta oferta."),
            React.createElement("button", { style: { ...M, ...W, opacity: invalid || insufficient ? .5 : 1 }, disabled: invalid || insufficient, onClick: () => onConfirm(player, value) }, "Enviar oferta")
          );
        }

        function TradeOffersArea({ offers, catalog, teamById, activeTeam, transfers, onAccept, onUpdate, onOpenDetail, onExplorePlayers }) {
          let [section, setSection] = b("received"), [counterId, setCounterId] = b(null), [counterValue, setCounterValue] = b(0);
          if (!activeTeam) return React.createElement("div", { style: { ...E, padding: 24, textAlign: "center", color: "var(--muted)" } }, "Este perfil não possui um time neste campeonato.");
          let now = Date.now();
          let all = Object.values(offers || {}).map((offer) => offer.expiresAt && offer.expiresAt <= now && isOfferOpen(offer) ? { ...offer, status: "expired" } : offer);
          let list = all.filter((offer) => section === "received" ? String(offer.sellerTeamId) === String(activeTeam.id) : String(offer.buyerTeamId) === String(activeTeam.id)).sort((a,b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          return React.createElement("div", null,
            React.createElement(Z, { icon: React.createElement(OfferIcon, { size: 15 }), text: "Negociações" }),
            React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 14 } },
              React.createElement("button", { style: V(section === "received"), onClick: () => setSection("received") }, "Recebidas"),
              React.createElement("button", { style: V(section === "sent"), onClick: () => setSection("sent") }, "Enviadas")
            ),
            list.length === 0 && React.createElement("div", { style: { ...E, padding: 28, textAlign: "center", color: "var(--muted)" } },
              React.createElement("div", { style: { fontWeight: 700, color: "var(--heading)", marginBottom: 6 } }, "Nenhuma negociação por aqui"),
              React.createElement("div", { style: { fontSize: 12.5, marginBottom: 14 } }, section === "received" ? "As ofertas recebidas aparecerão aqui." : "As ofertas enviadas aparecerão aqui."),
              React.createElement("button", { className: "tapbtn", onClick: onExplorePlayers, style: { ...M, ...W, width: "auto", display: "inline-flex" } }, "Explorar jogadores")
            ),
            list.map((offer) => {
              let player = catalog.get(offer.playerId), open = isOfferOpen(offer), isSeller = String(offer.sellerTeamId) === String(activeTeam.id);
              let waitingForMe = open && String(offer.lastActorTeamId) !== String(activeTeam.id);
              return React.createElement("div", { key: offer.id, style: { ...E, padding: 16 } },
                React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "center" } },
                  player && React.createElement("span", { style: { background: positionColor(player.position), color: "#fff", borderRadius: 6, padding: "4px 7px", fontSize: 11, fontWeight: 700 } }, player.position),
                  React.createElement("button", { onClick: () => player && onOpenDetail(player), style: { flex: 1, textAlign: "left", background: "none", border: 0, padding: 0, color: "var(--heading)", cursor: "pointer" } },
                    React.createElement("div", { style: { fontWeight: 700 } }, offer.playerName),
                    React.createElement("div", { style: { fontSize: 12, color: "var(--muted)" } }, isSeller ? `Oferta de ${(teamById(offer.buyerTeamId) || {}).name || "Time"}` : `Enviada para ${(teamById(offer.sellerTeamId) || {}).name || "Time"}`)
                  ),
                  React.createElement("div", { style: { textAlign: "right" } },
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 17 } }, L(offer.currentAmount)),
                    React.createElement("div", { style: { fontSize: 10, color: open ? "var(--orange)" : "var(--muted)" } }, offerStatusLabel(offer.status))
                  )
                ),
                React.createElement("div", { style: { fontSize: 11, color: "var(--muted)", marginTop: 10 } }, `Valor de mercado no envio: ${L(offer.marketValueAtCreation)}`),
                counterId === offer.id && React.createElement("div", { style: { marginTop: 12 } },
                  React.createElement("input", { type: "number", min: 1, style: q, value: counterValue, onChange: e => setCounterValue(e.target.value) }),
                  React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 8 } },
                    React.createElement("button", { style: { ...M, ...W, flex: 1 }, onClick: () => { onUpdate(offer.id, "counter", counterValue); setCounterId(null); } }, "Enviar contraproposta"),
                    React.createElement("button", { style: { ...M, flex: 1 }, onClick: () => setCounterId(null) }, "Cancelar")
                  )
                ),
                open && counterId !== offer.id && React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 } },
                  waitingForMe && React.createElement("button", { style: { ...M, ...W, flex: 1 }, onClick: () => onAccept(offer.id) }, "Aceitar"),
                  waitingForMe && React.createElement("button", { style: { ...M, flex: 1 }, onClick: () => { setCounterId(offer.id); setCounterValue(offer.currentAmount); } }, "Contraproposta"),
                  React.createElement("button", { style: { ...M, color: "var(--danger)", flex: 1 }, onClick: () => onUpdate(offer.id, isSeller ? "decline" : "cancel") }, isSeller ? "Recusar" : "Cancelar oferta")
                )
              );
            }),
            React.createElement("section", { style:{ marginTop:26 } },
              React.createElement("h3", { style:{ margin:"0 0 12px",fontSize:17 } }, "Histórico de transferências"),
              (Array.isArray(transfers)?transfers:[]).slice().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).slice(0,30).map((transfer)=>{
                let buyer=transfer.toTeamId?teamById(transfer.toTeamId):null, seller=transfer.fromTeamId?teamById(transfer.fromTeamId):null;
                return React.createElement("div", { key:transfer.id, style:{ ...E,padding:14,display:"grid",gridTemplateColumns:"1fr auto",gap:10,alignItems:"center" } },
                  React.createElement("div", null, React.createElement("strong", { style:{ display:"block",fontSize:14 } }, transfer.playerName || "Jogador"), React.createElement("span", { style:{ fontSize:11.5,color:"var(--muted)" } }, transfer.type==="market_sale"?`${seller?seller.name:"Um time"} vendeu ao mercado`:seller?`${buyer?buyer.name:"Um time"} comprou de ${seller.name}`:`${buyer?buyer.name:"Um time"} comprou do mercado`)),
                  React.createElement("strong", { style:{ color:"var(--green)" } }, L(transfer.price||0))
                );
              }),
              !(Array.isArray(transfers)&&transfers.length) && React.createElement("div", { style:{ color:"var(--muted)",fontSize:12 } }, "Nenhuma transferência realizada ainda.")
            )
          );
        }

        function co({ data: e, onClose: t, onConfirm: l }) {
          let { player: a, teamId: n, price: r } = e,
            [f, d] = b(r);
          return React.createElement(
            ee,
            { title: `Vender ${a.name}`, onClose: t },
            React.createElement(
              "label",
              { style: P },
              "Pre\xE7o de venda (em milh\xF5es)",
            ),
            React.createElement("input", {
              type: "number",
              min: 1,
              style: q,
              value: f,
              onChange: (p) => d(p.target.value),
            }),
            React.createElement(
              "div",
              {
                style: {
                  fontSize: 11.5,
                  color: "var(--muted)",
                  marginTop: 6,
                  marginBottom: 16,
                },
              },
              "Valor de refer\xEAncia da tabela: ",
              L(a.value),
            ),
            React.createElement(
              "button",
              {
                className: "tapbtn",
                style: { ...M, ...W },
                onClick: () => l(a, n, f),
              },
              "Colocar \xE0 venda",
            ),
          );
        }
        function po({
          tournament: e,
          teamById: t,
          onNewTournament: l,
          onOpenMatch: a,
          groupTab: n,
          setGroupTab: r,
          advanceKnockout: f,
          advanceFromGroups: d,
          archiveSeason: p,
          finishTournament: F,
        }) {
          var h;
          if (!e)
            return React.createElement(
              "div",
              { style: { textAlign: "center", padding: "10px 0" } },
              React.createElement(
                "div",
                { style: { ...E, padding: 24 } },
                React.createElement(pe, {
                  size: 28,
                  color: "var(--green)",
                  style: { marginBottom: 8 },
                }),
                React.createElement(
                  "div",
                  { style: { fontWeight: 700, marginBottom: 4 } },
                  "Sem campeonato ativo",
                ),
                React.createElement(
                  "div",
                  {
                    style: { fontSize: 13, color: "var(--muted)", marginBottom: 16 },
                  },
                  "Escolha o formato e os times participantes.",
                ),
              ),
              React.createElement(
                "button",
                { className: "tapbtn", onClick: l, style: { ...M, ...W } },
                "Criar campeonato",
              ),
            );
          if (e.status === "finished") {
            let m = t(e.champion);
            return React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                {
                  style: {
                    ...E,
                    textAlign: "center",
                    padding: 28,
                    background: "var(--surface-soft)",
                  },
                },
                React.createElement(tt, {
                  size: 34,
                  color: "var(--green)",
                  style: { marginBottom: 10 },
                }),
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 12,
                      color: "var(--green)",
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                      fontWeight: 700,
                    },
                  },
                  "Campe\xE3o",
                ),
                React.createElement(
                  "div",
                  { style: { fontSize: 22, fontWeight: 900, marginTop: 4 } },
                  m == null ? void 0 : m.name,
                ),
                React.createElement(
                  "div",
                  { style: { fontSize: 12.5, color: "var(--muted)", marginTop: 4 } },
                  e.name,
                ),
              ),
              React.createElement(
                "button",
                { className: "tapbtn", onClick: p, style: { ...M, ...W } },
                "Encerrar temporada e come\xE7ar outra",
              ),
              React.createElement(
                "button",
                {
                  className: "tapbtn",
                  onClick: l,
                  style: {
                    ...M,
                    background: "var(--surface-soft)",
                    color: "var(--heading)",
                    border: "1px solid #58CC02",
                  },
                },
                "Novo campeonato agora",
              ),
            );
          }
          if (e.format === "liga") {
            let m = we(e.teamIds, e.matches),
              g = [...new Set(e.matches.map((I) => I.round))].sort(
                (I, B) => I - B,
              ),
              k = e.matches.every((I) => I.played);
            return React.createElement(
              "div",
              null,
              React.createElement(Ue, { standings: m, teamById: t }),
              k &&
                React.createElement(
                  "button",
                  {
                    className: "tapbtn",
                    onClick: () => F(m[0].id),
                    style: { ...M, ...W, marginBottom: 14 },
                  },
                  "\u{1F3C6} Encerrar liga (",
                  (h = t(m[0].id)) == null ? void 0 : h.name,
                  " campe\xE3o)",
                ),
              React.createElement(Z, {
                icon: React.createElement(ot, { size: 15 }),
                text: "Rodadas",
              }),
              g.map((I) =>
                React.createElement(
                  "div",
                  { key: I, style: { marginBottom: 14 } },
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 12,
                        color: "var(--muted)",
                        marginBottom: 6,
                        fontWeight: 700,
                      },
                    },
                    "RODADA ",
                    I,
                  ),
                  e.matches
                    .filter((B) => B.round === I)
                    .map((B) =>
                      React.createElement(ce, {
                        key: B.id,
                        match: B,
                        teamById: t,
                        onOpen: a,
                      }),
                    ),
                ),
              ),
            );
          }
          if (e.format === "mata-mata")
            return React.createElement(Je, {
              tournament: e,
              teamById: t,
              onOpenMatch: a,
              advanceKnockout: f,
            });
          let c = e.groups,
            v = e.matches.some((m) => m.stage === "knockout"),
            s = c.every((m) =>
              e.matches
                .filter((g) => g.stage === "group" && g.groupName === m.name)
                .every((g) => g.played),
            );
          return React.createElement(
            "div",
            null,
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  gap: 8,
                  marginBottom: 14,
                  flexWrap: "wrap",
                },
              },
              c.map((m, g) =>
                React.createElement(
                  "span",
                  { key: m.name, onClick: () => r(g), style: V(n === g) },
                  m.name,
                ),
              ),
              v &&
                React.createElement(
                  "span",
                  { onClick: () => r(-1), style: V(n === -1) },
                  "Mata-mata",
                ),
            ),
            n === -1
              ? React.createElement(Je, {
                  tournament: e,
                  teamById: t,
                  onOpenMatch: a,
                  advanceKnockout: f,
                })
              : React.createElement(
                  React.Fragment,
                  null,
                  c[n] &&
                    React.createElement(
                      React.Fragment,
                      null,
                      React.createElement(Ue, {
                        standings: we(
                          c[n].teamIds,
                          e.matches.filter((m) => m.groupName === c[n].name),
                        ),
                        teamById: t,
                        highlightTop: 2,
                      }),
                      [
                        ...new Set(
                          e.matches
                            .filter((m) => m.groupName === c[n].name)
                            .map((m) => m.round),
                        ),
                      ]
                        .sort((m, g) => m - g)
                        .map((m) =>
                          React.createElement(
                            "div",
                            { key: m, style: { marginBottom: 14 } },
                            React.createElement(
                              "div",
                              {
                                style: {
                                  fontSize: 12,
                                  color: "var(--muted)",
                                  marginBottom: 6,
                                  fontWeight: 700,
                                },
                              },
                              "RODADA ",
                              m,
                            ),
                            e.matches
                              .filter(
                                (g) =>
                                  g.groupName === c[n].name && g.round === m,
                              )
                              .map((g) =>
                                React.createElement(ce, {
                                  key: g.id,
                                  match: g,
                                  teamById: t,
                                  onOpen: a,
                                }),
                              ),
                          ),
                        ),
                    ),
                  s &&
                    !v &&
                    React.createElement(
                      "button",
                      {
                        className: "tapbtn",
                        onClick: d,
                        style: { ...M, ...W },
                      },
                      "Gerar fase eliminat\xF3ria (top 2 de cada grupo)",
                    ),
                ),
          );
        }
        function Je({
          tournament: e,
          teamById: t,
          onOpenMatch: l,
          advanceKnockout: a,
        }) {
          let n = e.matches.filter((v) => v.stage === "knockout"),
            r = [...new Set(n.map((v) => v.round))].sort((v, s) => v - s),
            f = Math.max(...r),
            d = (v) => {
              let s = n.filter((h) => h.round === v).length * 2;
              return s <= 2
                ? "FINAL"
                : s <= 4
                  ? "SEMIFINAL"
                  : s <= 8
                    ? "QUARTAS DE FINAL"
                    : `FASE DE ${s}`;
            },
            p = n.filter((v) => v.round === f),
            F = p.every((v) => v.played),
            c = F ? p.length : null;
          return React.createElement(
            "div",
            null,
            r.map((v) =>
              React.createElement(
                "div",
                { key: v, style: { marginBottom: 16 } },
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 12,
                      color: "var(--muted)",
                      marginBottom: 6,
                      fontWeight: 700,
                      letterSpacing: 1,
                    },
                  },
                  d(v),
                ),
                n
                  .filter((s) => s.round === v)
                  .map((s) => {
                    var h;
                    return React.createElement(
                      "div",
                      { key: s.id },
                      React.createElement(ce, {
                        match: s,
                        teamById: t,
                        onOpen: l,
                      }),
                      s.played &&
                        !s.bye &&
                        s.homeScore === s.awayScore &&
                        s.penaltyWinner &&
                        React.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 11.5,
                              color: "var(--muted)",
                              marginTop: -4,
                              marginBottom: 8,
                              paddingLeft: 4,
                            },
                          },
                          "P\xEAnaltis: ",
                          (h = t(s.penaltyWinner)) == null ? void 0 : h.name,
                          " venceu",
                        ),
                    );
                  }),
              ),
            ),
            F &&
              c > 1 &&
              React.createElement(
                "button",
                { className: "tapbtn", onClick: a, style: { ...M, ...W } },
                "Gerar pr\xF3xima fase",
              ),
            F &&
              c === 1 &&
              React.createElement(
                "button",
                { className: "tapbtn", onClick: a, style: { ...M, ...W } },
                "\u{1F3C6} Coroar campe\xE3o",
              ),
          );
        }
        function Ue({ standings: e, teamById: t, highlightTop: l }) {
          return React.createElement(
            "div",
            {
              style: { ...E, padding: 10, marginBottom: 16, overflowX: "auto" },
            },
            React.createElement(
              "table",
              {
                style: {
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12.5,
                },
              },
              React.createElement(
                "thead",
                null,
                React.createElement(
                  "tr",
                  {
                    style: {
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      fontSize: 10.5,
                    },
                  },
                  React.createElement(
                    "th",
                    { style: { textAlign: "left", padding: "4px 4px" } },
                    "#",
                  ),
                  React.createElement(
                    "th",
                    { style: { textAlign: "left", padding: "4px 4px" } },
                    "Time",
                  ),
                  React.createElement("th", { style: O }, "PJ"),
                  React.createElement("th", { style: O }, "V"),
                  React.createElement("th", { style: O }, "E"),
                  React.createElement("th", { style: O }, "D"),
                  React.createElement("th", { style: O }, "SG"),
                  React.createElement("th", { style: O }, "Pts"),
                ),
              ),
              React.createElement(
                "tbody",
                null,
                e.map((a, n) => {
                  var r, f;
                  return React.createElement(
                    "tr",
                    {
                      key: a.id,
                      style: {
                        borderTop: "1px solid #DEDEDE",
                        background:
                          l && n < l ? "rgba(47,122,77,0.15)" : "transparent",
                      },
                    },
                    React.createElement(
                      "td",
                      { style: { padding: "6px 4px", color: "var(--muted)" } },
                      n + 1,
                    ),
                    React.createElement(
                      "td",
                      {
                        style: {
                          padding: "6px 4px",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        },
                      },
                      React.createElement("span", {
                        style: {
                          width: 7,
                          height: 7,
                          borderRadius: 2,
                          background: (r = t(a.id)) == null ? void 0 : r.color,
                          display: "inline-block",
                          marginRight: 6,
                        },
                      }),
                      (f = t(a.id)) == null ? void 0 : f.name,
                    ),
                    React.createElement("td", { style: O }, a.pj),
                    React.createElement("td", { style: O }, a.v),
                    React.createElement("td", { style: O }, a.e),
                    React.createElement("td", { style: O }, a.d),
                    React.createElement("td", { style: O }, a.sg),
                    React.createElement(
                      "td",
                      { style: { ...O, fontWeight: 800, color: "var(--green)" } },
                      a.pts,
                    ),
                  );
                }),
              ),
            ),
          );
        }
        function ProfilePinLock({ gate, onDigit, onErase }) {
          let profile = gate && gate.profile ? gate.profile : {};
          let digits = String(gate && gate.digits || "");
          let keyStyle={width:74,height:74,borderRadius:999,border:"1px solid rgba(255,255,255,.22)",background:"rgba(255,255,255,.12)",color:"#fff",fontSize:27,fontWeight:600,cursor:"pointer",display:"grid",placeItems:"center",WebkitTapHighlightColor:"transparent"};
          let content=React.createElement("div", { role:"dialog", "aria-modal":"true", "aria-label":`Digite o PIN de ${profile.name || "perfil"}`, style:{ position:"fixed",inset:0,zIndex:99999,display:"grid",placeItems:"center",padding:"max(28px, env(safe-area-inset-top)) 20px max(24px, env(safe-area-inset-bottom))",overflowY:"auto",color:"#fff",background:"radial-gradient(680px 460px at 50% 10%, rgba(33,228,147,.16), transparent 68%), linear-gradient(180deg, #050807, #080d0b)",fontFamily:"Manrope,system-ui,-apple-system,sans-serif" } },
            React.createElement("div", { style:{ width:"min(360px,100%)",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center" } },
              React.createElement("div", { style:{ width:82,height:82,borderRadius:999,overflow:"hidden",display:"grid",placeItems:"center",background:profile.color||"#21e493",fontSize:32,fontWeight:850,boxShadow:"0 18px 50px rgba(0,0,0,.35)",marginBottom:14 } }, profile.avatar ? React.createElement("img", { src:profile.avatar,alt:"",style:{width:"100%",height:"100%",objectFit:"cover"} }) : String(profile.name||"?").charAt(0).toUpperCase()),
              React.createElement("h2", { style:{ margin:"0 0 6px",fontSize:26,letterSpacing:"-.03em" } }, profile.name||"Perfil"),
              React.createElement("p", { style:{ margin:"0 0 22px",minHeight:20,color:gate.error?"#ff6b72":"rgba(255,255,255,.68)",fontSize:14,fontWeight:650 } }, gate.checking?"Verificando...":gate.error||"Digite seu PIN"),
              React.createElement("div", { style:{ display:"flex",gap:14,marginBottom:32 } }, [0,1,2,3].map((index)=>React.createElement("span", { key:index,style:{ width:13,height:13,borderRadius:999,border:`1.5px solid ${gate.error?"#ff6b72":"rgba(255,255,255,.82)"}`,background:index<digits.length?(gate.error?"#ff6b72":"#fff"):"transparent",transition:"all .12s ease" } }))),
              React.createElement("div", { style:{ display:"grid",gridTemplateColumns:"repeat(3,74px)",gap:"15px 22px",justifyContent:"center" } },
                [1,2,3,4,5,6,7,8,9].map((digit)=>React.createElement("button", { key:digit,type:"button",disabled:gate.checking,onClick:()=>onDigit(String(digit)),style:{...keyStyle,opacity:gate.checking?.55:1} }, digit)),
                React.createElement("span", { style:{width:74,height:74} }),
                React.createElement("button", { type:"button",disabled:gate.checking,onClick:()=>onDigit("0"),style:{...keyStyle,opacity:gate.checking?.55:1} }, "0"),
                React.createElement("button", { type:"button",disabled:gate.checking||!digits.length,onClick:onErase,"aria-label":"Apagar último dígito",style:{...keyStyle,border:"none",background:"transparent",fontSize:25,opacity:digits.length&&!gate.checking?1:.3} }, "⌫")
              )
            )
          );
          return ReactDOM.createPortal(content, document.body);
        }
        function ProfilePinSetup({ profile, onSave, onClose }) {
          let [step,setStep]=b("create"), [first,setFirst]=b(""), [digits,setDigits]=b(""), [error,setError]=b(""), [saving,setSaving]=b(false);
          async function addDigit(digit) {
            if (saving || digits.length >= 4) return;
            let next=`${digits}${digit}`.slice(0,4); setDigits(next); setError("");
            if (next.length !== 4) return;
            if (step === "create") { window.setTimeout(()=>{ setFirst(next); setDigits(""); setStep("confirm"); },180); return; }
            if (next !== first) { window.setTimeout(()=>{ setDigits(""); setFirst(""); setStep("create"); setError("Os PINs não coincidem. Tente novamente."); },220); return; }
            setSaving(true);
            try {
              let pinHash=await hashProfilePin(next);
              await onSave(pinHash);
              onClose();
            } catch (saveError) {
              console.error("profile pin save failed", saveError);
              setDigits(""); setFirst(""); setStep("create");
              setError("Não foi possível salvar o PIN. Tente novamente.");
            } finally {
              setSaving(false);
            }
          }
          return React.createElement("div", { className:"profile-modal-overlay profile-pin-modal-overlay", role:"dialog", "aria-modal":"true" },
            React.createElement("div", { className:"profile-modal profile-pin-modal" },
              React.createElement("button", { type:"button", onClick:onClose, className:"profile-modal-close", "aria-label":"Fechar" }, "×"),
              React.createElement("div", { className:"profile-pin-lock" },
                React.createElement("div", { className:"profile-pin-avatar", style:{ background:profile.color || "var(--green)" } }, profile.avatar ? React.createElement("img", { src:profile.avatar, alt:"" }) : String(profile.name || "?").charAt(0).toUpperCase()),
                React.createElement("h2", null, step === "create" ? "Crie um PIN" : "Repita o PIN"),
                React.createElement("p", null, saving ? "Salvando PIN..." : error || "Use 4 dígitos para proteger seu perfil"),
                React.createElement("div", { className:`profile-pin-dots${error ? " is-error" : ""}` }, [0,1,2,3].map((index)=>React.createElement("span", { key:index, className:index < digits.length ? "is-filled" : "" }))),
                React.createElement("div", { className:"profile-pin-keypad" },
                  [1,2,3,4,5,6,7,8,9].map((digit)=>React.createElement("button", { key:digit, type:"button", disabled:saving, onClick:()=>addDigit(String(digit)), className:"profile-pin-key" }, digit)),
                  React.createElement("span", { className:"profile-pin-key-spacer" }),
                  React.createElement("button", { type:"button", disabled:saving, onClick:()=>addDigit("0"), className:"profile-pin-key" }, "0"),
                  React.createElement("button", { type:"button", disabled:saving || !digits.length, onClick:()=>setDigits(digits.slice(0,-1)), className:"profile-pin-delete", "aria-label":"Apagar último dígito" }, React.createElement("span", null, "⌫"))
                )
              )
            )
          );
        }
        function ProfileEditModal({ profile, team, onSave, onClose, onOpenPin }) {
          let [name,setName]=b(profile.name || ""), [teamName,setTeamName]=b(team ? team.name : ""), [avatar,setAvatar]=b(profile.avatar || null), [saving,setSaving]=b(false), [error,setError]=b("");
          function handleAvatar(event) {
            let file=event.target.files && event.target.files[0];
            if(!file) return;
            if(!file.type.startsWith("image/")) { setError("Escolha um arquivo de imagem."); return; }
            if(file.size > 4*1024*1024) { setError("Use uma imagem de até 4 MB."); return; }
            let reader=new FileReader();
            reader.onload=()=>{ setAvatar(reader.result); setError(""); };
            reader.readAsDataURL(file);
          }
          async function submit() {
            let cleanName=name.trim(), cleanTeam=teamName.trim();
            if(!cleanName) { setError("Informe um nome para o perfil."); return; }
            setSaving(true); setError("");
            try { await onSave({ name:cleanName, avatar, teamName:cleanTeam }); onClose(); }
            catch(saveError) { console.error("profile edit save failed",saveError); setError("Não foi possível salvar as alterações."); }
            finally { setSaving(false); }
          }
          return React.createElement("div", { className:"profile-modal-overlay", role:"dialog", "aria-modal":"true" },
            React.createElement("div", { className:"profile-modal" },
              React.createElement("button", { type:"button", onClick:onClose, className:"profile-modal-close", "aria-label":"Fechar" }, "×"),
              React.createElement("h2", null, "Editar perfil"),
              React.createElement("div", { className:"profile-edit-avatar", style:{ background:profile.color || "var(--surface-soft)" } }, avatar ? React.createElement("img", { src:avatar, alt:"Avatar" }) : String(profile.name || "?").charAt(0).toUpperCase()),
              React.createElement("label", { style:P }, "Avatar"),
              React.createElement("input", { type:"file", accept:"image/*", onChange:handleAvatar, style:{ ...q, padding:"10px" } }),
              React.createElement("label", { style:{ ...P, marginTop:14 } }, "Nome do perfil"),
              React.createElement("input", { style:q, value:name, onChange:(event)=>setName(event.target.value), maxLength:30 }),
              team && React.createElement(React.Fragment,null,
                React.createElement("label", { style:{ ...P, marginTop:14 } }, "Nome do time neste campeonato"),
                React.createElement("input", { style:q, value:teamName, onChange:(event)=>setTeamName(event.target.value), maxLength:40 })
              ),
              React.createElement("button", { type:"button", onClick:onOpenPin, className:"profile-edit-pin-button family-pill-secondary" }, profile.pinHash ? "Alterar PIN" : "Criar PIN"),
              error && React.createElement("div", { className:"profile-modal-error" }, error),
              React.createElement("button", { type:"button", onClick:submit, disabled:saving, style:{ ...M, ...W, marginTop:16 } }, saving ? "Salvando..." : "Salvar alterações")
            )
          );
        }
        function ProfileArea({ profile, team, tournament, squad, stats, matches, transfers, theme, setTheme, onUpdateProfile, onUpdateTeamName, onSwitchProfile, onOpenBalanceHistory, tournaments, onOpenChampionshipSummary }) {
          let item = typeof profile === "object" && profile ? profile : { name: String(profile || "") };
          let [editing,setEditing]=b(false), [pinSetupOpen,setPinSetupOpen]=b(false);
          let played = matches.filter((match) => match && match.played && !match.bye && team && (match.homeId === team.id || match.awayId === team.id));
          let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
          played.forEach((match) => { let home = match.homeId === team.id, gf = home ? match.homeScore : match.awayScore, ga = home ? match.awayScore : match.homeScore; goalsFor += Number(gf)||0; goalsAgainst += Number(ga)||0; if (gf > ga) wins++; else if (gf === ga) draws++; else losses++; });
          let goals = squad.reduce((total, player) => total + ((stats[player.id] && stats[player.id].goals) || 0), 0);
          async function saveProfileModal(values) {
            await onUpdateProfile(item.id,{ name:values.name, avatar:values.avatar });
            if(team && values.teamName) await Promise.resolve(onUpdateTeamName(team.id,values.teamName));
          }
          return React.createElement("div", null,
            React.createElement("div", { style:{ textAlign:"center", marginBottom:24, position:"relative" } },
              React.createElement("button", { onClick:()=>setEditing(true), title:"Editar perfil", className:"tapbtn", style:{ position:"absolute", right:0, top:0, width:42, height:42, borderRadius:999, border:"1px solid var(--border)", background:"var(--surface)", color:"var(--heading)", display:"grid", placeItems:"center", cursor:"pointer", boxShadow:"var(--shadow-soft)" } }, React.createElement("span", { style:{ fontSize:19, lineHeight:1 } }, "✎")),
              React.createElement("div", { style:{ width:116, height:116, margin:"0 auto", borderRadius:999, background:item.color || "var(--surface-soft)", overflow:"hidden", display:"grid", placeItems:"center", fontSize:44, fontWeight:750, boxShadow:"0 20px 54px rgba(0,0,0,.24), inset 0 0 0 1px var(--border)" } }, item.avatar ? React.createElement("img", { src:item.avatar, alt:"Avatar", style:{ width:"100%", height:"100%", objectFit:"cover" } }) : String(item.name || "?").charAt(0).toUpperCase()),
              React.createElement("div", { style:{ fontSize:30, fontWeight:750, letterSpacing:"-.04em", color:"var(--heading)", marginTop:16 } }, item.name),
              React.createElement("div", { style:{ color:"var(--muted)", marginTop:5, fontSize:15 } }, team ? team.name : "Administrador global"),
              tournament && React.createElement("div", { style:{ color:"var(--green)", fontSize:12, fontWeight:700, marginTop:8 } }, tournament.name)
            ),
            team && React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10, marginBottom: 16 } },
              [["Saldo", L(team.budget || 0)], ["Elenco", `${squad.length} jogadores`], ["Partidas", played.length], ["Campanha", `${wins}V · ${draws}E · ${losses}D`], ["Gols marcados", goalsFor], ["Artilharia do elenco", goals]].map(([label,value]) => React.createElement("button", { key: label, onClick:label==="Saldo"?onOpenBalanceHistory:undefined, className: "family-card", style: { padding: 18, textAlign:"left", color:"inherit", cursor:label==="Saldo"?"pointer":"default", width:"100%" } }, React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", marginBottom: 6 } }, label), React.createElement("strong", { style: { fontSize: 18, color: "var(--heading)" } }, value))),
              React.createElement("div", { className:"family-card", style:{ padding:18, gridColumn:"1 / -1" } }, React.createElement("div", { style:{ fontSize:12,color:"var(--muted)",marginBottom:10 } }, "Últimas partidas"), React.createElement("div", { style:{ display:"flex",gap:8,alignItems:"center" } }, played.slice().sort((a,b)=>(a.playedAt||a.createdAt||0)-(b.playedAt||b.createdAt||0)).slice(-6).map((match)=>{ let isHome=match.homeId===team.id, mine=isHome?Number(match.homeScore)||0:Number(match.awayScore)||0, other=isHome?Number(match.awayScore)||0:Number(match.homeScore)||0, result=mine>other?"V":mine<other?"D":"E"; return React.createElement("span", { key:match.id, style:{ width:30,height:30,borderRadius:9,display:"grid",placeItems:"center",fontWeight:850,background:result==="V"?"rgba(0,201,120,.18)":result==="D"?"rgba(255,43,58,.18)":"rgba(255,187,38,.18)",color:result==="V"?"#00c978":result==="D"?"#ff2b3a":"#ffbb26" } }, result); })))
            ),
            (()=>{ let trophies=(tournaments||[]).filter((item)=>item&&item.status==="finished").map((item)=>{ let standings=Array.isArray(item.finalStandings)?item.finalStandings:[]; let entry=profile&&profile.id?standings.find((row)=>row&&String(row.profileId)===String(profile.id)):null; return entry&&Number(entry.position)===1?{ tournament:item, entry }:null; }).filter(Boolean).sort((a,b)=>(Number(b.tournament.finishedAt)||0)-(Number(a.tournament.finishedAt)||0)); return trophies.length ? React.createElement("section", { style:{ marginBottom:18 } }, React.createElement("div", { style:{ fontSize:19,fontWeight:800,marginBottom:12 } }, "Sala de troféus"), React.createElement("div", { style:{ display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10 } }, trophies.map(({tournament:item,entry})=>React.createElement("button", { key:item.id,onClick:()=>onOpenChampionshipSummary&&onOpenChampionshipSummary(item),className:"family-card tapbtn",style:{ padding:18,textAlign:"center",cursor:"pointer",color:"inherit",border:"1px solid var(--border)" } }, React.createElement(TrophyAsset,{tournament:item,size:62,style:{marginBottom:8}}), React.createElement("div", { style:{ fontWeight:800,fontSize:14 } }, item.name), React.createElement("div", { style:{ color:"var(--muted)",fontSize:12,marginTop:4 } }, item.type === "cup" ? "Campeão da Copa" : "Campeão"))))) : null; })(),
            editing && React.createElement(ProfileEditModal,{ profile:item,team,onClose:()=>setEditing(false),onOpenPin:()=>{setEditing(false);setPinSetupOpen(true);},onSave:saveProfileModal }),
            pinSetupOpen && React.createElement(ProfilePinSetup, { profile:item, onClose:()=>setPinSetupOpen(false), onSave:(pinHash)=>onUpdateProfile(item.id,{ pinHash, pinUpdatedAt:Date.now() }) }),
            React.createElement("button", { onClick: onSwitchProfile, style: { ...M, width: "100%", marginTop: 16 } }, "Trocar perfil ou campeonato")
          );
        }
        function normalizeImportText(value) {
          return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
        }
        function importNameVariants(value) {
          let raw = String(value || "").trim(), values = [raw];
          let matches = [...raw.matchAll(/\(([^)]+)\)/g)].map((item) => item[1]);
          values.push(...matches, raw.replace(/\s*\([^)]*\)\s*/g, " "));
          return [...new Set(values.map(normalizeImportText).filter(Boolean))];
        }
        function normalizeImportPosition(value) {
          let position = String(value || "").trim().toUpperCase();
          return ({ ATA_LEVE: "SS", ZAG: "CBT", LE: "SB_E", LD: "SB_D", GOL: "GK" })[position] || position;
        }
        function parseRosterTxt(text, catalog, profiles, teams) {
          let rows = String(text || "").split(/\r?\n/), ownerName = "", squadRole = "", rawEntries = [];
          for (let rawLine of rows) {
            let line = rawLine.trim();
            let ownerMatch = line.match(/^🎮\s*(.+)$/u);
            if (ownerMatch) { ownerName = ownerMatch[1].trim(); squadRole = ""; continue; }
            if (/TIME TITULAR/i.test(line)) { squadRole = "starter"; continue; }
            if (/BANCO DE RESERVAS/i.test(line)) { squadRole = "bench"; continue; }
            if (!ownerName || !squadRole || !line.includes("|")) continue;
            if (/^NOME\s*\|/i.test(line)) continue;
            let parts = line.split("|").map((part) => part.trim());
            if (parts.length < 5 || !parts[0] || !/^\d+$/.test(parts[3])) continue;
            rawEntries.push({ ownerName, squadRole, txtName: parts[0], position: parts[1], club: parts[2], overall: Number(parts[3]), value: Number(parts[4]) || 0 });
          }
          let activeProfiles = (profiles || []).filter((profile) => profile && typeof profile === "object" && profile.active !== false);
          let owners = [...new Set(rawEntries.map((entry) => entry.ownerName))].map((name) => {
            let normalized = normalizeImportText(name);
            let profileMatches = activeProfiles.filter((profile) => normalizeImportText(profile.name) === normalized);
            let profile = profileMatches.length === 1 ? profileMatches[0] : null;
            let team = profile ? teams.find((item) => item.profileId === profile.id && item.active !== false) : null;
            return { name, profile, team, status: !profile ? "profile_missing" : !team ? "team_missing" : "ok" };
          });
          let ownerMap = new Map(owners.map((owner) => [owner.name, owner]));
          let entries = rawEntries.map((entry) => {
            let owner = ownerMap.get(entry.ownerName);
            let txtNames = importNameVariants(entry.txtName), txtClub = normalizeImportText(entry.club), txtPosition = normalizeImportPosition(entry.position);
            let candidates = (catalog || []).map((player) => {
              let playerNames = importNameVariants(player.name);
              let nameExact = txtNames.some((name) => playerNames.includes(name));
              if (!nameExact) return null;
              let score = 100;
              if (normalizeImportPosition(player.position) === txtPosition) score += 20;
              if (normalizeImportText(player.club) === txtClub) score += 20;
              if (Number(player.overall) === entry.overall) score += 15;
              if (Number(player.value) === entry.value) score += 5;
              return { player, score };
            }).filter(Boolean).sort((a, b) => b.score - a.score);
            let best = candidates[0], tied = best ? candidates.filter((candidate) => candidate.score === best.score) : [];
            let status = !owner || owner.status !== "ok" ? "owner_error" : !best ? "not_found" : tied.length > 1 ? "ambiguous" : "matched";
            return { ...entry, owner, status, candidates: candidates.slice(0, 8), playerId: status === "matched" ? best.player.id : null, teamId: owner && owner.team ? owner.team.id : null };
          });
          let seen = new Map();
          entries.forEach((entry) => {
            if (!entry.playerId) return;
            if (seen.has(entry.playerId) && seen.get(entry.playerId) !== entry.teamId) {
              entry.status = "duplicate";
              let previous = entries.find((candidate) => candidate.playerId === entry.playerId && candidate !== entry);
              if (previous) previous.status = "duplicate";
            } else seen.set(entry.playerId, entry.teamId);
          });
          return { owners, entries, total: entries.length };
        }


        function parseHistoricalCompetitionTxt(text) {
          let lines=String(text||"").replace(/\r/g,"").split("\n").map((line)=>line.trim()).filter(Boolean);
          let headers={}, sections={}, current="";
          lines.forEach((line)=>{ let section=line.match(/^\[([^\]]+)\]$/); if(section){current=section[1].toUpperCase();sections[current]=sections[current]||[];return;} let header=line.match(/^([A-Z_]+)=(.*)$/i); if(header&&!current){headers[header[1].toUpperCase()]=header[2].trim();return;} if(current) sections[current].push(line); else (sections.STANDINGS||(sections.STANDINGS=[])).push(line); });
          let type=String(headers.TYPE||"").toUpperCase()==="CUP"?"cup":"league",name=headers.NAME||"",version=Number(headers.VERSION)||2;
          if(type==="league"){
            let standings=(sections.STANDINGS||[]).map((line)=>{let c=line.split("|").map((v)=>v.trim());return {position:Number(c[0]),originalName:c[1],played:Number(c[2]),wins:Number(c[3]),draws:Number(c[4]),losses:Number(c[5]),goalDifference:Number(c[6]),points:Number(c[7])};}).filter((row)=>row.originalName&&row.position);
            return {version,type,name,standings,names:standings.map((row)=>row.originalName)};
          }
          let groups=Object.keys(sections).filter((key)=>key.startsWith("GROUP_")).map((key)=>({name:key.replace("GROUP_","Grupo ").replace(/_/g," "),names:sections[key]}));
          let matches=[];
          (sections.SEMIFINALS||[]).forEach((line)=>{let c=line.split("|").map((v)=>v.trim());let hs=c[1]!=="?"&&c[1]!==""?Number(c[1]):null,as=c[3]!=="?"&&c[3]!==""?Number(c[3]):null;let winner=hs!=null&&as!=null?(hs>as?c[0]:as>hs?c[2]:null):null;matches.push({stage:"knockout",round:1,home:c[0],away:c[2],homeScore:hs,awayScore:as,winner});});
          let finalLine=(sections.FINAL||[])[0]||"",fc=finalLine?finalLine.split("|").map((v)=>v.trim()):[];
          let champion=(sections.CHAMPION||[])[0]||"";
          let runner="";
          if(fc.length){let hs=fc[1]!=="?"&&fc[1]!==""?Number(fc[1]):null,as=fc[3]!=="?"&&fc[3]!==""?Number(fc[3]):null;let away=fc[2]&&fc[2]!=="?"?fc[2]:null;matches.push({stage:"knockout",round:2,home:fc[0],away,homeScore:hs,awayScore:as,winner:champion||null}); if(champion&&away) runner=fc[0]===champion?away:fc[0];}
          let names=[];groups.forEach((g)=>g.names.forEach((n)=>{if(n&&!names.includes(n))names.push(n);}));matches.forEach((match)=>[match.home,match.away].forEach((n)=>{if(n&&!names.includes(n))names.push(n);}));if(champion&&!names.includes(champion))names.push(champion);
          return {version,type,name,groups,matches,champion,runner,names};
        }

        function AdminArea({ currentTournament, tournaments, teams, profiles, profileName, setProfileName, profileColor, setProfileColor, profileBudget, setProfileBudget, tournamentName, setTournamentName, onCreateProfile, onCreateTournament, onDeleteTournament, onSelectTournament, onUpdateBudget, onToggleParticipant, onDeleteProfile, onResetTournament, onRemoveOrphanParticipant, onRestoreOrphanProfile, onUpdateMarketDepreciation, onUpdateInitialRosterDepreciation, onUpdateMarketBalanceRules, onUpdateMarketAccessRules, onUpdateRosterRules, onUpdateEconomyRules, onFinishTournament, catalog, onImportRosters, onImportHistoricalCompetition }) {
          let globalProfiles = (profiles || []).filter((profile) => profile && typeof profile === "object" && profile.active !== false);
          let participants = currentTournament && Array.isArray(currentTournament.participants) ? currentTournament.participants : [];
          let globalProfileIds = new Set(globalProfiles.map((profile) => String(profile.id)));
          let orphanTeams = currentTournament ? (teams || []).filter((team) => team && team.active !== false && team.profileId && !globalProfileIds.has(String(team.profileId))) : [];
          let [importText, setImportText] = b("");
          let [importMode, setImportMode] = b("replace");
          let [importPreview, setImportPreview] = b(null);
          let [historyImportText,setHistoryImportText]=b("");
          let [historyImportPreview,setHistoryImportPreview]=b(null);
          let [historyMappings,setHistoryMappings]=b({});
          let sourceCandidates = [...(tournaments || [])].sort((a, b) => (Number(b.finishedAt || b.createdAt) || 0) - (Number(a.finishedAt || a.createdAt) || 0));
          let [creationMode, setCreationMode] = b(sourceCandidates.length ? "continue" : "new");
          let [sourceTournamentId, setSourceTournamentId] = b(sourceCandidates[0] ? sourceCandidates[0].id : "");
          let [inheritance, setInheritance] = b({ participants: true, balances: true, rosters: true, teamNames: true });
          let [participantOverrides, setParticipantOverrides] = b({});
          let [competitionType, setCompetitionType] = b("league");
          let [competitionWizardOpen, setCompetitionWizardOpen] = b(false);
          let [competitionWizardStep, setCompetitionWizardStep] = b(1);
          let [adminSection, setAdminSection] = b("home");
          let [newParticipantIds, setNewParticipantIds] = b([]);
          let [newParticipantDrafts, setNewParticipantDrafts] = b({});
          let activeLeagues = (tournaments || []).filter((item)=>item&&item.type!=="cup"&&item.status!=="finished");
          let [cupLeagueId, setCupLeagueId] = b(activeLeagues[0]?activeLeagues[0].id:"");
          let [groupLegs, setGroupLegs] = b(1);
          let [cupPrize, setCupPrize] = b(20);
          let [cupParticipantIds, setCupParticipantIds] = b([]);
          let cupLeague = activeLeagues.find((item)=>String(item.id)===String(cupLeagueId))||null;
          He(()=>{ if(!cupLeague){setCupParticipantIds([]);return;} let ids=(Array.isArray(cupLeague.context&&cupLeague.context.teams)?cupLeague.context.teams:[]).filter((team)=>team&&team.active!==false&&team.profileId).map((team)=>String(team.profileId)); setCupParticipantIds(ids); },[cupLeagueId]);
          let sourceTournament = sourceCandidates.find((item) => item && String(item.id) === String(sourceTournamentId)) || null;
          He(() => {
            if (!sourceTournament) { setParticipantOverrides({}); return; }
            let sourceTeams = Array.isArray(sourceTournament.context && sourceTournament.context.teams) ? sourceTournament.context.teams.filter((team) => team && team.active !== false && team.profileId) : [];
            let next = {};
            sourceTeams.forEach((team) => {
              next[String(team.profileId)] = { include: true, teamName: team.name || "", budget: Number(team.budget) || 0, inheritRoster: true };
            });
            setParticipantOverrides(next);
          }, [sourceTournamentId]);
          function toggleInheritanceOption(key, checked) {
            let nextInheritance = { ...inheritance, [key]: checked };
            setInheritance(nextInheritance);
            if (!sourceTournament) return;
            let sourceTeams = Array.isArray(sourceTournament.context && sourceTournament.context.teams) ? sourceTournament.context.teams.filter((team) => team && team.active !== false && team.profileId) : [];
            let nextOverrides = { ...participantOverrides };
            sourceTeams.forEach((team) => {
              let profile = globalProfiles.find((item) => String(item.id) === String(team.profileId));
              let current = nextOverrides[String(team.profileId)] || { include:true, teamName:team.name || "", budget:Number(team.budget) || 0, inheritRoster:true };
              if (key === "participants") current = { ...current, include: checked };
              if (key === "balances") current = { ...current, budget: checked ? (Number(team.budget) || 0) : Math.max(0, Number(profileBudget) || 300) };
              if (key === "teamNames") current = { ...current, teamName: checked ? (team.name || "") : (profile && profile.name ? profile.name : team.name || "Time") };
              if (key === "rosters") current = { ...current, inheritRoster: checked };
              nextOverrides[String(team.profileId)] = current;
            });
            setParticipantOverrides(nextOverrides);
          }
          function readImportFile(event) {
            let file = event.target.files && event.target.files[0];
            if (!file) return;
            if (!/\.txt$/i.test(file.name)) { window.alert("Selecione um arquivo .txt."); return; }
            let reader = new FileReader();
            reader.onload = () => { setImportText(String(reader.result || "")); setImportPreview(null); };
            reader.readAsText(file, "UTF-8");
          }
          function buildImportPreview() {
            if (!currentTournament) { window.alert("Selecione um campeonato antes de importar."); return; }
            let preview = parseRosterTxt(importText, catalog, profiles, teams);
            if (!preview.total) { window.alert("Nenhum jogador foi identificado no TXT."); return; }
            setImportPreview(preview);
          }

          function readHistoryImportFile(event){let file=event.target.files&&event.target.files[0];if(!file)return;if(!/\.txt$/i.test(file.name)){window.alert("Selecione um arquivo .txt.");return;}let reader=new FileReader();reader.onload=()=>{setHistoryImportText(String(reader.result||""));setHistoryImportPreview(null);setHistoryMappings({});};reader.readAsText(file,"UTF-8");}
          function buildHistoryImportPreview(){let parsed=parseHistoricalCompetitionTxt(historyImportText);if(!parsed.name){window.alert("O TXT precisa ter NAME=Nome da competição.");return;}if(!parsed.names||!parsed.names.length){window.alert("Nenhum participante foi identificado.");return;}if(parsed.type==="cup"&&!parsed.champion){window.alert("A Copa precisa informar o campeão em [CHAMPION].");return;}let next={};parsed.names.forEach((name)=>{let normalized=normalizeImportText(name);let matches=globalProfiles.filter((profile)=>normalizeImportText(profile.name)===normalized);if(matches.length===1)next[name]=matches[0].id;});setHistoryMappings(next);setHistoryImportPreview(parsed);}
          function confirmHistoryImport(){if(!historyImportPreview)return;let used=Object.values(historyMappings).filter(Boolean);if(historyImportPreview.names.some((name)=>!historyMappings[name])){window.alert("Vincule todos os participantes.");return;}if(new Set(used.map(String)).size!==used.length){window.alert("Cada nome antigo precisa estar vinculado a um perfil diferente.");return;}let rows=historyImportPreview.names.map((originalName)=>({originalName}));if(!window.confirm(`Importar ${historyImportPreview.name} como competição encerrada?`))return;onImportHistoricalCompetition({competition:historyImportPreview,rows,mappings:historyMappings});}

          function resolveImportEntry(index, playerId) {
            let next = { ...importPreview, entries: importPreview.entries.map((entry, entryIndex) => entryIndex === index ? { ...entry, playerId, status: playerId ? "matched" : "not_found" } : entry) };
            let seen = new Map();
            next.entries.forEach((entry) => {
              if (!entry.playerId || entry.status === "owner_error") return;
              if (seen.has(entry.playerId) && seen.get(entry.playerId) !== entry.teamId) entry.status = "duplicate";
              else seen.set(entry.playerId, entry.teamId);
            });
            setImportPreview(next);
          }
          function openCompetitionWizard() {
            let ids = globalProfiles.map((profile)=>String(profile.id));
            let drafts = {};
            globalProfiles.forEach((profile)=>{ drafts[String(profile.id)] = { teamName: profile.name || "Time", budget: Math.max(0, Number(profileBudget) || 300) }; });
            setNewParticipantIds(ids);
            setNewParticipantDrafts(drafts);
            setCompetitionType("league");
            setCreationMode(sourceCandidates.length ? "continue" : "new");
            setCompetitionWizardStep(1);
            setTournamentName("");
            setCompetitionWizardOpen(true);
          }
          function closeCompetitionWizard() { setCompetitionWizardOpen(false); setCompetitionWizardStep(1); }
          function toggleNewParticipant(profileId) {
            let id = String(profileId);
            setNewParticipantIds(newParticipantIds.includes(id) ? newParticipantIds.filter((item)=>item!==id) : [...newParticipantIds,id]);
          }
          function wizardCanContinue() {
            if (competitionWizardStep === 1) return true;
            if (competitionWizardStep === 2) {
              if (!tournamentName.trim()) return false;
              if (competitionType === "cup") return !!cupLeague;
              if (creationMode === "continue") return !!sourceTournament;
              return true;
            }
            if (competitionWizardStep === 3) {
              if (competitionType === "cup") return cupParticipantIds.length >= 4;
              if (creationMode === "continue") return Object.values(participantOverrides).filter((item)=>item&&item.include!==false).length >= 2;
              return newParticipantIds.length >= 2;
            }
            return true;
          }
          async function submitCompetitionWizard() {
            let options = competitionType === "cup"
              ? { competitionType:"cup", linkedLeagueId:cupLeagueId, groupLegs, cupPrize, cupParticipantIds }
              : creationMode === "continue"
                ? { competitionType:"league", mode:"continue", sourceTournamentId, inheritance, participantOverrides }
                : { competitionType:"league", mode:"new", newParticipantIds, newParticipantDrafts };
            try {
              let result = await onCreateTournament(options);
              if (result !== false) closeCompetitionWizard();
            } catch (error) {
              console.error("competition creation failed", error);
              window.alert("Não foi possível criar a competição. Os dados anteriores foram preservados.");
            }
          }
          function competitionChoiceCard(value, title, description) {
            let selected = competitionType === value;
            return React.createElement("button", { onClick:()=>setCompetitionType(value), style:{ textAlign:"left", padding:18, borderRadius:18, border:selected?"1px solid var(--green)":"1px solid var(--border)", background:selected?"color-mix(in srgb, var(--green) 10%, var(--surface))":"var(--surface-soft)", color:"var(--heading)", cursor:"pointer", minHeight:126 } },
              React.createElement("div", { style:{ fontSize:17, fontWeight:800, marginBottom:7 } }, title),
              React.createElement("div", { style:{ fontSize:12.5, lineHeight:1.5, color:"var(--muted)" } }, description),
              React.createElement("div", { style:{ marginTop:14, fontSize:12, fontWeight:800, color:selected?"var(--green)":"var(--muted)" } }, selected?"Selecionado":"Selecionar")
            );
          }
          function renderCompetitionWizard() {
            if (!competitionWizardOpen) return null;
            let stepLabels = ["Formato","Origem","Configuração","Revisão"];
            let title = competitionWizardStep === 1 ? "Que competição você quer criar?" : competitionWizardStep === 2 ? "Defina a origem" : competitionWizardStep === 3 ? "Configure a competição" : "Revise antes de criar";
            let content = null;
            if (competitionWizardStep === 1) {
              content = React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:12 } },
                competitionChoiceCard("league","Campeonato","Pontos corridos, tabela geral e partidas adicionadas pelos participantes."),
                competitionChoiceCard("cup","Copa","Fase de grupos, confrontos definidos e chaveamento mata-mata.")
              );
            } else if (competitionWizardStep === 2) {
              content = React.createElement("div", { style:{ display:"grid", gap:14 } },
                React.createElement("div", null, React.createElement("label", { style:P }, "Nome da competição"), React.createElement("input", { style:q, autoFocus:true, placeholder:competitionType==="cup"?"Ex: Copa de Inverno":"Ex: Temporada 3", value:tournamentName, onChange:(event)=>setTournamentName(event.target.value) })),
                competitionType === "league" ? React.createElement(React.Fragment,null,
                  React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 } },
                    [["new","Começar do zero"],["continue","Continuar temporada"]].map(([value,label])=>React.createElement("button", { key:value, disabled:value==="continue"&&!sourceCandidates.length, onClick:()=>setCreationMode(value), style:{ padding:13, borderRadius:14, border:creationMode===value?"1px solid var(--green)":"1px solid var(--border)", background:creationMode===value?"color-mix(in srgb, var(--green) 10%, var(--surface))":"var(--surface-soft)", color:"var(--heading)", fontWeight:750, opacity:value==="continue"&&!sourceCandidates.length?.45:1 } }, label))),
                  creationMode === "continue" && React.createElement("div", null, React.createElement("label", { style:P }, "Temporada anterior"), React.createElement("select", { style:q, value:sourceTournamentId, onChange:(event)=>setSourceTournamentId(event.target.value) }, sourceCandidates.map((item)=>React.createElement("option", { key:item.id, value:item.id }, item.name))))
                ) : React.createElement("div", null,
                  React.createElement("label", { style:P }, "Liga vinculada"),
                  React.createElement("select", { style:q, value:cupLeagueId, onChange:(event)=>setCupLeagueId(event.target.value) }, activeLeagues.length?activeLeagues.map((item)=>React.createElement("option", { key:item.id, value:item.id }, item.name)):React.createElement("option", { value:"" }, "Nenhuma liga ativa disponível")),
                  React.createElement("div", { style:{ fontSize:12, lineHeight:1.5, color:"var(--muted)", marginTop:8 } }, "A copa usa os mesmos times, elencos e carteira da liga escolhida.")
                )
              );
            } else if (competitionWizardStep === 3) {
              if (competitionType === "cup") {
                content = React.createElement("div", { style:{ display:"grid", gap:16 } },
                  React.createElement("div", null, React.createElement("label", { style:P }, "Jogos da fase de grupos"), React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 } }, [[1,"Somente ida"],[2,"Ida e volta"]].map(([value,label])=>React.createElement("button", { key:value, onClick:()=>setGroupLegs(value), style:{ padding:12,borderRadius:14,border:groupLegs===value?"1px solid var(--green)":"1px solid var(--border)",background:groupLegs===value?"color-mix(in srgb, var(--green) 10%, var(--surface))":"var(--surface-soft)",color:"var(--heading)",fontWeight:750 } }, label)))),
                  React.createElement("div", null, React.createElement("label", { style:P }, "Premiação do campeão"), React.createElement("input", { style:q, type:"number", min:0, value:cupPrize, onChange:(event)=>setCupPrize(event.target.value) })),
                  React.createElement("div", null, React.createElement("div", { style:{ fontWeight:800, marginBottom:4 } }, `Participantes · ${cupParticipantIds.length} selecionados`), React.createElement("div", { style:{ fontSize:12,color:"var(--muted)",marginBottom:10 } }, "Todos vêm selecionados por padrão. São necessários pelo menos quatro."), React.createElement("div", { style:{ display:"grid", gap:8, maxHeight:260, overflow:"auto" } }, (cupLeague&&Array.isArray(cupLeague.context&&cupLeague.context.teams)?cupLeague.context.teams:[]).filter((team)=>team&&team.active!==false&&team.profileId).map((team)=>{ let id=String(team.profileId), checked=cupParticipantIds.includes(id), profile=globalProfiles.find((item)=>String(item.id)===id); return React.createElement("button", { key:id,onClick:()=>setCupParticipantIds(checked?cupParticipantIds.filter((item)=>item!==id):[...cupParticipantIds,id]),style:{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 12px",borderRadius:12,border:"1px solid var(--border)",background:checked?"var(--surface-soft)":"transparent",color:"var(--heading)" } },React.createElement("span",null,profile?profile.name:team.name),React.createElement("strong",{style:{color:checked?"var(--green)":"var(--muted)"}},checked?"Incluído":"Adicionar")); })))
                );
              } else if (creationMode === "continue" && sourceTournament) {
                content = React.createElement("div", { style:{ display:"grid", gap:14 } },
                  React.createElement("div", null, React.createElement("div", { style:{ fontWeight:800, marginBottom:8 } }, "O que será herdado?"), [["participants","Participantes"],["balances","Saldos"],["rosters","Elencos"],["teamNames","Nomes dos times"]].map(([key,label])=>React.createElement("label", { key, style:{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid var(--border)" } },React.createElement("span",null,label),React.createElement("input",{type:"checkbox",checked:!!inheritance[key],onChange:(event)=>toggleInheritanceOption(key,event.target.checked)})))),
                  React.createElement("div", null, React.createElement("div", { style:{ fontWeight:800, marginBottom:8 } }, "Revise os participantes"), React.createElement("div", { style:{ display:"grid",gap:8,maxHeight:330,overflow:"auto" } }, (Array.isArray(sourceTournament.context&&sourceTournament.context.teams)?sourceTournament.context.teams.filter((team)=>team&&team.active!==false&&team.profileId):[]).map((team)=>{ let profile=globalProfiles.find((item)=>String(item.id)===String(team.profileId)); let draft=participantOverrides[String(team.profileId)]||{include:true,teamName:team.name||"",budget:Number(team.budget)||0,inheritRoster:true}; return React.createElement("div", { key:team.id,style:{padding:12,border:"1px solid var(--border)",borderRadius:14,opacity:draft.include===false?.5:1} },React.createElement("label",{style:{display:"flex",gap:8,alignItems:"center",fontWeight:800,marginBottom:9}},React.createElement("input",{type:"checkbox",checked:draft.include!==false,onChange:(event)=>setParticipantOverrides({...participantOverrides,[String(team.profileId)]:{...draft,include:event.target.checked}})}),profile?profile.name:team.name),React.createElement("div",{style:{display:"grid",gridTemplateColumns:"minmax(0,1fr) 105px",gap:8}},React.createElement("input",{style:q,disabled:draft.include===false,value:draft.teamName,onChange:(event)=>setParticipantOverrides({...participantOverrides,[String(team.profileId)]:{...draft,teamName:event.target.value}})}),React.createElement("input",{style:q,disabled:draft.include===false,type:"number",min:0,value:draft.budget,onChange:(event)=>setParticipantOverrides({...participantOverrides,[String(team.profileId)]:{...draft,budget:event.target.value}})})),inheritance.rosters&&React.createElement("label",{style:{display:"flex",gap:7,alignItems:"center",fontSize:12,color:"var(--muted)",marginTop:9}},React.createElement("input",{type:"checkbox",disabled:draft.include===false,checked:draft.inheritRoster!==false,onChange:(event)=>setParticipantOverrides({...participantOverrides,[String(team.profileId)]:{...draft,inheritRoster:event.target.checked}})}),"Herdar elenco")); })))
                );
              } else {
                content = React.createElement("div", null,
                  React.createElement("div", { style:{ fontWeight:800, marginBottom:4 } }, `Participantes · ${newParticipantIds.length} selecionados`),
                  React.createElement("div", { style:{ fontSize:12,color:"var(--muted)",marginBottom:10 } }, "Escolha quem começa na nova liga e ajuste nome do time e saldo inicial."),
                  React.createElement("div", { style:{ display:"grid",gap:8,maxHeight:360,overflow:"auto" } }, globalProfiles.map((profile)=>{ let id=String(profile.id),checked=newParticipantIds.includes(id),draft=newParticipantDrafts[id]||{teamName:profile.name,budget:Number(profileBudget)||300}; return React.createElement("div", { key:id,style:{padding:12,border:"1px solid var(--border)",borderRadius:14,opacity:checked?1:.5} },React.createElement("label",{style:{display:"flex",gap:8,alignItems:"center",fontWeight:800,marginBottom:9}},React.createElement("input",{type:"checkbox",checked,onChange:()=>toggleNewParticipant(id)}),profile.name),React.createElement("div",{style:{display:"grid",gridTemplateColumns:"minmax(0,1fr) 105px",gap:8}},React.createElement("input",{style:q,disabled:!checked,value:draft.teamName,onChange:(event)=>setNewParticipantDrafts({...newParticipantDrafts,[id]:{...draft,teamName:event.target.value}})}),React.createElement("input",{style:q,disabled:!checked,type:"number",min:0,value:draft.budget,onChange:(event)=>setNewParticipantDrafts({...newParticipantDrafts,[id]:{...draft,budget:event.target.value}})}))); }))
                );
              }
            } else {
              let participantCount = competitionType === "cup" ? cupParticipantIds.length : creationMode === "continue" ? Object.values(participantOverrides).filter((item)=>item&&item.include!==false).length : newParticipantIds.length;
              content = React.createElement("div", { style:{ display:"grid", gap:10 } },
                [["Tipo",competitionType==="cup"?"Copa · grupos + mata-mata":"Campeonato · pontos corridos"],["Nome",tournamentName],["Participantes",String(participantCount)]].map(([label,value])=>React.createElement("div",{key:label,style:{display:"flex",justifyContent:"space-between",gap:16,padding:"12px 0",borderBottom:"1px solid var(--border)"}},React.createElement("span",{style:{color:"var(--muted)"}},label),React.createElement("strong",{style:{textAlign:"right"}},value))),
                competitionType==="cup"&&React.createElement(React.Fragment,null,React.createElement("div",{style:{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid var(--border)"}},React.createElement("span",{style:{color:"var(--muted)"}},"Liga vinculada"),React.createElement("strong",null,cupLeague?cupLeague.name:"—")),React.createElement("div",{style:{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid var(--border)"}},React.createElement("span",{style:{color:"var(--muted)"}},"Fase de grupos"),React.createElement("strong",null,groupLegs===2?"Ida e volta":"Somente ida")),React.createElement("div",{style:{display:"flex",justifyContent:"space-between",padding:"12px 0"}},React.createElement("span",{style:{color:"var(--muted)"}},"Premiação"),React.createElement("strong",null,`${Math.max(0,Number(cupPrize)||0)}M`)))
              );
            }
            return ReactDOM.createPortal(React.createElement("div", { className:"sports-modal-overlay",onClick:closeCompetitionWizard,style:{position:"fixed",inset:0,zIndex:1500,display:"grid",placeItems:"center",padding:16,background:"rgba(0,0,0,.78)",backdropFilter:"blur(14px)"} },React.createElement("div",{onClick:(event)=>event.stopPropagation(),style:{width:"min(680px,100%)",maxHeight:"88vh",overflow:"hidden",display:"flex",flexDirection:"column",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:26,boxShadow:"0 28px 80px rgba(0,0,0,.45)"}},
              React.createElement("div",{style:{padding:"18px 20px 14px",borderBottom:"1px solid var(--border)"}},React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}},React.createElement("div",null,React.createElement("div",{style:{fontSize:12,color:"var(--muted)",marginBottom:3}},`Etapa ${competitionWizardStep} de 4`),React.createElement("div",{style:{fontSize:21,fontWeight:850}},title)),React.createElement("button",{onClick:closeCompetitionWizard,style:{width:36,height:36,borderRadius:999,border:"1px solid var(--border)",background:"var(--surface-soft)",color:"var(--heading)",fontSize:20}},"×")),React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginTop:14}},stepLabels.map((label,index)=>React.createElement("div",{key:label,style:{height:4,borderRadius:999,background:index<competitionWizardStep?"var(--green)":"var(--border)"}})))),
              React.createElement("div",{style:{padding:20,overflow:"auto"}},content),
              React.createElement("div",{style:{display:"grid",gridTemplateColumns:competitionWizardStep===1?"1fr":"auto 1fr",gap:10,padding:16,borderTop:"1px solid var(--border)",background:"color-mix(in srgb, var(--surface) 92%, transparent)"}},competitionWizardStep>1&&React.createElement("button",{onClick:()=>setCompetitionWizardStep(Math.max(1,competitionWizardStep-1)),style:{...M,background:"var(--surface-soft)",color:"var(--heading)",border:"1px solid var(--border)"}},"Voltar"),React.createElement("button",{disabled:!wizardCanContinue(),onClick:()=>competitionWizardStep<4?setCompetitionWizardStep(competitionWizardStep+1):submitCompetitionWizard(),style:{...M,...W,opacity:wizardCanContinue()?1:.45}},competitionWizardStep<4?"Continuar":competitionType==="cup"?"Sortear e criar copa":"Criar competição"))
            )),document.body);
          }
          const adminSections = {
            profiles: { title: "Perfis globais", description: "Gerencie usuários, permissões e acessos do app." },
            competitions: { title: "Competições", description: "Crie ligas, copas e novas temporadas." },
            participants: { title: "Participantes e times", description: "Defina quem participa, nomes dos times e saldos." },
            rules: { title: "Regras e economia", description: "Configure mercado, elenco, recompensas e premiações." },
            tools: { title: "Dados e ferramentas", description: "Importe elencos e execute tarefas administrativas." },
            danger: { title: "Zona de perigo", description: "Ações destrutivas e irreversíveis da competição." }
          };
          function adminHubCard(section, icon, title, description, meta, danger=false) {
            return React.createElement("button", { onClick:()=>setAdminSection(section), style:{ textAlign:"left",padding:20,borderRadius:20,border:`1px solid ${danger ? "color-mix(in srgb, var(--danger) 42%, var(--border))" : "var(--border)"}`,background:"linear-gradient(145deg,color-mix(in srgb,var(--surface) 96%,transparent),color-mix(in srgb,var(--surface-soft) 78%,transparent))",color:"var(--heading)",cursor:"pointer",minHeight:150,display:"flex",flexDirection:"column",justifyContent:"space-between",gap:18,transition:"transform .18s ease,border-color .18s ease",boxShadow:"inset 0 1px 0 rgba(255,255,255,.035)" } },
              React.createElement("div", { style:{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 } },
                React.createElement("span", { style:{ width:44,height:44,borderRadius:14,display:"grid",placeItems:"center",background:danger?"color-mix(in srgb,var(--danger) 13%,transparent)":"var(--surface-soft)",color:danger?"var(--danger)":"var(--green)" } }, icon),
                React.createElement("span", { style:{ fontSize:24,color:"var(--muted)" } }, "→")
              ),
              React.createElement("div", null,
                React.createElement("div", { style:{ fontSize:18,fontWeight:850,marginBottom:6,color:danger?"var(--danger)":"var(--heading)" } }, title),
                React.createElement("div", { style:{ fontSize:13,color:"var(--muted)",lineHeight:1.48 } }, description),
                meta && React.createElement("div", { style:{ marginTop:11,fontSize:12,fontWeight:750,color:danger?"var(--danger)":"var(--green)" } }, meta)
              )
            );
          }
          if (adminSection === "home") {
            let activeCompetitions=(tournaments||[]).filter((item)=>item&&item.status!=="finished").length;
            let finishedCompetitions=(tournaments||[]).filter((item)=>item&&item.status==="finished").length;
            let activeTeams=(teams||[]).filter((team)=>team&&team.active!==false).length;
            return React.createElement("div", null,
              React.createElement(Z, { icon: React.createElement(AdminIcon, { size:17 }), text:"Administração" }),
              React.createElement("div", { style:{ margin:"4px 0 20px" } },
                React.createElement("h1", { style:{ margin:"0 0 7px",fontSize:"clamp(28px,4vw,42px)",letterSpacing:"-.035em" } }, "Central de gestão"),
                React.createElement("p", { style:{ margin:0,color:"var(--muted)",fontSize:14,lineHeight:1.55,maxWidth:620 } }, "Gerencie pessoas, competições e regras sem misturar tarefas rotineiras com ações sensíveis.")
              ),
              React.createElement("div", { style:{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12 } },
                adminHubCard("profiles", React.createElement(UserIcon,{size:22}), "Perfis globais", "Crie e gerencie usuários e permissões.", `${globalProfiles.length} perfis ativos`),
                adminHubCard("competitions", React.createElement(TrophyIcon,{size:22}), "Competições", "Crie ligas, copas e continue temporadas.", `${activeCompetitions} em andamento · ${finishedCompetitions} encerradas`),
                adminHubCard("participants", React.createElement(TeamIcon,{size:22}), "Participantes e times", "Gerencie participantes, times e carteiras da competição selecionada.", currentTournament ? `${activeTeams} participantes em ${currentTournament.name}` : "Selecione uma competição"),
                adminHubCard("rules", React.createElement(SettingsIcon,{size:22}), "Regras e economia", "Defina mercado, limites de elenco, recompensas e premiação.", currentTournament ? `Editando ${currentTournament.name}` : "Selecione uma competição"),
                adminHubCard("tools", React.createElement(DatabaseIcon,{size:22}), "Dados e ferramentas", "Importe elencos e execute tarefas de manutenção.", "Ferramentas administrativas"),
                adminHubCard("danger", React.createElement(TrashIcon,{size:22}), "Zona de perigo", "Resete ou remova dados da competição com confirmação reforçada.", currentTournament ? currentTournament.name : "Nenhuma competição selecionada", true)
              )
            );
          }
          let importErrors = importPreview ? importPreview.entries.filter((entry) => entry.status !== "matched") : [];
          let sectionInfo=adminSections[adminSection]||adminSections.competitions;
          return React.createElement("div", null,
            React.createElement("div", { style:{ display:"flex",alignItems:"center",gap:12,marginBottom:18 } },
              React.createElement("button", { onClick:()=>setAdminSection("home"),style:{ width:40,height:40,borderRadius:999,border:"1px solid var(--border)",background:"var(--surface-soft)",color:"var(--heading)",fontSize:22,cursor:"pointer" } },"‹"),
              React.createElement("div", null,React.createElement("div",{style:{fontSize:12,color:"var(--muted)",marginBottom:2}},"Administração"),React.createElement("div",{style:{fontSize:24,fontWeight:850}},sectionInfo.title),React.createElement("div",{style:{fontSize:12.5,color:"var(--muted)",marginTop:3}},sectionInfo.description))
            ),
            adminSection === "profiles" && React.createElement("div", { style: E },
              React.createElement("div", { style: { fontSize: 18, fontWeight: 700, marginBottom: 4 } }, "Perfis globais"),
              React.createElement("div", { style: { fontSize: 13, color: "var(--muted)", marginBottom: 14 } }, "Crie cada pessoa uma única vez. Depois, escolha em quais campeonatos ela participa."),
              React.createElement("label", { style: P }, "Nome"),
              React.createElement("input", { style: q, value: profileName, onChange: (event) => setProfileName(event.target.value), placeholder: "Nome do jogador" }),
              React.createElement("label", { style: { ...P, marginTop: 14 } }, "Cor"),
              React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 } }, se.map((color) => React.createElement("button", { key: color, onClick: () => setProfileColor(color), style: { width: 32, height: 32, borderRadius: 999, background: color, border: profileColor === color ? "3px solid var(--heading)" : "2px solid transparent", cursor: "pointer" } }))),
              React.createElement("button", { style: { ...M, ...W }, disabled: !profileName.trim(), onClick: onCreateProfile }, "Criar perfil global"),
              globalProfiles.length ? React.createElement("div", { style: { marginTop: 18, display: "grid", gap: 8 } }, globalProfiles.map((profile) => React.createElement("div", { key: profile.id, style: { display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, background: "var(--surface-soft)" } }, React.createElement("div", { style: { width: 34, height: 34, borderRadius: 999, background: profile.color, overflow: "hidden", display: "grid", placeItems: "center", fontWeight: 700 } }, profile.avatar ? React.createElement("img", { src: profile.avatar, style: { width: "100%", height: "100%", objectFit: "cover" } }) : profile.name.charAt(0).toUpperCase()), React.createElement("div", { style: { flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 } }, React.createElement("strong", { style: { overflow: "hidden", textOverflow: "ellipsis" } }, profile.name), profile.role === "admin" ? React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "var(--green)", border: "1px solid color-mix(in srgb, var(--green) 45%, transparent)", background: "color-mix(in srgb, var(--green) 10%, transparent)", borderRadius: 999, padding: "4px 7px", textTransform: "uppercase", letterSpacing: ".05em" } }, "Admin") : null), profile.role !== "admin" ? React.createElement("button", { onClick: () => onDeleteProfile(profile.id), style: { background: "transparent", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: 999, padding: "7px 10px", cursor: "pointer", fontSize: 12, fontWeight: 700 } }, "Excluir") : null))) : null
            ),
            adminSection === "competitions" && React.createElement("div", { style: E },
              React.createElement("div", { style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16} },
                React.createElement("div", null,
                  React.createElement("div", { style:{fontSize:18,fontWeight:800,marginBottom:4} }, "Competições"),
                  React.createElement("div", { style:{fontSize:13,color:"var(--muted)",lineHeight:1.45} }, "Crie uma liga ou uma copa em um fluxo guiado, revise tudo e só então confirme.")
                ),
                React.createElement("button", { onClick:openCompetitionWizard, style:{...M,whiteSpace:"nowrap"} }, "+ Nova competição")
              )
            ),
            adminSection === "competitions" && renderCompetitionWizard(),
            adminSection === "competitions" && React.createElement("div", { style: E },
              React.createElement("div", { style: { fontSize: 18, fontWeight: 700, marginBottom: 14 } }, "Competições existentes"),
              tournaments.length ? tournaments.map((tournament) => React.createElement("div", { key: tournament.id, style: { display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--border)" } },
                React.createElement("button", { onClick: () => onSelectTournament(tournament.id), style: { flex: 1, background: tournament.id === (currentTournament && currentTournament.id) ? "var(--surface-soft)" : "transparent", border: "1px solid var(--border)", borderRadius: 10, padding: 10, textAlign: "left", fontWeight: 700, color: "var(--heading)", cursor: "pointer" } }, React.createElement("div", null, tournament.name), React.createElement("div", { style:{fontSize:11,color:"var(--muted)",marginTop:3,fontWeight:650} }, tournament.type === "cup" ? "Copa" : "Liga", " · ", tournament.status === "finished" ? "Encerrada" : "Em andamento")),
                React.createElement("button", { onClick: () => onDeleteTournament(tournament.id), style: { background: "transparent", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: 999, padding: "8px 12px", cursor: "pointer" } }, "Excluir")
              )) : React.createElement("div", { style: { color: "var(--muted)" } }, "Nenhum campeonato criado.")
            ),
            adminSection === "participants" && currentTournament && React.createElement("div", { style: E },
              React.createElement("div", { style: { fontSize: 18, fontWeight: 700, marginBottom: 4 } }, "Participantes"),
              React.createElement("div", { style: { fontSize: 13, color: "var(--muted)", marginBottom: 14 } }, "Selecione quem participa de ", currentTournament.name, ". Ao remover, o histórico e o elenco são preservados."),
              React.createElement("label", { style: P }, "Moedas iniciais para novos participantes"),
              React.createElement("input", { type: "number", min: 0, style: q, value: profileBudget, onChange: (event) => setProfileBudget(event.target.value) }),
              globalProfiles.length ? React.createElement("div", { style: { display: "grid", gap: 8, marginTop: 14 } }, globalProfiles.map((profile) => {
                let checked = participants.includes(profile.id) || (!Array.isArray(currentTournament.participants) && ((Array.isArray(profile.tournamentIds) && profile.tournamentIds.includes(currentTournament.id)) || teams.some((team) => team.profileId === profile.id || team.id === profile.teamId || String(team.name || "").trim().toLowerCase() === String(profile.name || "").trim().toLowerCase())));
                return React.createElement("button", { key: profile.id, onClick: () => onToggleParticipant(profile.id), style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: checked ? "var(--surface-soft)" : "var(--surface)", color: "var(--heading)", cursor: "pointer" } }, React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 10 } }, React.createElement("span", { style: { width: 30, height: 30, borderRadius: 999, background: profile.color, display: "grid", placeItems: "center", fontWeight: 700 } }, profile.name.charAt(0).toUpperCase()), React.createElement("strong", null, profile.name)), React.createElement("span", { style: { fontWeight: 700, color: checked ? "var(--green)" : "var(--muted)" } }, checked ? "Participando" : "Adicionar"));
              })) : React.createElement("div", { style: { color: "var(--muted)" } }, "Crie um perfil global primeiro.")
            ),
            currentTournament && orphanTeams.length > 0 && React.createElement("div", { style: { ...E, border: "1px solid color-mix(in srgb, var(--danger) 35%, var(--border))" } },
              React.createElement("div", { style: { fontSize: 18, fontWeight: 700, marginBottom: 4 } }, "Participantes órfãos"),
              React.createElement("div", { style: { fontSize: 13, color: "var(--muted)", lineHeight: 1.5, marginBottom: 14 } }, "Estes times ainda existem no campeonato, mas o perfil global correspondente foi removido. Você pode restaurar o perfil ou retirar o time da classificação ativa sem apagar partidas antigas."),
              React.createElement("div", { style: { display: "grid", gap: 8 } }, orphanTeams.map((team) => React.createElement("div", { key: team.id, style: { display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", gap: 8, padding: 10, borderRadius: 10, background: "var(--surface-soft)" } },
                React.createElement("div", { style: { minWidth: 0 } }, React.createElement("strong", { style: { display: "block", overflow: "hidden", textOverflow: "ellipsis" } }, team.archivedProfileName || team.profileName || team.name || "Perfil removido"), React.createElement("span", { style: { fontSize: 11, color: "var(--muted)" } }, team.name || "Time sem nome")),
                React.createElement("button", { onClick: () => onRestoreOrphanProfile(team.id), style: { background: "transparent", color: "var(--heading)", border: "1px solid var(--border)", borderRadius: 999, padding: "7px 10px", cursor: "pointer", fontSize: 12, fontWeight: 700 } }, "Restaurar"),
                React.createElement("button", { onClick: () => onRemoveOrphanParticipant(team.id), style: { background: "transparent", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: 999, padding: "7px 10px", cursor: "pointer", fontSize: 12, fontWeight: 700 } }, "Remover")
              )))
            ),
            adminSection === "rules" && currentTournament && React.createElement("div", { style:{...E,textAlign:"center",padding:20,background:"linear-gradient(145deg,color-mix(in srgb,#ffbb26 8%,var(--surface)),var(--surface))"} },React.createElement(TrophyAsset,{tournament:currentTournament,size:92}),React.createElement("div",{style:{fontSize:20,fontWeight:900,marginTop:4}},currentTournament.name),React.createElement("div",{style:{fontSize:12,color:"var(--muted)",marginTop:4}},currentTournament.type==="cup"?"Copa • Editor da competição":"Liga • Editor da competição")),
            adminSection === "rules" && currentTournament && React.createElement("div", { style: E },
              React.createElement("div", { style: { fontSize: 18, fontWeight: 700, marginBottom: 4 } }, "Mercado · Taxas do Lobo Pidão"),
              React.createElement("div", { style: { fontSize: 13, color: "var(--muted)", lineHeight: 1.5, marginBottom: 14 } }, "Defina quanto será descontado do valor de mercado quando um participante fizer uma venda imediata. Ofertas entre usuários não usam essa taxa."),
              React.createElement("label", { style: P }, "Depreciação na venda ao mercado"),
              React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" } },
                React.createElement("input", { type: "range", min: 0, max: 100, step: 1, value: currentTournament.marketSettings && currentTournament.marketSettings.depreciationPct != null ? currentTournament.marketSettings.depreciationPct : 10, onChange: (event) => onUpdateMarketDepreciation(event.target.value), style: { width: "100%", accentColor: "var(--green)" } }),
                React.createElement("div", { style: { minWidth: 68, textAlign: "center", padding: "9px 10px", borderRadius: 10, background: "var(--surface-soft)", fontWeight: 800 } }, (currentTournament.marketSettings && currentTournament.marketSettings.depreciationPct != null ? currentTournament.marketSettings.depreciationPct : 10), "%")
              ),
              React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)", marginTop: 10 } }, "Exemplo: um jogador de 15 moedas rende ", Math.ceil(15 * (1 - (currentTournament.marketSettings && currentTournament.marketSettings.depreciationPct != null ? currentTournament.marketSettings.depreciationPct : 10) / 100)), " moedas."),
              React.createElement("div", { style:{ height:1, background:"var(--border)", margin:"20px 0" } }),
              React.createElement("label", { style: P }, "Depreciação do elenco-base"),
              React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" } },
                React.createElement("input", { type: "range", min: 0, max: 100, step: 1, value: currentTournament.marketSettings && currentTournament.marketSettings.initialRosterDepreciationPct != null ? currentTournament.marketSettings.initialRosterDepreciationPct : 50, onChange: (event) => onUpdateInitialRosterDepreciation(event.target.value), style: { width: "100%", accentColor: "var(--green)" } }),
                React.createElement("div", { style: { minWidth: 68, textAlign: "center", padding: "9px 10px", borderRadius: 10, background: "var(--surface-soft)", fontWeight: 800 } }, (currentTournament.marketSettings && currentTournament.marketSettings.initialRosterDepreciationPct != null ? currentTournament.marketSettings.initialRosterDepreciationPct : 50), "%")
              ),
              React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)", marginTop: 10, lineHeight:1.45 } }, "Aplicada somente ao vender para o mercado um jogador que ainda pertence ao time para o qual foi importado originalmente.")
            ),
            adminSection === "rules" && currentTournament && React.createElement("div", { style: E },
              React.createElement("div", { style: { fontSize: 18, fontWeight: 700, marginBottom: 4 } }, "Regras do elenco"),
              React.createElement("div", { style: { fontSize: 13, color: "var(--muted)", lineHeight: 1.5, marginBottom: 14 } }, "Define quantos jogadores cada time precisa manter e o limite para novas contratações."),
              React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
                React.createElement("div", null, React.createElement("label", { style: P }, "Mínimo"), React.createElement("input", { type: "number", min: 0, max: 99, style: q, value: currentTournament.rosterSettings && currentTournament.rosterSettings.minPlayers != null ? currentTournament.rosterSettings.minPlayers : 23, onChange: (event) => onUpdateRosterRules(event.target.value, currentTournament.rosterSettings && currentTournament.rosterSettings.maxPlayers != null ? currentTournament.rosterSettings.maxPlayers : 30) })),
                React.createElement("div", null, React.createElement("label", { style: P }, "Máximo"), React.createElement("input", { type: "number", min: 1, max: 99, style: q, value: currentTournament.rosterSettings && currentTournament.rosterSettings.maxPlayers != null ? currentTournament.rosterSettings.maxPlayers : 30, onChange: (event) => onUpdateRosterRules(currentTournament.rosterSettings && currentTournament.rosterSettings.minPlayers != null ? currentTournament.rosterSettings.minPlayers : 23, event.target.value) }))
              ),
              React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)", marginTop: 10 } }, "Times fora do novo limite mantêm seus jogadores, mas ficam impedidos de comprar ou vender até regularizarem o elenco.")
            ),
            adminSection === "participants" && currentTournament && React.createElement("div", { style: E },
              React.createElement("div", { style: { fontSize: 18, fontWeight: 700, marginBottom: 4 } }, "Moedas dos participantes"),
              React.createElement("div", { style: { fontSize: 13, color: "var(--muted)", marginBottom: 14 } }, currentTournament.name),
              teams.filter((team) => team.active !== false).length ? teams.filter((team) => team.active !== false).map((team) => React.createElement("div", { key: team.id, style: { display: "grid", gridTemplateColumns: "1fr 120px", gap: 10, alignItems: "center", marginBottom: 10 } }, React.createElement("div", { style: { fontWeight: 700 } }, team.name), React.createElement("input", { type: "number", min: 0, style: { ...q, padding: "9px 10px" }, value: team.budget, onChange: (event) => onUpdateBudget(team.id, event.target.value) }))) : React.createElement("div", { style: { color: "var(--muted)" } }, "Nenhum participante ativo.")
            ),
            adminSection === "tools" && currentTournament && React.createElement("div", { style: E },
              React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4 } },
                React.createElement("div", { style: { fontSize: 18, fontWeight: 700 } }, "Importar elencos por TXT"),
                React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "var(--ember)", background: "var(--surface-soft)", borderRadius: 999, padding: "5px 8px" } }, "Ferramenta temporária")
              ),
              React.createElement("div", { style: { fontSize: 13, color: "var(--muted)", lineHeight: 1.5, marginBottom: 14 } }, "Use o arquivo do sorteio para preencher os elencos de ", currentTournament.name, ". A importação preserva as moedas e só grava depois da prévia."),
              React.createElement("input", { type: "file", accept: ".txt,text/plain", onChange: readImportFile, style: { ...q, padding: 10, marginBottom: 10 } }),
              React.createElement("textarea", { value: importText, onChange: (event) => { setImportText(event.target.value); setImportPreview(null); }, placeholder: "Ou cole aqui o conteúdo do TXT...", rows: 7, style: { ...q, resize: "vertical", minHeight: 140, fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: 11.5 } }),
              React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 } },
                React.createElement("button", { onClick: () => setImportMode("replace"), style: { padding: 11, borderRadius: 10, border: importMode === "replace" ? "2px solid var(--heading)" : "1px solid var(--border)", background: importMode === "replace" ? "var(--surface-soft)" : "var(--surface)", color: "var(--heading)", cursor: "pointer", fontWeight: 700 } }, "Substituir elencos"),
                React.createElement("button", { onClick: () => setImportMode("add"), style: { padding: 11, borderRadius: 10, border: importMode === "add" ? "2px solid var(--heading)" : "1px solid var(--border)", background: importMode === "add" ? "var(--surface-soft)" : "var(--surface)", color: "var(--heading)", cursor: "pointer", fontWeight: 700 } }, "Adicionar aos atuais")
              ),
              React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)", marginTop: 8, lineHeight: 1.45 } }, importMode === "replace" ? "Remove os jogadores atuais apenas dos times presentes no TXT e aplica os novos elencos." : "Mantém os elencos atuais. Jogadores que já pertencem a outro time bloquearão a importação."),
              React.createElement("button", { disabled: !importText.trim(), onClick: buildImportPreview, style: { ...M, ...W, opacity: importText.trim() ? 1 : 0.45 } }, "Gerar prévia"),
              importPreview && React.createElement("div", { style: { marginTop: 18 } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10 } },
                  React.createElement("strong", null, importPreview.total, " jogadores identificados"),
                  React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: importErrors.length ? "var(--danger)" : "var(--green)" } }, importErrors.length ? importErrors.length + " pendências" : "Pronto para importar")
                ),
                importPreview.owners.map((owner) => React.createElement("div", { key: owner.name, style: { padding: "8px 10px", borderRadius: 8, background: "var(--surface-soft)", marginBottom: 6, fontSize: 12.5 } },
                  React.createElement("strong", null, owner.name), " — ", owner.status === "ok" ? owner.team.name : owner.status === "profile_missing" ? "perfil global não encontrado" : "perfil não participa deste campeonato"
                )),
                React.createElement("div", { style: { maxHeight: 360, overflow: "auto", marginTop: 12, borderTop: "1px solid var(--border)" } }, importPreview.entries.map((entry, index) => {
                  let matched = entry.playerId ? (catalog || []).find((player) => player.id === entry.playerId) : null;
                  return React.createElement("div", { key: index, style: { padding: "10px 0", borderBottom: "1px solid var(--border)", display: "grid", gap: 6 } },
                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 10 } },
                      React.createElement("div", null, React.createElement("strong", { style: { fontSize: 13 } }, entry.txtName), React.createElement("div", { style: { fontSize: 11, color: "var(--muted)" } }, entry.ownerName, " · ", entry.position, " · OVR ", entry.overall)),
                      React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: entry.status === "matched" ? "var(--green)" : "var(--danger)" } }, entry.status === "matched" ? "Encontrado" : entry.status === "ambiguous" ? "Ambíguo" : entry.status === "duplicate" ? "Duplicado" : entry.status === "owner_error" ? "Perfil inválido" : "Não encontrado")
                    ),
                    (entry.status === "ambiguous" || entry.status === "not_found" || entry.status === "duplicate") && React.createElement("select", { value: entry.playerId || "", onChange: (event) => resolveImportEntry(index, event.target.value), style: { ...q, padding: "8px 10px", fontSize: 12 } },
                      React.createElement("option", { value: "" }, "Selecionar jogador manualmente"),
                      (entry.candidates && entry.candidates.length ? entry.candidates.map((candidate) => candidate.player) : (catalog || []).filter((player) => importNameVariants(player.name).some((name) => name.includes(normalizeImportText(entry.txtName).split(" ")[0]))).slice(0, 30)).map((player) => React.createElement("option", { key: player.id, value: player.id }, player.name, " · ", player.position, " · OVR ", player.overall, " · ", player.club))
                    ),
                    matched && entry.status === "matched" && React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)" } }, "Vinculado a ", matched.name, " · ", matched.club)
                  );
                })),
                React.createElement("button", { disabled: importErrors.length > 0, onClick: () => { if (!window.confirm(`Importar ${importPreview.entries.length} jogadores para ${currentTournament.name}?`)) return; onImportRosters({ entries: importPreview.entries.map((entry) => ({ playerId: entry.playerId, teamId: entry.teamId, squadRole: entry.squadRole })) }, importMode); }, style: { ...M, ...W, opacity: importErrors.length ? 0.45 : 1 } }, importErrors.length ? "Resolva as pendências" : "Confirmar importação")
              )
            ),
            adminSection === "tools" && React.createElement("div", { style:{ ...E,marginTop:18 } },
              React.createElement("div", { style:{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:4 } },React.createElement("div", { style:{ fontSize:18,fontWeight:700 } },"Importar competição encerrada"),React.createElement("span", { style:{ fontSize:11,fontWeight:700,color:"#ffbb26",background:"var(--surface-soft)",borderRadius:999,padding:"5px 8px" } },"Histórico")),
              React.createElement("div", { style:{ fontSize:13,color:"var(--muted)",lineHeight:1.5,marginBottom:14 } },"Importe uma Liga ou Copa antiga sem elencos, mercado ou economia. O tipo é identificado automaticamente pelo TXT."),
              React.createElement("input", { type:"file",accept:".txt,text/plain",onChange:readHistoryImportFile,style:{...q,padding:10,marginBottom:10} }),
              React.createElement("textarea", { value:historyImportText,onChange:(event)=>{setHistoryImportText(event.target.value);setHistoryImportPreview(null);setHistoryMappings({});},placeholder:"Ou cole aqui o conteúdo do TXT histórico...",rows:8,style:{...q,resize:"vertical",minHeight:160,fontFamily:"ui-monospace,SFMono-Regular,Menlo,monospace",fontSize:11.5} }),
              React.createElement("button", { disabled:!historyImportText.trim(),onClick:buildHistoryImportPreview,style:{...M,...W,opacity:historyImportText.trim()?1:.45} },"Ler competição"),
              historyImportPreview&&React.createElement("div", { style:{marginTop:18} },
                React.createElement("div", { className:"family-card",style:{padding:14,marginBottom:12} },React.createElement("div", { style:{fontSize:11,color:"var(--muted)",fontWeight:800,textTransform:"uppercase",letterSpacing:".1em"} },historyImportPreview.type==="cup"?"Copa encerrada":"Liga encerrada"),React.createElement("div", { style:{fontSize:18,fontWeight:850,marginTop:4} },historyImportPreview.name),React.createElement("div", { style:{fontSize:12,color:"var(--muted)",marginTop:4} },`${historyImportPreview.names.length} participantes${historyImportPreview.type==="cup"?` · Campeão: ${historyImportPreview.champion}`:""}`)),
                React.createElement("div", { style:{fontSize:13,fontWeight:800,marginBottom:8} },"Vincular participantes"),
                React.createElement("div", { style:{display:"grid",gap:8,maxHeight:390,overflow:"auto"} },historyImportPreview.names.map((name)=>React.createElement("div", { key:name,style:{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1.2fr)",gap:10,alignItems:"center",padding:10,border:"1px solid var(--border)",borderRadius:12} },React.createElement("div", { style:{fontWeight:800,fontSize:13} },name),React.createElement("select", { value:historyMappings[name]||"",onChange:(event)=>setHistoryMappings({...historyMappings,[name]:event.target.value}),style:{...q,padding:"9px 10px",fontSize:12} },React.createElement("option", { value:"" },"Selecionar perfil"),globalProfiles.map((profile)=>React.createElement("option", { key:profile.id,value:profile.id },profile.name)))))),
                React.createElement("button", { onClick:confirmHistoryImport,disabled:historyImportPreview.names.some((name)=>!historyMappings[name]),style:{...M,...W,opacity:historyImportPreview.names.some((name)=>!historyMappings[name])?.45:1} },historyImportPreview.names.some((name)=>!historyMappings[name])?"Vincule todos os participantes":"Confirmar importação")
              )
            ),
            adminSection === "rules" && currentTournament && React.createElement("section", { style:{ ...E,padding:20,marginTop:18 } },
              React.createElement("h3", { style:{ margin:"0 0 6px" } }, "Economia e premiação"),
              React.createElement("div", { style:{ fontSize:12,color:"var(--muted)",marginBottom:14,lineHeight:1.5 } }, "Defina recompensas por resultado e a faixa de premiação final."),
              React.createElement(EconomyAdminForm, { tournament:currentTournament, onSave:onUpdateEconomyRules }),
              currentTournament.type !== "cup" && React.createElement(MarketAccessAdminForm, { tournament:currentTournament, onSave:onUpdateMarketAccessRules }),
              currentTournament.type !== "cup" && React.createElement(MarketBalanceAdminForm, { tournament:currentTournament, teams, catalog, onSave:onUpdateMarketBalanceRules }),
              React.createElement("button", { onClick:onFinishTournament, disabled:currentTournament.status==="finished", style:{ ...M,marginTop:14,background:currentTournament.status==="finished"?"var(--surface-soft)":"var(--ink)",color:currentTournament.status==="finished"?"var(--muted)":"var(--surface)",cursor:currentTournament.status==="finished"?"not-allowed":"pointer" } }, currentTournament.status==="finished"?"Campeonato encerrado":"Encerrar campeonato")
            ),
            adminSection === "danger" && currentTournament && React.createElement("div", { style: { ...E, border: "1px solid color-mix(in srgb, var(--danger) 40%, var(--border))" } },
              React.createElement("div", { style: { fontSize: 18, fontWeight: 700, color: "var(--danger)", marginBottom: 4 } }, "Zona de perigo"),
              React.createElement("div", { style: { fontSize: 13, color: "var(--muted)", lineHeight: 1.5, marginBottom: 14 } }, "O reset mantém o campeonato e seus participantes, mas apaga partidas, tabela, elencos, mercado, propostas, transferências e estatísticas. Esta ação não pode ser desfeita."),
              React.createElement("button", { onClick: onResetTournament, style: { width: "100%", background: "transparent", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: 999, padding: "11px 14px", cursor: "pointer", fontWeight: 700 } }, "Resetar campeonato")
            )
          );
        }
        function uo({
          tournaments: e,
          teamById: t,
          historyOpen: l,
          setHistoryOpen: a,
        }) {
          return e.length === 0
            ? React.createElement(
                "div",
                {
                  style: {
                    color: "var(--muted)",
                    fontSize: 13,
                    textAlign: "center",
                    padding: 30,
                  },
                },
                "Nenhuma temporada encerrada ainda.",
              )
            : React.createElement(
                "div",
                null,
                React.createElement(Z, {
                  icon: React.createElement(ze, { size: 15 }),
                  text: "Hist\xF3rico de temporadas",
                }),
                e
                  .slice()
                  .reverse()
                  .map((n) => {
                    var f;
                    let r = l === n.id;
                    return React.createElement(
                      "div",
                      { key: n.id, style: E },
                      React.createElement(
                        "button",
                        {
                          onClick: () => a(r ? null : n.id),
                          style: {
                            background: "none",
                            border: "none",
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            padding: 0,
                            color: "var(--heading)",
                          },
                        },
                        React.createElement(
                          "div",
                          { style: { textAlign: "left" } },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 11,
                                color: "var(--green)",
                                fontWeight: 700,
                              },
                            },
                            "TEMPORADA ",
                            n.season,
                          ),
                          React.createElement(
                            "div",
                            { style: { fontWeight: 800, fontSize: 15 } },
                            n.name,
                          ),
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 12,
                                color: "var(--muted)",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                marginTop: 2,
                              },
                            },
                            React.createElement(tt, {
                              size: 12,
                              color: "var(--green)",
                            }),
                            " ",
                            (f = t(n.champion)) == null ? void 0 : f.name,
                          ),
                        ),
                        React.createElement(Ze, {
                          size: 18,
                          style: {
                            transform: r ? "rotate(180deg)" : "none",
                            transition: "transform 0.15s",
                          },
                          color: "var(--muted)",
                        }),
                      ),
                      r &&
                        React.createElement(
                          "div",
                          { style: { marginTop: 12 } },
                          React.createElement(
                            "div",
                            {
                              style: {
                                fontSize: 12,
                                color: "var(--muted)",
                                marginBottom: 6,
                              },
                            },
                            "Formato: ",
                            n.format === "liga"
                              ? "Liga"
                              : n.format === "mata-mata"
                                ? "Mata-mata"
                                : "Grupos + Mata-mata",
                          ),
                          React.createElement(
                            "div",
                            { style: { fontSize: 12, color: "var(--muted)" } },
                            n.matches.filter((d) => d.played).length,
                            " partidas disputadas",
                          ),
                        ),
                    );
                  }),
              );
        }
        function ChampionshipSummaryModal({ tournament, profiles, onClose }) {
          let rows = Array.isArray(tournament && tournament.finalStandings) ? tournament.finalStandings : [];
          if (tournament && tournament.type === "cup") {
            let matches = Array.isArray(tournament.matches) ? tournament.matches : [];
            let groups = Array.isArray(tournament.groups) ? tournament.groups : [];
            let knockout = matches.filter((match) => match.stage === "knockout");
            let rounds = [...new Set(knockout.map((match) => match.round || 1))].sort((a,b)=>a-b);
            let contextTeams = Array.isArray(tournament.context && tournament.context.teams) ? tournament.context.teams : [];
            let teamName = (id) => {
              let snap = rows.find((row) => String(row.teamId) === String(id));
              let team = contextTeams.find((item) => String(item.id) === String(id));
              return (snap && snap.teamNameSnapshot) || (team && team.name) || "Time";
            };
            let groupCards = groups.map((group) => React.createElement("div", { key:group.name, className:"family-card", style:{ padding:12 } },
              React.createElement("div", { style:{ fontWeight:850, marginBottom:7 } }, group.name),
              group.teamIds.map((id) => React.createElement("div", { key:id, style:{ fontSize:12, color:"var(--muted)", padding:"3px 0" } }, teamName(id)))
            ));
            let roundCards = rounds.map((round) => {
              let roundMatches = knockout.filter((match) => (match.round || 1) === round);
              let label = roundMatches.length === 1 ? "Final" : roundMatches.length === 2 ? "Semifinal" : roundMatches.length === 4 ? "Quartas de final" : `Fase ${round}`;
              return React.createElement("div", { key:round, className:"family-card", style:{ flex:"0 0 260px", padding:12 } },
                React.createElement("div", { style:{ fontSize:11, color:"var(--muted)", fontWeight:850, textTransform:"uppercase", marginBottom:8 } }, label),
                roundMatches.map((match) => React.createElement("div", { key:match.id, style:{ padding:"8px 0", borderBottom:"1px solid var(--border)", fontSize:12 } },
                  React.createElement("div", { style:{ display:"flex", justifyContent:"space-between", gap:8 } }, React.createElement("span", null, teamName(match.homeId)), React.createElement("strong", null, match.played ? match.homeScore : "-")),
                  React.createElement("div", { style:{ display:"flex", justifyContent:"space-between", gap:8, marginTop:4 } }, React.createElement("span", null, teamName(match.awayId)), React.createElement("strong", null, match.played ? match.awayScore : "-"))
                ))
              );
            });
            return React.createElement(ee, { title:tournament.name, onClose },
              React.createElement("div", { style:{ textAlign:"center", marginBottom:18 } },
                React.createElement(TrophyAsset,{tournament,size:92}),
                React.createElement("div", { style:{ fontSize:20, fontWeight:900 } }, rows[0] && rows[0].profileNameSnapshot || "Campeão"),
                React.createElement("div", { style:{ color:"var(--muted)", fontSize:13, marginTop:4 } }, `${rows[0] && rows[0].teamNameSnapshot || ""} · +${L(rows[0] && rows[0].prize || 0)}`)
              ),
              groups.length ? React.createElement("div", { style:{ marginBottom:18 } },
                React.createElement("div", { style:{ fontWeight:850, marginBottom:10 } }, "Fase de grupos"),
                React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:8 } }, groupCards)
              ) : null,
              rounds.length ? React.createElement("div", null,
                React.createElement("div", { style:{ fontWeight:850, marginBottom:10 } }, "Mata-mata"),
                React.createElement("div", { style:{ display:"flex", gap:10, overflowX:"auto", paddingBottom:10 } }, roundCards)
              ) : null
            );
          }
          return React.createElement(ee, { title:tournament ? tournament.name : "Resumo do campeonato", onClose },
            React.createElement("div", { style:{ textAlign:"center",marginBottom:18 } }, React.createElement(TrophyAsset,{tournament,size:96}), React.createElement("div", { style:{ color:"var(--muted)",fontSize:12,marginTop:5 } }, tournament&&tournament.finishedAt?`Encerrado em ${new Date(tournament.finishedAt).toLocaleDateString("pt-BR")}`:"Campeonato encerrado")),
            rows.length ? React.createElement(React.Fragment,null,
              React.createElement("div", { style:{ display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8,marginBottom:18,alignItems:"end" } }, [rows[1],rows[0],rows[2]].map((row,index)=>row?React.createElement("div", { key:row.teamId||index,className:"family-card",style:{ padding:12,textAlign:"center",transform:index===1?"translateY(-8px)":"none" } }, React.createElement("div", { style:{ fontSize:index===1?34:26 } }, row.position===1?"🏆":row.position===2?"🥈":"🥉"), React.createElement("strong", { style:{ display:"block",fontSize:13,marginTop:5 } }, row.profileNameSnapshot), React.createElement("div", { style:{ fontSize:11,color:"var(--muted)",marginTop:3 } }, row.teamNameSnapshot), React.createElement("div", { style:{ fontSize:11,color:"var(--green)",marginTop:5,fontWeight:800 } }, `${row.points||0} pts · +${L(row.prize||0)}`)):React.createElement("span",{key:index}))),
              React.createElement("div", { style:{ overflowX:"auto" } }, React.createElement("table", { style:{ width:"100%",borderCollapse:"collapse",minWidth:520 } }, React.createElement("thead",null,React.createElement("tr",null,["#","Participante","J","V","E","D","SG","PTS"].map((label)=>React.createElement("th",{key:label,style:{padding:"8px 9px",fontSize:10,color:"var(--muted)",textAlign:label==="Participante"?"left":"center",borderBottom:"1px solid var(--border)"}},label)))),React.createElement("tbody",null,rows.map((row)=>React.createElement("tr",{key:row.teamId},React.createElement("td",{style:{padding:9,textAlign:"center",fontWeight:850}},row.position),React.createElement("td",{style:{padding:9}},React.createElement("div",{style:{fontWeight:800}},row.profileNameSnapshot),React.createElement("div",{style:{fontSize:11,color:"var(--muted)"}},row.teamNameSnapshot)),[row.played,row.wins,row.draws,row.losses,row.goalDifference,row.points].map((value,index)=>React.createElement("td",{key:index,style:{padding:9,textAlign:"center",fontVariantNumeric:"tabular-nums",fontWeight:index===5?850:600}},value||0)))))))
            ) : React.createElement("div", { style:{ color:"var(--muted)",textAlign:"center",padding:24 } }, "O snapshot final deste campeonato ainda não está disponível."));
        }

        function TeamViewer({ team, squadOf, ownership, onOpenDetail, profiles, tournament, tournaments, onOpenChampionshipSummary, onOfferPlayer, onClose }) {
          let profile = (profiles || []).find((item) => item && typeof item === "object" && String(item.id) === String(team.profileId));
          let trophies = (tournaments || []).filter((item)=>item&&item.status==="finished").map((item)=>{
            let standings=Array.isArray(item.finalStandings)?item.finalStandings:[];
            let entry=standings.find((row)=>row&&String(row.profileId)===String(team.profileId)&&Number(row.position)===1);
            return entry?{tournament:item,entry}:null;
          }).filter(Boolean).sort((a,b)=>(Number(b.tournament.finishedAt)||0)-(Number(a.tournament.finishedAt)||0));
          return React.createElement(
            "div",
            {
              className: "sports-modal-overlay",
              onClick: onClose,
              style: { position:"fixed", inset:0, zIndex:80, background:"var(--overlay)", backdropFilter:"blur(12px)", overflowY:"auto", padding:"clamp(12px,3vw,32px)" },
            },
            React.createElement(
              "div",
              { onClick:(event)=>event.stopPropagation(), style:{ width:"min(1120px,100%)", margin:"0 auto", minHeight:"calc(100vh - 64px)", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:28, padding:"clamp(18px,3vw,36px)", boxShadow:"0 24px 80px rgba(0,0,0,.35)" } },
              React.createElement(io, {
                teams:[team], activeTeamId:team.id, setActiveTeamId:()=>{}, onNewTeam:null, onDeleteTeam:()=>{},
                squadOf, onSellToMarket:()=>{}, depreciationPct:0, ownership, onOpenDetail:(player)=>onOpenDetail({ player, fromOtherTeam:true }), onGoMarket:()=>{},
                baseRosterPlayerIds:squadOf(team.id).filter((player)=>{ let item=ownership&&ownership[player.id]; return item&&item.acquisitionSource==="initial_roster"&&String(item.initialTeamId||"")===String(team.id); }).map((player)=>String(player.id)),
                rosterSettings:tournament&&tournament.rosterSettings?tournament.rosterSettings:{minPlayers:23,maxPlayers:30},
                readOnly:true, onBack:onClose, viewerProfile:profile,
                readOnlyActionLabel:"Fazer oferta", onReadOnlyAction:onOfferPlayer,
                viewerTrophies: trophies.length ? React.createElement("div", { style:{ display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10,marginTop:16,textAlign:"initial" } }, trophies.map(({tournament:item})=>React.createElement("button", { key:item.id,onClick:()=>onOpenChampionshipSummary&&onOpenChampionshipSummary(item),className:"family-card tapbtn",style:{ padding:14,textAlign:"center",cursor:"pointer",color:"inherit",border:"1px solid var(--border)" } }, React.createElement(TrophyAsset,{tournament:item,size:54,style:{marginBottom:6}}), React.createElement("div", { style:{ fontWeight:850,fontSize:13 } }, item.name), React.createElement("div", { style:{ color:"var(--muted)",fontSize:11.5,marginTop:4 } }, item.type === "cup" ? "Campeão da Copa" : "Campeão")))) : null,
              })
            )
          );
        }

        function buildStandings(tournament, teams) {
          let rows = (teams || []).filter((team)=>team && team.active !== false).map((team)=>({ id:team.id, name:team.name, team, played:0,wins:0,draws:0,losses:0,gf:0,ga:0,gd:0,pts:0 }));
          let byId = Object.fromEntries(rows.map((row)=>[row.id,row]));
          (Array.isArray(tournament && tournament.matches)?tournament.matches:[]).filter((match)=>match && match.played && match.status !== "voided" && !match.bye).forEach((match)=>{
            let home=byId[match.homeId], away=byId[match.awayId]; if(!home||!away)return;
            let hs=Number(match.homeScore)||0, as=Number(match.awayScore)||0; home.played++;away.played++;home.gf+=hs;home.ga+=as;away.gf+=as;away.ga+=hs;
            if(hs>as){home.wins++;away.losses++;home.pts+=3}else if(as>hs){away.wins++;home.losses++;away.pts+=3}else{home.draws++;away.draws++;home.pts++;away.pts++;}
          });
          rows.forEach((row)=>row.gd=row.gf-row.ga);
          return rows.sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||String(a.name).localeCompare(String(b.name)));
        }
        function TableArea({ tournament, tournaments, teams, teamById, profiles, squadOf, onSelectTournament, onDeleteMatch, currentProfile, isAdmin, onOpenTeam, onOpenRules, presence, onOpenSummary, onOpenCupMatch }) {
          let [tableMode,setTableMode]=b("standings");
          He(()=>setTableMode("standings"),[tournament&&tournament.id]);
          let [visibleCount, setVisibleCount] = b(20), sentinel = React.useRef(null);
          He(() => { setVisibleCount(20); }, [tournament && tournament.id]);
          let allMatches = tournament && Array.isArray(tournament.matches) ? tournament.matches.filter((match) => match && match.played && !match.bye && match.status !== "voided") : [];
          let history = [...allMatches].sort((a,b) => (b.playedAt || b.createdAt || 0) - (a.playedAt || a.createdAt || 0));
          He(() => {
            let node = sentinel.current;
            if (!node || visibleCount >= history.length || !window.IntersectionObserver) return;
            let observer = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) setVisibleCount((value) => Math.min(value + 20, history.length)); }, { rootMargin: "200px" });
            observer.observe(node); return () => observer.disconnect();
          }, [visibleCount, history.length, tournament && tournament.id]);
          if (!tournament) return React.createElement("div", { style: E }, React.createElement("div", { style: { fontWeight: 700, marginBottom: 6 } }, "Nenhum campeonato selecionado"), React.createElement("div", { style: { color: "var(--muted)", fontSize: 14 } }, "Selecione um campeonato para visualizar a tabela."));
          if (tournament.type === "cup") return React.createElement(CupViewErrorBoundary,{ tournamentId:tournament.id },React.createElement(CupCompetitionArea,{ tournament, teams, teamById, profiles, presence, onOpenMatch:onOpenCupMatch, onOpenSummary }));
          let participantIds = Array.isArray(tournament.participants) ? tournament.participants : [];
          let declaredTeamIds = Array.isArray(tournament.teamIds) ? tournament.teamIds : [];
          let existingProfileIds = new Set((profiles || []).filter((item) => item && typeof item === "object" && item.active !== false && item.id).map((item) => String(item.id)));
          let activeIds = Array.from(new Set([
            ...declaredTeamIds,
            ...teams.filter((team) => team && team.active !== false && team.profileId && existingProfileIds.has(String(team.profileId)) && participantIds.includes(team.profileId)).map((team) => team.id),
          ])).filter((id) => teams.some((team) => team && team.id === id && team.active !== false && team.profileId && existingProfileIds.has(String(team.profileId)) && participantIds.includes(team.profileId)));
          let standings = we(activeIds, allMatches);
          function avatarForTeam(team, size) {
            let profile = team && (profiles || []).find((item) => item && typeof item === "object" && item.id === team.profileId);
            let name = profile && profile.name ? profile.name : team && team.name ? team.name : "?";
            let online = !!(profile && presence && presence[profile.id] && presence[profile.id].online);
            return React.createElement("span", { style:{ width:size, height:size, borderRadius:999, flexShrink:0, display:"inline-grid", placeItems:"center", background:(profile&&profile.color)||(team&&team.color)||"var(--surface-soft)", color:"white", fontSize:Math.max(10,size*.38), fontWeight:800, border:profile&&profile.avatar?"0":"1px solid var(--border)", position:"relative" } },
              React.createElement("span", { style:{ width:"100%", height:"100%", borderRadius:999, overflow:"hidden", display:"grid", placeItems:"center" } }, profile&&profile.avatar ? React.createElement("img", { src:profile.avatar, alt:"", style:{ width:"100%", height:"100%", objectFit:"cover" } }) : String(name).charAt(0).toUpperCase()),
              online && React.createElement("span", { title:"Online", style:{ position:"absolute", right:-1, bottom:-1, width:Math.max(9,size*.28), height:Math.max(9,size*.28), borderRadius:999, background:"#21e493", boxShadow:"0 0 0 2px var(--surface), 0 0 10px rgba(33,228,147,.65)" } })
            );
          }
          function profileForTeam(team) {
            return team && (profiles || []).find((item) => item && typeof item === "object" && item.id === team.profileId);
          }
          function profileNameForTeam(team) {
            let profile = profileForTeam(team);
            return profile && profile.name ? profile.name : team && team.name ? team.name : "Perfil removido";
          }
          function teamOverall(team) {
            let squad = team && typeof squadOf === "function" ? squadOf(team.id) : [];
            if (!Array.isArray(squad) || !squad.length) return 0;
            return Math.round((squad.reduce((sum, player) => sum + (Number(player && player.overall) || 0), 0) / squad.length) * 10) / 10;
          }
          function dayLabel(timestamp) {
            let date = new Date(timestamp || Date.now()), now = new Date(), yesterday = new Date(); yesterday.setDate(now.getDate()-1);
            let key = date.toDateString();
            if (key === now.toDateString()) return "Hoje";
            if (key === yesterday.toDateString()) return "Ontem";
            return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", ...(date.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}) });
          }
          let groups = {};
          history.slice(0,visibleCount).forEach((match) => { let label=dayLabel(match.playedAt || match.createdAt); (groups[label] ||= []).push(match); });
          let scorerRows = Object.values(tournament&&tournament.context&&tournament.context.playerStats&&typeof tournament.context.playerStats==="object"?tournament.context.playerStats:{})
            .filter((item)=>item&&Number(item.goals)>0)
            .map((item)=>({ ...item, goals:Number(item.goals)||0, team:teamById(item.teamId) }))
            .sort((left,right)=>right.goals-left.goals||String(left.playerNameSnapshot||"").localeCompare(String(right.playerNameSnapshot||""),"pt-BR"));
          let finalRows = tournament.status === "finished" && Array.isArray(tournament.finalStandings) && tournament.finalStandings.length ? tournament.finalStandings : tournament.status === "finished" ? standings.map((row,index)=>{ let team=teams.find((item)=>item.id===row.id)||{}; let profile=profileForTeam(team)||{}; let award=Array.isArray(tournament.finalAwards)?tournament.finalAwards.find((item)=>item.teamId===row.id):null; return { position:index+1,teamId:row.id,profileId:team.profileId||null,profileNameSnapshot:profile.name||team.name,teamNameSnapshot:team.name,avatarSnapshot:profile.avatar||null,colorSnapshot:profile.color||team.color||null,points:row.pts,prize:award?award.amount:0,wins:row.wins,draws:row.draws,losses:row.losses,goalDifference:row.gd }; }):[];
          let podiumRows = finalRows.slice(0,3);
          return React.createElement("div", null,
            tournament.status === "finished" && podiumRows.length ? React.createElement("section", { className:"family-card", style:{ padding:"22px 18px",marginBottom:16,textAlign:"center",background:"linear-gradient(145deg,color-mix(in srgb,#ffbb26 10%,var(--surface)),var(--surface))",overflow:"hidden" } }, React.createElement("div", { style:{ color:"#ffbb26",fontWeight:850,fontSize:12,textTransform:"uppercase",letterSpacing:".14em",marginBottom:14 } }, "Pódio final"), React.createElement("div", { style:{ display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10,alignItems:"end" } }, [podiumRows[1],podiumRows[0],podiumRows[2]].map((row,index)=>row?React.createElement("button", { key:row.teamId||index,onClick:()=>onOpenSummary&&onOpenSummary(tournament),style:{ border:0,background:"transparent",color:"inherit",cursor:"pointer",padding:8,textAlign:"center",transform:index===1?"translateY(-8px)":"none" } }, React.createElement("div", { style:{ fontSize:index===1?38:30 } }, row.position===1?"🏆":row.position===2?"🥈":"🥉"), React.createElement("div", { style:{ width:index===1?58:48,height:index===1?58:48,borderRadius:999,margin:"7px auto",background:row.colorSnapshot||"var(--surface-soft)",overflow:"hidden",display:"grid",placeItems:"center",fontWeight:850 } }, row.avatarSnapshot?React.createElement("img", { src:row.avatarSnapshot,alt:"",style:{width:"100%",height:"100%",objectFit:"cover"} }):String(row.profileNameSnapshot||"?").charAt(0).toUpperCase()), React.createElement("div", { style:{ fontWeight:850,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" } }, row.profileNameSnapshot), React.createElement("div", { style:{ color:"var(--muted)",fontSize:11,marginTop:3 } }, `${row.points||0} pts · +${L(row.prize||0)}`)):React.createElement("span",{key:index}))) ) : null,
            React.createElement("div", { style:E },
              React.createElement("div", { style:{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:16 } }, React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8,minWidth:0}},React.createElement("div", { style:{ fontSize:21, fontWeight:750, letterSpacing:"-.025em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" } }, tableMode==="scorers"?"Artilheiros":tournament.name), React.createElement("button", { onClick:onOpenRules, title:"Regras do campeonato", style:{ width:26,height:26,borderRadius:"50%",border:"1px solid var(--border)",background:"var(--surface-soft)",color:"var(--muted)",cursor:"pointer",fontWeight:850,flexShrink:0 } }, "i")),React.createElement("button",{onClick:()=>setTableMode(tableMode==="scorers"?"standings":"scorers"),title:tableMode==="scorers"?"Voltar para classificação":"Ver artilheiros","aria-label":tableMode==="scorers"?"Voltar para classificação":"Ver artilheiros",style:{width:38,height:38,borderRadius:12,border:"1px solid var(--border)",background:"var(--surface-soft)",color:"var(--heading)",display:"grid",placeItems:"center",cursor:"pointer",flexShrink:0}},tableMode==="scorers"?React.createElement("svg",{width:19,height:19,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("path",{d:"M8 4h8v4a4 4 0 0 1-8 0V4Z"}),React.createElement("path",{d:"M8 6H5v1a4 4 0 0 0 4 4M16 6h3v1a4 4 0 0 1-4 4M12 12v4M8 20h8M9 16h6"})):React.createElement("svg",{width:20,height:20,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("path",{d:"M5 15c3-1 5-4 6-8l4 1-1 4 4 2c1 .5 1.2 2 .4 2.8L17 18H8c-2 0-3-1-3-3Z"}),React.createElement("path",{d:"M8 18v2M12 18v2M16 18v2"})))),
              tableMode==="scorers" ? (scorerRows.length?React.createElement("div",{style:{display:"grid",gap:7}},scorerRows.slice(0,5).map((row,index)=>React.createElement("div",{key:row.playerId||index,style:{display:"grid",gridTemplateColumns:"32px minmax(0,1fr) auto",alignItems:"center",gap:10,padding:"11px 10px",borderBottom:"1px solid var(--border)"}},React.createElement("div",{style:{fontWeight:850,textAlign:"center",color:index<3?"var(--green)":"var(--muted)"}},index+1),React.createElement("div",{style:{minWidth:0}},React.createElement("div",{style:{fontWeight:800,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},row.playerNameSnapshot||"Jogador"),React.createElement("div",{style:{fontSize:11.5,color:"var(--muted)",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},row.team?row.team.name:"Time não disponível")),React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,fontWeight:900,fontVariantNumeric:"tabular-nums"}},React.createElement("span",{style:{fontSize:15}},"⚽"),row.goals)))):React.createElement("div",{style:{padding:"24px 8px",textAlign:"center",color:"var(--muted)",fontSize:13}},"Nenhum gol com autoria foi registrado ainda.")) : ((tournament.status === "finished" ? finalRows.length : standings.length) ? React.createElement("div", { style:{ overflowX:"auto" } }, React.createElement("table", { style:{ width:"100%", borderCollapse:"collapse", minWidth:460 } },
                React.createElement("thead", null, React.createElement("tr", null, ["#","Time","J","V","E","D","SG","PTS"].map((label)=>React.createElement("th", { key:label, style:{ textAlign: label==="Time"?"left":"center", fontSize:11, color:"var(--muted)", padding:"8px 10px", borderBottom:"1px solid var(--border)", ...(label==="PTS"?{position:"sticky",right:0,zIndex:4,background:"var(--surface)",boxShadow:"-10px 0 18px rgba(0,0,0,.12)"}:{}) } }, label)))),
                React.createElement("tbody", null, (tournament.status === "finished" ? finalRows : standings).map((row,index)=>{ 
                  let isFinal=tournament.status === "finished", team=teamById(isFinal?row.teamId:row.id), profileName=isFinal?(row.profileNameSnapshot||"Perfil removido"):profileNameForTeam(team), teamName=isFinal?(row.teamNameSnapshot||profileName):(team&&team.name?team.name:profileName), avatar=isFinal?React.createElement("span", { style:{ width:32,height:32,borderRadius:999,flexShrink:0,display:"inline-grid",placeItems:"center",background:row.colorSnapshot||"var(--surface-soft)",color:"white",fontSize:12,fontWeight:800,overflow:"hidden",border:row.avatarSnapshot?0:"1px solid var(--border)" } }, row.avatarSnapshot?React.createElement("img",{src:row.avatarSnapshot,alt:"",style:{width:"100%",height:"100%",objectFit:"cover"}}):String(teamName||"?").charAt(0).toUpperCase()):avatarForTeam(team,32);
                  let values=isFinal?[row.played,row.wins,row.draws,row.losses,row.goalDifference,row.points]:[row.pj,row.v,row.e,row.d,row.sg,row.pts];
                  return React.createElement("tr", { key:(isFinal?row.teamId:row.id)||index }, React.createElement("td", { style:{ padding:"12px 6px", fontWeight:700, textAlign:"center" } }, isFinal?(row.position||index+1):index+1), React.createElement("td", { style:{ padding:"12px 6px", fontWeight:650, minWidth:210 } }, React.createElement("button", { onClick:()=>team&&onOpenTeam&&onOpenTeam(team.id), disabled:!team||!!(tournament.context&&tournament.context.historicalImport), style:{ display:"flex", alignItems:"center", gap:10, background:"none", border:0, padding:0, color:"var(--heading)", font:"inherit", cursor:team&&!(tournament.context&&tournament.context.historicalImport)?"pointer":"default", textAlign:"left", width:"100%" } }, avatar, React.createElement("span", { style:{ minWidth:0, display:"grid", gap:3 } }, React.createElement("span", { style:{ fontWeight:780, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", textDecoration:team&&!(tournament.context&&tournament.context.historicalImport)?"underline":"none", textDecorationColor:"color-mix(in srgb, var(--green) 50%, transparent)", textUnderlineOffset:4 } }, teamName), isFinal?React.createElement("span", { style:{ fontSize:11.5, color:"var(--muted)", fontWeight:550, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } }, tournament.context&&tournament.context.historicalImport?`${profileName} • Resultado importado`:profileName):team&&React.createElement("span", { style:{ fontSize:11.5, color:"var(--muted)", fontWeight:550, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } }, profileName, " • ", teamOverall(team).toFixed(1), " OVR • ", L(Number(team.budget) || 0))))), values.map((value,i)=>React.createElement("td", { key:i, style:{ padding:"12px 10px", textAlign:"center", fontWeight:i===5?850:500, ...(i===5?{position:"sticky",right:0,zIndex:3,background:"var(--surface)",boxShadow:"-10px 0 18px rgba(0,0,0,.12)"}:{}) } }, Number(value)||0))); }))
              )) : React.createElement("div", { style:{ color:"var(--muted)", fontSize:14 } }, "A classificação aparecerá quando houver participantes."))
            ),
            React.createElement("div", { style:{ marginTop:28, marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"end" } }, React.createElement("div", null, React.createElement("div", { style:{ fontSize:12, color:"var(--muted)" } }, "Resultados"), React.createElement("div", { style:{ fontSize:21, fontWeight:750 } }, "Histórico de partidas")), React.createElement("div", { style:{ fontSize:12, color:"var(--muted)" } }, history.length + " partidas")),
            history.length === 0 ? React.createElement("div", { style:{ ...E, textAlign:"center", color:"var(--muted)" } }, tournament.status === "finished" ? (tournament.context&&tournament.context.historicalImport?"Este histórico importado preserva apenas a classificação final.":"Nenhuma partida foi preservada neste histórico.") : "Nenhuma partida registrada ainda. Use o botão + para adicionar a primeira.") : Object.entries(groups).map(([label,matches])=>React.createElement("section", { key:label, style:{ marginBottom:22 } }, React.createElement("div", { style:{ fontSize:13, fontWeight:700, marginBottom:8, color:"var(--muted)" } }, label), matches.map((match)=>React.createElement(HistoryMatchCard, { key:match.id, match, teamById, avatarForTeam, profileNameForTeam, onDelete:onDeleteMatch, canDelete: !!(currentProfile && (isAdmin || match.createdByProfileId === currentProfile.id)) })) )),
            visibleCount < history.length && React.createElement("div", { ref:sentinel, style:{ textAlign:"center", color:"var(--muted)", padding:20, fontSize:13 } }, "Carregando mais partidas...")
          );
        }
        function HistoryMatchCard({ match, teamById, avatarForTeam, profileNameForTeam, onDelete, canDelete }) {
          let [expanded,setExpanded]=b(false);
          let home = teamById(match.homeId), away = teamById(match.awayId);
          let leftTeam=home,rightTeam=away,leftScore=Number(match.homeScore)||0,rightScore=Number(match.awayScore)||0;
          if (rightScore > leftScore) { [leftTeam,rightTeam]=[rightTeam,leftTeam]; [leftScore,rightScore]=[rightScore,leftScore]; }
          let isDraw = leftScore === rightScore;
          let goals=Array.isArray(match.goals)?match.goals:Array.isArray(match.scorers)?match.scorers:[];
          let cards=Array.isArray(match.redCards)?match.redCards:[];
          let events=[...goals.map((event)=>({...event,eventType:"goal"})),...cards.map((event)=>({...event,eventType:"red"}))];
          let hasEvents=events.length>0;
          function participant(team) {
            let profileName = profileNameForTeam ? profileNameForTeam(team) : "Perfil removido";
            let teamName = team && team.name ? team.name : profileName;
            return React.createElement("div", { style:{ minWidth:0, display:"grid", justifyItems:"center", gap:7, textAlign:"center" } },avatarForTeam(team,38),React.createElement("div", { style:{ minWidth:0,maxWidth:"100%",display:"grid",gap:3,justifyItems:"center" } },React.createElement("div", { style:{ maxWidth:"100%", fontSize:13, lineHeight:1.15, fontWeight:760, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"var(--heading)" } }, teamName),React.createElement("div", { style:{ maxWidth:"100%", fontSize:11, lineHeight:1.15, fontWeight:550, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"var(--muted)" } }, profileName)));
          }
          function eventList(team){let teamEvents=events.filter((event)=>event&&String(event.teamId)===String(team&&team.id));return React.createElement("div",{style:{display:"grid",gap:7,minWidth:0,justifyItems:"center"}},teamEvents.map((event,index)=>React.createElement("div",{key:`${event.eventType}-${index}-${event.playerId||"none"}`,style:{display:"flex",alignItems:"center",justifyContent:"center",gap:8,minWidth:0,maxWidth:"100%",fontSize:12.5}},event.eventType==="goal"?React.createElement("span",{style:{width:18,height:18,borderRadius:99,display:"grid",placeItems:"center",background:"color-mix(in srgb,var(--green) 13%,transparent)",fontSize:10,flexShrink:0}},"⚽"):React.createElement("span",{style:{width:11,height:15,borderRadius:2,background:"#ef3838",boxShadow:"inset 0 0 0 1px rgba(0,0,0,.12)",flexShrink:0}}),React.createElement("span",{style:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--heading)",fontWeight:650}},event.playerNameSnapshot||(event.eventType==="goal"?(event.type==="own_goal"?"Gol contra":"Autoria não informada"):"Jogador não identificado")))));}
          return React.createElement("div", { style:{ ...E, width:"100%", padding:"16px clamp(10px,2.5vw,20px)" } },React.createElement("div",{style:{display:"grid",gridTemplateColumns:"36px minmax(0,1fr) auto minmax(0,1fr) 36px",alignItems:"center",gap:"clamp(8px,2vw,18px)"}},hasEvents?React.createElement("button",{onClick:()=>setExpanded(!expanded),title:expanded?"Ocultar eventos":"Mostrar eventos","aria-label":expanded?"Ocultar eventos":"Mostrar eventos",style:{width:36,height:36,borderRadius:10,border:0,background:"transparent",color:"var(--muted)",display:"grid",placeItems:"center",cursor:"pointer",padding:0}},React.createElement("svg",{width:20,height:20,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.9,strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("path",{d:expanded?"m7 8 5 5 5-5":"m7 10 5-5 5 5"}),React.createElement("path",{d:expanded?"m7 16 5-5 5 5":"m7 14 5 5 5-5"}))):React.createElement("div",{"aria-hidden":"true"}),participant(leftTeam),React.createElement("div", { className:"scoreboard", style:{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, minWidth:82, fontSize:"clamp(20px,4vw,27px)", fontWeight:880, whiteSpace:"nowrap" } },React.createElement("span", { style:{ color:isDraw?"var(--heading)":"var(--green)" } }, leftScore),React.createElement("span", { style:{ color:"var(--muted)", fontSize:".72em", fontWeight:650 } }, "×"),React.createElement("span", { style:{ color:isDraw?"var(--heading)":"var(--danger)" } }, rightScore)),participant(rightTeam),canDelete ? React.createElement("button", { onClick:()=>onDelete && onDelete(match), title:"Excluir partida", "aria-label":"Excluir partida", style:{ width:36, height:36, borderRadius:10, border:0, background:"transparent", color:"var(--muted)", display:"grid", placeItems:"center", cursor:"pointer", padding:0 } },React.createElement("svg", { width:18, height:18, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:1.8, strokeLinecap:"round", strokeLinejoin:"round", "aria-hidden":"true" }, React.createElement("path", { d:"M3 6h18" }), React.createElement("path", { d:"M8 6V4h8v2" }), React.createElement("path", { d:"M19 6l-1 14H6L5 6" }), React.createElement("path", { d:"M10 11v5M14 11v5" }))) : React.createElement("div", { "aria-hidden":"true" })),expanded&&hasEvents&&React.createElement("div",{style:{display:"grid",gridTemplateColumns:"36px minmax(0,1fr) minmax(82px,auto) minmax(0,1fr) 36px",gap:"clamp(8px,2vw,18px)",marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)",alignItems:"start"}},React.createElement("div",{"aria-hidden":"true"}),eventList(leftTeam),React.createElement("div",{"aria-hidden":"true"}),eventList(rightTeam),React.createElement("div",{"aria-hidden":"true"})));
        }
        class CupViewErrorBoundary extends React.Component {
          constructor(props){ super(props); this.state={ error:null }; }
          static getDerivedStateFromError(error){ return { error }; }
          componentDidCatch(error, info){ console.error("cup view failed", error, info); }
          componentDidUpdate(prevProps){
            if (this.state.error && prevProps.tournamentId !== this.props.tournamentId) this.setState({ error:null });
          }
          render(){
            if (!this.state.error) return this.props.children;
            return React.createElement("section", { className:"family-card", style:{padding:24,textAlign:"center",marginTop:10} },
              React.createElement("div", { style:{fontSize:38,marginBottom:10} }, "🏆"),
              React.createElement("div", { style:{fontSize:19,fontWeight:850,marginBottom:7} }, "Não foi possível abrir esta Copa"),
              React.createElement("div", { style:{fontSize:13,color:"var(--muted)",lineHeight:1.55,maxWidth:520,margin:"0 auto 14px"} }, "Os dados da competição foram preservados. Atualize a página; se a estrutura estiver incompleta, o app tentará reconstruí-la usando a liga vinculada."),
              React.createElement("button", { onClick:()=>window.location.reload(), style:{...M,...W,width:"auto",padding:"11px 18px"} }, "Tentar novamente")
            );
          }
        }
        function CupCompetitionArea({ tournament, teams, teamById, profiles, presence, onOpenMatch, onOpenSummary }) {
          tournament = tournament && typeof tournament === "object" ? tournament : {};
          teams = Array.isArray(teams) ? teams.filter(Boolean) : [];
          profiles = Array.isArray(profiles) ? profiles.filter(Boolean) : [];
          const groups = Array.isArray(tournament.groups) ? tournament.groups.filter(Boolean) : [];
          const matches = Array.isArray(tournament.matches) ? tournament.matches.filter(Boolean) : [];
          const isFinished = tournament.status === "finished";
          const hasKnockout = matches.some((match)=>match && match.stage === "knockout");
          let [view,setView]=b((tournament.cupStage === "knockout" || isFinished || hasKnockout) ? "knockout" : "groups");
          He(()=>{ if(tournament.cupStage === "knockout" || isFinished) setView("knockout"); },[tournament.cupStage,isFinished]);
          const byTeamId = new Map(teams.map((team)=>[String(team.id),team]));
          function resolveTeam(id){
            if (id == null) return null;
            return byTeamId.get(String(id)) || (typeof teamById === "function" ? teamById(id) : null) || null;
          }
          function resolveProfile(team){ return team ? profiles.find((profile)=>profile && String(profile.id)===String(team.profileId)) || null : null; }
          function avatar(team,size=34){
            const profile=resolveProfile(team), name=(profile&&profile.name)||(team&&team.name)||"?";
            return React.createElement("span",{style:{width:size,height:size,borderRadius:999,overflow:"hidden",display:"grid",placeItems:"center",background:(profile&&profile.color)||(team&&team.color)||"var(--surface-soft)",fontWeight:850,flexShrink:0}},profile&&profile.avatar?React.createElement("img",{src:profile.avatar,alt:"",style:{width:"100%",height:"100%",objectFit:"cover"}}):String(name).charAt(0).toUpperCase());
          }
          function safeStandings(group){
            const ids=Array.isArray(group&&group.teamIds)?group.teamIds.map(String):[];
            const rows=Object.fromEntries(ids.map((id)=>[id,{id,pj:0,v:0,e:0,d:0,gp:0,gc:0,sg:0,pts:0}]));
            matches.filter((match)=>match&&match.stage==="group"&&match.groupName===group.name&&match.played&&match.status!=="voided").forEach((match)=>{
              const home=rows[String(match.homeId)],away=rows[String(match.awayId)]; if(!home||!away)return;
              const hs=Number(match.homeScore)||0,as=Number(match.awayScore)||0; home.pj++;away.pj++;home.gp+=hs;home.gc+=as;away.gp+=as;away.gc+=hs;
              if(hs>as){home.v++;away.d++;home.pts+=3;}else if(as>hs){away.v++;home.d++;away.pts+=3;}else{home.e++;away.e++;home.pts++;away.pts++;}
            });
            Object.values(rows).forEach((row)=>row.sg=row.gp-row.gc);
            return Object.values(rows).sort((a,b)=>b.pts-a.pts||b.sg-a.sg||b.gp-a.gp||String((resolveTeam(a.id)||{}).name||"").localeCompare(String((resolveTeam(b.id)||{}).name||"")));
          }
          function matchCard(match){
            const home=resolveTeam(match.homeId),away=resolveTeam(match.awayId),canOpen=!isFinished&&home&&away;
            return React.createElement("button",{key:match.id||`${match.homeId}-${match.awayId}-${match.round||0}`,onClick:()=>canOpen&&onOpenMatch&&onOpenMatch(match),disabled:!canOpen,className:"family-card tapbtn",style:{width:"100%",padding:14,marginBottom:8,display:"grid",gridTemplateColumns:"minmax(0,1fr) auto minmax(0,1fr)",gap:10,alignItems:"center",color:"inherit",cursor:canOpen?"pointer":"default",opacity:home&&away?1:.65}},React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8,minWidth:0}},avatar(home,30),React.createElement("span",{style:{fontWeight:750,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},home&&home.name||"A definir")),React.createElement("div",{style:{fontWeight:900,fontSize:18,whiteSpace:"nowrap"}},match.played?`${Number(match.homeScore)||0} × ${Number(match.awayScore)||0}`:"×"),React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:8,minWidth:0}},React.createElement("span",{style:{fontWeight:750,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},away&&away.name||"A definir"),avatar(away,30)));
          }
          if (!groups.length || !matches.length) return React.createElement("section", { className:"family-card", style:{padding:24,textAlign:"center"} },
            React.createElement("div", { style:{fontSize:38,marginBottom:10} }, "🏆"),
            React.createElement("div", { style:{fontSize:19,fontWeight:850,marginBottom:6} }, "Copa em preparação"),
            React.createElement("div", { style:{fontSize:13,color:"var(--muted)",lineHeight:1.55,maxWidth:500,margin:"0 auto"} }, "A estrutura de grupos ainda não foi concluída. Os dados permanecem salvos e serão reconstruídos automaticamente a partir da liga vinculada.")
          );
          const knockout=matches.filter((match)=>match&&match.stage==="knockout");
          const rounds=[...new Set(knockout.map((match)=>Number(match.round)||1))].sort((a,b)=>a-b);
          function roundName(round){const count=knockout.filter((match)=>(Number(match.round)||1)===round).length;return count===1?"Final":count===2?"Semifinal":count===4?"Quartas de final":count===8?"Oitavas de final":`Fase ${round}`;}
          const winner=Array.isArray(tournament.finalStandings)&&tournament.finalStandings[0]?tournament.finalStandings[0]:null;
          return React.createElement("div",null,
            isFinished&&winner&&React.createElement("section",{className:"family-card",style:{padding:22,marginBottom:16,textAlign:"center",background:"linear-gradient(145deg,color-mix(in srgb,#ffbb26 12%,var(--surface)),var(--surface))"}},React.createElement(TrophyAsset,{tournament,size:90}),React.createElement("div",{style:{fontSize:12,color:"#ffbb26",fontWeight:850,textTransform:"uppercase",letterSpacing:".12em"}},"Campeão da copa"),React.createElement("div",{style:{fontSize:22,fontWeight:900,marginTop:5}},winner.profileNameSnapshot||winner.teamNameSnapshot||"Campeão"),React.createElement("div",{style:{color:"var(--muted)",fontSize:13,marginTop:3}},`${winner.teamNameSnapshot||"Time"} · +${L(winner.prize||0)}`),onOpenSummary&&React.createElement("button",{onClick:()=>onOpenSummary(tournament),style:{...M,marginTop:14,background:"var(--surface-soft)",color:"var(--heading)"}},"Ver resumo da copa")),
            React.createElement("div",{style:{display:"flex",justifyContent:"center",marginBottom:16}},React.createElement("div",{style:{display:"inline-flex",padding:4,borderRadius:999,background:"var(--surface-soft)",overflowX:"auto",maxWidth:"100%"}},React.createElement("button",{onClick:()=>setView("groups"),style:{...V(view==="groups"),whiteSpace:"nowrap"}},"Grupos"),knockout.length?React.createElement("button",{onClick:()=>setView("knockout"),style:{...V(view==="knockout"),whiteSpace:"nowrap"}},"Mata-mata"):null)),
            view==="groups"?React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,360px),1fr))",gap:14}},groups.map((group,index)=>{const rows=safeStandings(group),groupMatches=matches.filter((match)=>match&&match.stage==="group"&&match.groupName===group.name);return React.createElement("section",{key:group.name||index,className:"family-card",style:{padding:14}},React.createElement("div",{style:{fontSize:17,fontWeight:850,marginBottom:10}},group.name||`Grupo ${index+1}`),React.createElement("div",{style:{overflowX:"auto"}},React.createElement("table",{style:{width:"100%",borderCollapse:"collapse",minWidth:330}},React.createElement("thead",null,React.createElement("tr",null,["#","Time","J","SG","PTS"].map((label)=>React.createElement("th",{key:label,style:{fontSize:10,color:"var(--muted)",textAlign:label==="Time"?"left":"center",padding:"7px 5px",borderBottom:"1px solid var(--border)"}},label)))),React.createElement("tbody",null,rows.map((row,rowIndex)=>{const team=resolveTeam(row.id);return React.createElement("tr",{key:row.id,style:{background:rowIndex<2?"color-mix(in srgb,var(--green) 7%,transparent)":"transparent"}},React.createElement("td",{style:{padding:"9px 5px",textAlign:"center",fontWeight:800}},rowIndex+1),React.createElement("td",{style:{padding:"9px 5px",fontWeight:750}},team&&team.name||"Time indisponível"),React.createElement("td",{style:{padding:"9px 5px",textAlign:"center"}},row.pj),React.createElement("td",{style:{padding:"9px 5px",textAlign:"center"}},row.sg),React.createElement("td",{style:{padding:"9px 5px",textAlign:"center",fontWeight:900}},row.pts));})))),React.createElement("div",{style:{fontSize:11,color:"var(--muted)",fontWeight:800,textTransform:"uppercase",letterSpacing:".08em",margin:"14px 0 8px"}},"Confrontos"),groupMatches.map(matchCard));})):knockout.length?React.createElement("div",{className:"cup-bracket-scroll",style:{display:"flex",gap:18,overflowX:"auto",padding:"8px 8px 22px",alignItems:"stretch"}},rounds.map((round)=>React.createElement("section",{key:round,className:"family-card",style:{flex:"0 0 min(82vw,330px)",padding:14,display:"flex",flexDirection:"column",justifyContent:"center"}},React.createElement("div",{style:{fontSize:12,color:"var(--muted)",fontWeight:850,textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}},roundName(round)),knockout.filter((match)=>(Number(match.round)||1)===round).map(matchCard)))):React.createElement("section",{className:"family-card",style:{padding:20,textAlign:"center",color:"var(--muted)"}},"Conclua todos os jogos dos grupos para gerar o mata-mata.")
          );
        }
        function CupScoreModal({ data,setData,tournament,teams,profiles,onClose,onSave }){
          let match=(tournament.matches||[]).find((item)=>String(item.id)===String(data.matchId)),home=match&&teams.find((team)=>String(team.id)===String(match.homeId)),away=match&&teams.find((team)=>String(team.id)===String(match.awayId));
          if(!match)return null;
          function profile(team){return team&&(profiles||[]).find((item)=>item&&String(item.id)===String(team.profileId));}
          function avatar(team){let p=profile(team),name=p&&p.name||team&&team.name||"?";return React.createElement("span",{style:{width:48,height:48,borderRadius:999,overflow:"hidden",display:"grid",placeItems:"center",margin:"0 auto 8px",background:p&&p.color||"var(--surface-soft)",fontWeight:850}},p&&p.avatar?React.createElement("img",{src:p.avatar,alt:"",style:{width:"100%",height:"100%",objectFit:"cover"}}):String(name).charAt(0).toUpperCase());}
          function side(team,key){let value=Number(data[key])||0;return React.createElement("div",{style:{textAlign:"center"}},avatar(team),React.createElement("div",{style:{fontWeight:800,minHeight:40}},team&&team.name||"A definir"),React.createElement("button",{onClick:()=>setData({...data,[key]:Math.min(30,value+1)}),style:{border:0,background:"none",color:"var(--heading)",fontSize:24,cursor:"pointer"}},"⌃"),React.createElement("div",{style:{fontSize:50,fontWeight:900,lineHeight:1}},value),React.createElement("button",{onClick:()=>setData({...data,[key]:Math.max(0,value-1)}),style:{border:0,background:"none",color:"var(--heading)",fontSize:24,cursor:"pointer"}},"⌄"));}
          let tied=match.stage==="knockout"&&Number(data.homeScore)===Number(data.awayScore);
          return React.createElement(ee,{title:match.stage==="group"?`${match.groupName} · Resultado`:"Mata-mata · Resultado",onClose},React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",gap:12,margin:"8px 0 20px"}},side(home,"homeScore"),React.createElement("div",{style:{fontWeight:850,color:"var(--muted)"}},"×"),side(away,"awayScore")),tied&&React.createElement("div",{style:{marginBottom:16}},React.createElement("label",{style:P},"Quem avançou nos pênaltis?"),React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}},[home,away].map((team)=>React.createElement("button",{key:team.id,onClick:()=>setData({...data,penaltyWinner:team.id}),style:{padding:11,borderRadius:12,border:data.penaltyWinner===team.id?"1px solid var(--green)":"1px solid var(--border)",background:data.penaltyWinner===team.id?"color-mix(in srgb,var(--green) 10%,var(--surface))":"var(--surface-soft)",color:"var(--heading)",fontWeight:750,cursor:"pointer"}},team.name)))),React.createElement("button",{onClick:()=>onSave(data),disabled:tied&&!data.penaltyWinner,style:{...M,...W,opacity:tied&&!data.penaltyWinner?.45:1}},"Salvar resultado"));
        }

        function MatchWizard({ data, setData, teams, profiles, presence, players, ownership, onClose, onSave }) {
          let left=teams.find((team)=>team.id===data.leftTeamId),right=teams.find((team)=>team.id===data.rightTeamId);
          function profileName(team) { let profile=profiles.find((item)=>item&&String(item.id)===String(team&&team.profileId)); return profile&&profile.name?profile.name:(team&&team.name)||"Participante"; }
          function profileAvatar(team) { let profile=profiles.find((item)=>item&&String(item.id)===String(team&&team.profileId)); let online=profile&&presence&&presence[profile.id]&&Date.now()-(presence[profile.id].lastSeen||0)<90000; return React.createElement("span",{style:{width:42,height:42,borderRadius:"50%",display:"inline-grid",placeItems:"center",overflow:"hidden",background:(profile&&profile.color)||"var(--green-strong)",fontWeight:850,position:"relative",flex:"0 0 auto"}},profile&&profile.avatar?React.createElement("img",{src:profile.avatar,alt:"",style:{width:"100%",height:"100%",objectFit:"cover"}}):String(profileName(team)).charAt(0).toUpperCase(),online&&React.createElement("span",{style:{position:"absolute",right:1,bottom:1,width:9,height:9,borderRadius:99,background:"var(--green)",border:"2px solid var(--surface)"}})); }
          function roster(teamId) { let ids=Object.entries(ownership||{}).filter(([,owner])=>owner&&String(owner.teamId)===String(teamId)).map(([id])=>String(id)); return ids.map((id)=>(players||[]).find((player)=>String(player.id)===id)).filter(Boolean).sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""),"pt-BR")); }
          function choose(side,id) { let next={...data,[side+"TeamId"]:id}; let other=side==="left"?next.rightTeamId:next.leftTeamId;if(other&&other!==id)next.step=2;setData(next); }
          function score(side,delta) { let key=side+"Score", scorerKey=side+"Scorers"; let value=Math.max(0,Math.min(30,(Number(data[key])||0)+delta)); let list=Array.isArray(data[scorerKey])?data[scorerKey].slice(0,value):[]; while(list.length<value)list.push(""); setData({...data,[key]:value,[scorerKey]:list}); }
          function updateScorer(side,index,playerId){let key=side+"Scorers",list=Array.isArray(data[key])?[...data[key]]:[];list[index]=playerId;setData({...data,[key]:list});}
          function toggleRed(side,playerId){let key=side+"RedCards",list=Array.isArray(data[key])?[...data[key]]:[];list=list.includes(playerId)?list.filter((id)=>id!==playerId):[...list,playerId];setData({...data,[key]:list});}
          let title=data.step===1?"Quem jogou?":"Qual foi o resultado?";
          function teamButton(side,team){let disabled=(side==="left"?data.rightTeamId:data.leftTeamId)===team.id,selected=data[side+"TeamId"]===team.id;return React.createElement("button",{key:team.id,disabled,onClick:()=>choose(side,team.id),style:{width:"100%",marginBottom:8,padding:12,borderRadius:12,border:selected?"2px solid var(--green)":"1px solid var(--border)",background:selected?"var(--surface-soft)":"var(--surface)",opacity:disabled?.3:1,textAlign:"left",cursor:disabled?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:10}},profileAvatar(team),React.createElement("div",{style:{minWidth:0}},React.createElement("div",{style:{fontWeight:700,overflow:"hidden",textOverflow:"ellipsis"}},profileName(team)),React.createElement("div",{style:{fontSize:11.5,color:"var(--muted)",marginTop:3,overflow:"hidden",textOverflow:"ellipsis"}},team.name)));}
          function teamColumn(side){return React.createElement("div",{key:side},React.createElement("div",{style:{fontSize:12,fontWeight:700,marginBottom:8}},side==="left"?"Jogador 1":"Jogador 2"),teams.map((team)=>teamButton(side,team)));}
          let stepOne=data.step===1&&React.createElement("div",null,React.createElement("div",{style:{color:"var(--muted)",fontSize:13,marginBottom:16}},"Selecione dois participantes diferentes deste campeonato."),React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}},teamColumn("left"),teamColumn("right")));
          function scorerButton(team,side){let total=Number(data[side+"Score"])||0,selected=(Array.isArray(data[side+"Scorers"])?data[side+"Scorers"]:[]).filter(Boolean).length,open=data.scorerPanel===side; if(!total)return null;return React.createElement("button",{onClick:()=>setData({...data,scorerPanel:open?null:side}),style:{marginTop:12,width:"100%",padding:"10px 8px",borderRadius:12,border:"1px solid var(--border)",background:open?"var(--surface-soft)":"var(--surface)",color:selected===total?"var(--green)":"var(--heading)",fontWeight:800,fontSize:12,cursor:"pointer"}},`⚽ Artilheiros · ${selected} de ${total}`);}
          let scoreColumn=(team,side)=>React.createElement("div",{style:{textAlign:"center"}},profileAvatar(team),React.createElement("div",{style:{fontWeight:700,minHeight:42,marginTop:8}},team.name),React.createElement("button",{onClick:()=>score(side,1),style:{border:0,background:"none",color:"var(--heading)",fontSize:24,cursor:"pointer"}},"⌃"),React.createElement("div",{style:{fontSize:48,fontWeight:850,lineHeight:1}},side==="left"?data.leftScore:data.rightScore),React.createElement("button",{onClick:()=>score(side,-1),style:{border:0,background:"none",color:"var(--heading)",fontSize:24,cursor:"pointer"}},"⌄"),scorerButton(team,side));
          function scorerPanel(side,team){if(data.scorerPanel!==side)return null;let total=Number(data[side+"Score"])||0,list=Array.isArray(data[side+"Scorers"])?data[side+"Scorers"]:[],teamRoster=roster(team.id);return React.createElement("div",{style:{padding:14,border:"1px solid var(--border)",borderRadius:16,background:"var(--surface-soft)",marginBottom:14}},React.createElement("div",{style:{fontWeight:850,marginBottom:10}},`Gols de ${team.name}`),teamRoster.length?Array.from({length:total},(_,index)=>React.createElement("label",{key:index,style:{display:"grid",gridTemplateColumns:"52px minmax(0,1fr)",gap:8,alignItems:"center",marginBottom:8,fontSize:12,color:"var(--muted)"}},`Gol ${index+1}`,React.createElement("select",{style:{...q,margin:0},value:list[index]||"",onChange:(event)=>updateScorer(side,index,event.target.value)},React.createElement("option",{value:""},"Autoria não informada"),React.createElement("option",{value:"__own_goal__"},"Gol contra"),teamRoster.map((player)=>React.createElement("option",{key:player.id,value:String(player.id)},player.name||player.fullName||`Jogador ${player.id}`))))):React.createElement("div",{style:{fontSize:13,color:"var(--muted)"}},"Este time ainda não possui jogadores no elenco."));}
          function crimeRoster(side,team){let selected=Array.isArray(data[side+"RedCards"])?data[side+"RedCards"]:[],teamRoster=roster(team.id);return React.createElement("div",null,React.createElement("div",{style:{fontWeight:850,fontSize:12,marginBottom:8,textAlign:"center"}},team.name),React.createElement("div",{style:{display:"grid",gap:7}},teamRoster.length?teamRoster.map((player)=>{let id=String(player.id),active=selected.includes(id);return React.createElement("button",{key:id,onClick:()=>toggleRed(side,id),style:{padding:"9px 7px",borderRadius:11,border:active?"1px solid #ff3b30":"1px solid var(--border)",background:active?"rgba(255,59,48,.12)":"var(--surface)",color:active?"#ff5a52":"var(--heading)",fontWeight:750,fontSize:11,cursor:"pointer"}},`${active?"🟥 ":""}${player.name||player.fullName||`Jogador ${id}`}`);}):React.createElement("div",{style:{fontSize:12,color:"var(--muted)",textAlign:"center"}},"Sem jogadores")));}
          let stepTwo=data.step===2&&React.createElement("div",null,React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"start",gap:12,margin:"14px 0 18px"}},scoreColumn(left,"left"),React.createElement("div",{style:{fontWeight:800,color:"var(--muted)",paddingTop:70}},"×"),scoreColumn(right,"right")),scorerPanel("left",left),scorerPanel("right",right),React.createElement("div",{style:{margin:"18px 0",padding:14,border:"1px solid var(--border)",borderRadius:16}},React.createElement("div",{style:{textAlign:"center",fontWeight:900,marginBottom:10}},"🟥 Teve crime?"),React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxWidth:280,margin:"0 auto"}},React.createElement("button",{onClick:()=>setData({...data,hadCrime:false,leftRedCards:[],rightRedCards:[]}),style:{padding:10,borderRadius:12,border:!data.hadCrime?"1px solid var(--green)":"1px solid var(--border)",background:!data.hadCrime?"color-mix(in srgb,var(--green) 12%,var(--surface))":"var(--surface)",color:"var(--heading)",fontWeight:800}},"Não"),React.createElement("button",{onClick:()=>setData({...data,hadCrime:true}),style:{padding:10,borderRadius:12,border:data.hadCrime?"1px solid #ff3b30":"1px solid var(--border)",background:data.hadCrime?"rgba(255,59,48,.12)":"var(--surface)",color:data.hadCrime?"#ff5a52":"var(--heading)",fontWeight:800}},"Sim")),data.hadCrime&&React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:14}},crimeRoster("left",left),crimeRoster("right",right))),React.createElement("div",{style:{display:"flex",gap:8}},React.createElement("button",{onClick:()=>setData({...data,step:1}),style:{...M,background:"var(--surface-soft)",color:"var(--heading)"}},"Voltar"),React.createElement("button",{onClick:()=>onSave(data),style:{...M,...W}},"Salvar partida")));
          return React.createElement(ee,{title,onClose},stepOne,stepTwo);
        }
        function mo({ tab: e, setTab: t, isAdmin: l, unreadOffers, profile, presence, tournamentFinished }) {
          let items = [
            { key: "table", icon: pe, label: "Tabela" },
            { key: "teams", icon: Vt, label: "Elenco" },
            ...(!tournamentFinished ? [{ key: "market", icon: Xe, label: "Mercado", badge: unreadOffers }] : []),
            { key: "profile", icon: ProfileIcon, label: "Perfil", avatar: true },
          ];
          if (l) items.push({ key: "admin", icon: AdminIcon, label: "Admin" });
          let profileItem = profile && typeof profile === "object" ? profile : { name: String(profile || "") };
          return React.createElement("nav", { className: "sports-dock", "aria-label": "Navegação principal" },
            items.map(({ key, icon: Icon, label, badge, avatar }) => {
              let active = e === key;
              let visual = avatar
                ? React.createElement("span", { className: "sports-tab-avatar", style: { background: profileItem.color || "var(--green-strong)", boxShadow: profileItem.avatar ? "none" : undefined, position:"relative" } },
                    profileItem.avatar
                      ? React.createElement("img", { src: profileItem.avatar, alt: "" })
                      : String(profileItem.name || "?").charAt(0).toUpperCase())
                : React.createElement(Icon, { size: 21, color: "currentColor" });
              return React.createElement("button", { key, onClick: () => t(key), className: "sports-tab" + (active ? " is-active" : ""), "aria-current": active ? "page" : undefined, "aria-label": label },
                React.createElement("span", { style: { position: "relative", display: "inline-flex" } }, visual,
                  badge > 0 && React.createElement("span", { style: { position: "absolute", top: -8, right: -11, minWidth: 17, height: 17, padding: "0 4px", borderRadius: 999, background: "var(--danger)", color: "white", display: "grid", placeItems: "center", fontSize: 9, fontWeight: 800, boxShadow: "0 0 0 2px var(--surface)" } }, badge > 9 ? "9+" : badge)),
                React.createElement("span", { className: "sports-tab-label", style: { fontSize: 10, color: "currentColor", fontWeight: active ? 800 : 600 } }, label)
              );
            })
          );
        }
        function ee({ title: e, onClose: t, children: l, hideHeader = false, closeOutside = false, modalClassName = "" }) {
          return React.createElement(
            "div",
            { className:"sports-modal-overlay", style:{ position:"fixed", inset:0, background:"var(--overlay)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:220 }, onClick:t },
            closeOutside && React.createElement("button", { className:"tapbtn player-detail-close", onClick:t, "aria-label":"Fechar detalhes" }, React.createElement(Ye,{size:21})),
            React.createElement(
              "div",
              { className:`sports-modal ${modalClassName}`.trim(), onClick:(a)=>a.stopPropagation(), style:{ background:"var(--surface)", borderRadius:"24px 24px 0 0", padding:20, width:"100%", maxWidth:720, maxHeight:"88vh", overflowY:"auto" } },
              !hideHeader && React.createElement("div", { style:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 } },
                React.createElement("span", { style:{ fontWeight:800, fontSize:16 } }, e),
                React.createElement("button", { onClick:t, style:{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer" } }, React.createElement(Ye,{size:20}))
              ),
              l
            )
          );
        }
        function go({
          teams: e,
          tourForm: t,
          setTourForm: l,
          onClose: a,
          onToggleTeam: n,
          onCreate: r,
        }) {
          let f =
            t.name.trim() &&
            t.teamIds.length >= 2 &&
            (t.format !== "grupos" || t.teamIds.length >= 4);
          return React.createElement(
            ee,
            { title: "Novo campeonato", onClose: a },
            React.createElement("label", { style: P }, "Nome do campeonato"),
            React.createElement("input", {
              style: q,
              value: t.name,
              onChange: (d) => l({ ...t, name: d.target.value }),
              placeholder: "Ex: Copa Retr\xF4 2007",
              autoFocus: !0,
            }),
            React.createElement(
              "label",
              { style: { ...P, marginTop: 14 } },
              "Formato",
            ),
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginBottom: 4,
                },
              },
              [
                {
                  k: "liga",
                  t: "Liga (pontos corridos)",
                  d: "Todos contra todos, tabela de classifica\xE7\xE3o.",
                },
                {
                  k: "mata-mata",
                  t: "Mata-mata (eliminat\xF3ria)",
                  d: "Jogo \xFAnico, perdeu est\xE1 fora. Empate decide nos p\xEAnaltis.",
                },
                {
                  k: "grupos",
                  t: "Grupos + Mata-mata",
                  d: "Fase de grupos e depois eliminat\xF3rias com os classificados.",
                },
              ].map((d) =>
                React.createElement(
                  "button",
                  {
                    key: d.k,
                    onClick: () => l({ ...t, format: d.k }),
                    style: {
                      textAlign: "left",
                      padding: 12,
                      borderRadius: 10,
                      cursor: "pointer",
                      background:
                        t.format === d.k ? "rgba(212,175,55,0.12)" : "var(--surface)",
                      border:
                        t.format === d.k
                          ? "1px solid #58CC02"
                          : "1px solid #AFAFAF",
                      color: "var(--heading)",
                    },
                  },
                  React.createElement(
                    "div",
                    { style: { fontWeight: 700, fontSize: 14 } },
                    d.t,
                  ),
                  React.createElement(
                    "div",
                    {
                      style: { fontSize: 11.5, color: "var(--muted)", marginTop: 2 },
                    },
                    d.d,
                  ),
                ),
              ),
            ),
            t.format === "grupos" &&
              React.createElement(
                React.Fragment,
                null,
                React.createElement(
                  "label",
                  { style: { ...P, marginTop: 10 } },
                  "N\xFAmero de grupos",
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: 8, marginBottom: 4 } },
                  [2, 4].map((d) =>
                    React.createElement(
                      "span",
                      {
                        key: d,
                        onClick: () => l({ ...t, numGroups: d }),
                        style: V(t.numGroups === d),
                      },
                      d,
                      " grupos",
                    ),
                  ),
                ),
              ),
            React.createElement(
              "label",
              { style: { ...P, marginTop: 14 } },
              "Times participantes (",
              t.teamIds.length,
              " selecionados)",
            ),
            e.length === 0 &&
              React.createElement(
                "div",
                {
                  style: { fontSize: 12.5, color: "var(--danger)", marginBottom: 8 },
                },
                "Crie times na aba Elenco primeiro.",
              ),
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginBottom: 14,
                },
              },
              e.map((d) => {
                let p = t.teamIds.includes(d.id);
                return React.createElement(
                  "button",
                  {
                    key: d.id,
                    onClick: () => n(d.id),
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: 10,
                      borderRadius: 10,
                      cursor: "pointer",
                      background: p ? "rgba(47,122,77,0.15)" : "var(--surface)",
                      border: p ? "1px solid #58CC02" : "1px solid #AFAFAF",
                      color: "var(--heading)",
                    },
                  },
                  React.createElement("span", {
                    style: {
                      width: 8,
                      height: 8,
                      borderRadius: 3,
                      background: d.color,
                    },
                  }),
                  React.createElement(
                    "span",
                    {
                      style: {
                        flex: 1,
                        textAlign: "left",
                        fontSize: 14,
                        fontWeight: 600,
                      },
                    },
                    d.name,
                  ),
                  p && React.createElement(et, { size: 16, color: "var(--green)" }),
                );
              }),
            ),
            t.format === "grupos" &&
              t.teamIds.length > 0 &&
              t.teamIds.length < 4 &&
              React.createElement(
                "div",
                {
                  style: {
                    fontSize: 12,
                    color: "var(--danger)",
                    marginBottom: 10,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  },
                },
                React.createElement(at, { size: 14 }),
                " Selecione pelo menos 4 times para grupos.",
              ),
            React.createElement(
              "button",
              {
                className: "tapbtn",
                disabled: !f,
                onClick: r,
                style: { ...M, ...W, opacity: f ? 1 : 0.5 },
              },
              "Iniciar campeonato",
            ),
          );
        }
        function fo({
          match: e,
          teamById: t,
          squadOf: l,
          catalogMap: a,
          scoreDraft: n,
          setScoreDraft: r,
          onClose: f,
          onSave: d,
          addScorer: p,
          removeScorer: F,
        }) {
          let c = t(e.homeId),
            v = t(e.awayId),
            s =
              n.home !== "" &&
              n.away !== "" &&
              parseInt(n.home, 10) === parseInt(n.away, 10),
            h = e.stage === "knockout" && s,
            m = l(e.homeId),
            g = l(e.awayId);
          return React.createElement(
            ee,
            { title: "Resultado da partida", onClose: f },
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  marginBottom: 18,
                },
              },
              React.createElement(
                "div",
                { style: { textAlign: "center", flex: 1 } },
                React.createElement(
                  "div",
                  {
                    style: { fontWeight: 700, fontSize: 13.5, marginBottom: 8 },
                  },
                  c == null ? void 0 : c.name,
                ),
                React.createElement("input", {
                  type: "number",
                  min: 0,
                  style: {
                    ...q,
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: 800,
                    padding: "10px 0",
                  },
                  value: n.home,
                  onChange: (k) => r({ ...n, home: k.target.value }),
                }),
              ),
              React.createElement(
                "span",
                { style: { fontSize: 18, color: "var(--muted)", marginTop: 20 } },
                "\xD7",
              ),
              React.createElement(
                "div",
                { style: { textAlign: "center", flex: 1 } },
                React.createElement(
                  "div",
                  {
                    style: { fontWeight: 700, fontSize: 13.5, marginBottom: 8 },
                  },
                  v == null ? void 0 : v.name,
                ),
                React.createElement("input", {
                  type: "number",
                  min: 0,
                  style: {
                    ...q,
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: 800,
                    padding: "10px 0",
                  },
                  value: n.away,
                  onChange: (k) => r({ ...n, away: k.target.value }),
                }),
              ),
            ),
            h &&
              React.createElement(
                "div",
                { style: { marginBottom: 16 } },
                React.createElement(
                  "label",
                  { style: P },
                  "Empate \u2014 vencedor nos p\xEAnaltis",
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: 8 } },
                  React.createElement(
                    "span",
                    {
                      onClick: () => r({ ...n, penaltyWinner: e.homeId }),
                      style: {
                        ...V(n.penaltyWinner === e.homeId),
                        flex: 1,
                        textAlign: "center",
                      },
                    },
                    c == null ? void 0 : c.name,
                  ),
                  React.createElement(
                    "span",
                    {
                      onClick: () => r({ ...n, penaltyWinner: e.awayId }),
                      style: {
                        ...V(n.penaltyWinner === e.awayId),
                        flex: 1,
                        textAlign: "center",
                      },
                    },
                    v == null ? void 0 : v.name,
                  ),
                ),
              ),
            React.createElement(
              "label",
              { style: P },
              "Gols marcados (opcional)",
            ),
            React.createElement(
              "div",
              { style: { display: "flex", gap: 8, marginBottom: 10 } },
              React.createElement(Qe, {
                team: c,
                squad: m,
                onPick: (k) => p(e.homeId, k),
              }),
              React.createElement(Qe, {
                team: v,
                squad: g,
                onPick: (k) => p(e.awayId, k),
              }),
            ),
            n.scorers.length > 0 &&
              React.createElement(
                "div",
                { style: { marginBottom: 14 } },
                n.scorers.map((k, I) => {
                  let B = a.get(k.playerId);
                  return React.createElement(
                    "div",
                    {
                      key: I,
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 13,
                        padding: "5px 0",
                        borderBottom:
                          I < n.scorers.length - 1
                            ? "1px solid #DEDEDE"
                            : "none",
                      },
                    },
                    React.createElement(
                      "span",
                      null,
                      React.createElement(nt, {
                        size: 12,
                        style: { verticalAlign: -1, marginRight: 5 },
                        color: "var(--green)",
                      }),
                      B ? B.name : "?",
                    ),
                    React.createElement(
                      "button",
                      {
                        onClick: () => F(I),
                        style: {
                          background: "none",
                          border: "none",
                          color: "var(--danger)",
                          cursor: "pointer",
                        },
                      },
                      React.createElement(Ye, { size: 14 }),
                    ),
                  );
                }),
              ),
            React.createElement(
              "button",
              { className: "tapbtn", onClick: d, style: { ...M, ...W } },
              "Salvar resultado",
            ),
          );
        }
        function Qe({ team: e, squad: t, onPick: l }) {
          let [a, n] = b(!1);
          return e
            ? React.createElement(
                "div",
                { style: { position: "relative", flex: 1 } },
                React.createElement(
                  "button",
                  {
                    onClick: () => n((r) => !r),
                    style: {
                      width: "100%",
                      padding: "9px 10px",
                      borderRadius: 8,
                      background: "var(--surface)",
                      border: "1px solid #AFAFAF",
                      color: "var(--muted)",
                      fontSize: 12,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    },
                  },
                  "+ Gol ",
                  e.name,
                  " ",
                  React.createElement(Ze, { size: 13 }),
                ),
                a &&
                  React.createElement(
                    "div",
                    {
                      style: {
                        position: "absolute",
                        top: "105%",
                        left: 0,
                        right: 0,
                        background: "var(--surface)",
                        border: "1px solid #D7FFB8",
                        borderRadius: 8,
                        zIndex: 5,
                        maxHeight: 160,
                        overflowY: "auto",
                      },
                    },
                    t.length === 0 &&
                      React.createElement(
                        "div",
                        {
                          style: {
                            padding: 10,
                            fontSize: 12,
                            color: "var(--muted)",
                          },
                        },
                        "Sem jogadores no elenco",
                      ),
                    t.map((r) =>
                      React.createElement(
                        "div",
                        {
                          key: r.id,
                          onClick: () => {
                            (l(r.id), n(!1));
                          },
                          style: {
                            padding: "8px 10px",
                            fontSize: 12.5,
                            cursor: "pointer",
                            borderBottom: "1px solid #DEDEDE",
                          },
                        },
                        r.name,
                      ),
                    ),
                  ),
              )
            : React.createElement("div", { style: { flex: 1 } });
        }
        var yo = ReactDOM.createRoot(document.getElementById("root"));
        yo.render(React.createElement(to, null));
      })();
