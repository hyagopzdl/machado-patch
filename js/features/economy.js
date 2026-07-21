(() => {
  window.ManchaApp = window.ManchaApp || {};
  const { _ } = window.ManchaApp;
        function economySettingsOf(tournament) {
          let raw = tournament && tournament.economySettings && typeof tournament.economySettings === "object" ? tournament.economySettings : {}, settings = Number(raw.version) >= 2 ? raw : {};
          return {
            version: 2,
            winReward: Math.max(0, Number(settings.winReward != null ? settings.winReward : 5) || 0),
            scoringDrawReward: Math.max(0, Number(settings.scoringDrawReward != null ? settings.scoringDrawReward : 3) || 0),
            scorelessDrawReward: Math.max(0, Number(settings.scorelessDrawReward != null ? settings.scorelessDrawReward : 2) || 0),
            lossReward: Math.max(0, Number(settings.lossReward != null ? settings.lossReward : 1) || 0),
            goalReward: Math.max(0, Number(settings.goalReward != null ? settings.goalReward : 1) || 0),
            redCardPenalty: Math.max(0, Number(settings.redCardPenalty != null ? settings.redCardPenalty : 1) || 0),
          };
        }
        function matchEconomyForTeam(match, teamId, settings) {
          let home = String(match && match.homeId) === String(teamId), score = home ? Number(match.homeScore)||0 : Number(match.awayScore)||0, opponentScore = home ? Number(match.awayScore)||0 : Number(match.homeScore)||0;
          let resultReward = score > opponentScore ? settings.winReward : score < opponentScore ? settings.lossReward : score > 0 ? settings.scoringDrawReward : settings.scorelessDrawReward;
          let eligibleGoals = (Array.isArray(match && match.scorers) ? match.scorers : []).filter((event) => event && String(event.teamId) === String(teamId) && event.playerId && event.type !== "own_goal").length;
          let redCards = (Array.isArray(match && match.redCards) ? match.redCards : []).filter((event) => event && String(event.teamId) === String(teamId)).length;
          return { resultReward, eligibleGoals, redCards, goalAmount: eligibleGoals * settings.goalReward, redCardAmount: redCards * settings.redCardPenalty, total: resultReward + eligibleGoals * settings.goalReward - redCards * settings.redCardPenalty };
        }
        function prizeSettingsOf(tournament) {
          let raw=tournament && tournament.finalPrizeSettings && typeof tournament.finalPrizeSettings === "object" ? tournament.finalPrizeSettings : {};
          let championPrize=Math.max(0,Number(raw.championPrize!=null?raw.championPrize:raw.firstPlacePrize!=null?raw.firstPlacePrize:20)||0);
          return {
            championPrize,
            firstPlacePrize:championPrize,
            topScorerPrize:Math.max(0,Number(raw.topScorerPrize!=null?raw.topScorerPrize:0)||0),
            lastPlacePercentage:50,
          };
        }
        function championshipPrizeLadder(championPrize, participantCount) {
          let total=Math.max(0,Math.floor(Number(participantCount)||0)), first=Math.max(0,Number(championPrize)||0);
          if (!total) return [];
          if (total===1) return [Math.ceil(first)];
          let last=first/2, step=(first-last)/(total-1);
          return Array.from({length:total},(_,index)=>Math.ceil(first-(step*index)));
        }
        function financeEntry(type, teamId, amount, label, referenceId, balanceBefore, createdAt = Date.now()) {
          return { id: _(), type, teamId, amount: Number(amount) || 0, label, referenceId: referenceId || null, balanceBefore: Number(balanceBefore) || 0, balanceAfter: (Number(balanceBefore) || 0) + (Number(amount) || 0), createdAt };
        }

  Object.assign(window.ManchaApp, { economySettingsOf, matchEconomyForTeam, prizeSettingsOf, championshipPrizeLadder, financeEntry });
})();
