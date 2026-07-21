(() => {
  window.ManchaApp = window.ManchaApp || {};
  function fullSquadOverall(teamId, ownershipValue, catalogValue) {
    let entries = Object.entries(ownershipValue && typeof ownershipValue === "object" ? ownershipValue : {});
    let ids = new Set(entries.filter(([, item]) => item && String(item.teamId) === String(teamId)).map(([playerId]) => String(playerId)));
    let players = (Array.isArray(catalogValue) ? catalogValue : []).filter((player) => player && ids.has(String(player.id)));
    if (!players.length) return 0;
    return players.reduce((sum, player) => sum + (Number(player.overall) || 0), 0) / players.length;
  }
  function marketBalanceSettings(tournament) {
    let settings = tournament && tournament.marketBalanceSettings && typeof tournament.marketBalanceSettings === "object" ? tournament.marketBalanceSettings : {};
    return { enabled: settings.enabled === true, maxDifference: Math.max(0, Number(settings.maxDifference != null ? settings.maxDifference : 10) || 0), recoveryMode: settings.recoveryMode !== false };
  }
  function marketAccessSettings(tournament) {
    let settings = tournament && tournament.marketSettings && typeof tournament.marketSettings === "object" ? tournament.marketSettings : {};
    let limit = settings.freePlayerOverallLimit && typeof settings.freePlayerOverallLimit === "object" ? settings.freePlayerOverallLimit : {};
    return { isOpen: settings.isOpen !== false, freePlayerOverallLimit: { enabled: limit.enabled === true, maxOverall: Math.min(99, Math.max(1, Number(limit.maxOverall != null ? limit.maxOverall : 99) || 99)) } };
  }
  function inferPlayerAcquisition(playerId, ownershipItem, transfersValue) {
    let item = ownershipItem && typeof ownershipItem === "object" ? ownershipItem : {};
    if (item.acquisitionSource) return { acquisitionSource:item.acquisitionSource, initialTeamId:item.initialTeamId || null };
    let history = (Array.isArray(transfersValue) ? transfersValue : []).filter((entry) => entry && String(entry.playerId) === String(playerId)).slice().sort((a,b) => (Number(a.createdAt)||0) - (Number(b.createdAt)||0));
    let first = history[0] || null;
    if (item.squadRole) return { acquisitionSource:"initial_roster", initialTeamId:item.initialTeamId || (first && first.fromTeamId) || item.teamId || null };
    if (first && first.type === "market_purchase") return { acquisitionSource:"market_purchase", initialTeamId:null };
    if (first && first.type === "user_transfer") return { acquisitionSource:"user_transfer", initialTeamId:null };
    return { acquisitionSource:"unknown", initialTeamId:null };
  }
  function isInitialRosterPlayer(playerId, teamId, ownershipValue, transfersValue) {
    let item = ownershipValue && typeof ownershipValue === "object" ? ownershipValue[playerId] : null;
    if (!item || String(item.teamId) !== String(teamId)) return false;
    let origin = inferPlayerAcquisition(playerId, item, transfersValue);
    return origin.acquisitionSource === "initial_roster" && String(origin.initialTeamId || "") === String(teamId);
  }
  function marketSaleDepreciation(tournament, playerId, teamId, ownershipValue, transfersValue) {
    let settings = tournament && tournament.marketSettings && typeof tournament.marketSettings === "object" ? tournament.marketSettings : {};
    let initialRoster = isInitialRosterPlayer(playerId, teamId, ownershipValue, transfersValue);
    let pct = initialRoster
      ? Number(settings.initialRosterDepreciationPct != null ? settings.initialRosterDepreciationPct : 50)
      : Number(settings.depreciationPct != null ? settings.depreciationPct : 10);
    return { depreciationPct:Math.min(100,Math.max(0,pct||0)), initialRoster };
  }
  function marketOperationBlock(player, status, tournament) {
    let settings = marketAccessSettings(tournament);
    if (!settings.isOpen) return { blocked:true, reason:"market_closed", message:"O mercado está fechado pela administração." };
    if (status && status.kind === "free" && settings.freePlayerOverallLimit.enabled && Number(player && player.overall || 0) > settings.freePlayerOverallLimit.maxOverall) {
      return { blocked:true, reason:"overall_limit", maxOverall:settings.freePlayerOverallLimit.maxOverall, message:`Esta Liga permite comprar jogadores livres de até ${settings.freePlayerOverallLimit.maxOverall} OVR.` };
    }
    return { blocked:false, settings };
  }
  function evaluateMarketBalance(player, buyerTeamId, tournament, teamsValue, ownershipValue, catalogValue) {
    let settings = marketBalanceSettings(tournament);
    if (!settings.enabled || !player || !buyerTeamId) return { allowed:true, enabled:settings.enabled, maxDifference:settings.maxDifference };
    let activeTeams = (Array.isArray(teamsValue) ? teamsValue : []).filter((team) => team && team.active !== false);
    if (activeTeams.length < 2) return { allowed:true, enabled:true, maxDifference:settings.maxDifference };
    let current = activeTeams.map((team) => ({ team, overall:fullSquadOverall(team.id, ownershipValue, catalogValue) }));
    let validCurrent = current.filter((item) => item.overall > 0);
    if (validCurrent.length < 2) return { allowed:true, enabled:true, maxDifference:settings.maxDifference };
    let currentMax = Math.max(...validCurrent.map((item) => item.overall));
    let currentMin = Math.min(...validCurrent.map((item) => item.overall));
    let currentGap = currentMax - currentMin;
    let nextOwnership = { ...(ownershipValue || {}) };
    let playerKey = Object.keys(nextOwnership).find((key) => String(key) === String(player.id)) || String(player.id);
    nextOwnership[playerKey] = { ...(nextOwnership[playerKey] || {}), teamId:buyerTeamId, forSale:false, price:null };
    let future = activeTeams.map((team) => ({ team, overall:fullSquadOverall(team.id, nextOwnership, catalogValue) })).filter((item) => item.overall > 0);
    let futureMax = Math.max(...future.map((item) => item.overall));
    let futureMin = Math.min(...future.map((item) => item.overall));
    let futureGap = futureMax - futureMin;
    let wasAboveLimit = currentGap > settings.maxDifference;
    let threshold = wasAboveLimit && settings.recoveryMode ? currentGap : settings.maxDifference;
    let allowed = Number.isFinite(futureGap) && (wasAboveLimit && settings.recoveryMode ? futureGap <= currentGap + 1e-9 : futureGap <= settings.maxDifference + 1e-9);
    let buyerBefore = (current.find((item) => String(item.team.id) === String(buyerTeamId)) || {}).overall || 0;
    let buyerAfter = (future.find((item) => String(item.team.id) === String(buyerTeamId)) || {}).overall || 0;
    let weakest = future.slice().sort((a,b)=>a.overall-b.overall)[0];
    return { allowed, enabled:true, maxDifference:settings.maxDifference, currentGap, futureGap, threshold, recoveryMode:settings.recoveryMode, wasAboveLimit, buyerBefore, buyerAfter, weakestTeamName:weakest && weakest.team ? weakest.team.name : "time mais fraco", weakestOverall:weakest ? weakest.overall : 0 };
  }
  function marketBalanceMessage(check) {
    if (!check || check.allowed) return "";
    return `Esta contratação elevaria a diferença entre os times para ${check.futureGap.toFixed(1)} OVR. Pela regra de equilíbrio, o máximo permitido agora é ${(check.currentGap > check.maxDifference ? check.currentGap : check.maxDifference).toFixed(1)} OVR. O time mais fraco está com ${check.weakestOverall.toFixed(1)} OVR.`;
  }

  window.ManchaApp.MarketFeature = { fullSquadOverall, marketBalanceSettings, marketAccessSettings, inferPlayerAcquisition, isInitialRosterPlayer, marketSaleDepreciation, marketOperationBlock, evaluateMarketBalance, marketBalanceMessage };
})();
